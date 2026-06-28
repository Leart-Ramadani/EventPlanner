import { v4 as uuidv4 } from 'uuid';

function makeChair(index, total, tableType, tableWidth, tableHeight, overrides = {}) {
  const id = `chair_${uuidv4()}`;
  return { id, index, x: 0, y: 0, rotation: 0, guestName: '', guestPhone: '', guestEmail: '', foodPreference: '', notes: '', gender: '', ageGroup: '', color: '', status: 'available', ...overrides };
}

function roundChairs(count, w, overrides = []) {
  const rx = w / 2 + 11 + 6;
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return { id: `chair_${uuidv4()}`, index: i, x: Math.cos(angle) * rx, y: Math.sin(angle) * rx, rotation: (angle * 180) / Math.PI + 90, guestName: '', guestPhone: '', guestEmail: '', foodPreference: '', notes: '', gender: '', ageGroup: '', color: '', status: 'available', ...(overrides[i] || {}) };
  });
}

function rectChairs(count, w, h) {
  const perimeter = 2 * (w + h);
  const spacing = perimeter / count;
  return Array.from({ length: count }, (_, i) => {
    const dist = i * spacing;
    let x, y, rotation;
    if (dist < w) { x = dist - w / 2; y = -(h / 2 + 17); rotation = 180; }
    else if (dist < w + h) { x = w / 2 + 17; y = (dist - w) - h / 2; rotation = 270; }
    else if (dist < 2 * w + h) { x = w / 2 - (dist - w - h); y = h / 2 + 17; rotation = 0; }
    else { x = -(w / 2 + 17); y = h / 2 - (dist - 2 * w - h); rotation = 90; }
    return { id: `chair_${uuidv4()}`, index: i, x, y, rotation, guestName: '', guestPhone: '', guestEmail: '', foodPreference: '', notes: '', gender: '', ageGroup: '', color: '', status: 'available' };
  });
}

