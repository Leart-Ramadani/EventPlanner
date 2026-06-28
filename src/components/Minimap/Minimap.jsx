import { useRef, useEffect, useCallback } from 'react';
import { useProjectStore } from '../../store/projectStore.js';
import { useCanvasStore } from '../../store/canvasStore.js';
import { TABLE_TYPES } from '../../data/defaultShapes.js';

const MAP_W = 180;
const MAP_H = 120;
const PADDING = 40;

function getWorldBounds(objects) {
  if (!objects.length) return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const o of objects) {
    minX = Math.min(minX, o.x);
    minY = Math.min(minY, o.y);
    maxX = Math.max(maxX, o.x + o.width);
    maxY = Math.max(maxY, o.y + o.height);
  }
  return { minX: minX - PADDING, minY: minY - PADDING, maxX: maxX + PADDING, maxY: maxY + PADDING };
}

export default function Minimap() {
  const canvasRef = useRef(null);
  const { getObjects } = useProjectStore();
  const { zoom, offsetX, offsetY, stageSize, setOffset } = useCanvasStore();

  const objects = getObjects();
  const bounds = getWorldBounds(objects);
  const worldW = bounds.maxX - bounds.minX;
  const worldH = bounds.maxY - bounds.minY;
  const scaleX = MAP_W / worldW;
  const scaleY = MAP_H / worldH;
  const scale = Math.min(scaleX, scaleY);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, MAP_W, MAP_H);

    // Background
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, MAP_W, MAP_H);

    // Objects
    for (const obj of objects) {
      if (!obj.visible) continue;
      const x = (obj.x - bounds.minX) * scale;
      const y = (obj.y - bounds.minY) * scale;
      const w = obj.width * scale;
      const h = obj.height * scale;

      ctx.fillStyle = obj.color || '#e5e7eb';
      ctx.strokeStyle = obj.borderColor || '#9ca3af';
      ctx.lineWidth = 0.5;

      if (TABLE_TYPES.includes(obj.type) && (obj.type === 'round_table' || obj.type === 'oval_table')) {
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
      }
    }

    // Viewport indicator
    const vpX = (-offsetX / zoom - bounds.minX) * scale;
    const vpY = (-offsetY / zoom - bounds.minY) * scale;
    const vpW = (stageSize.width / zoom) * scale;
    const vpH = (stageSize.height / zoom) * scale;

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vpX, vpY, vpW, vpH);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
    ctx.fillRect(vpX, vpY, vpW, vpH);
  }, [objects, zoom, offsetX, offsetY, stageSize, bounds, scale]);

  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const worldX = mx / scale + bounds.minX;
    const worldY = my / scale + bounds.minY;
    const newOffX = stageSize.width / 2 - worldX * zoom;
    const newOffY = stageSize.height / 2 - worldY * zoom;
    setOffset(newOffX, newOffY);
  }, [scale, bounds, stageSize, zoom, setOffset]);

  return (
    <div className="absolute bottom-4 right-4 z-20 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ width: MAP_W + 2, height: MAP_H + 2 }}>
      <canvas
        ref={canvasRef}
        width={MAP_W}
        height={MAP_H}
        onClick={handleClick}
        className="cursor-crosshair"
      />
    </div>
  );
}
