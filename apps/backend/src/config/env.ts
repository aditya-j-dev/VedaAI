import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  LLM_MODEL: z.string().default('gemini-1.5-flash'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  // Auth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  SERVER_URL: z.string().default('http://localhost:4000'),
  // Seed (kept for backward compat but no longer used)
  SEED_SCHOOL_NAME: z.string().default('Delhi Public School'),
  SEED_SCHOOL_LOCATION: z.string().default('Bokaro Steel City'),
  SEED_TEACHER_NAME: z.string().default('Lakshya Sharma'),
  SEED_TEACHER_EMAIL: z.string().email().default('lakshya@dps.edu'),
  // Load testing and worker configuration
  ENABLE_LOAD_TESTING: z.string().transform(v => v === 'true').default('false'),
  MOCK_AI_DELAY: z.string().transform(v => v === 'true').default('false'),
  WORKER_CONCURRENCY: z.string().transform(Number).default('5'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
