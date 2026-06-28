import { useState } from 'react';
import { TOOLBAR_ITEMS } from '../../data/defaultShapes.js';
import { useSelectionStore } from '../../store/selectionStore.js';
import { MousePointer2, Hand } from 'lucide-react';

function ToolbarItem({ item }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('object_type', item.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex flex-col items-center gap-1 p-2 rounded-lg cursor-grab hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95 select-none"
      title={item.label}
    >
      <span className="text-xl leading-none">{item.icon}</span>
      <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{item.label}</span>
    </div>
  );
}

export default function Toolbar() {
  const [collapsed, setCollapsed] = useState(false);
  const { tool, setTool } = useSelectionStore();

  return (
    <div className={`flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-200 ${collapsed ? 'w-12' : 'w-48'} overflow-hidden z-10`}>
      {/* Tool controls */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-100">
        <button
          onClick={() => setTool('select')}
          className={`p-2 rounded-lg transition-colors ${tool === 'select' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
          title="Select (V)"
        >
          <MousePointer2 size={16} />
        </button>
        <button
          onClick={() => setTool('pan')}
          className={`p-2 rounded-lg transition-colors ${tool === 'pan' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
          title="Pan (H)"
        >
          <Hand size={16} />
        </button>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Object categories */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {TOOLBAR_ITEMS.map((category) => (
          <div key={category.category}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1">
                {category.category}
              </p>
            )}
            <div className="grid grid-cols-2 gap-1">
              {category.items.map((item) => (
                <ToolbarItem key={item.type} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
