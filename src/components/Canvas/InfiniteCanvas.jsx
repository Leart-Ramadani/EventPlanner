import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Stage, Layer } from 'react-konva';
import CanvasGrid from './CanvasGrid.jsx';
import CanvasObject from './CanvasObject.jsx';
import SelectionTransformer from './SelectionTransformer.jsx';
import ContextMenu from './ContextMenu.jsx';
import { useCanvasStore } from '../../store/canvasStore.js';
import { useProjectStore } from '../../store/projectStore.js';
import { useSelectionStore } from '../../store/selectionStore.js';
import { createObject } from '../../utils/objectFactory.js';
import { useHistoryStore } from '../../store/historyStore.js';

function getDistance(p1, p2) {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

export default function InfiniteCanvas({ containerRef }) {
  const stageRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const isPanning = useRef(false);
  const lastPointer = useRef(null);
  const lastDist = useRef(0);
  const lastTouchCenter = useRef(null);

  const { zoom, offsetX, offsetY, gridVisible, gridSize, setZoom, setOffset, stageSize, setStageSize } = useCanvasStore();
  const { getObjects, addObject, exportData } = useProjectStore();
  const { deselect, tool } = useSelectionStore();
  const { push } = useHistoryStore();

  const objects = getObjects();
  const sortedObjects = useMemo(() => [...objects].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)), [objects]);

  // Resize observer
  useEffect(() => {
    if (!containerRef?.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setStageSize(width, height);
    });
    ro.observe(containerRef.current);
    const { width, height } = containerRef.current.getBoundingClientRect();
    setStageSize(width, height);
    return () => ro.disconnect();
  }, [containerRef, setStageSize]);

  // Desktop drag-and-drop from toolbar
  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;
    const onDragOver = (e) => e.preventDefault();
    const onDrop = (e) => {
      e.preventDefault();
      const typeData = e.dataTransfer.getData('object_type');
      if (!typeData) return;
      const rect = el.getBoundingClientRect();
      const rawX = (e.clientX - rect.left - offsetX) / zoom;
      const rawY = (e.clientY - rect.top - offsetY) / zoom;
      push(exportData());
      addObject(createObject(typeData, rawX, rawY));
    };
    el.addEventListener('dragover', onDragOver);
    el.addEventListener('drop', onDrop);
    return () => { el.removeEventListener('dragover', onDragOver); el.removeEventListener('drop', onDrop); };
  }, [containerRef, zoom, offsetX, offsetY, addObject, push, exportData]);

  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    const scaleBy = 1.08;
    if (e.evt.ctrlKey || e.evt.metaKey) {
      const oldZoom = zoom;
      const newZoom = Math.max(0.1, Math.min(5, e.evt.deltaY < 0 ? oldZoom * scaleBy : oldZoom / scaleBy));
      setZoom(newZoom);
      setOffset(
        pointer.x - (pointer.x - offsetX) * (newZoom / oldZoom),
        pointer.y - (pointer.y - offsetY) * (newZoom / oldZoom),
      );
    } else {
      setOffset(offsetX - e.evt.deltaX, offsetY - e.evt.deltaY);
    }
  }, [zoom, offsetX, offsetY, setZoom, setOffset]);

  const handleMouseDown = useCallback((e) => {
    if (e.evt.button === 1 || tool === 'pan') {
      isPanning.current = true;
      lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY };
      return;
    }
    if (e.target === e.target.getStage()) {
      deselect();
      setContextMenu(null);
    }
  }, [deselect, tool]);

  const handleMouseMove = useCallback((e) => {
    if (!isPanning.current) return;
    const dx = e.evt.clientX - lastPointer.current.x;
    const dy = e.evt.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY };
    setOffset(offsetX + dx, offsetY + dy);
  }, [offsetX, offsetY, setOffset]);

  const handleMouseUp = useCallback(() => { isPanning.current = false; }, []);

  // Touch: pinch-to-zoom + single-finger pan
  const handleTouchStart = useCallback((e) => {
    const touches = e.evt.touches;
    if (touches.length === 2) {
      const p1 = { x: touches[0].clientX, y: touches[0].clientY };
      const p2 = { x: touches[1].clientX, y: touches[1].clientY };
      lastDist.current = getDistance(p1, p2);
      lastTouchCenter.current = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    } else if (touches.length === 1 && tool === 'pan') {
      isPanning.current = true;
      lastPointer.current = { x: touches[0].clientX, y: touches[0].clientY };
    }
  }, [tool]);

  const handleTouchMove = useCallback((e) => {
    const touches = e.evt.touches;
    e.evt.preventDefault?.();
    if (touches.length === 2) {
      const p1 = { x: touches[0].clientX, y: touches[0].clientY };
      const p2 = { x: touches[1].clientX, y: touches[1].clientY };
      const newDist = getDistance(p1, p2);
      const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      if (lastDist.current && lastTouchCenter.current) {
        const scale = newDist / lastDist.current;
        const oldZoom = zoom;
        const newZoom = Math.max(0.1, Math.min(5, oldZoom * scale));
        const stage = stageRef.current;
        if (stage) {
          const rect = stage.container().getBoundingClientRect();
          const sx = center.x - rect.left;
          const sy = center.y - rect.top;
          setZoom(newZoom);
          setOffset(sx - (sx - offsetX) * (newZoom / oldZoom), sy - (sy - offsetY) * (newZoom / oldZoom));
        }
        const dx = center.x - lastTouchCenter.current.x;
        const dy = center.y - lastTouchCenter.current.y;
        setOffset(offsetX + dx, offsetY + dy);
      }
      lastDist.current = newDist;
      lastTouchCenter.current = center;
    } else if (touches.length === 1 && isPanning.current) {
      const dx = touches[0].clientX - lastPointer.current.x;
      const dy = touches[0].clientY - lastPointer.current.y;
      lastPointer.current = { x: touches[0].clientX, y: touches[0].clientY };
      setOffset(offsetX + dx, offsetY + dy);
    }
  }, [zoom, offsetX, offsetY, setZoom, setOffset]);

  const handleTouchEnd = useCallback(() => {
    isPanning.current = false;
    lastDist.current = 0;
    lastTouchCenter.current = null;
  }, []);

  const handleContextMenu = useCallback((e) => {
    e.evt.preventDefault();
    let node = e.target;
    while (node) {
      const nodeId = typeof node.id === 'function' ? node.id() : '';
      if (nodeId && nodeId.startsWith('obj_')) {
        const rect = containerRef.current?.getBoundingClientRect();
        setContextMenu({ x: e.evt.clientX - (rect?.left ?? 0), y: e.evt.clientY - (rect?.top ?? 0), objectId: nodeId });
        return;
      }
      if (!node.parent || node === stageRef.current) break;
      node = node.parent;
    }
  }, [containerRef]);

  const cursor = tool === 'pan' || isPanning.current ? 'grab' : 'default';

  return (
    <div className="relative w-full h-full" style={{ cursor, touchAction: 'none' }}>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        x={offsetX}
        y={offsetY}
        scaleX={zoom}
        scaleY={zoom}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
        style={{ background: '#f9fafb' }}
      >
        <Layer listening={false}>
          {gridVisible && (
            <CanvasGrid
              width={stageSize.width}
              height={stageSize.height}
              gridSize={gridSize}
              zoom={zoom}
              offsetX={offsetX}
              offsetY={offsetY}
            />
          )}
        </Layer>
        <Layer>
          {sortedObjects.map((obj) => (
            <CanvasObject key={obj.id} obj={obj} />
          ))}
          <SelectionTransformer stageRef={stageRef} />
        </Layer>
      </Stage>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          objectId={contextMenu.objectId}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
