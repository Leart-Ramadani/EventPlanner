import { memo } from 'react';
import { Group, Rect, Ellipse, Text } from 'react-konva';
import ChairNode from './ChairNode.jsx';

const TableNode = memo(({ obj, isSelected }) => {
  const { type, width, height, color, borderColor, label, chairs = [] } = obj;

  const renderTableShape = () => {
    const strokeW = isSelected ? 2.5 : 1.5;
    const stroke = isSelected ? '#3b82f6' : (borderColor || '#8b7355');

    if (type === 'round_table') {
      return (
        <Ellipse
          x={0} y={0}
          radiusX={width / 2}
          radiusY={height / 2}
          fill={color}
          stroke={stroke}
          strokeWidth={strokeW}
        />
      );
    }
    if (type === 'oval_table') {
      return (
        <Ellipse
          x={0} y={0}
          radiusX={width / 2}
          radiusY={height / 2}
          fill={color}
          stroke={stroke}
          strokeWidth={strokeW}
        />
      );
    }
    // rect / square
    return (
      <Rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        fill={color}
        stroke={stroke}
        strokeWidth={strokeW}
        cornerRadius={4}
      />
    );
  };

  return (
    <>
      {chairs.map((chair) => (
        <ChairNode key={chair.id} chair={chair} tableId={obj.id} tableSelected={isSelected} />
      ))}
      {renderTableShape()}
      {label && (
        <Text
          text={label}
          x={-width / 2}
          y={-10}
          width={width}
          height={20}
          fontSize={12}
          fontStyle="bold"
          fill="#1f2937"
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      )}
    </>
  );
});

export default TableNode;
