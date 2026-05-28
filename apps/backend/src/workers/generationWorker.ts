import { Worker, Job, UnrecoverableError } from 'bullmq';
import { env } from '../config/env';
import { Assignment } from '../models/Assignment';
import { Result } from '../models/Result';
import { emitToRoom } from '../services/socketService';
import { buildPrompt, callLLM, parseAndValidateResponse } from '../services/aiService';
import { GenerationJobData, getGenerationQueue } from '../queues/generationQueue';
import Redis from 'ioredis';

export function startGenerationWorker(): Worker {
  const worker = new Worker<GenerationJobData>(
    'question-generation',
    async (job: Job<GenerationJobData>) => {
      const { assignmentId } = job.data;
      const startTime = Date.now();

      if (env.ENABLE_LOAD_TESTING) {
        const queueSize = await getGenerationQueue().count();
        console.log(`[WORKER] Job ${job.id} started processing for assignment ${assignmentId}. Queue size: ${queueSize}`);
      }

      // ── Step 1: Mark processing ──────────────────────────────────────
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
      emitToRoom(assignmentId, 'job:processing', {
        progress: 10,
        message: 'Analyzing your assignment details...',
      });

      // ── Step 2: Fetch assignment ─────────────────────────────────────
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

      let parsed: any;
      let latencyMs = 0;

      if (env.MOCK_AI_DELAY) {
        // Simulated AI delay (random between 3 and 5 seconds)
        const delayMs = Math.floor(Math.random() * 2000) + 3000;
        await new Promise((resolve) => setTimeout(resolve, delayMs));

        parsed = {
          subject: assignment.subject,
          grade: assignment.grade,
          duration: 60,
          totalMarks: assignment.sections.reduce((sum, s) => sum + s.numQuestions * s.marksPerQuestion, 0),
          sections: assignment.sections.map((s, idx) => ({
            sectionName: String.fromCharCode(65 + idx),
            title: `${s.type} Section`,
            instruction: `Attempt all questions. Each question carries ${s.marksPerQuestion} marks.`,
            totalMarks: s.numQuestions * s.marksPerQuestion,
            questions: Array.from({ length: s.numQuestions }, (_, qIdx) => ({
              questionNumber: qIdx + 1,
              questionText: `Mock question ${qIdx + 1} for ${s.type} on subject ${assignment.subject}`,
              questionType: s.type,
              difficulty: (['Easy', 'Moderate', 'Challenging'][qIdx % 3] as 'Easy' | 'Moderate' | 'Challenging'),
              marks: s.marksPerQuestion,
              options: s.type === 'MCQs' ? ['a) Option A', 'b) Option B', 'c) Option C', 'd) Option D'] : null,
              answer: 'Mock answer text',
            })),
          })),
        };
        latencyMs = delayMs;
      } else {
        // ── Step 3: Build prompt ─────────────────────────────────────────
        emitToRoom(assignmentId, 'job:progress', {
          progress: 25,
          message: 'Building AI prompt...',
        });
        const prompt = buildPrompt(assignment);

        // ── Step 4: Call LLM ─────────────────────────────────────────────
        emitToRoom(assignmentId, 'job:progress', {
          progress: 45,
          message: 'Generating questions with AI...',
        });
        
        let rawContent = '';
        let llmUsage: any = undefined;
        try {
          const { raw, usage } = await callLLM(prompt);
          rawContent = raw;
          llmUsage = usage;
        } catch (err: any) {
          const errorMsg = err.message || '';
          if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('limit') || errorMsg.toLowerCase().includes('resource_exhausted')) {
            throw new UnrecoverableError('Gemini API quota exceeded. Please upgrade your Google AI Studio plan to pay-as-you-go, or enable MOCK_AI_DELAY=true in your environment variables to bypass actual API calls.');
          }
          throw err;
        }

        // ── Step 5: Parse & Validate (never render raw LLM output) ───────
        emitToRoom(assignmentId, 'job:progress', {
          progress: 70,
          message: 'Structuring sections and questions...',
        });
        parsed = parseAndValidateResponse(rawContent);
        latencyMs = Date.now() - startTime;

        // Save LLM token details
        (job.data as any).usage = llmUsage;
      }

      // ── Step 6: Save to MongoDB ──────────────────────────────────────
      emitToRoom(assignmentId, 'job:progress', {
        progress: 85,
        message: 'Saving your question paper...',
      });
      
      const usage = (job.data as any).usage;
      const saved = await Result.create({
        assignmentId,
        ...parsed,
        generationMetadata: {
          model: env.MOCK_AI_DELAY ? 'mock-ai' : (env.LLM_MODEL ?? 'gemini-1.5-flash'),
          promptTokens: (usage as any)?.prompt_tokens ?? 0,
          completionTokens: (usage as any)?.completion_tokens ?? 0,
          latencyMs,
        },
      });

      // ── Step 7: Cache in Redis (1 hour TTL) ───────────────────────────────────
      const redisClient = new Redis(env.REDIS_URL);
      await redisClient.setex(
        `result:${assignmentId}`,
        3600,
        JSON.stringify(saved.toObject())
      );
      await redisClient.quit();

      // ── Step 8: Update assignment status ─────────────────────────────
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'completed',
        resultId: saved._id,
      });

      // ── Step 9: Notify frontend ──────────────────────────────────────
      emitToRoom(assignmentId, 'job:completed', {
        progress: 100,
        message: 'Question paper ready!',
        resultId: String(saved._id),
      });

      if (env.ENABLE_LOAD_TESTING) {
        const duration = Date.now() - startTime;
        const queueSize = await getGenerationQueue().count();
        console.log(`[WORKER] Job ${job.id} completed for assignment ${assignmentId} in ${duration}ms. Queue size: ${queueSize}`);
      }

      return { resultId: String(saved._id) };
    },
    {
      connection: { url: env.REDIS_URL },
      concurrency: env.WORKER_CONCURRENCY,
    }
  );

  worker.on('failed', async (job, err) => {
    if (!job) return;
    const { assignmentId } = job.data;
    const errorMsg = err.message || '';
    const isQuotaLimited = errorMsg.includes('429') || 
                           errorMsg.toLowerCase().includes('quota') || 
                           errorMsg.toLowerCase().includes('limit') || 
                           errorMsg.toLowerCase().includes('resource_exhausted');

    if (env.ENABLE_LOAD_TESTING) {
      const duration = job.finishedOn && job.processedOn ? (job.finishedOn - job.processedOn) : 0;
      const queueSize = await getGenerationQueue().count();
      console.error(`[WORKER] Job ${job.id} failed for assignment ${assignmentId} after ${duration}ms. Error: ${err.message}. Queue size: ${queueSize}`);
    } else {
      console.error(`❌ Job failed for assignment ${assignmentId}:`, err.message);
    }

    const finalStatus = isQuotaLimited ? 'rate_limited' : 'failed';
    await Assignment.findByIdAndUpdate(assignmentId, { status: finalStatus });

    emitToRoom(assignmentId, 'job:failed', {
      error: err.message ?? 'Generation failed. Please try again.',
      isQuotaLimited,
    });
  });

  worker.on('error', (err) => {
    console.error('❌ Worker error:', err);
  });

  console.log(`✅ Generation worker started (concurrency: ${env.WORKER_CONCURRENCY})`);
  return worker;
}
