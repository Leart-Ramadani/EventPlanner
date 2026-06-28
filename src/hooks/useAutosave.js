import { useEffect, useRef } from 'react';
import { useProjectStore } from '../store/projectStore.js';
import { useAuthStore } from '../store/authStore.js';
import { autosave } from '../utils/fileIO.js';
import { saveProjectToCloud } from '../utils/cloudSync.js';

export function useAutosave(intervalMs = 15000) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const state = useProjectStore.getState();
      if (!state.isDirty) return;

      const data = state.exportData();
      autosave(data);

      const { user } = useAuthStore.getState();
      if (user) {
        saveProjectToCloud(user.id, data).catch(console.error);
      }

      state.markClean();
    }, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [intervalMs]);
}
