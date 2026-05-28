import './config/env'; // Must be first — validates env vars
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { env } from './config/env';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { initSocket } from './socket';
import { startGenerationWorker } from './workers/generationWorker';
import assignmentRoutes from './routes/assignments';
import profileRoutes from './routes/profile';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { requireAuth } from './middleware/requireAuth';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { getGenerationQueue } from './queues/generationQueue';

const app = express();
const httpServer = http.createServer(app);

// ─── Bull Board Queue Dashboard ──────────────────────────────────────────────
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(getGenerationQueue())],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

// ─── CORS — explicit origin allowlist ────────────────────────────────────────
app.use(
  cors({
    origin: [env.FRONTEND_URL, env.CLIENT_URL, 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Passport (stateless — JWT via cookies only) ──────────────────────────────
app.use(passport.initialize());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/profile', requireAuth, profileRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  try {
    await connectDB();
    await connectRedis();
    // seedDatabase() removed — teachers self-register now

    initSocket(httpServer);
    startGenerationWorker();

    httpServer.listen(parseInt(env.PORT), () => {
      console.log(`🚀 VedaAI Backend running on http://localhost:${env.PORT}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`🔐 Auth: Google OAuth + Email/Password enabled`);
    });
  } catch (err) {
    console.error('❌ Bootstrap failed:', err);
    process.exit(1);
  }
}

bootstrap();
