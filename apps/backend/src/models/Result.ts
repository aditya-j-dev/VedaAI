import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  questionNumber: number;
  questionText: string;
  questionType: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
  options: string[] | null;
  answer: string | null;
}

export interface IResultSection {
  sectionName: string;
  title: string;
  instruction: string;
  totalMarks: number;
  questions: IQuestion[];
}

export interface IGenerationMetadata {
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
}

export interface IResult extends Document {
  assignmentId: mongoose.Types.ObjectId;
  subject: string;
  grade: string;
  duration: number;
  totalMarks: number;
  sections: IResultSection[];
  generationMetadata?: IGenerationMetadata;
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    questionNumber: { type: Number, required: true },
    questionText: { type: String, required: true },
    questionType: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Easy', 'Moderate', 'Challenging'],
      required: true,
    },
    marks: { type: Number, required: true, min: 1 },
    options: { type: [String], default: null },
    answer: { type: String, default: null },
  },
  { _id: false }
);

const ResultSectionSchema = new Schema<IResultSection>(
  {
    sectionName: { type: String, required: true },
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    questions: { type: [QuestionSchema], required: true },
  },
  { _id: false }
);

const ResultSchema = new Schema<IResult>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    duration: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    sections: { type: [ResultSectionSchema], required: true },
    generationMetadata: {
      model: String,
      promptTokens: Number,
      completionTokens: Number,
      latencyMs: Number,
    },
  },
  { timestamps: true }
);

ResultSchema.index({ assignmentId: 1 });

export const Result = mongoose.model<IResult>('Result', ResultSchema);
