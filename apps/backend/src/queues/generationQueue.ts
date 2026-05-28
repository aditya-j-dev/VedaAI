import { Queue } from 'bullmq';
import { env } from '../config/env';

export interface GenerationJobData {
  assignmentId: string;
}

// 3 attempts with exponential backoff: 2s → 4s → 8s
const JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 2000,
  },
  timeout: 30000, // 30 seconds timeout limit for AI generation
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 200 },
};

// Use URL string to avoid ioredis version conflicts with BullMQ's bundled ioredis
const redisConnection = { url: env.REDIS_URL };

let generationQueue: Queue | null = null;

export function getGenerationQueue(): Queue {
  if (!generationQueue) {
    generationQueue = new Queue('question-generation', {
      connection: redisConnection,
      defaultJobOptions: JOB_OPTIONS,
    });
  }
  return generationQueue;
}

export async function enqueueGeneration(assignmentId: string): Promise<string> {
  const queue = getGenerationQueue();
  const job = await queue.add('generate', { assignmentId }, {
    jobId: `gen-${assignmentId}-${Date.now()}`,
  });

  if (env.ENABLE_LOAD_TESTING) {
    const queueSize = await queue.count();
    console.log(`[QUEUE] Job ${job.id} added for assignment ${assignmentId}. Queue size: ${queueSize}`);
  }

  return job.id ?? assignmentId;
}
