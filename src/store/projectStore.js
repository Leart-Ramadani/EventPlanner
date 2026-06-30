import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { autosave } from '../utils/fileIO.js';
import { updateChairs } from '../utils/objectFactory.js';

const DEFAULT_FLOOR = { id: 'floor_1', name: 'Main Hall', objects: [] };

const DEFAULT_PROJECT = {
  projectName: 'Untitled Event',
  floors: [DEFAULT_FLOOR],
  activeFloorId: 'floor_1',
  guests: [],
  canvas: { zoom: 1, offsetX: 0, offsetY: 0 },
};

export const useProjectStore = create((set, get) => ({
  ...DEFAULT_PROJECT,
  isDirty: false,

  // --- Floors ---
  addFloor: (name) => {
    const floor = { id: `floor_${uuidv4()}`, name: name || 'New Floor', objects: [] };
    set((s) => ({
      floors: [...s.floors, floor],
      activeFloorId: floor.id,
      isDirty: true,
    }));
  },

  removeFloor: (id) => {
    set((s) => {
      const floors = s.floors.filter((f) => f.id !== id);
      if (!floors.length) return s;
      const activeFloorId = s.activeFloorId === id ? floors[0].id : s.activeFloorId;
      return { floors, activeFloorId, isDirty: true };
    });
  },

  renameFloor: (id, name) => {
    set((s) => ({
      floors: s.floors.map((f) => (f.id === id ? { ...f, name } : f)),
      isDirty: true,
    }));
  },

  setActiveFloor: (id) => set({ activeFloorId: id }),

  // --- Active floor objects ---
  getActiveFloor: () => {
    const { floors, activeFloorId } = get();
    return floors.find((f) => f.id === activeFloorId) || floors[0];
  },

  getObjects: () => get().getActiveFloor()?.objects || [],

  _updateActiveFloor: (updater) => {
    set((s) => ({
      floors: s.floors.map((f) =>
        f.id === s.activeFloorId ? { ...f, objects: updater(f.objects) } : f
      ),
      isDirty: true,
    }));
  },

  addObject: (obj) => {
    get()._updateActiveFloor((objs) => {
      const maxZ = objs.length ? Math.max(...objs.map((o) => o.zIndex || 0)) : 0;
      return [...objs, { ...obj, zIndex: maxZ + 1 }];
    });
  },

  updateObject: (id, changes) => {
    get()._updateActiveFloor((objs) =>
      objs.map((o) => {
        if (o.id !== id) return o;
        const updated = { ...o, ...changes };
        return updateChairs(updated);
      })
    );
  },

  updateObjectRaw: (id, changes) => {
    get()._updateActiveFloor((objs) =>
      objs.map((o) => (o.id !== id ? o : { ...o, ...changes }))
    );
  },

  deleteObject: (id) => {
    get()._updateActiveFloor((objs) => objs.filter((o) => o.id !== id));
  },

  deleteObjects: (ids) => {
    const set_ = new Set(ids);
    get()._updateActiveFloor((objs) => objs.filter((o) => !set_.has(o.id)));
  },

  duplicateObject: (id) => {
    const objs = get().getObjects();
    const obj = objs.find((o) => o.id === id);
    if (!obj) return;
    const copy = { ...obj, id: `obj_${uuidv4()}`, x: obj.x + 20, y: obj.y + 20 };
    if (copy.chairs) {
      copy.chairs = copy.chairs.map((c) => ({ ...c, id: `chair_${uuidv4()}`, guestName: '', status: 'available' }));
    }
    get().addObject(copy);
    return copy.id;
  },

  bringForward: (id) => {
    get()._updateActiveFloor((objs) => {
      const sorted = [...objs].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      const idx = sorted.findIndex((o) => o.id === id);
      if (idx < sorted.length - 1) {
        const a = sorted[idx];
        const b = sorted[idx + 1];
        return objs.map((o) => o.id === a.id ? { ...o, zIndex: b.zIndex } : o.id === b.id ? { ...o, zIndex: a.zIndex } : o);
      }
      return objs;
    });
  },

  sendBackward: (id) => {
    get()._updateActiveFloor((objs) => {
      const sorted = [...objs].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      const idx = sorted.findIndex((o) => o.id === id);
      if (idx > 0) {
        const a = sorted[idx];
        const b = sorted[idx - 1];
        return objs.map((o) => o.id === a.id ? { ...o, zIndex: b.zIndex } : o.id === b.id ? { ...o, zIndex: a.zIndex } : o);
      }
      return objs;
    });
  },

  updateChair: (tableId, chairId, changes) => {
    get()._updateActiveFloor((objs) =>
      objs.map((o) => {
        if (o.id !== tableId || !o.chairs) return o;
        return { ...o, chairs: o.chairs.map((c) => (c.id === chairId ? { ...c, ...changes } : c)) };
      })
    );
  },

  reorderObjects: (orderedIds) => {
    get()._updateActiveFloor((objs) => {
      const map = new Map(objs.map((o) => [o.id, o]));
      return orderedIds.map((id, i) => ({ ...map.get(id), zIndex: i })).filter(Boolean);
    });
  },

  // --- Guests ---
  addGuest: (name) => {
    const guest = { id: `guest_${uuidv4()}`, name: name.trim() };
    set((s) => ({ guests: [...s.guests, guest], isDirty: true }));
    return guest;
  },

  removeGuest: (id) => set((s) => ({ guests: s.guests.filter((g) => g.id !== id), isDirty: true })),

  renameGuest: (id, name) => set((s) => ({
    guests: s.guests.map((g) => (g.id === id ? { ...g, name } : g)),
    isDirty: true,
  })),

  // Returns map of guestName -> { tableId, chairId, tableLabel, chairIndex } for all floors
  getAssignments: () => {
    const { floors } = get();
    const map = {};
    for (const floor of floors) {
      for (const obj of floor.objects) {
        if (!obj.chairs) continue;
        for (const chair of obj.chairs) {
          if (chair.guestName) {
            map[chair.guestName] = { tableId: obj.id, chairId: chair.id, tableLabel: obj.label, chairIndex: chair.index };
          }
        }
      }
    }
    return map;
  },

  // Unassign a guest from whichever chair they're currently in (across all floors)
  unassignGuest: (guestName) => {
    set((s) => ({
      floors: s.floors.map((floor) => ({
        ...floor,
        objects: floor.objects.map((obj) => {
          if (!obj.chairs) return obj;
          const hasGuest = obj.chairs.some((c) => c.guestName === guestName);
          if (!hasGuest) return obj;
          return { ...obj, chairs: obj.chairs.map((c) => c.guestName === guestName ? { ...c, guestName: '' } : c) };
        }),
      })),
      isDirty: true,
    }));
  },

  // --- Project management ---
  setProjectName: (name) => set({ projectName: name, isDirty: true }),

  loadProject: (data) => {
    set({
      projectName: data.projectName || 'Untitled Event',
      floors: data.floors || [DEFAULT_FLOOR],
      activeFloorId: data.activeFloorId || data.floors?.[0]?.id || 'floor_1',
      guests: data.guests || [],
      isDirty: false,
    });
  },

  newProject: () => {
    const newFloor = { ...DEFAULT_FLOOR, id: `floor_${uuidv4()}` };
    set({ ...DEFAULT_PROJECT, floors: [newFloor], activeFloorId: newFloor.id, guests: [], isDirty: false });
  },

  markClean: () => set({ isDirty: false }),

  exportData: () => {
    const { projectName, floors, activeFloorId, guests } = get();
    return { projectName, floors, activeFloorId, guests };
  },

  // Align multiple objects
  updateObjects: (updates) => {
    get()._updateActiveFloor((objs) => {
      const map = new Map(updates.map((u) => [u.id, u]));
      return objs.map((o) => (map.has(o.id) ? { ...o, ...map.get(o.id) } : o));
    });
  },
}));
