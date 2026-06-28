import { memo, useState, useRef } from 'react';
import { Rect, Ellipse, Line, Text, Group } from 'react-konva';
import { OBJECT_TYPES } from '../../data/defaultShapes.js';

const ShapeNode = memo(({ obj, isSelected, onTextChange }) => {
  const { type, width, height, color, borderColor, label, fontSize = 18, fontWeight = 'normal', align = 'left' } = obj;
  const stroke = isSelected ? '#3b82f6' : (borderColor || '#6b7280');
  const strokeW = isSelected ? 2 : 1.5;

  if (type === OBJECT_TYPES.CIRCLE || type === OBJECT_TYPES.PLANT) {
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

  if (type === OBJECT_TYPES.LINE) {
    return (
      <Line
        points={[-width / 2, 0, width / 2, 0]}
        stroke={color || stroke}
        strokeWidth={Math.max(height, 2)}
        lineCap="round"
      />
    );
  }

  if (type === OBJECT_TYPES.TEXT) {
    return (
      <Text
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        text={label || 'Double-click to edit'}
        fontSize={fontSize}
        fontStyle={fontWeight === 'bold' ? 'bold' : 'normal'}
        fontFamily="sans-serif"
        fill={color === 'transparent' ? '#1f2937' : color}
        align={align}
        verticalAlign="middle"
        wrap="word"
      />
    );
  }

  // Default: rectangle with a centered label
  return (
    <>
      <Rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        fill={color}
        stroke={stroke}
        strokeWidth={strokeW}
        cornerRadius={type === OBJECT_TYPES.WALL ? 0 : 6}
        dash={type === OBJECT_TYPES.PARKING ? [8, 4] : undefined}
      />
      {label && (
        <Text
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          text={label}
          fontSize={13}
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

export default ShapeNode;
