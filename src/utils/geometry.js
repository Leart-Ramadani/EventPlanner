export function snapToGrid(value, gridSize) {
  return Math.round(value / gridSize) * gridSize;
}

export function snapPointToGrid(x, y, gridSize) {
  return { x: snapToGrid(x, gridSize), y: snapToGrid(y, gridSize) };
}

export function getBoundingBox(objects) {
  if (!objects.length) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const obj of objects) {
    minX = Math.min(minX, obj.x);
    minY = Math.min(minY, obj.y);
    maxX = Math.max(maxX, obj.x + obj.width);
    maxY = Math.max(maxY, obj.y + obj.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function alignObjects(objects, alignment, canvasWidth, canvasHeight) {
  const bb = getBoundingBox(objects);
  if (!bb) return objects;

  return objects.map(obj => {
    switch (alignment) {
      case 'left': return { ...obj, x: bb.x };
      case 'right': return { ...obj, x: bb.x + bb.width - obj.width };
      case 'top': return { ...obj, y: bb.y };
      case 'bottom': return { ...obj, y: bb.y + bb.height - obj.height };
      case 'centerH': return { ...obj, x: bb.x + (bb.width - obj.width) / 2 };
      case 'centerV': return { ...obj, y: bb.y + (bb.height - obj.height) / 2 };
      default: return obj;
    }
  });
}

export function distributeHorizontally(objects) {
  if (objects.length < 3) return objects;
  const sorted = [...objects].sort((a, b) => a.x - b.x);
  const totalWidth = sorted.reduce((s, o) => s + o.width, 0);
  const span = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width - sorted[0].x;
  const gap = (span - totalWidth) / (sorted.length - 1);
  let cursor = sorted[0].x;
  return sorted.map(obj => {
    const updated = { ...obj, x: cursor };
    cursor += obj.width + gap;
    return updated;
  });
}

export function distributeVertically(objects) {
  if (objects.length < 3) return objects;
  const sorted = [...objects].sort((a, b) => a.y - b.y);
  const totalHeight = sorted.reduce((s, o) => s + o.height, 0);
  const span = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height - sorted[0].y;
  const gap = (span - totalHeight) / (sorted.length - 1);
  let cursor = sorted[0].y;
  return sorted.map(obj => {
    const updated = { ...obj, y: cursor };
    cursor += obj.height + gap;
    return updated;
  });
}
