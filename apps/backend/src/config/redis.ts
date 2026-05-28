import Redis from 'ioredis';
import { env } from './env';

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null, // Required by BullMQ
      enableReadyCheck: false,
      lazyConnect: true,
    });

    redisClient.on('connect', () => console.log('✅ Redis connected'));
    redisClient.on('error', (err) => console.error('❌ Redis error:', err));
    redisClient.on('close', () => console.warn('⚠️  Redis connection closed'));
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  const client = getRedis();
  await client.connect();
}
