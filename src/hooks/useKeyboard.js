import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore.js';
import { useSelectionStore } from '../store/selectionStore.js';
import { useHistoryStore } from '../store/historyStore.js';
import { useCanvasStore } from '../store/canvasStore.js';

export function useKeyboard() {
  const { deleteObjects, duplicateObject, exportData, loadProject, getObjects } = useProjectStore();
  const { selectedIds, deselect } = useSelectionStore();
  const { undo, redo, push } = useHistoryStore();
  const { zoomIn, zoomOut } = useCanvasStore();

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (isTyping) return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'z') {
        e.preventDefault();
        undo(exportData(), (snap) => loadProject(snap));
      } else if (ctrl && (e.key === 'y' || (e.key === 'Z' && e.shiftKey))) {
        e.preventDefault();
        redo(exportData(), (snap) => loadProject(snap));
      } else if (ctrl && e.key === 'd') {
        e.preventDefault();
        if (selectedIds.length === 1) {
          push(exportData());
          duplicateObject(selectedIds[0]);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length) {
          push(exportData());
          deleteObjects(selectedIds);
          deselect();
        }
      } else if (ctrl && e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (ctrl && e.key === '-') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === 'Escape') {
        deselect();
      } else if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key) && selectedIds.length) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        const objects = getObjects();
        const updates = selectedIds.map((id) => {
          const obj = objects.find((o) => o.id === id);
          return obj ? { id, x: obj.x + dx, y: obj.y + dy } : null;
        }).filter(Boolean);
        useProjectStore.getState().updateObjects(updates);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedIds, deleteObjects, duplicateObject, exportData, loadProject, undo, redo, push, deselect, zoomIn, zoomOut, getObjects]);
}
