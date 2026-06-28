import { memo } from 'react';
import { Line } from 'react-konva';

const CanvasGrid = memo(({ width, height, gridSize, zoom, offsetX, offsetY }) => {
  const lines = [];
  const startX = Math.floor(-offsetX / zoom / gridSize) * gridSize;
  const startY = Math.floor(-offsetY / zoom / gridSize) * gridSize;
  const endX = startX + width / zoom + gridSize * 2;
  const endY = startY + height / zoom + gridSize * 2;

  for (let x = startX; x <= endX; x += gridSize) {
    lines.push(
      <Line
        key={`v_${x}`}
        points={[x, startY, x, endY]}
        stroke="#e5e7eb"
        strokeWidth={1 / zoom}
        listening={false}
      />
    );
  }

  for (let y = startY; y <= endY; y += gridSize) {
    lines.push(
      <Line
        key={`h_${y}`}
        points={[startX, y, endX, y]}
        stroke="#e5e7eb"
        strokeWidth={1 / zoom}
        listening={false}
      />
    );
  }

  return <>{lines}</>;
});

export default CanvasGrid;
