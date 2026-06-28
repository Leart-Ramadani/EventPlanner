import { create } from 'zustand';

const MAX_HISTORY = 50;

export const useHistoryStore = create((set, get) => ({
  past: [],
  future: [],

  push: (snapshot) => {
    set((s) => ({
      past: [...s.past.slice(-(MAX_HISTORY - 1)), snapshot],
      future: [],
    }));
  },

  undo: (currentSnapshot, applyFn) => {
    const { past } = get();
    if (!past.length) return;
    const previous = past[past.length - 1];
    set((s) => ({
      past: s.past.slice(0, -1),
      future: [currentSnapshot, ...s.future],
    }));
    applyFn(previous);
  },

  redo: (currentSnapshot, applyFn) => {
    const { future } = get();
    if (!future.length) return;
    const next = future[0];
    set((s) => ({
      future: s.future.slice(1),
      past: [...s.past, currentSnapshot],
    }));
    applyFn(next);
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  clear: () => set({ past: [], future: [] }),
}));