export function createSampleProject() {
  const floorId = `floor_${uuidv4()}`;

  const objects = [
    // Walls / Room boundary
    { id: `obj_${uuidv4()}`, type: 'rectangle', x: 60, y: 60, width: 860, height: 620, rotation: 0, color: 'transparent', borderColor: '#374151', opacity: 1, visible: true, locked: false, zIndex: 0, label: '', notes: '' },

    // Stage
    { id: `obj_${uuidv4()}`, type: 'stage', x: 320, y: 80, width: 340, height: 120, rotation: 0, color: '#dbeafe', borderColor: '#3b82f6', opacity: 1, visible: true, locked: false, zIndex: 1, label: 'Stage', notes: '' },

    // Dance Floor
    { id: `obj_${uuidv4()}`, type: 'dance_floor', x: 330, y: 230, width: 320, height: 180, rotation: 0, color: '#fce7f3', borderColor: '#ec4899', opacity: 1, visible: true, locked: false, zIndex: 1, label: 'Dance Floor', notes: '' },

    // Bar
    { id: `obj_${uuidv4()}`, type: 'bar', x: 700, y: 90, width: 200, height: 70, rotation: 0, color: '#d1fae5', borderColor: '#10b981', opacity: 1, visible: true, locked: false, zIndex: 1, label: 'Bar', notes: '' },

    // Cake Table
    { id: `obj_${uuidv4()}`, type: 'cake_table', x: 82, y: 90, width: 100, height: 80, rotation: 0, color: '#fce7f3', borderColor: '#db2777', opacity: 1, visible: true, locked: false, zIndex: 1, label: 'Cake Table', notes: '' },

    // Entrance
    { id: `obj_${uuidv4()}`, type: 'entrance', x: 390, y: 625, width: 100, height: 50, rotation: 0, color: '#dcfce7', borderColor: '#16a34a', opacity: 1, visible: true, locked: false, zIndex: 1, label: 'Entrance', notes: '' },

    // Round tables — left section
    ...[
      { label: 'Table 1', x: 110, y: 260 },
      { label: 'Table 2', x: 230, y: 260 },
      { label: 'Table 3', x: 110, y: 390 },
      { label: 'Table 4', x: 230, y: 390 },
    ].map(({ label, x, y }, idx) => ({
      id: `obj_${uuidv4()}`,
      type: 'round_table',
      x, y,
      width: 100, height: 100,
      rotation: 0,
      color: '#f5f0e8', borderColor: '#8b7355',
      opacity: 1, visible: true, locked: false,
      zIndex: 2,
      label,
      notes: '',
      chairCount: 8,
      chairs: roundChairs(8, 100, idx === 0 ? [
        { guestName: 'Alice Martin', status: 'vip' },
        { guestName: 'Bob Chen', status: 'occupied' },
        { guestName: 'Carol White', status: 'reserved' },
      ] : []),
    })),

    // Round tables — right section
    ...[
      { label: 'Table 5', x: 690, y: 260 },
      { label: 'Table 6', x: 820, y: 260 },
      { label: 'Table 7', x: 690, y: 390 },
      { label: 'Table 8', x: 820, y: 390 },
    ].map(({ label, x, y }) => ({
      id: `obj_${uuidv4()}`,
      type: 'round_table',
      x, y,
      width: 100, height: 100,
      rotation: 0,
      color: '#f5f0e8', borderColor: '#8b7355',
      opacity: 1, visible: true, locked: false,
      zIndex: 2,
      label,
      notes: '',
      chairCount: 8,
      chairs: roundChairs(8, 100),
    })),

    // Rectangular VIP table
    {
      id: `obj_${uuidv4()}`,
      type: 'rect_table',
      x: 290, y: 460,
      width: 300, height: 80,
      rotation: 0,
      color: '#ede9fe', borderColor: '#7c3aed',
      opacity: 1, visible: true, locked: false,
      zIndex: 2,
      label: 'Head Table',
      notes: 'Bride & Groom',
      chairCount: 8,
      chairs: rectChairs(8, 300, 80).map((c, i) => ({
        ...c,
        status: i < 2 ? 'vip' : 'reserved',
        guestName: i === 0 ? 'Sarah Johnson' : i === 1 ? 'Michael Johnson' : '',
      })),
    },

    // Bottom row tables
    ...[
      { label: 'Table 9', x: 200, y: 540 },
      { label: 'Table 10', x: 360, y: 540 },
      { label: 'Table 11', x: 520, y: 540 },
      { label: 'Table 12', x: 680, y: 540 },
    ].map(({ label, x, y }) => ({
      id: `obj_${uuidv4()}`,
      type: 'round_table',
      x, y,
      width: 100, height: 100,
      rotation: 0,
      color: '#f5f0e8', borderColor: '#8b7355',
      opacity: 1, visible: true, locked: false,
      zIndex: 2,
      label,
      notes: '',
      chairCount: 8,
      chairs: roundChairs(8, 100),
    })),

    // Plants
    ...[[75, 75],[895, 75],[75, 630],[895, 630],[340, 240],[640, 240]].map(([x, y]) => ({
      id: `obj_${uuidv4()}`,
      type: 'plant',
      x, y,
      width: 40, height: 40,
      rotation: 0,
      color: '#4ade80', borderColor: '#16a34a',
      opacity: 1, visible: true, locked: false,
      zIndex: 1,
      label: '',
      notes: '',
    })),

    // Text label
    { id: `obj_${uuidv4()}`, type: 'text', x: 350, y: 85, width: 280, height: 30, rotation: 0, color: '#1e40af', borderColor: 'transparent', opacity: 1, visible: true, locked: false, zIndex: 3, label: 'Wedding Reception', notes: '', fontSize: 20, fontWeight: 'bold', align: 'center' },
  ];

  return {
    projectName: 'Sample Wedding',
    activeFloorId: floorId,
    floors: [
      { id: floorId, name: 'Main Hall', objects },
      { id: `floor_${uuidv4()}`, name: 'Garden', objects: [] },
    ],
  };
}
