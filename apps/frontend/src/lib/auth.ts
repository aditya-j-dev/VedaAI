import { apiClient } from './api';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ─── Sign in with Google (redirect flow) ─────────────────────────────────────
export function signInWithGoogle(): void {
  window.location.href = `${API_URL}/api/auth/google`;
}

// ─── Email / Password Register ────────────────────────────────────────────────
export async function emailRegister(name: string, email: string, password: string) {
  const res = await apiClient.post('/api/auth/email/register', { name, email, password });
  return res.data;
}

// ─── Email / Password Login ───────────────────────────────────────────────────
export async function emailLogin(email: string, password: string) {
  const res = await apiClient.post('/api/auth/email/login', { email, password });
  return res.data;
}

// ─── Sign out ─────────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  await apiClient.post('/api/auth/logout');
  useAuthStore.getState().clearAuth();
}

// ─── Get current session ──────────────────────────────────────────────────────
export async function getSession() {
  try {
    const res = await apiClient.get('/api/auth/me');
    return res.data.data; // { teacher, school }
  } catch {
    return null;
  }
}

// ─── Complete onboarding ──────────────────────────────────────────────────────
export async function completeOnboarding(name: string, schoolName: string, schoolLocation: string) {
  const res = await apiClient.put('/api/auth/onboarding', { name, schoolName, schoolLocation });
  return res.data.data; // { teacher, school }
}
