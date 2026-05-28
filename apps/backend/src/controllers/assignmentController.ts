import { Request, Response, NextFunction } from 'express';
import pdf from 'pdf-parse';
import { Assignment } from '../models/Assignment';
import { Result } from '../models/Result';
import { School } from '../models/School';
import { getRedis } from '../config/redis';
import { enqueueGeneration } from '../queues/generationQueue';
import { emitToRoom } from '../services/socketService';
import { generatePDFAsync } from '../services/pdfService';
import { z } from 'zod';
import { QUESTION_TYPES } from '@vedaai/shared';

// ─── Validation Schema ────────────────────────────────────────────────────────
const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  grade: z.string().min(1, 'Grade is required'),
  dueDate: z.string().refine((d) => new Date(d) > new Date(), 'Due date must be in the future'),
  sections: z
    .string()
    .transform((s) => JSON.parse(s))
    .pipe(
      z
        .array(
          z.object({
            type: z.enum(QUESTION_TYPES as [string, ...string[]]),
            numQuestions: z.number().int().min(1).max(50),
            marksPerQuestion: z.number().int().min(1),
          })
        )
        .min(1, 'At least one section required')
    ),
  additionalInfo: z.string().optional(),
});

// ─── Helper: Extract text from uploaded file ──────────────────────────────────
async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  if (file.mimetype === 'application/pdf') {
    try {
      const data = await pdf(file.buffer);
      return data.text.slice(0, 5000); // Cap at 5000 chars for prompt
    } catch {
      return '';
    }
  }
  if (file.mimetype === 'text/plain') {
    return file.buffer.toString('utf-8').slice(0, 5000);
  }
  // Images: return empty (AI generates from assignment details only)
  return '';
}

// ─── POST /api/assignments ────────────────────────────────────────────────────
export async function createAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createAssignmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { title, subject, grade, dueDate, sections, additionalInfo } = parsed.data;

    let sourceText = '';
    let fileName: string | undefined;

    if (req.file) {
      sourceText = await extractTextFromFile(req.file);
      fileName = req.file.originalname;
    }

    // Create assignment — scoped to authenticated teacher
    const assignment = await Assignment.create({
      title,
      subject,
      grade,
      dueDate: new Date(dueDate),
      sections,
      additionalInfo,
      sourceText,
      fileName,
      status: 'pending',
      teacherId: req.teacher!.teacherId,
    });

    // Enqueue generation job
    const jobId = await enqueueGeneration(String(assignment._id));
    await Assignment.findByIdAndUpdate(assignment._id, { status: 'queued', jobId });

    // Notify via WebSocket
    const queue = await import('../queues/generationQueue').then(m => m.getGenerationQueue());
    const waitingCount = await queue.getWaitingCount();
    emitToRoom(String(assignment._id), 'job:queued', { position: waitingCount });

    res.status(201).json({
      success: true,
      data: assignment,
      message: 'Assignment created and generation queued',
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/assignments ─────────────────────────────────────────────────────
export async function listAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(String(req.query.page ?? '1'));
    const limit = parseInt(String(req.query.limit ?? '20'));
    const search = String(req.query.search ?? '');
    const skip = (page - 1) * limit;

    // Scope to authenticated teacher only
    const filter: Record<string, unknown> = { teacherId: req.teacher!.teacherId };
    if (search) {
      filter.$text = { $search: search };
    }

    const [assignments, total] = await Promise.all([
      Assignment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Assignment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: assignments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/assignments/:id ─────────────────────────────────────────────────
export async function getAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, teacherId: req.teacher!.teacherId }).lean();
    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/assignments/:id/result ─────────────────────────────────────────
export async function getResult(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    // Check Redis cache first
    const cached = await getRedis().get(`result:${id}`);
    if (cached) {
      res.json({ success: true, data: JSON.parse(cached), cached: true });
      return;
    }

    const result = await Result.findOne({ assignmentId: id }).lean();
    if (!result) {
      res.status(404).json({ success: false, message: 'Result not found. Generation may still be in progress.' });
      return;
    }

    // Repopulate cache
    await getRedis().setex(`result:${id}`, 3600, JSON.stringify(result));

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/assignments/:id/regenerate ─────────────────────────────────────
export async function regenerateAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }

    // Delete old result + clear cache
    await Result.deleteOne({ assignmentId: id });
    await getRedis().del(`result:${id}`);

    // Re-enqueue
    const jobId = await enqueueGeneration(id);
    await Assignment.findByIdAndUpdate(id, { status: 'queued', jobId, resultId: undefined });

    const queue = await import('../queues/generationQueue').then(m => m.getGenerationQueue());
    const waitingCount = await queue.getWaitingCount();
    emitToRoom(id, 'job:queued', { position: waitingCount });

    res.json({ success: true, message: 'Regeneration queued successfully' });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/assignments/:id/pdf ─────────────────────────────────────────────
export async function downloadPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const result = await Result.findOne({ assignmentId: id }).lean();
    if (!result) {
      res.status(404).json({ success: false, message: 'Result not found' });
      return;
    }

    const school = await School.findOne().lean();
    const schoolName = school?.name ?? 'School';
    const schoolLocation = school?.location ?? '';

    const showDifficulty = req.query.showDifficulty === 'true';

    const pdfBuffer = await generatePDFAsync({
      schoolName,
      schoolLocation,
      result: result as any,
      showDifficulty,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="question-paper-${id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/assignments/:id ──────────────────────────────────────────────
export async function deleteAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await Assignment.findByIdAndDelete(id);
    await Result.deleteOne({ assignmentId: id });
    await getRedis().del(`result:${id}`);
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (err) {
    next(err);
  }
}
