/**
 * Seed Script — idempotent upsert of School + Teacher
 * Run: pnpm seed  OR  auto-runs on backend startup
 */
import '../config/env';
import { connectDB } from '../config/db';
import { School } from '../models/School';
import { Teacher } from '../models/Teacher';
import { env } from '../config/env';
import mongoose from 'mongoose';

export async function seedDatabase(): Promise<void> {
  try {
    // Upsert School
    const school = await School.findOneAndUpdate(
      { name: env.SEED_SCHOOL_NAME },
      {
        name: env.SEED_SCHOOL_NAME,
        location: env.SEED_SCHOOL_LOCATION,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Upsert Teacher
    await Teacher.findOneAndUpdate(
      { email: env.SEED_TEACHER_EMAIL },
      {
        name: env.SEED_TEACHER_NAME,
        email: env.SEED_TEACHER_EMAIL,
        schoolId: school._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✅ Seeded: ${env.SEED_SCHOOL_NAME} / ${env.SEED_TEACHER_NAME}`);
  } catch (err) {
    console.error('❌ Seed failed:', err);
  }
}

// Run directly: tsx src/scripts/seed.ts
if (require.main === module) {
  connectDB()
    .then(() => seedDatabase())
    .then(() => {
      mongoose.disconnect();
      process.exit(0);
    });
}
