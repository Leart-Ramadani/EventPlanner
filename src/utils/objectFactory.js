import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_OBJECT_PROPS, TABLE_TYPES, OBJECT_TYPES } from '../data/defaultShapes.js';
import { getChairPositions, CHAIR_SIZE } from './chairPositions.js';

let tableCounter = 0;

export function resetTableCounter() { tableCounter = 0; }
export function getNextTableNumber() { return ++tableCounter; }

export function createChair(overrides = {}) {
  return {
    id: `chair_${uuidv4()}`,
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    foodPreference: '',
    notes: '',
    gender: '',
    ageGroup: '',
    color: '',
    status: 'available',
    ...overrides,
  };
}

export function buildChairs(type, width, height, count) {
  const positions = getChairPositions(type, width, height, count);
  return positions.map((pos) => ({
    ...createChair(),
    ...pos,
  }));
}

export function createObject(type, x, y, overrides = {}) {
  const defaults = DEFAULT_OBJECT_PROPS[type] || { width: 120, height: 80, color: '#e5e7eb', borderColor: '#6b7280', label: '' };
  const isTable = TABLE_TYPES.includes(type);

  const num = isTable ? getNextTableNumber() : null;
  const label = isTable ? `Table ${num}` : (defaults.label || '');

  const obj = {
    id: `obj_${uuidv4()}`,
    type,
    x: x - defaults.width / 2,
    y: y - defaults.height / 2,
    width: defaults.width,
    height: defaults.height,
    rotation: 0,
    color: defaults.color,
    borderColor: defaults.borderColor,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 0,
    label,
    notes: '',
    ...overrides,
  };

  if (isTable) {
    const chairCount = defaults.chairCount || 8;
    obj.chairCount = chairCount;
    obj.chairs = buildChairs(type, obj.width, obj.height, chairCount);
  }

  if (type === OBJECT_TYPES.TEXT) {
    obj.fontSize = defaults.fontSize || 18;
    obj.fontWeight = defaults.fontWeight || 'normal';
    obj.align = 'left';
    obj.fontFamily = 'sans-serif';
  }

  return obj;
}

export function updateChairs(obj) {
  if (!TABLE_TYPES.includes(obj.type)) return obj;
  const positions = getChairPositions(obj.type, obj.width, obj.height, obj.chairCount);
  const existingChairs = obj.chairs || [];
  const chairs = positions.map((pos, i) => ({
    ...(existingChairs[i] || createChair()),
    ...pos,
    id: existingChairs[i]?.id || `chair_${uuidv4()}`,
  }));
  return { ...obj, chairs };
}
