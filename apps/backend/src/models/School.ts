import mongoose, { Document, Schema } from 'mongoose';

export interface ISchool extends Document {
  name: string;
  location: string;
  logoUrl?: string;
  createdAt: Date;
}

const SchoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    logoUrl: { type: String },
  },
  { timestamps: true }
);

export const School = mongoose.model<ISchool>('School', SchoolSchema);
