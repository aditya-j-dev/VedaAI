// ─── Question Types ────────────────────────────────────────────────────────────
export type QuestionType =
  | 'Multiple Choice Questions'
  | 'Short Questions'
  | 'Long Answer Questions'
  | 'Diagram/Graph-Based Questions'
  | 'Numerical Problems'
  | 'True/False'
  | 'Fill in the Blank';

export const QUESTION_TYPES: QuestionType[] = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Answer Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'True/False',
  'Fill in the Blank',
];

// ─── Difficulty ────────────────────────────────────────────────────────────────
// Must be exactly these values — matches Figma inline tags [Easy] [Moderate] [Challenging]
export type Difficulty = 'Easy' | 'Moderate' | 'Challenging';

// ─── Status ───────────────────────────────────────────────────────────────────
export type AssignmentStatus = 'pending' | 'queued' | 'processing' | 'rate_limited' | 'completed' | 'failed';

// ─── Assignment ───────────────────────────────────────────────────────────────
export interface AssignmentSection {
  type: QuestionType;
  numQuestions: number;
  marksPerQuestion: number;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  sections: AssignmentSection[];
  additionalInfo?: string;
  // file handled separately as multipart
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  sections: AssignmentSection[];
  additionalInfo?: string;
  sourceText?: string;
  fileName?: string;
  status: AssignmentStatus;
  jobId?: string;
  resultId?: string;
  teacherId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Result / Question Paper ──────────────────────────────────────────────────
export interface Question {
  questionNumber: number;
  questionText: string;
  questionType: string;
  difficulty: Difficulty;
  marks: number;
  options: string[] | null;
  answer: string | null;
}

export interface ResultSection {
  sectionName: string;    // "A", "B", "C"
  title: string;          // "Short Answer Questions"
  instruction: string;    // "Attempt all questions. Each question carries 2 marks."
  totalMarks: number;
  questions: Question[];
}

export interface GenerationMetadata {
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
}

export interface Result {
  _id: string;
  assignmentId: string;
  subject: string;
  grade: string;
  duration: number;
  totalMarks: number;
  sections: ResultSection[];
  generationMetadata?: GenerationMetadata;
  createdAt: string;
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export interface School {
  _id: string;
  name: string;
  location: string;
  logoUrl?: string;
}

export interface Teacher {
  _id: string;
  name: string;
  email: string;
  schoolId: string;
  avatarUrl?: string;
}

export interface Profile {
  teacher: Teacher;
  school: School;
}

// ─── WebSocket Events ─────────────────────────────────────────────────────────
export interface WsJobQueued {
  assignmentId: string;
  position: number;
}

export interface WsJobProgress {
  assignmentId: string;
  progress: number;
  message: string;
}

export interface WsJobCompleted {
  assignmentId: string;
  resultId: string;
}

export interface WsJobFailed {
  assignmentId: string;
  error: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
