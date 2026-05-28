import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env';
import { setSocketServer } from '../services/socketService';

export function initSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: [env.FRONTEND_URL, 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  const assignmentsNs = io.of('/assignments');

  assignmentsNs.on('connection', (socket) => {
    console.log(`🔌 WS connected: ${socket.id}`);

    // Client joins assignment room to receive updates
    socket.on('join', ({ assignmentId }: { assignmentId: string }) => {
      if (!assignmentId) return;
      socket.join(`assignment:${assignmentId}`);
      console.log(`🚪 ${socket.id} joined room: assignment:${assignmentId}`);
    });

    socket.on('leave', ({ assignmentId }: { assignmentId: string }) => {
      socket.leave(`assignment:${assignmentId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 WS disconnected: ${socket.id} (${reason})`);
    });

    socket.on('error', (err) => {
      console.error(`❌ Socket error (${socket.id}):`, err);
    });
  });

  setSocketServer(io);
  console.log('✅ Socket.io initialized on namespace /assignments');
  return io;
}
