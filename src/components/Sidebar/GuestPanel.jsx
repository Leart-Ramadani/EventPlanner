import { useState, useEffect } from 'react';
import { useSelectionStore } from '../../store/selectionStore.js';
import { useProjectStore } from '../../store/projectStore.js';
import { useMobile } from '../../hooks/useMobile.js';
import { X, User } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'vip', label: 'VIP' },
  { value: 'disabled', label: 'Disabled Access' },
  { value: 'child', label: 'Child' },
];

const STATUS_COLORS = {
  available: '#e5e7eb',
  reserved: '#fbbf24',
  occupied: '#60a5fa',
  vip: '#a78bfa',
  disabled: '#34d399',
  child: '#f87171',
};

export default function GuestPanel() {
  const { editingChair, clearEditingChair } = useSelectionStore();
  const { getObjects, updateChair } = useProjectStore();
  const { isMobile } = useMobile();

  const [form, setForm] = useState({ guestName: '', status: 'available' });

  useEffect(() => {
    if (!editingChair) return;
    const objects = getObjects();
    const table = objects.find((o) => o.id === editingChair.tableId);
    const chair = table?.chairs?.find((c) => c.id === editingChair.chairId);
    if (chair) setForm({ ...chair });
  }, [editingChair]);

  if (!editingChair) return null;

  const objects = getObjects();
  const table = objects.find((o) => o.id === editingChair.tableId);
  const chair = table?.chairs?.find((c) => c.id === editingChair.chairId);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    updateChair(editingChair.tableId, editingChair.chairId, form);
    clearEditingChair();
  };

  const clear = () => {
    const cleared = { guestName: '', status: 'available' };
    setForm(cleared);
    updateChair(editingChair.tableId, editingChair.chairId, cleared);
    clearEditingChair();
  };
  const panelClass = isMobile
    ? 'fixed inset-0 bg-white z-50 flex flex-col'
    : 'fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-gray-200 z-40 flex flex-col';

  return (
    <div className={panelClass}>
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div>
          <h3 className="font-semibold text-gray-800">Seat Assignment</h3>
          <p className="text-xs text-gray-500">{table?.label} · Seat {chair?.index !== undefined ? chair.index + 1 : ''}</p>
        </div>
        <button onClick={clearEditingChair} className="p-1.5 hover:bg-white/50 rounded-full"><X size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Seat Status</label>
          <div className="grid grid-cols-3 gap-1.5">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => set('status', s.value)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${form.status === s.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                style={form.status === s.value ? { borderColor: STATUS_COLORS[s.value], backgroundColor: STATUS_COLORS[s.value] + '20' } : {}}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Guest name */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><User size={10} /> Guest Name</label>
          <input type="text" value={form.guestName} onChange={(e) => set('guestName', e.target.value)} placeholder="Full name" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 flex gap-2">
        <button onClick={clear} className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">Clear Seat</button>
        <button onClick={save} className="flex-1 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium">Save</button>
      </div>
    </div>
  );
}
