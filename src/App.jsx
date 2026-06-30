import { useRef, useState, useEffect } from 'react';
import TopBar from './components/TopBar/TopBar.jsx';
import MobileTopBar from './components/TopBar/MobileTopBar.jsx';
import MobileFloorTabs from './components/TopBar/MobileFloorTabs.jsx';
import Toolbar from './components/Toolbar/Toolbar.jsx';
import MobileToolbar from './components/Toolbar/MobileToolbar.jsx';
import InfiniteCanvas from './components/Canvas/InfiniteCanvas.jsx';
import RightSidebar from './components/Sidebar/RightSidebar.jsx';
import MobilePropertiesSheet from './components/Sidebar/MobilePropertiesSheet.jsx';
import GuestPanel from './components/Sidebar/GuestPanel.jsx';
import Minimap from './components/Minimap/Minimap.jsx';
import StatusBar from './components/Canvas/StatusBar.jsx';
import AuthScreen from './components/Auth/AuthScreen.jsx';
import { useKeyboard } from './hooks/useKeyboard.js';
import { useAutosave } from './hooks/useAutosave.js';
import { useMobile } from './hooks/useMobile.js';
import { useProjectStore } from './store/projectStore.js';
import { useCanvasStore } from './store/canvasStore.js';
import { useSelectionStore } from './store/selectionStore.js';
import { useAuthStore } from './store/authStore.js';
import { loadProjectFromCloud } from './utils/cloudSync.js';
import { createSampleProject } from './data/sampleProject.js';
import { Keyboard, Hand, MousePointer2, Loader2 } from 'lucide-react';

const SHORTCUTS = [
  { key: 'Ctrl+Z', desc: 'Undo' },
  { key: 'Ctrl+Y', desc: 'Redo' },
  { key: 'Ctrl+D', desc: 'Duplicate' },
  { key: 'Delete', desc: 'Delete selected' },
  { key: 'Escape', desc: 'Deselect' },
  { key: '↑↓←→', desc: 'Move 1px' },
  { key: 'Shift+Arrow', desc: 'Move 10px' },
  { key: 'Ctrl++/-', desc: 'Zoom in/out' },
  { key: 'Middle drag', desc: 'Pan canvas' },
  { key: 'Ctrl+Wheel', desc: 'Zoom' },
  { key: 'Right-click', desc: 'Context menu' },
];

export default function App() {
  const canvasContainerRef = useRef(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const { loadProject } = useProjectStore();
  const { fitToScreen } = useCanvasStore();
  const { tool, setTool } = useSelectionStore();
  const { isMobile, isTablet } = useMobile();
  const { user, loading, init } = useAuthStore();

  useKeyboard();
  useAutosave();

  // Init auth session on mount
  useEffect(() => { init(); }, []);

  // Load project once user is known
  useEffect(() => {
    if (loading) return;
    const bootstrap = async () => {
      let project = null;
      if (user) {
        try { project = await loadProjectFromCloud(user.id); } catch (_) {}
      }
      loadProject(project ?? createSampleProject());
      setTimeout(() => fitToScreen(useProjectStore.getState().getObjects()), 200);
    };
    bootstrap();
  }, [user, loading]);

  const isCompact = isMobile || isTablet;

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return (
    <div className={`flex flex-col w-screen h-screen overflow-hidden ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>

      {/* Top navigation — desktop full / mobile compact */}
      {isCompact
        ? <MobileTopBar darkMode={darkMode} setDarkMode={setDarkMode} />
        : <TopBar darkMode={darkMode} setDarkMode={setDarkMode} />
      }

      {/* Mobile floor tabs row */}
      {isCompact && <MobileFloorTabs />}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left toolbar — desktop only */}
        {!isCompact && <Toolbar />}

        {/* Canvas area */}
        <div ref={canvasContainerRef} className="flex-1 relative overflow-hidden bg-gray-50">
          <InfiniteCanvas containerRef={canvasContainerRef} />

          {/* Desktop: shortcuts button + hint */}
          {!isCompact && (
            <>
              <button
                onClick={() => setShowShortcuts((s) => !s)}
                className="absolute bottom-4 left-4 z-20 p-2 bg-white rounded-full shadow-md border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                title="Keyboard shortcuts"
              >
                <Keyboard size={16} />
              </button>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-4 py-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-100 text-xs text-gray-400 pointer-events-none whitespace-nowrap">
                Drag from toolbar · Right-click for options · Middle-drag to pan · Ctrl+Scroll to zoom
              </div>

              {showShortcuts && (
                <div className="absolute bottom-16 left-4 z-30 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-64">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Keyboard size={14} /> Keyboard Shortcuts
                  </h3>
                  <div className="space-y-1.5">
                    {SHORTCUTS.map(({ key, desc }) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{desc}</span>
                        <kbd className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono border border-gray-200">{key}</kbd>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Compact tool toggle (select vs pan) floating */}
          {isCompact && (
            <div className="absolute bottom-24 left-4 z-20 flex flex-col gap-2">
              <button
                onClick={() => setTool('select')}
                className={`w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all ${tool === 'select' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
              >
                <MousePointer2 size={18} />
              </button>
              <button
                onClick={() => setTool('pan')}
                className={`w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all ${tool === 'pan' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
              >
                <Hand size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Right sidebar — desktop only */}
        {!isCompact && <RightSidebar />}
      </div>

      {/* Desktop status bar */}
      {!isCompact && <StatusBar />}

      {/* Compact (mobile + tablet): properties bottom sheet when object selected */}
      {isCompact && <MobilePropertiesSheet />}

      {/* Compact (mobile + tablet): add object FAB + bottom sheet toolbar */}
      {isCompact && <MobileToolbar />}

      {/* Guest panel — works on all screen sizes (full-screen overlay on mobile) */}
      <GuestPanel />
    </div>
  );
}
