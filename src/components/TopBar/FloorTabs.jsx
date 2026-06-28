import { useState } from 'react';
import { useProjectStore } from '../../store/projectStore.js';
import { Plus, X } from 'lucide-react';

export default function FloorTabs() {
  const { floors, activeFloorId, setActiveFloor, addFloor, removeFloor, renameFloor } = useProjectStore();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const startEdit = (floor, e) => {
    e.stopPropagation();
    setEditingId(floor.id);
    setEditName(floor.name);
  };

  const commitEdit = () => {
    if (editName.trim()) renameFloor(editingId, editName.trim());
    setEditingId(null);
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {floors.map((floor) => (
        <div
          key={floor.id}
          onClick={() => setActiveFloor(floor.id)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap select-none ${activeFloorId === floor.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          {editingId === floor.id ? (
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
              className="bg-transparent outline-none border-b border-white w-20"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span onDoubleClick={(e) => startEdit(floor, e)}>{floor.name}</span>
          )}
          {floors.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); removeFloor(floor.id); }}
              className="ml-1 opacity-60 hover:opacity-100"
            >
              <X size={10} />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => addFloor()}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        title="Add Floor"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
