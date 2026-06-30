import { useState } from 'react';
import PropertiesPanel from './PropertiesPanel.jsx';
import LayersPanel from '../Layers/LayersPanel.jsx';
import GuestListPanel from './GuestListPanel.jsx';
import { Settings, Layers, Users } from 'lucide-react';

export default function RightSidebar() {
  const [tab, setTab] = useState('properties');

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col shadow-sm z-10">
      <div className="flex border-b border-gray-200">
        {[
          { id: 'properties', icon: <Settings size={14} />, label: 'Properties' },
          { id: 'guests', icon: <Users size={14} />, label: 'Guests' },
          { id: 'layers', icon: <Layers size={14} />, label: 'Layers' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${tab === t.id ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        {tab === 'properties' && <PropertiesPanel />}
        {tab === 'guests' && <GuestListPanel />}
        {tab === 'layers' && <LayersPanel />}
      </div>
    </div>
  );
}
