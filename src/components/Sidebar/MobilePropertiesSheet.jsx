import { useState } from 'react';
import { useSelectionStore } from '../../store/selectionStore.js';
import { useProjectStore } from '../../store/projectStore.js';
import { useHistoryStore } from '../../store/historyStore.js';
import { TABLE_TYPES, OBJECT_TYPES } from '../../data/defaultShapes.js';
import { X, ChevronUp, Trash2, Copy, Lock, Unlock, Eye, EyeOff, Layers } from 'lucide-react';

export default function MobilePropertiesSheet() {
  const [expanded, setExpanded] = useState(false);
  const { selectedIds, deselect } = useSelectionStore();
  const { getObjects, updateObject, updateObjectRaw, deleteObject, duplicateObject, exportData } = useProjectStore();
  const { push } = useHistoryStore();

  const objects = getObjects();
  const obj = objects.find((o) => o.id === selectedIds[0]);

  if (!selectedIds.length || !obj) return null;

  const isTable = TABLE_TYPES.includes(obj.type);
  const update = (c) => updateObject(obj.id, c);
  const rawUpdate = (c) => updateObjectRaw(obj.id, c);

  const QuickBtn = ({ icon, label, onClick, danger, active }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-all active:scale-95 ${danger ? 'text-red-500 bg-red-50' : active ? 'text-blue-600 bg-blue-50' : 'text-gray-600 bg-gray-50'}`}
    >
      {icon}
      <span className="text-[9px]">{label}</span>
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-2xl border-t border-gray-200">
      {/* Collapsed strip */}
      <div className="flex items-center gap-2 px-3 py-2">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 flex-1 min-w-0">
          <ChevronUp size={16} className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          <span className="text-sm font-semibold text-gray-800 truncate">{obj.label || obj.type}</span>
          {isTable && <span className="text-xs text-gray-400">· {obj.chairCount} chairs</span>}
        </button>

        {/* Quick actions always visible */}
        <div className="flex items-center gap-1">
          {isTable && (
            <>
              <button onClick={() => update({ chairCount: Math.max(1, (obj.chairCount||1) - 1) })} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-700">−</button>
              <span className="text-sm font-semibold w-6 text-center">{obj.chairCount}</span>
              <button onClick={() => update({ chairCount: Math.min(30, (obj.chairCount||1) + 1) })} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-700">+</button>
            </>
          )}
          <button onClick={() => { push(exportData()); deleteObject(obj.id); deselect(); }} className="ml-1 p-2 rounded-xl bg-red-50 text-red-500">
            <Trash2 size={16} />
          </button>
          <button onClick={deselect} className="p-2 rounded-xl bg-gray-100 text-gray-500">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-4 space-y-4 border-t border-gray-100 pt-3 max-h-72 overflow-y-auto">
          {/* Action row */}
          <div className="grid grid-cols-5 gap-2">
            <QuickBtn icon={<Copy size={16}/>} label="Copy" onClick={() => { push(exportData()); duplicateObject(obj.id); }} />
            <QuickBtn icon={obj.locked ? <Lock size={16}/> : <Unlock size={16}/>} label={obj.locked ? 'Unlock' : 'Lock'} onClick={() => rawUpdate({ locked: !obj.locked })} active={obj.locked} />
            <QuickBtn icon={obj.visible !== false ? <Eye size={16}/> : <EyeOff size={16}/>} label={obj.visible !== false ? 'Hide' : 'Show'} onClick={() => rawUpdate({ visible: !obj.visible })} />
            <QuickBtn icon={<Layers size={16}/>} label="Forward" onClick={() => useProjectStore.getState().bringForward(obj.id)} />
            <QuickBtn icon={<Trash2 size={16}/>} label="Delete" onClick={() => { push(exportData()); deleteObject(obj.id); deselect(); }} danger />
          </div>

          {/* Label */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Label</label>
            <input type="text" value={obj.label||''} onChange={(e) => rawUpdate({ label: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Position & size */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">X</label>
              <input type="number" value={Math.round(obj.x)} onChange={(e) => rawUpdate({ x: +e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Y</label>
              <input type="number" value={Math.round(obj.y)} onChange={(e) => rawUpdate({ y: +e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Width</label>
              <input type="number" value={Math.round(obj.width)} onChange={(e) => update({ width: +e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Height</label>
              <input type="number" value={Math.round(obj.height)} onChange={(e) => update({ height: +e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none" />
            </div>
          </div>

          {/* Colors */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 block mb-1">Fill</label>
              <input type="color" value={obj.color === 'transparent' ? '#ffffff' : (obj.color||'#ffffff')}
                onChange={(e) => rawUpdate({ color: e.target.value })}
                className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 block mb-1">Border</label>
              <input type="color" value={obj.borderColor||'#000000'}
                onChange={(e) => rawUpdate({ borderColor: e.target.value })}
                className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
