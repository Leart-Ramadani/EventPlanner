import { useState, useEffect } from 'react';
import { useSelectionStore } from '../../store/selectionStore.js';
import { useProjectStore } from '../../store/projectStore.js';
import { useMobile } from '../../hooks/useMobile.js';
import { X, User, Phone, Mail, Utensils } from 'lucide-react';

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

  const [form, setForm] = useState({
    guestName: '', guestPhone: '', guestEmail: '',
    foodPreference: '', notes: '', status: 'available',
    gender: '', ageGroup: '', color: '',
  });

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
    const cleared = { guestName: '', guestPhone: '', guestEmail: '', foodPreference: '', notes: '', status: 'available', gender: '', ageGroup: '', color: '' };
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

        {/* Guest info */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><User size={10} /> Guest Name</label>
            <input type="text" value={form.guestName} onChange={(e) => set('guestName', e.target.value)} placeholder="Full name" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Phone size={10} /> Phone</label>
            <input type="tel" value={form.guestPhone} onChange={(e) => set('guestPhone', e.target.value)} placeholder="+1 (555) 000-0000" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Mail size={10} /> Email</label>
            <input type="email" value={form.guestEmail} onChange={(e) => set('guestEmail', e.target.value)} placeholder="guest@example.com" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Utensils size={10} /> Meal Preference</label>
            <select value={form.foodPreference} onChange={(e) => set('foodPreference', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">No preference</option>
              <option value="standard">Standard</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="halal">Halal</option>
              <option value="kosher">Kosher</option>
              <option value="gluten_free">Gluten-Free</option>
              <option value="child_meal">Child Meal</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
            <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
              <option value="">Not specified</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Age Group</label>
            <select value={form.ageGroup} onChange={(e) => set('ageGroup', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none">
              <option value="">Not specified</option>
              <option value="child">Child (0–12)</option>
              <option value="teen">Teen (13–17)</option>
              <option value="adult">Adult (18+)</option>
              <option value="senior">Senior (65+)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Seat Color</label>
            <input type="color" value={form.color || '#e5e7eb'} onChange={(e) => set('color', e.target.value)} className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} placeholder="Special requirements, notes..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 flex gap-2">
        <button onClick={clear} className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">Clear Seat</button>
        <button onClick={save} className="flex-1 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium">Save</button>
      </div>
    </div>
  );
}
