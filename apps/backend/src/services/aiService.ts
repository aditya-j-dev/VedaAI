import { z } from 'zod';
import { env } from '../config/env';
import { IAssignment } from '../models/Assignment';

// ─── Zod Schema — strict parse, never render raw LLM output ─────────────────
const questionSchema = z.object({
  questionNumber: z.number().int().positive(),
  questionText: z.string().min(5),
  questionType: z.string().min(1),
  difficulty: z.enum(['Easy', 'Moderate', 'Challenging']),
  marks: z.number().positive(),
  options: z.array(z.string()).nullable(),
  answer: z.string().nullable(),
});

const resultSectionSchema = z.object({
  sectionName: z.string().min(1),
  title: z.string().min(1),
  instruction: z.string().min(1),
  totalMarks: z.number().nonnegative(),
  questions: z.array(questionSchema).min(1),
});

export const resultSchema = z.object({
  subject: z.string().min(1),
  grade: z.string().min(1),
  duration: z.number().positive(),
  totalMarks: z.number().positive(),
  sections: z.array(resultSectionSchema).min(1),
});

export type ParsedResult = z.infer<typeof resultSchema>;

// ─── System Prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert educational assessment designer for Indian schools (CBSE/ICSE curriculum).
Generate a structured question paper strictly following the JSON schema provided.

Rules:
- Questions must be clear, grade-appropriate, and curriculum-relevant
- For MCQ: provide exactly 4 options as an array ["a) ...", "b) ...", "c) ...", "d) ..."]
- For non-MCQ: options must be null
- Difficulty must be exactly one of: "Easy", "Moderate", "Challenging"
- Section names must be single letters: "A", "B", "C" etc.
- Section titles describe the question type (e.g., "Short Answer Questions")
- Instructions must state attempt rules and marks per question
- Question numbers must be sequential across ALL sections (1, 2, 3... not reset per section)
- Return ONLY valid JSON. No markdown fences. No explanation. No extra text.`;

// ─── User Prompt Builder ──────────────────────────────────────────────────────
export function buildPrompt(assignment: IAssignment): string {
  const totalMarks = assignment.sections.reduce(
    (sum, s) => sum + s.numQuestions * s.marksPerQuestion,
    0
  );

  const sectionSpecs = assignment.sections
    .map(
      (s, i) => `
Section ${String.fromCharCode(65 + i)}:
  Question Type: ${s.type}
  Number of Questions: ${s.numQuestions}
  Marks per Question: ${s.marksPerQuestion}
  Total Section Marks: ${s.numQuestions * s.marksPerQuestion}
  Difficulty Mix: balanced mix of Easy, Moderate, and Challenging`
    )
    .join('\n');

  return `${SYSTEM_PROMPT}

Create a complete question paper with these specifications:

Subject: ${assignment.subject}
Grade: ${assignment.grade}
Total Marks: ${totalMarks}
Additional Instructions: ${assignment.additionalInfo || 'None'}
${assignment.sourceText ? `\nReference Material (paraphrase, do not copy):\n${assignment.sourceText.slice(0, 2500)}` : ''}

Generate exactly these sections in order:
${sectionSpecs}

Return ONLY this JSON structure (fill in all values):
{
  "subject": "${assignment.subject}",
  "grade": "${assignment.grade}",
  "duration": 60,
  "totalMarks": ${totalMarks},
  "sections": [
    {
      "sectionName": "A",
      "title": "Short Answer Questions",
      "instruction": "Attempt all questions. Each question carries 2 marks.",
      "totalMarks": 6,
      "questions": [
        {
          "questionNumber": 1,
          "questionText": "What is photosynthesis?",
          "questionType": "Short Questions",
          "difficulty": "Easy",
          "marks": 2,
          "options": null,
          "answer": "Photosynthesis is the process by which plants use sunlight..."
        }
      ]
    }
  ]
}`;
}

// ─── Gemini REST API Call (no SDK — uses built-in fetch) ─────────────────────
export async function callLLM(prompt: string): Promise<{ raw: string; usage: undefined }> {
  const model = env.LLM_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${err}`);
  }

  const data = await response.json() as any;
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!raw) throw new Error('Gemini returned empty response');

  return { raw, usage: undefined };
}

// ─── Parser — strict Zod, never render raw LLM output ────────────────────────
export function parseAndValidateResponse(raw: string): ParsedResult {
  const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
  const parsed = JSON.parse(clean);
  return resultSchema.parse(parsed);
}
