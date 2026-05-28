import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacher extends Document {
  name: string;
  email: string;
  schoolId?: mongoose.Types.ObjectId;
  avatarUrl?: string;
  // Auth fields
  oauthProvider: 'google' | 'email';
  oauthId?: string;
  passwordHash?: string;
  onboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School' },
    avatarUrl: { type: String },
    oauthProvider: { type: String, enum: ['google', 'email'], default: 'email' },
    oauthId: { type: String },
    passwordHash: { type: String },
    onboardingComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TeacherSchema.index({ oauthId: 1, oauthProvider: 1 });

export const Teacher = mongoose.model<ITeacher>('Teacher', TeacherSchema);
