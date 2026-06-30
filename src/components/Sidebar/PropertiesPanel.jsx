import { useCallback } from 'react';
import { useProjectStore } from '../../store/projectStore.js';
import { useSelectionStore } from '../../store/selectionStore.js';
import { useHistoryStore } from '../../store/historyStore.js';
import { TABLE_TYPES, OBJECT_TYPES } from '../../data/defaultShapes.js';
import { alignObjects, distributeHorizontally, distributeVertically } from '../../utils/geometry.js';
import {
  AlignLeft, AlignRight, AlignCenterHorizontal, AlignCenterVertical,
  AlignStartVertical, AlignEndVertical, Trash2, Copy, Lock, Unlock, Eye, EyeOff,
  User, UserX
} from 'lucide-react';

function Label({ children }) {
  return <label className="block text-xs font-medium text-gray-500 mb-1">{children}</label>;
}

function Input({ value, onChange, type = 'text', min, max, step }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  );
}

function ColorInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value === 'transparent' ? '#ffffff' : (value || '#ffffff')}
        onChange={onChange}
        className="w-8 h-8 rounded cursor-pointer border border-gray-200"
      />
      <input
        type="text"
        value={value || ''}
        onChange={onChange}
        placeholder="#000000"
        className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default function PropertiesPanel() {
  const { selectedIds, deselect } = useSelectionStore();
  const { getObjects, updateObject, updateObjectRaw, deleteObject, deleteObjects, duplicateObject, exportData, updateObjects } = useProjectStore();
  const { push } = useHistoryStore();

  const objects = getObjects();
  const selectedObjects = objects.filter((o) => selectedIds.includes(o.id));
  const obj = selectedObjects[0];

  if (!selectedIds.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm p-4 text-center">
        <div className="text-4xl mb-3">🎯</div>
        <p className="font-medium text-gray-500">No object selected</p>
        <p className="text-xs mt-1">Click an object on the canvas to see its properties</p>
      </div>
    );
  }

  if (selectedIds.length > 1) {
    return <MultiSelectPanel selectedObjects={selectedObjects} push={push} exportData={exportData} updateObjects={updateObjects} deleteObjects={deleteObjects} deselect={deselect} />;
  }

  const isTable = TABLE_TYPES.includes(obj?.type);
  const isText = obj?.type === OBJECT_TYPES.TEXT;

  const update = (changes) => {
    updateObject(obj.id, changes);
  };

  const rawUpdate = (changes) => {
    updateObjectRaw(obj.id, changes);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{obj?.label || obj?.type}</h3>
        <div className="flex gap-1">
          <button onClick={() => { push(exportData()); duplicateObject(obj.id); }} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate"><Copy size={14} /></button>
          <button onClick={() => rawUpdate({ locked: !obj.locked })} className={`p-1.5 rounded ${obj.locked ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100'}`} title={obj.locked ? 'Unlock' : 'Lock'}>
            {obj.locked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
          <button onClick={() => rawUpdate({ visible: !obj.visible })} className="p-1.5 hover:bg-gray-100 rounded" title={obj.visible ? 'Hide' : 'Show'}>
            {obj.visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button onClick={() => { push(exportData()); deleteObject(obj.id); deselect(); }} className="p-1.5 hover:bg-red-50 text-red-500 rounded" title="Delete"><Trash2 size={14} /></button>
        </div>
      </div>

      <div className="p-3 space-y-4">
        {/* Position & Size */}
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Transform</p>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>X</Label><Input type="number" value={Math.round(obj.x)} onChange={(e) => rawUpdate({ x: +e.target.value })} /></div>
            <div><Label>Y</Label><Input type="number" value={Math.round(obj.y)} onChange={(e) => rawUpdate({ y: +e.target.value })} /></div>
            <div><Label>Width</Label><Input type="number" value={Math.round(obj.width)} min={10} onChange={(e) => update({ width: +e.target.value })} /></div>
            <div><Label>Height</Label><Input type="number" value={Math.round(obj.height)} min={10} onChange={(e) => update({ height: +e.target.value })} /></div>
            <div><Label>Rotation (°)</Label><Input type="number" value={Math.round(obj.rotation || 0)} onChange={(e) => rawUpdate({ rotation: +e.target.value })} /></div>
            <div><Label>Opacity (%)</Label><Input type="number" value={Math.round((obj.opacity ?? 1) * 100)} min={0} max={100} onChange={(e) => rawUpdate({ opacity: +e.target.value / 100 })} /></div>
          </div>
        </section>

        {/* Label */}
        <section>
          <Label>Label</Label>
          <Input value={obj.label || ''} onChange={(e) => rawUpdate({ label: e.target.value })} />
        </section>

        {/* Appearance */}
        {obj.type !== OBJECT_TYPES.LINE && (
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Appearance</p>
            <div className="space-y-2">
              <div><Label>Fill Color</Label><ColorInput value={obj.color} onChange={(e) => rawUpdate({ color: e.target.value })} /></div>
              <div><Label>Border Color</Label><ColorInput value={obj.borderColor} onChange={(e) => rawUpdate({ borderColor: e.target.value })} /></div>
            </div>
          </section>
        )}

        {/* Table options */}
        {isTable && (
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Table</p>
            <div className="space-y-2">
              <div>
                <Label>Chairs</Label>
                <div className="flex items-center gap-2">
                  <button onClick={() => update({ chairCount: Math.max(1, (obj.chairCount || 1) - 1) })} className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-lg">−</button>
                  <span className="flex-1 text-center font-semibold">{obj.chairCount}</span>
                  <button onClick={() => update({ chairCount: Math.min(30, (obj.chairCount || 1) + 1) })} className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-lg">+</button>
                </div>
              </div>
              <div><Label>Notes</Label><textarea value={obj.notes || ''} onChange={(e) => rawUpdate({ notes: e.target.value })} rows={2} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            </div>
          </section>
        )}

        {/* Seat roster — shown when a table is selected */}
        {isTable && obj.chairs?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Seat List</p>
              <span className="text-xs text-gray-400">
                {obj.chairs.filter((c) => c.guestName).length}/{obj.chairs.length} filled
              </span>
            </div>
            <div className="space-y-1">
              {obj.chairs.map((chair, i) => (
                <SeatRow key={chair.id} chair={chair} index={i} tableId={obj.id} />
              ))}
            </div>
          </section>
        )}

        {/* Text options */}
        {isText && (
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Text</p>
            <div className="space-y-2">
              <div><Label>Font Size</Label><Input type="number" value={obj.fontSize || 18} min={6} max={200} onChange={(e) => rawUpdate({ fontSize: +e.target.value })} /></div>
              <div>
                <Label>Weight</Label>
                <select value={obj.fontWeight || 'normal'} onChange={(e) => rawUpdate({ fontWeight: e.target.value })} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none">
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
              <div>
                <Label>Alignment</Label>
                <select value={obj.align || 'left'} onChange={(e) => rawUpdate({ align: e.target.value })} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none">
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div><Label>Text Color</Label><ColorInput value={obj.color === 'transparent' ? '#1f2937' : obj.color} onChange={(e) => rawUpdate({ color: e.target.value })} /></div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SeatRow({ chair, index, tableId }) {
  const { updateChair } = useProjectStore();
  const { setEditingChair } = useSelectionStore();

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${chair.guestName ? 'bg-blue-50 hover:bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'}`}
      onClick={() => setEditingChair(tableId, chair.id)}
      title="Click to edit seat"
    >
      <span className="text-gray-400 font-mono w-5 flex-shrink-0">{index + 1}</span>
      {chair.guestName ? (
        <>
          <User size={11} className="text-blue-500 flex-shrink-0" />
          <span className="flex-1 font-medium text-gray-800 truncate">{chair.guestName}</span>
        </>
      ) : (
        <>
          <UserX size={11} className="text-gray-300 flex-shrink-0" />
          <span className="flex-1 text-gray-400 italic">Empty</span>
        </>
      )}
    </div>
  );
}

function MultiSelectPanel({ selectedObjects, push, exportData, updateObjects, deleteObjects, deselect }) {
  const applyAlign = (type) => {
    push(exportData());
    const updates = alignObjects(selectedObjects, type);
    updateObjects(updates);
  };

  const applyDistH = () => {
    push(exportData());
    updateObjects(distributeHorizontally(selectedObjects));
  };

  const applyDistV = () => {
    push(exportData());
    updateObjects(distributeVertically(selectedObjects));
  };

  return (
    <div className="p-3 space-y-4">
      <p className="text-sm font-semibold text-gray-700">{selectedObjects.length} objects selected</p>

      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Align</p>
        <div className="grid grid-cols-3 gap-1">
          {[
            { label: 'Left', icon: <AlignLeft size={14} />, type: 'left' },
            { label: 'Center H', icon: <AlignCenterHorizontal size={14} />, type: 'centerH' },
            { label: 'Right', icon: <AlignRight size={14} />, type: 'right' },
            { label: 'Top', icon: <AlignStartVertical size={14} />, type: 'top' },
            { label: 'Center V', icon: <AlignCenterVertical size={14} />, type: 'centerV' },
            { label: 'Bottom', icon: <AlignEndVertical size={14} />, type: 'bottom' },
          ].map((a) => (
            <button key={a.type} onClick={() => applyAlign(a.type)} className="flex flex-col items-center gap-1 p-2 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
              {a.icon}<span>{a.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Distribute</p>
        <div className="flex gap-2">
          <button onClick={applyDistH} className="flex-1 py-1.5 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg border border-gray-200 transition-colors">Horizontal</button>
          <button onClick={applyDistV} className="flex-1 py-1.5 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg border border-gray-200 transition-colors">Vertical</button>
        </div>
      </section>

      <button
        onClick={() => { push(exportData()); deleteObjects(selectedObjects.map((o) => o.id)); deselect(); }}
        className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors flex items-center justify-center gap-2"
      >
        <Trash2 size={14} /> Delete All
      </button>
    </div>
  );
}
