import { useState, useCallback } from 'react';
import FloorTabs from './FloorTabs.jsx';
import { useProjectStore } from '../../store/projectStore.js';
import { useCanvasStore } from '../../store/canvasStore.js';
import { useHistoryStore } from '../../store/historyStore.js';
import { useSelectionStore } from '../../store/selectionStore.js';
import { exportJSON, importJSON } from '../../utils/fileIO.js';
import { saveProjectToCloud } from '../../utils/cloudSync.js';
import { TABLE_TYPES } from '../../data/defaultShapes.js';
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, RotateCcw, Grid3X3,
  Save, FolderOpen, Download, Upload, FilePlus, Search, Moon, Sun,
  Magnet, LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

export default function TopBar({ darkMode, setDarkMode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [projectNameEdit, setProjectNameEdit] = useState(false);

  const { projectName, setProjectName, exportData, loadProject, newProject, getObjects, isDirty, markClean } = useProjectStore();
  const { user, signOut } = useAuthStore();
  const { zoom, zoomIn, zoomOut, fitToScreen, resetZoom, gridVisible, toggleGrid, snapToGrid, toggleSnap, setZoom } = useCanvasStore();
  const { canUndo, canRedo, undo, redo, push } = useHistoryStore();
  const { deselect } = useSelectionStore();
  const { setOffset } = useCanvasStore();

  const handleSave = async () => {
    const data = exportData();
    if (user) {
      try {
        await saveProjectToCloud(user.id, data);
        markClean();
      } catch (e) {
        alert('Failed to save: ' + e.message);
      }
    }
  };

  const handleExport = () => {
    exportJSON(exportData(), `${projectName.replace(/\s+/g, '_')}.json`);
  };

  const handleOpen = async () => {
    try {
      const data = await importJSON();
      loadProject(data);
      deselect();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleNew = () => {
    if (isDirty && !confirm('Unsaved changes. Start a new project?')) return;
    newProject();
    deselect();
  };

  const handleSearch = (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const objects = getObjects();
    const results = [];
    for (const obj of objects) {
      if (!TABLE_TYPES.includes(obj.type) || !obj.chairs) continue;
      for (const chair of obj.chairs) {
        if (chair.guestName?.toLowerCase().includes(q.toLowerCase())) {
          results.push({ table: obj, chair });
        }
      }
    }
    setSearchResults(results);
  };

  const jumpToChair = (table, chair) => {
    const objects = getObjects();
    const { stageSize, zoom: z } = useCanvasStore.getState();
    const worldX = table.x + table.width / 2;
    const worldY = table.y + table.height / 2;
    setOffset(stageSize.width / 2 - worldX * z, stageSize.height / 2 - worldY * z);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUndo = () => {
    undo(exportData(), (snapshot) => loadProject(snapshot));
  };

  const handleRedo = () => {
    redo(exportData(), (snapshot) => loadProject(snapshot));
  };

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center px-3 gap-2 shadow-sm z-20 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">EP</div>
        {projectNameEdit ? (
          <input
            autoFocus
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={() => setProjectNameEdit(false)}
            onKeyDown={(e) => e.key === 'Enter' && setProjectNameEdit(false)}
            className="text-sm font-semibold text-gray-800 border-b border-blue-400 outline-none w-32"
          />
        ) : (
          <span
            className="text-sm font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
            onDoubleClick={() => setProjectNameEdit(true)}
            title="Double-click to rename"
          >
            {projectName}
            {isDirty && <span className="text-orange-400 ml-1">•</span>}
          </span>
        )}
      </div>

      {/* File actions */}
      <div className="flex items-center gap-0.5">
        <TopBtn icon={<FilePlus size={15} />} label="New" onClick={handleNew} />
        <TopBtn icon={<FolderOpen size={15} />} label="Open" onClick={handleOpen} />
        <TopBtn icon={<Save size={15} />} label="Save" onClick={handleSave} />
        <TopBtn icon={<Download size={15} />} label="Export" onClick={handleExport} />
      </div>

      <div className="w-px h-6 bg-gray-200" />

      {/* History */}
      <div className="flex items-center gap-0.5">
        <TopBtn icon={<Undo2 size={15} />} label="Undo" onClick={handleUndo} disabled={!canUndo()} title="Ctrl+Z" />
        <TopBtn icon={<Redo2 size={15} />} label="Redo" onClick={handleRedo} disabled={!canRedo()} title="Ctrl+Y" />
      </div>

      <div className="w-px h-6 bg-gray-200" />

      {/* View */}
      <div className="flex items-center gap-0.5">
        <TopBtn icon={<ZoomOut size={15} />} onClick={zoomOut} />
        <span className="text-xs text-gray-600 font-mono w-12 text-center cursor-pointer" onClick={resetZoom} title="Reset zoom">
          {Math.round(zoom * 100)}%
        </span>
        <TopBtn icon={<ZoomIn size={15} />} onClick={zoomIn} />
        <TopBtn icon={<Maximize2 size={15} />} onClick={() => fitToScreen(getObjects())} title="Fit to screen" />
        <TopBtn icon={<RotateCcw size={15} />} onClick={resetZoom} title="Reset view" />
        <TopBtn
          icon={<Grid3X3 size={15} />}
          onClick={toggleGrid}
          active={gridVisible}
          title="Toggle grid"
        />
        <TopBtn
          icon={<Magnet size={15} />}
          onClick={toggleSnap}
          active={snapToGrid}
          title="Snap to grid"
        />
      </div>

      <div className="w-px h-6 bg-gray-200" />

      {/* Floor tabs */}
      <div className="flex-1 overflow-hidden">
        <FloorTabs />
      </div>

      {/* Search */}
      <div className="relative">
        <button
          onClick={() => setShowSearch((s) => !s)}
          className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Search size={14} />
          <span className="hidden sm:inline">Search</span>
        </button>
        {showSearch && (
          <div className="absolute top-10 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl w-72 z-50">
            <div className="p-3 border-b border-gray-100">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search guests by name..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {searchResults.length === 0 && searchQuery && (
                <p className="text-xs text-gray-400 text-center py-4">No guests found</p>
              )}
              {searchResults.map(({ table, chair }, i) => (
                <button
                  key={i}
                  onClick={() => jumpToChair(table, chair)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800">{chair.guestName}</p>
                  <p className="text-xs text-gray-500">{table.label} · Seat {chair.index + 1}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dark mode */}
      <button
        onClick={() => setDarkMode((d) => !d)}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        title="Toggle dark mode"
      >
        {darkMode ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* User + logout */}
      {user && (
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <span className="text-xs text-gray-500 hidden lg:block max-w-32 truncate">{user.email}</span>
          <button
            onClick={signOut}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function TopBtn({ icon, label, onClick, disabled, active, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg transition-colors ${disabled ? 'text-gray-300 cursor-not-allowed' : active ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      {icon}
      {label && <span className="hidden md:inline">{label}</span>}
    </button>
  );
}
