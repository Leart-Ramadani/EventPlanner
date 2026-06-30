import { useState, useMemo } from 'react';
import { Search, X, User, ChevronRight } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore.js';
import { useSelectionStore } from '../../store/selectionStore.js';
import { TABLE_TYPES } from '../../data/defaultShapes.js';

const STATUS_COLORS = {
  available: '#e5e7eb',
  reserved: '#fbbf24',
  occupied: '#60a5fa',
  vip: '#a78bfa',
  disabled: '#34d399',
  child: '#f87171',
};

export default function MobileGuestSearch({ onClose }) {
  const [query, setQuery] = useState('');
  const { getObjects } = useProjectStore();
  const { setEditingChair } = useSelectionStore();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const objects = getObjects();
    const hits = [];
    for (const obj of objects) {
      if (!TABLE_TYPES.includes(obj.type)) continue;
      for (const chair of obj.chairs ?? []) {
        if (!chair.guestName && !chair.guestEmail && !chair.guestPhone) continue;
        if (
          q &&
          !chair.guestName?.toLowerCase().includes(q) &&
          !chair.guestEmail?.toLowerCase().includes(q) &&
          !chair.guestPhone?.includes(q)
        ) continue;
        hits.push({ tableId: obj.id, tableLabel: obj.label, chair });
      }
    }
    return hits;
  }, [query, getObjects]);

  const handleSelect = (tableId, chairId) => {
    setEditingChair(tableId, chairId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <Search size={18} className="text-gray-400 flex-shrink-0" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guests by name, email or phone…"
          className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400"
        />
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <User size={32} className="mb-2 opacity-40" />
            <p className="text-sm">{query ? 'No guests found' : 'No assigned seats yet'}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {results.map(({ tableId, tableLabel, chair }) => (
              <li key={chair.id}>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 text-left"
                  onClick={() => handleSelect(tableId, chair.id)}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[chair.status] ?? '#e5e7eb' }}
                  >
                    <User size={16} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {chair.guestName || <span className="text-gray-400 italic">Unnamed guest</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {tableLabel} · Seat {(chair.index ?? 0) + 1}
                      {chair.guestEmail ? ` · ${chair.guestEmail}` : ''}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {results.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 text-center">
          {results.length} guest{results.length !== 1 ? 's' : ''} found
        </div>
      )}
    </div>
  );
}
