import { memo, useCallback } from 'react';
import { Group, Rect, Arc, Text } from 'react-konva';
import { CHAIR_SIZE } from '../../utils/chairPositions.js';
import { useSelectionStore } from '../../store/selectionStore.js';
import { useProjectStore } from '../../store/projectStore.js';

const CHAIR_STATUS_COLORS_MAP = {
  available: '#f3f4f6',
  reserved: '#fbbf24',
  occupied: '#60a5fa',
  vip: '#a78bfa',
  disabled: '#34d399',
  child: '#f87171',
};

const ChairNode = memo(({ chair, tableId, tableSelected }) => {
  const setEditingChair = useSelectionStore((s) => s.setEditingChair);
  const assigningGuestId = useSelectionStore((s) => s.assigningGuestId);
  const clearAssigningGuest = useSelectionStore((s) => s.clearAssigningGuest);
  const { updateChair, unassignGuest, guests } = useProjectStore();

  const bgColor = chair.color || CHAIR_STATUS_COLORS_MAP[chair.status] || CHAIR_STATUS_COLORS_MAP.available;

  const handleClick = useCallback((e) => {
    e.cancelBubble = true;
    if (assigningGuestId) {
      const guest = guests.find((g) => g.id === assigningGuestId);
      if (!guest) { clearAssigningGuest(); return; }
      // Remove previous assignment for this guest across all chairs
      unassignGuest(guest.name);
      updateChair(tableId, chair.id, { guestName: guest.name, status: 'occupied' });
      clearAssigningGuest();
      return;
    }
    setEditingChair(tableId, chair.id);
  }, [tableId, chair.id, assigningGuestId, guests, setEditingChair, updateChair, unassignGuest, clearAssigningGuest]);

  const size = CHAIR_SIZE;
  const isAssigning = !!assigningGuestId;
  const strokeColor = isAssigning ? '#3b82f6' : chair.status === 'vip' ? '#7c3aed' : '#9ca3af';
  const strokeWidth = isAssigning ? 2 : chair.status === 'vip' ? 2 : 1;

  return (
    <Group
      x={chair.x}
      y={chair.y}
      rotation={chair.rotation}
      onClick={handleClick}
      onTap={handleClick}
    >
      {/* Chair body */}
      <Rect
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        fill={isAssigning ? '#eff6ff' : bgColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        cornerRadius={4}
      />
      {/* Chair back (top arc) */}
      <Rect
        x={-size / 2}
        y={-size / 2 - 5}
        width={size}
        height={5}
        fill={isAssigning ? '#eff6ff' : bgColor}
        stroke={strokeColor}
        strokeWidth={1}
        cornerRadius={[3, 3, 0, 0]}
      />
      {/* Guest name */}
      {chair.guestName && (
        <Text
          text={chair.guestName.split(' ')[0]}
          x={-size / 2}
          y={-size / 2 + 1}
          width={size}
          height={size - 2}
          fontSize={10}
          fontStyle="bold"
          fill="#1f2937"
          align="center"
          verticalAlign="middle"
          listening={false}
          ellipsis
        />
      )}
    </Group>
  );
});

export default ChairNode;
