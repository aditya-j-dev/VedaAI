import { Server } from 'socket.io';

let io: Server | null = null;

export function setSocketServer(server: Server): void {
  io = server;
}

export function emitToRoom(
  assignmentId: string,
  event: string,
  data: Record<string, unknown>
): void {
  if (!io) {
    console.warn('⚠️  Socket.io server not initialized');
    return;
  }
  io.of('/assignments').to(`assignment:${assignmentId}`).emit(event, {
    assignmentId,
    ...data,
  });
}
