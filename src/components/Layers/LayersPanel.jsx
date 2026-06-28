import { useState, useCallback } from 'react';
import { useProjectStore } from '../../store/projectStore.js';
import { useSelectionStore } from '../../store/selectionStore.js';
import { Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react';

function getTypeIcon(type) {
  const icons = {
    round_table: '⭕', rect_table: '▭', oval_table: '🟡', square_table: '⬜',
    stage: '🎭', dance_floor: '💃', bar: '🍸', buffet: '🍽️', dj_booth: '🎧',
    gift_table: '🎁', cake_table: '🎂', entrance: '🚪', exit: '🚪', bathroom: '🚻',
    wall: '▬', rectangle: '▭', circle: '○', line: '╱', text: 'T', plant: '🌿', parking: '🅿️',
  };
  return icons[type] || '□';
}

export default function LayersPanel() {
  const { getObjects, updateObjectRaw, deleteObject, reorderObjects, exportData } = useProjectStore();
  const { selectedIds, select, addToSelection } = useSelectionStore();
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');

  const objects = [...getObjects()].reverse(); // top-first

  const startEdit = (obj, e) => {
    e.stopPropagation();
    setEditingId(obj.id);
    setEditLabel(obj.label || '');
  };

  const commitEdit = (id) => {
    updateObjectRaw(id, { label: editLabel });
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-gray-100">
        <p className="text-xs text-gray-400">{objects.length} object{objects.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {objects.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-gray-400">No objects yet</div>
        )}
        {objects.map((obj) => {
          const isSelected = selectedIds.includes(obj.id);
          return (
            <div
              key={obj.id}
              onClick={(e) => e.shiftKey ? addToSelection(obj.id) : select(obj.id)}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}`}
            >
              <span className="text-sm leading-none flex-shrink-0">{getTypeIcon(obj.type)}</span>
              <div className="flex-1 min-w-0">
                {editingId === obj.id ? (
                  <input
                    autoFocus
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onBlur={() => commitEdit(obj.id)}
                    onKeyDown={(e) => e.key === 'Enter' && commitEdit(obj.id)}
                    className="w-full text-xs border-b border-blue-400 outline-none bg-transparent"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p className="text-xs font-medium text-gray-700 truncate" onDoubleClick={(e) => startEdit(obj, e)}>
                    {obj.label || obj.type}
                  </p>
                )}
              </div>
              <div className="flex gap-0.5 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); updateObjectRaw(obj.id, { visible: !obj.visible }); }}
                  className="p-0.5 rounded hover:bg-gray-200 text-gray-400"
                >
                  {obj.visible !== false ? <Eye size={11} /> : <EyeOff size={11} className="text-gray-300" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); updateObjectRaw(obj.id, { locked: !obj.locked }); }}
                  className={`p-0.5 rounded hover:bg-gray-200 ${obj.locked ? 'text-yellow-500' : 'text-gray-400'}`}
                >
                  {obj.locked ? <Lock size={11} /> : <Unlock size={11} />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteObject(obj.id); }}
                  className="p-0.5 rounded hover:bg-red-100 text-gray-300 hover:text-red-500"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
