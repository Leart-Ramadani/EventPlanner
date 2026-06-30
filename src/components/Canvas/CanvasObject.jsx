import { memo, useRef, useCallback } from 'react';
import { Group } from 'react-konva';
import TableNode from './TableNode.jsx';
import ShapeNode from './ShapeNode.jsx';
import { TABLE_TYPES } from '../../data/defaultShapes.js';
import { useProjectStore } from '../../store/projectStore.js';
import { useSelectionStore } from '../../store/selectionStore.js';
import { useCanvasStore } from '../../store/canvasStore.js';
import { useHistoryStore } from '../../store/historyStore.js';
import { snapToGrid } from '../../utils/geometry.js';

const CanvasObject = memo(({ obj }) => {
  const groupRef = useRef(null);
  const dragStart = useRef(null);

  const { updateObject, updateObjectRaw, getObjects, exportData } = useProjectStore();
  const { selectedIds, select, addToSelection, setHovered, setEditingChair, tool } = useSelectionStore();
  const { snapToGrid: snap, gridSize } = useCanvasStore();
  const { push } = useHistoryStore();

  const isSelected = selectedIds.includes(obj.id);
  const isTable = TABLE_TYPES.includes(obj.type);

  const handleClick = useCallback((e) => {
    if (tool === 'pan') return;
    e.cancelBubble = true;
    if (e.evt.shiftKey) {
      addToSelection(obj.id);
    } else {
      select(obj.id);
    }
  }, [obj.id, select, addToSelection, tool]);

  const handleDblClick = useCallback((e) => {
    e.cancelBubble = true;
    if (!isTable) return;
    const firstChair = obj.chairs?.[0];
    if (firstChair) setEditingChair(obj.id, firstChair.id);
  }, [isTable, obj.id, obj.chairs, setEditingChair]);

  const handleDragStart = useCallback(() => {
    dragStart.current = exportData();
    if (!selectedIds.includes(obj.id)) select(obj.id);
  }, [obj.id, select, selectedIds, exportData]);

  const handleDragEnd = useCallback((e) => {
    // e.target is the Group whose origin is at obj.x + width/2, obj.y + height/2
    let cx = e.target.x();
    let cy = e.target.y();
    if (snap) {
      // Snap the top-left corner then recompute center
      const snappedX = snapToGrid(cx - obj.width / 2, gridSize);
      const snappedY = snapToGrid(cy - obj.height / 2, gridSize);
      cx = snappedX + obj.width / 2;
      cy = snappedY + obj.height / 2;
      e.target.x(cx);
      e.target.y(cy);
    }
    if (dragStart.current) push(dragStart.current);
    updateObjectRaw(obj.id, { x: cx - obj.width / 2, y: cy - obj.height / 2 });
  }, [obj.id, obj.width, obj.height, updateObjectRaw, snap, gridSize, push]);

  const handleTransformEnd = useCallback((e) => {
    const node = groupRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    const newW = Math.max(20, obj.width * scaleX);
    const newH = Math.max(20, obj.height * scaleY);
    push(exportData());
    updateObject(obj.id, {
      x: node.x(),
      y: node.y(),
      width: newW,
      height: newH,
      rotation: node.rotation(),
    });
  }, [obj, updateObject, push, exportData]);

  if (!obj.visible) return null;

  return (
    <Group
      ref={groupRef}
      id={obj.id}
      x={obj.x + obj.width / 2}
      y={obj.y + obj.height / 2}
      rotation={obj.rotation || 0}
      opacity={obj.opacity ?? 1}
      draggable={!obj.locked && tool !== 'pan'}
      onClick={handleClick}
      onTap={handleClick}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      onMouseEnter={() => setHovered(obj.id)}
      onMouseLeave={() => setHovered(null)}
    >
      {isTable
        ? <TableNode obj={obj} isSelected={isSelected} />
        : <ShapeNode obj={obj} isSelected={isSelected} />
      }
    </Group>
  );
});

export default CanvasObject;
