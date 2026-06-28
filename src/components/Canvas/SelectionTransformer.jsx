import { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import { useSelectionStore } from '../../store/selectionStore.js';

export default function SelectionTransformer({ stageRef }) {
  const transformerRef = useRef(null);
  const { selectedIds } = useSelectionStore();

  useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;

    const nodes = selectedIds
      .map((id) => stage.findOne(`#${id}`))
      .filter(Boolean);

    tr.nodes(nodes);
    tr.getLayer()?.batchDraw();
  }, [selectedIds, stageRef]);

  if (!selectedIds.length) return null;

  return (
    <Transformer
      ref={transformerRef}
      anchorSize={9}
      anchorCornerRadius={3}
      borderStroke="#3b82f6"
      borderStrokeWidth={1.5}
      anchorFill="#fff"
      anchorStroke="#3b82f6"
      anchorStrokeWidth={1.5}
      rotateAnchorOffset={20}
      keepRatio={false}
      enabledAnchors={['top-left','top-right','bottom-left','bottom-right','middle-left','middle-right','top-center','bottom-center']}
    />
  );
}
