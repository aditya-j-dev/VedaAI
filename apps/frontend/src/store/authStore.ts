import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface AuthTeacher {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  onboardingComplete: boolean;
}

export interface AuthSchool {
  id: string;
  name: string;
  location: string;
  logoUrl?: string;
}

interface AuthStore {
  teacher: AuthTeacher | null;
  school: AuthSchool | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (teacher: AuthTeacher, school: AuthSchool | null) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateSchool: (school: AuthSchool) => void;
  updateTeacher: (teacher: Partial<AuthTeacher>) => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        teacher: null,
        school: null,
        isAuthenticated: false,
        isLoading: true,

        setAuth: (teacher, school) =>
          set({ teacher, school, isAuthenticated: true, isLoading: false }),

        clearAuth: () =>
          set({ teacher: null, school: null, isAuthenticated: false, isLoading: false }),

        setLoading: (isLoading) => set({ isLoading }),

        updateSchool: (school) => set({ school }),

        updateTeacher: (partial) =>
          set((s) => ({ teacher: s.teacher ? { ...s.teacher, ...partial } : null })),
      }),
      {
        name: 'vedaai-auth',
        partialize: (state) => ({
          teacher: state.teacher,
          school: state.school,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'VedaAI Auth Store' }
  )
);
