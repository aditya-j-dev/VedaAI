import axios from 'axios';
import type { Assignment, Result, Profile, PaginatedResponse, ApiResponse } from '@vedaai/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send JWT cookie with every request
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message ?? err.message ?? 'Request failed';
    return Promise.reject(new Error(message));
  }
);

// ─── Assignment API ───────────────────────────────────────────────────────────
export const assignmentApi = {
  create: (formData: FormData) =>
    apiClient.post<ApiResponse<Assignment>>('/api/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  list: (params?: { search?: string; page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<Assignment>>('/api/assignments', { params }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Assignment>>(`/api/assignments/${id}`),

  getResult: (id: string) =>
    apiClient.get<ApiResponse<Result>>(`/api/assignments/${id}/result`),

  regenerate: (id: string) =>
    apiClient.post<ApiResponse<null>>(`/api/assignments/${id}/regenerate`),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/api/assignments/${id}`),

  getPDFUrl: (id: string, showDifficulty: boolean = false) => `${API_URL}/api/assignments/${id}/pdf?showDifficulty=${showDifficulty}`,
};

// ─── Profile API ──────────────────────────────────────────────────────────────
export const profileApi = {
  get: () => apiClient.get<ApiResponse<Profile>>('/api/profile'),
  update: (formData: FormData) => apiClient.put<ApiResponse<Profile>>('/api/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ─── Health API ───────────────────────────────────────────────────────────────
export const healthApi = {
  check: () => apiClient.get('/api/health'),
};

// ─── Auth API ──────────────────────────────────────────────────────
export const authApi = {
  me: () => apiClient.get('/api/auth/me'),
  logout: () => apiClient.post('/api/auth/logout'),
  emailRegister: (name: string, email: string, password: string) =>
    apiClient.post('/api/auth/email/register', { name, email, password }),
  emailLogin: (email: string, password: string) =>
    apiClient.post('/api/auth/email/login', { email, password }),
  completeOnboarding: (name: string, schoolName: string, schoolLocation: string) =>
    apiClient.put('/api/auth/onboarding', { name, schoolName, schoolLocation }),
};
