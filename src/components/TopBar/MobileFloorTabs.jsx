import { useState } from 'react';
import { useProjectStore } from '../../store/projectStore.js';
import { Plus, X } from 'lucide-react';

export default function MobileFloorTabs() {
  const { floors, activeFloorId, setActiveFloor, addFloor, removeFloor } = useProjectStore();

  return (
    <div className="bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-2 overflow-x-auto flex-shrink-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex-shrink-0">Floor:</span>
      <div className="flex gap-2 flex-1 overflow-x-auto">
        {floors.map((floor) => (
          <div
            key={floor.id}
            onClick={() => setActiveFloor(floor.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 cursor-pointer select-none ${
              activeFloorId === floor.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {floor.name}
            {floors.length > 1 && (
              <span
                onClick={(e) => { e.stopPropagation(); removeFloor(floor.id); }}
                className="opacity-70 hover:opacity-100 -mr-0.5 cursor-pointer"
              >
                <X size={10} />
              </span>
            )}
          </div>
        ))}
        <button onClick={() => addFloor()} className="p-1 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
