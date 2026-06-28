import { useEffect, useRef } from 'react';
import { useProjectStore } from '../store/projectStore.js';
import { autosave } from '../utils/fileIO.js';

export function useAutosave(intervalMs = 15000) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const state = useProjectStore.getState();
      if (state.isDirty) {
        autosave(state.exportData());
        state.markClean();
      }
    }, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [intervalMs]);
}
