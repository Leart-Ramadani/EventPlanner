import { memo, useCallback } from 'react';
import { Group, Rect, Arc, Text } from 'react-konva';
import { CHAIR_SIZE } from '../../utils/chairPositions.js';
import { useSelectionStore } from '../../store/selectionStore.js';

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

  const bgColor = chair.color || CHAIR_STATUS_COLORS_MAP[chair.status] || CHAIR_STATUS_COLORS_MAP.available;

  const handleClick = useCallback((e) => {
    e.cancelBubble = true;
    setEditingChair(tableId, chair.id);
  }, [tableId, chair.id, setEditingChair]);

  const size = CHAIR_SIZE;

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
        fill={bgColor}
        stroke={chair.status === 'vip' ? '#7c3aed' : '#9ca3af'}
        strokeWidth={chair.status === 'vip' ? 2 : 1}
        cornerRadius={4}
      />
      {/* Chair back (top arc) */}
      <Rect
        x={-size / 2}
        y={-size / 2 - 5}
        width={size}
        height={5}
        fill={bgColor}
        stroke={chair.status === 'vip' ? '#7c3aed' : '#9ca3af'}
        strokeWidth={1}
        cornerRadius={[3, 3, 0, 0]}
      />
      {/* Guest name — very small, only if assigned */}
      {chair.guestName && (
        <Text
          text={chair.guestName.split(' ')[0]}
          x={-size / 2}
          y={-size / 2 + 2}
          width={size}
          height={size - 4}
          fontSize={7}
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
