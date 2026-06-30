import { useState, useEffect } from 'react';
import { useProjectStore } from '../../store/projectStore.js';
import { useSelectionStore } from '../../store/selectionStore.js';
import { Plus, Trash2, MapPin, MapPinOff, X, UserCheck, UserX } from 'lucide-react';

export default function GuestListPanel() {
  const { guests, addGuest, removeGuest, getAssignments, unassignGuest } = useProjectStore();
  const { assigningGuestId, setAssigningGuest, clearAssigningGuest } = useSelectionStore();
  const [input, setInput] = useState('');
  const [assignments, setAssignments] = useState({});

  // Refresh assignments whenever guests or store changes
  useEffect(() => {
    const update = () => setAssignments(getAssignments());
    update();
    return useProjectStore.subscribe(update);
  }, []);

  const handleAdd = () => {
    const name = input.trim();
    if (!name) return;
    // Allow adding multiple names separated by newline or comma
    const names = name.split(/[\n,]/).map((n) => n.trim()).filter(Boolean);
    names.forEach((n) => addGuest(n));
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); }
  };

  const assigned = guests.filter((g) => assignments[g.name]);
  const unassigned = guests.filter((g) => !assignments[g.name]);

  return (
    <div className="flex flex-col h-full">
      {/* Assign mode banner */}
      {assigningGuestId && (() => {
        const guest = guests.find((g) => g.id === assigningGuestId);
        return (
          <div className="bg-blue-600 text-white px-3 py-2 flex items-center justify-between text-xs font-medium flex-shrink-0">
            <span>Click a seat to assign <strong>{guest?.name}</strong></span>
            <button onClick={clearAssigningGuest} className="hover:opacity-70"><X size={14} /></button>
          </div>
        );
      })()}

      {/* Add guest input */}
      <div className="p-3 border-b border-gray-100 flex-shrink-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Add Guests</p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Guest name (Enter to add, comma or newline for multiple)"
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg transition-colors"
        >
          <Plus size={13} /> Add Guest{input.includes(',') || input.includes('\n') ? 's' : ''}
        </button>
      </div>

      {/* Summary */}
      <div className="px-3 py-2 flex gap-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-green-600">
          <UserCheck size={13} /> <span className="font-semibold">{assigned.length}</span> assigned
        </div>
        <div className="flex items-center gap-1.5 text-xs text-orange-500">
          <UserX size={13} /> <span className="font-semibold">{unassigned.length}</span> unassigned
        </div>
      </div>

      {/* Guest list */}
      <div className="flex-1 overflow-y-auto">
        {guests.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-xs text-center px-4">
            <p className="font-medium text-gray-500 mb-1">No guests yet</p>
            <p>Add guest names above to get started</p>
          </div>
        )}

        {unassigned.length > 0 && (
          <div className="px-3 pt-3">
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1.5">Unassigned ({unassigned.length})</p>
            <div className="space-y-1">
              {unassigned.map((g) => (
                <GuestRow
                  key={g.id}
                  guest={g}
                  isAssigning={assigningGuestId === g.id}
                  onAssign={() => assigningGuestId === g.id ? clearAssigningGuest() : setAssigningGuest(g.id)}
                  onRemove={() => removeGuest(g.id)}
                  assignment={null}
                  onUnassign={null}
                />
              ))}
            </div>
          </div>
        )}

        {assigned.length > 0 && (
          <div className="px-3 pt-3 pb-3">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1.5">Assigned ({assigned.length})</p>
            <div className="space-y-1">
              {assigned.map((g) => (
                <GuestRow
                  key={g.id}
                  guest={g}
                  isAssigning={assigningGuestId === g.id}
                  onAssign={() => assigningGuestId === g.id ? clearAssigningGuest() : setAssigningGuest(g.id)}
                  onRemove={() => { unassignGuest(g.name); removeGuest(g.id); }}
                  assignment={assignments[g.name]}
                  onUnassign={() => unassignGuest(g.name)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GuestRow({ guest, isAssigning, onAssign, onRemove, assignment, onUnassign }) {
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors ${isAssigning ? 'bg-blue-50 border border-blue-300' : 'hover:bg-gray-50'}`}>
      <span className="flex-1 font-medium text-gray-800 truncate">{guest.name}</span>
      {assignment && (
        <span className="text-gray-400 truncate max-w-20" title={`${assignment.tableLabel} · Seat ${assignment.chairIndex + 1}`}>
          {assignment.tableLabel}
        </span>
      )}
      <button
        onClick={onAssign}
        title={isAssigning ? 'Cancel' : assignment ? 'Move seat' : 'Assign seat'}
        className={`p-1 rounded transition-colors flex-shrink-0 ${isAssigning ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
      >
        <MapPin size={12} />
      </button>
      {assignment && (
        <button onClick={onUnassign} title="Remove from seat" className="p-1 rounded text-gray-400 hover:text-orange-500 hover:bg-orange-50 flex-shrink-0 transition-colors">
          <MapPinOff size={12} />
        </button>
      )}
      <button onClick={onRemove} title="Remove guest" className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0 transition-colors">
        <Trash2 size={12} />
      </button>
    </div>
  );
}
