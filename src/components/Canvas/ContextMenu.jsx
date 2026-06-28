import { useEffect, useRef } from 'react';
import { useProjectStore } from '../../store/projectStore.js';
import { useSelectionStore } from '../../store/selectionStore.js';
import { useHistoryStore } from '../../store/historyStore.js';

export default function ContextMenu({ x, y, objectId, onClose }) {
  const ref = useRef(null);
  const { deleteObject, duplicateObject, bringForward, sendBackward, updateObjectRaw, exportData } = useProjectStore();
  const { deselect } = useSelectionStore();
  const { push } = useHistoryStore();

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const action = (fn) => { fn(); onClose(); };

  const items = [
    { label: 'Duplicate', onClick: () => action(() => { push(exportData()); duplicateObject(objectId); }) },
    { label: 'Bring Forward', onClick: () => action(() => bringForward(objectId)) },
    { label: 'Send Backward', onClick: () => action(() => sendBackward(objectId)) },
    { type: 'sep' },
    { label: 'Lock', onClick: () => action(() => updateObjectRaw(objectId, { locked: true })) },
    { label: 'Hide', onClick: () => action(() => updateObjectRaw(objectId, { visible: false })) },
    { type: 'sep' },
    { label: 'Delete', onClick: () => action(() => { push(exportData()); deleteObject(objectId); deselect(); }), danger: true },
  ];

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-40"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) =>
        item.type === 'sep'
          ? <div key={i} className="my-1 border-t border-gray-100" />
          : (
            <button
              key={i}
              onClick={item.onClick}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${item.danger ? 'text-red-600' : 'text-gray-700'}`}
            >
              {item.label}
            </button>
          )
      )}
    </div>
  );
}
