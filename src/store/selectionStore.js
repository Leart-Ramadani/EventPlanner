import { create } from 'zustand';

export const useSelectionStore = create((set, get) => ({
  selectedIds: [],
  hoveredId: null,
  editingChair: null, // { tableId, chairId }
  tool: 'select', // 'select' | 'pan'
  assigningGuestId: null,

  setTool: (tool) => set({ tool }),
  select: (id) => set({ selectedIds: [id] }),
  selectMultiple: (ids) => set({ selectedIds: ids }),
  addToSelection: (id) => set((s) => ({ selectedIds: [...new Set([...s.selectedIds, id])] })),
  deselect: () => set({ selectedIds: [] }),
  setHovered: (id) => set({ hoveredId: id }),
  clearHovered: () => set({ hoveredId: null }),

  setEditingChair: (tableId, chairId) => set({ editingChair: tableId && chairId ? { tableId, chairId } : null }),
  clearEditingChair: () => set({ editingChair: null }),

  setAssigningGuest: (id) => set({ assigningGuestId: id }),
  clearAssigningGuest: () => set({ assigningGuestId: null }),

  isSelected: (id) => get().selectedIds.includes(id),
}));
