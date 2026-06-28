export const OBJECT_TYPES = {
  ROUND_TABLE: 'round_table',
  RECT_TABLE: 'rect_table',
  OVAL_TABLE: 'oval_table',
  SQUARE_TABLE: 'square_table',
  STAGE: 'stage',
  DANCE_FLOOR: 'dance_floor',
  BAR: 'bar',
  BUFFET: 'buffet',
  DJ_BOOTH: 'dj_booth',
  GIFT_TABLE: 'gift_table',
  CAKE_TABLE: 'cake_table',
  ENTRANCE: 'entrance',
  EXIT: 'exit',
  BATHROOM: 'bathroom',
  WALL: 'wall',
  LINE: 'line',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  TEXT: 'text',
  PLANT: 'plant',
  PARKING: 'parking',
};

export const TABLE_TYPES = [
  OBJECT_TYPES.ROUND_TABLE,
  OBJECT_TYPES.RECT_TABLE,
  OBJECT_TYPES.OVAL_TABLE,
  OBJECT_TYPES.SQUARE_TABLE,
];

export const CHAIR_STATUSES = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  OCCUPIED: 'occupied',
  VIP: 'vip',
  DISABLED: 'disabled',
  CHILD: 'child',
};

export const CHAIR_STATUS_COLORS = {
  available: '#e5e7eb',
  reserved: '#fbbf24',
  occupied: '#60a5fa',
  vip: '#a78bfa',
  disabled: '#34d399',
  child: '#f87171',
};

export const TOOLBAR_ITEMS = [
  {
    category: 'Tables',
    items: [
      { type: OBJECT_TYPES.ROUND_TABLE, label: 'Round Table', icon: '⭕', defaultChairs: 8 },
      { type: OBJECT_TYPES.RECT_TABLE, label: 'Rect Table', icon: '▭', defaultChairs: 8 },
      { type: OBJECT_TYPES.OVAL_TABLE, label: 'Oval Table', icon: '🟡', defaultChairs: 10 },
      { type: OBJECT_TYPES.SQUARE_TABLE, label: 'Square Table', icon: '⬜', defaultChairs: 4 },
    ],
  },
  {
    category: 'Venue',
    items: [
      { type: OBJECT_TYPES.STAGE, label: 'Stage', icon: '🎭' },
      { type: OBJECT_TYPES.DANCE_FLOOR, label: 'Dance Floor', icon: '💃' },
      { type: OBJECT_TYPES.BAR, label: 'Bar', icon: '🍸' },
      { type: OBJECT_TYPES.BUFFET, label: 'Buffet', icon: '🍽️' },
      { type: OBJECT_TYPES.DJ_BOOTH, label: 'DJ Booth', icon: '🎧' },
      { type: OBJECT_TYPES.GIFT_TABLE, label: 'Gift Table', icon: '🎁' },
      { type: OBJECT_TYPES.CAKE_TABLE, label: 'Cake Table', icon: '🎂' },
      { type: OBJECT_TYPES.ENTRANCE, label: 'Entrance', icon: '🚪' },
      { type: OBJECT_TYPES.EXIT, label: 'Exit', icon: '🚪' },
      { type: OBJECT_TYPES.BATHROOM, label: 'Bathroom', icon: '🚻' },
      { type: OBJECT_TYPES.PARKING, label: 'Parking', icon: '🅿️' },
    ],
  },
  {
    category: 'Shapes',
    items: [
      { type: OBJECT_TYPES.WALL, label: 'Wall', icon: '▬' },
      { type: OBJECT_TYPES.RECTANGLE, label: 'Rectangle', icon: '▭' },
      { type: OBJECT_TYPES.CIRCLE, label: 'Circle', icon: '○' },
      { type: OBJECT_TYPES.LINE, label: 'Line', icon: '╱' },
      { type: OBJECT_TYPES.TEXT, label: 'Text', icon: 'T' },
      { type: OBJECT_TYPES.PLANT, label: 'Plant', icon: '🌿' },
    ],
  },
];

export const DEFAULT_OBJECT_PROPS = {
  [OBJECT_TYPES.ROUND_TABLE]: { width: 140, height: 140, color: '#f5f0e8', borderColor: '#8b7355', chairCount: 8, label: 'Table' },
  [OBJECT_TYPES.RECT_TABLE]: { width: 200, height: 100, color: '#f5f0e8', borderColor: '#8b7355', chairCount: 8, label: 'Table' },
  [OBJECT_TYPES.OVAL_TABLE]: { width: 220, height: 120, color: '#f5f0e8', borderColor: '#8b7355', chairCount: 10, label: 'Table' },
  [OBJECT_TYPES.SQUARE_TABLE]: { width: 120, height: 120, color: '#f5f0e8', borderColor: '#8b7355', chairCount: 4, label: 'Table' },
  [OBJECT_TYPES.STAGE]: { width: 300, height: 160, color: '#dbeafe', borderColor: '#3b82f6', label: 'Stage' },
  [OBJECT_TYPES.DANCE_FLOOR]: { width: 260, height: 200, color: '#fce7f3', borderColor: '#ec4899', label: 'Dance Floor' },
  [OBJECT_TYPES.BAR]: { width: 200, height: 80, color: '#d1fae5', borderColor: '#10b981', label: 'Bar' },
  [OBJECT_TYPES.BUFFET]: { width: 240, height: 80, color: '#fef3c7', borderColor: '#f59e0b', label: 'Buffet' },
  [OBJECT_TYPES.DJ_BOOTH]: { width: 120, height: 100, color: '#ede9fe', borderColor: '#7c3aed', label: 'DJ Booth' },
  [OBJECT_TYPES.GIFT_TABLE]: { width: 160, height: 80, color: '#fee2e2', borderColor: '#ef4444', label: 'Gift Table' },
  [OBJECT_TYPES.CAKE_TABLE]: { width: 100, height: 100, color: '#fce7f3', borderColor: '#db2777', label: 'Cake Table' },
  [OBJECT_TYPES.ENTRANCE]: { width: 100, height: 60, color: '#dcfce7', borderColor: '#16a34a', label: 'Entrance' },
  [OBJECT_TYPES.EXIT]: { width: 100, height: 60, color: '#fee2e2', borderColor: '#dc2626', label: 'Exit' },
  [OBJECT_TYPES.BATHROOM]: { width: 120, height: 100, color: '#e0f2fe', borderColor: '#0284c7', label: 'Bathroom' },
  [OBJECT_TYPES.PARKING]: { width: 160, height: 120, color: '#f1f5f9', borderColor: '#64748b', label: 'Parking' },
  [OBJECT_TYPES.WALL]: { width: 200, height: 20, color: '#374151', borderColor: '#111827', label: '' },
  [OBJECT_TYPES.RECTANGLE]: { width: 160, height: 100, color: '#e5e7eb', borderColor: '#6b7280', label: '' },
  [OBJECT_TYPES.CIRCLE]: { width: 100, height: 100, color: '#e5e7eb', borderColor: '#6b7280', label: '' },
  [OBJECT_TYPES.LINE]: { width: 200, height: 4, color: '#374151', borderColor: '#374151', label: '' },
  [OBJECT_TYPES.TEXT]: { width: 200, height: 40, color: 'transparent', borderColor: 'transparent', label: 'Double-click to edit', fontSize: 18, fontWeight: 'normal' },
  [OBJECT_TYPES.PLANT]: { width: 60, height: 60, color: '#4ade80', borderColor: '#16a34a', label: '' },
};
