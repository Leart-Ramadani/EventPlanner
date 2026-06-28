import { useState } from 'react';
import { useProjectStore } from '../../store/projectStore.js';
import { useCanvasStore } from '../../store/canvasStore.js';
import { useHistoryStore } from '../../store/historyStore.js';
import { useSelectionStore } from '../../store/selectionStore.js';
import { exportJSON, importJSON } from '../../utils/fileIO.js';
import {
  Undo2, Redo2, Maximize2, Save, FolderOpen, FilePlus,
  MoreHorizontal, Grid3X3, Magnet, ZoomIn, ZoomOut, X
} from 'lucide-react';

export default function MobileTopBar({ darkMode, setDarkMode }) {
  const [showMenu, setShowMenu] = useState(false);
  const { projectName, exportData, loadProject, newProject, getObjects, isDirty, setProjectName } = useProjectStore();
  const { zoom, zoomIn, zoomOut, fitToScreen, toggleGrid, toggleSnap, gridVisible, snapToGrid } = useCanvasStore();
  const { canUndo, canRedo, undo, redo } = useHistoryStore();
  const { deselect } = useSelectionStore();

  const handleSave = () => { exportJSON(exportData(), `${projectName}.json`); setShowMenu(false); };
  const handleOpen = async () => {
    try { const d = await importJSON(); loadProject(d); deselect(); } catch {}
    setShowMenu(false);
  };
  const handleNew = () => {
    if (isDirty && !confirm('Unsaved changes. Start new project?')) return;
    newProject(); deselect(); setShowMenu(false);
  };

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center px-3 gap-2 shadow-sm z-20 flex-shrink-0">
      {/* Logo + name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">EP</div>
        <span className="text-sm font-semibold text-gray-800 truncate">
          {projectName}
          {isDirty && <span className="text-orange-400 ml-1">•</span>}
        </span>
      </div>

      {/* Undo / Redo */}
      <button onClick={() => undo(exportData(), (s) => loadProject(s))} disabled={!canUndo()} className="p-2 rounded-lg disabled:opacity-30 hover:bg-gray-100">
        <Undo2 size={18} className="text-gray-600" />
      </button>
      <button onClick={() => redo(exportData(), (s) => loadProject(s))} disabled={!canRedo()} className="p-2 rounded-lg disabled:opacity-30 hover:bg-gray-100">
        <Redo2 size={18} className="text-gray-600" />
      </button>

      {/* Fit to screen */}
      <button onClick={() => fitToScreen(getObjects())} className="p-2 rounded-lg hover:bg-gray-100">
        <Maximize2 size={18} className="text-gray-600" />
      </button>

      {/* More menu */}
      <div className="relative">
        <button onClick={() => setShowMenu((s) => !s)} className="p-2 rounded-lg hover:bg-gray-100">
          <MoreHorizontal size={18} className="text-gray-600" />
        </button>

        {showMenu && (
          <div className="absolute top-10 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl w-56 z-50 py-1">
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">MENU</span>
              <button onClick={() => setShowMenu(false)}><X size={14} className="text-gray-400" /></button>
            </div>
            {[
              { icon: <FilePlus size={15}/>, label: 'New Project', onClick: handleNew },
              { icon: <FolderOpen size={15}/>, label: 'Open Project', onClick: handleOpen },
              { icon: <Save size={15}/>, label: 'Save / Export', onClick: handleSave },
              { type: 'sep' },
              { icon: <ZoomIn size={15}/>, label: 'Zoom In', onClick: zoomIn },
              { icon: <ZoomOut size={15}/>, label: 'Zoom Out', onClick: zoomOut },
              { icon: <Grid3X3 size={15}/>, label: `Grid: ${gridVisible ? 'On' : 'Off'}`, onClick: () => { toggleGrid(); setShowMenu(false); } },
              { icon: <Magnet size={15}/>, label: `Snap: ${snapToGrid ? 'On' : 'Off'}`, onClick: () => { toggleSnap(); setShowMenu(false); } },
            ].map((item, i) =>
              item.type === 'sep'
                ? <div key={i} className="my-1 border-t border-gray-100" />
                : (
                  <button key={i} onClick={item.onClick} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    <span className="text-gray-500">{item.icon}</span>{item.label}
                  </button>
                )
            )}
            <div className="mt-1 px-3 py-2 text-xs text-gray-400 text-center border-t border-gray-100">
              Zoom: {Math.round(zoom * 100)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
