import { create } from "zustand";
import type { Question } from "@/lib/api/questions";

interface SessionFilters {
  topic?: string;
  difficulty?: string;
  year?: string;
  session?: string;
}

interface SessionState {
  // The full shuffled question list for the current session
  questions: Question[];
  currentIndex: number;
  viewedIds: Set<number>;
  filters: SessionFilters;
  component: string | null;

  // Actions
  setQuestions: (questions: Question[]) => void;
  setCurrentIndex: (index: number) => void;
  markViewed: (id: number) => void;
  setFilters: (filters: SessionFilters) => void;
  setComponent: (component: string) => void;
  resetSession: () => void;
  goNext: () => void;
  goPrev: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  viewedIds: new Set(),
  filters: {},
  component: null,

  setQuestions: (questions) =>
    set({ questions, currentIndex: 0, viewedIds: new Set() }),

  setCurrentIndex: (currentIndex) => {
    const { questions } = get();
    const q = questions[currentIndex];
    if (q) {
      set((state) => ({
        currentIndex,
        viewedIds: new Set([...state.viewedIds, q.id]),
      }));
    }
  },

  markViewed: (id) =>
    set((state) => ({ viewedIds: new Set([...state.viewedIds, id]) })),

  setFilters: (filters) => set({ filters }),

  setComponent: (component) => set({ component }),

  resetSession: () =>
    set({ questions: [], currentIndex: 0, viewedIds: new Set() }),

  goNext: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      const q = questions[nextIndex];
      set((state) => ({
        currentIndex: nextIndex,
        viewedIds: q ? new Set([...state.viewedIds, q.id]) : state.viewedIds,
      }));
    }
  },

  goPrev: () => {
    const { currentIndex, questions } = get();
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const q = questions[prevIndex];
      set((state) => ({
        currentIndex: prevIndex,
        viewedIds: q ? new Set([...state.viewedIds, q.id]) : state.viewedIds,
      }));
    }
  },
}));
