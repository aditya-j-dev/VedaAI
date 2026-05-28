'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAssignmentStore } from '@/store/assignmentStore';
import { assignmentApi } from '@/lib/api';
import toast from 'react-hot-toast';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

/**
 * Full WebSocket hook for real-time generation updates.
 * Connects to /assignments namespace, joins the assignment room,
 * listens to all 5 job events, and cleans up properly on unmount.
 */
export function useAssignmentSocket(assignmentId: string | null) {
  const { setGenerationStatus, setCurrentResult, setCurrentAssignmentId } = useAssignmentStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!assignmentId) return;

    setCurrentAssignmentId(assignmentId);

    // Create socket connection
    const socket = io(`${WS_URL}/assignments`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 WS connected:', socket.id);
      socket.emit('join', { assignmentId });
    });

    socket.on('connect_error', (err) => {
      console.error('❌ WS connect error:', err.message);
    });

    // ── Event Handlers ──────────────────────────────────────────────────────
    socket.on('job:queued', (data: { progress?: number; message?: string }) => {
      setGenerationStatus('queued', data.progress ?? 5, 'Job queued — waiting to start...');
    });

    socket.on('job:processing', (data: { progress: number; message: string }) => {
      setGenerationStatus('processing', data.progress, data.message);
    });

    socket.on('job:progress', (data: { progress: number; message: string }) => {
      setGenerationStatus('processing', data.progress, data.message);
    });

    socket.on('job:completed', async (data: { resultId: string }) => {
      setGenerationStatus('completed', 100, 'Question paper ready!');
      toast.success('Question paper generated successfully!');

      // Fetch the result from API
      try {
        const res = await assignmentApi.getResult(assignmentId);
        setCurrentResult(res.data.data);
      } catch (err) {
        console.error('Failed to fetch result after completion:', err);
      }
    });

    socket.on('job:failed', (data: { error: string; isQuotaLimited?: boolean }) => {
      if (data.isQuotaLimited) {
        setGenerationStatus('rate_limited', 0, data.error ?? 'Gemini API quota exceeded.');
        toast.error('AI Quota Limit Reached. Please upgrade your AI plan.');
      } else {
        setGenerationStatus('failed', 0, data.error ?? 'Generation failed. Please try again.');
        toast.error('Generation failed. Please retry.');
      }
    });

    // ── Cleanup — socket.off + socket.disconnect ────────────────────────────
    return () => {
      socket.off('job:queued');
      socket.off('job:processing');
      socket.off('job:progress');
      socket.off('job:completed');
      socket.off('job:failed');
      socket.off('connect');
      socket.off('connect_error');
      socket.emit('leave', { assignmentId });
      socket.disconnect();
      socketRef.current = null;
      console.log('🔌 WS disconnected and cleaned up');
    };
  }, [assignmentId, setGenerationStatus, setCurrentResult, setCurrentAssignmentId]);

  return socketRef;
}
