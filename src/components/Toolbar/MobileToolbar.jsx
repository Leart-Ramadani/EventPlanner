import { useState, useCallback } from 'react';
import { TOOLBAR_ITEMS } from '../../data/defaultShapes.js';
import { useProjectStore } from '../../store/projectStore.js';
import { useHistoryStore } from '../../store/historyStore.js';
import { useCanvasStore } from '../../store/canvasStore.js';
import { createObject } from '../../utils/objectFactory.js';
import { ChevronUp, X, Plus } from 'lucide-react';

export default function MobileToolbar() {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  const { addObject, exportData, getObjects } = useProjectStore();
  const { push } = useHistoryStore();
  const { zoom, offsetX, offsetY, stageSize } = useCanvasStore();

  const handleAddObject = useCallback((type) => {
    // Place in center of current viewport
    const worldX = (stageSize.width / 2 - offsetX) / zoom;
    const worldY = (stageSize.height / 2 - offsetY) / zoom;
    push(exportData());
    addObject(createObject(type, worldX, worldY));
    setOpen(false);
  }, [zoom, offsetX, offsetY, stageSize, addObject, push, exportData]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 transition-transform duration-300 ease-out ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '70vh' }}
      >
        {/* Handle bar */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <h3 className="font-semibold text-gray-800 text-sm">Add Object</h3>
          <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex border-b border-gray-100 px-2">
          {TOOLBAR_ITEMS.map((cat, i) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(i)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeCategory === i ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div className="overflow-y-auto p-3" style={{ maxHeight: 'calc(70vh - 100px)' }}>
          <div className="grid grid-cols-4 gap-2">
            {TOOLBAR_ITEMS[activeCategory].items.map((item) => (
              <button
                key={item.type}
                onClick={() => handleAddObject(item.type)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 active:bg-blue-50 active:scale-95 transition-all"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAB to open */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-30 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform"
        style={{ boxShadow: '0 4px 20px rgba(59,130,246,0.5)' }}
      >
        <Plus size={26} />
      </button>
    </>
  );
}
