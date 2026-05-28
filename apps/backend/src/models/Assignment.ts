import mongoose, { Document, Schema } from 'mongoose';
import { QUESTION_TYPES } from '@vedaai/shared';

export interface IAssignmentSection {
  type: string;
  numQuestions: number;
  marksPerQuestion: number;
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  grade: string;
  dueDate: Date;
  sections: IAssignmentSection[];
  additionalInfo?: string;
  sourceText?: string;
  fileName?: string;
  status: 'pending' | 'queued' | 'processing' | 'rate_limited' | 'completed' | 'failed';
  jobId?: string;
  resultId?: mongoose.Types.ObjectId;
  teacherId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSectionSchema = new Schema<IAssignmentSection>(
  {
    type: {
      type: String,
      enum: QUESTION_TYPES,
      required: true,
    },
    numQuestions: { type: Number, required: true, min: 1, max: 50 },
    marksPerQuestion: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    sections: { type: [AssignmentSectionSchema], required: true, validate: [(v: IAssignmentSection[]) => v.length > 0, 'At least one section required'] },
    additionalInfo: { type: String, trim: true },
    sourceText: { type: String },
    fileName: { type: String },
    status: {
      type: String,
      enum: ['pending', 'queued', 'processing', 'rate_limited', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: { type: String },
    resultId: { type: Schema.Types.ObjectId, ref: 'Result' },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  },
  { timestamps: true }
);

// Index for search + list performance
AssignmentSchema.index({ createdAt: -1 });
AssignmentSchema.index({ status: 1 });
AssignmentSchema.index({ title: 'text', subject: 'text' });

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
