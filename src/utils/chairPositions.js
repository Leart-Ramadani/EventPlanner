export const CHAIR_SIZE = 22;
export const CHAIR_GAP = 6;

export function calcRoundTableChairs(tableWidth, chairCount) {
  const rx = tableWidth / 2 + CHAIR_SIZE / 2 + CHAIR_GAP;
  const ry = rx;
  const chairs = [];
  for (let i = 0; i < chairCount; i++) {
    const angle = (2 * Math.PI * i) / chairCount - Math.PI / 2;
    chairs.push({
      index: i,
      x: Math.cos(angle) * rx,
      y: Math.sin(angle) * ry,
      rotation: (angle * 180) / Math.PI + 90,
    });
  }
  return chairs;
}

export function calcOvalTableChairs(tableWidth, tableHeight, chairCount) {
  const rx = tableWidth / 2 + CHAIR_SIZE / 2 + CHAIR_GAP;
  const ry = tableHeight / 2 + CHAIR_SIZE / 2 + CHAIR_GAP;
  const chairs = [];
  for (let i = 0; i < chairCount; i++) {
    const angle = (2 * Math.PI * i) / chairCount - Math.PI / 2;
    const x = Math.cos(angle) * rx;
    const y = Math.sin(angle) * ry;
    const tangentAngle = Math.atan2(y / (ry * ry), x / (rx * rx));
    chairs.push({
      index: i,
      x,
      y,
      rotation: (tangentAngle * 180) / Math.PI + 90,
    });
  }
  return chairs;
}

export function calcRectTableChairs(tableWidth, tableHeight, chairCount) {
  const chairs = [];
  const perimeter = 2 * (tableWidth + tableHeight);
  const spacing = perimeter / chairCount;

  for (let i = 0; i < chairCount; i++) {
    const dist = i * spacing;
    let x, y, rotation;

    if (dist < tableWidth) {
      // Top edge
      x = dist - tableWidth / 2;
      y = -(tableHeight / 2 + CHAIR_SIZE / 2 + CHAIR_GAP);
      rotation = 180;
    } else if (dist < tableWidth + tableHeight) {
      // Right edge
      x = tableWidth / 2 + CHAIR_SIZE / 2 + CHAIR_GAP;
      y = (dist - tableWidth) - tableHeight / 2;
      rotation = 270;
    } else if (dist < 2 * tableWidth + tableHeight) {
      // Bottom edge
      x = tableWidth / 2 - (dist - tableWidth - tableHeight);
      y = tableHeight / 2 + CHAIR_SIZE / 2 + CHAIR_GAP;
      rotation = 0;
    } else {
      // Left edge
      x = -(tableWidth / 2 + CHAIR_SIZE / 2 + CHAIR_GAP);
      y = tableHeight / 2 - (dist - 2 * tableWidth - tableHeight);
      rotation = 90;
    }

    chairs.push({ index: i, x, y, rotation });
  }
  return chairs;
}

export function calcSquareTableChairs(tableWidth, chairCount) {
  return calcRectTableChairs(tableWidth, tableWidth, chairCount);
}

export function getChairPositions(type, width, height, chairCount) {
  switch (type) {
    case 'round_table':
      return calcRoundTableChairs(width, chairCount);
    case 'oval_table':
      return calcOvalTableChairs(width, height, chairCount);
    case 'rect_table':
      return calcRectTableChairs(width, height, chairCount);
    case 'square_table':
      return calcSquareTableChairs(width, chairCount);
    default:
      return [];
  }
}
