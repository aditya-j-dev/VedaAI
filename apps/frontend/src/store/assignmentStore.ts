import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Assignment, AssignmentFormData, Profile, Result } from '@vedaai/shared';

export type GenerationStatus = 'idle' | 'queued' | 'processing' | 'rate_limited' | 'completed' | 'failed';

interface AssignmentStore {
  // ─── Form state ──────────────────────────────────────────────────────────
  formData: AssignmentFormData | null;
  formStep: 1 | 2 | 3;
  setFormData: (data: AssignmentFormData) => void;
  setFormStep: (step: 1 | 2 | 3) => void;
  resetForm: () => void;

  // ─── Assignment list ─────────────────────────────────────────────────────
  assignments: Assignment[];
  setAssignments: (a: Assignment[]) => void;
  addAssignment: (a: Assignment) => void;
  removeAssignment: (id: string) => void;

  // ─── Current result ──────────────────────────────────────────────────────
  currentResult: Result | null;
  setCurrentResult: (r: Result | null) => void;

  // ─── Generation / WebSocket state ────────────────────────────────────────
  generationStatus: GenerationStatus;
  generationProgress: number;   // 0–100
  progressMessage: string;
  currentAssignmentId: string | null;
  setGenerationStatus: (
    status: GenerationStatus,
    progress?: number,
    message?: string
  ) => void;
  setCurrentAssignmentId: (id: string | null) => void;
  resetGeneration: () => void;

  // ─── Profile ─────────────────────────────────────────────────────────────
  profile: Profile | null;
  setProfile: (p: Profile) => void;

  // ─── UI ──────────────────────────────────────────────────────────────────
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAssignmentStore = create<AssignmentStore>()(
  devtools(
    (set) => ({
      // ─── Form ──────────────────────────────────────────────────────────
      formData: null,
      formStep: 1,
      setFormData: (data) => set({ formData: data }),
      setFormStep: (step) => set({ formStep: step }),
      resetForm: () => set({ formData: null, formStep: 1 }),

      // ─── Assignments ───────────────────────────────────────────────────
      assignments: [],
      setAssignments: (assignments) => set({ assignments }),
      addAssignment: (a) => set((s) => ({ assignments: [a, ...s.assignments] })),
      removeAssignment: (id) =>
        set((s) => ({ assignments: s.assignments.filter((a) => a._id !== id) })),

      // ─── Result ────────────────────────────────────────────────────────
      currentResult: null,
      setCurrentResult: (r) => set({ currentResult: r }),

      // ─── Generation ────────────────────────────────────────────────────
      generationStatus: 'idle',
      generationProgress: 0,
      progressMessage: '',
      currentAssignmentId: null,
      setGenerationStatus: (status, progress = 0, message = '') =>
        set({ generationStatus: status, generationProgress: progress, progressMessage: message }),
      setCurrentAssignmentId: (id) => set({ currentAssignmentId: id }),
      resetGeneration: () =>
        set({
          generationStatus: 'idle',
          generationProgress: 0,
          progressMessage: '',
          currentAssignmentId: null,
        }),

      // ─── Profile ───────────────────────────────────────────────────────
      profile: null,
      setProfile: (p) => set({ profile: p }),

      // ─── UI ────────────────────────────────────────────────────────────
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    { name: 'VedaAI Store' }
  )
);
