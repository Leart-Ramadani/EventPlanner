import { create } from 'zustand';

const GRID_SIZE = 20;

export const useCanvasStore = create((set, get) => ({
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  gridVisible: true,
  snapToGrid: true,
  gridSize: GRID_SIZE,
  stageSize: { width: 1200, height: 800 },

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  setOffset: (offsetX, offsetY) => set({ offsetX, offsetY }),
  setStageSize: (width, height) => set({ stageSize: { width, height } }),
  toggleGrid: () => set((s) => ({ gridVisible: !s.gridVisible })),
  toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),

  fitToScreen: (objects) => {
    const { stageSize } = get();
    if (!objects.length) {
      set({ zoom: 1, offsetX: 0, offsetY: 0 });
      return;
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const obj of objects) {
      minX = Math.min(minX, obj.x);
      minY = Math.min(minY, obj.y);
      maxX = Math.max(maxX, obj.x + obj.width);
      maxY = Math.max(maxY, obj.y + obj.height);
    }
    const padding = 80;
    const contentW = maxX - minX + padding * 2;
    const contentH = maxY - minY + padding * 2;
    const zoom = Math.min(stageSize.width / contentW, stageSize.height / contentH, 2);
    const offsetX = (stageSize.width - contentW * zoom) / 2 - (minX - padding) * zoom;
    const offsetY = (stageSize.height - contentH * zoom) / 2 - (minY - padding) * zoom;
    set({ zoom, offsetX, offsetY });
  },

  resetZoom: () => set({ zoom: 1, offsetX: 0, offsetY: 0 }),

  zoomIn: () => set((s) => ({ zoom: Math.min(5, s.zoom * 1.2) })),
  zoomOut: () => set((s) => ({ zoom: Math.max(0.1, s.zoom / 1.2) })),
}));
