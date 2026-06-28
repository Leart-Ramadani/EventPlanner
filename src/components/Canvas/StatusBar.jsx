import { useCanvasStore } from '../../store/canvasStore.js';
import { useSelectionStore } from '../../store/selectionStore.js';
import { useProjectStore } from '../../store/projectStore.js';

export default function StatusBar() {
  const { zoom, gridVisible, snapToGrid } = useCanvasStore();
  const { selectedIds } = useSelectionStore();
  const { getObjects, projectName } = useProjectStore();

  const objects = getObjects();
  const tableCount = objects.filter((o) => ['round_table','rect_table','oval_table','square_table'].includes(o.type)).length;
  const chairCount = objects.reduce((s, o) => s + (o.chairs?.length ?? 0), 0);
  const assignedChairs = objects.reduce((s, o) => s + (o.chairs?.filter((c) => c.guestName).length ?? 0), 0);

  return (
    <div className="h-6 bg-gray-50 border-t border-gray-200 flex items-center px-4 gap-4 text-xs text-gray-400 flex-shrink-0">
      <span className="font-medium text-gray-500">{projectName}</span>
      <span>·</span>
      <span>{tableCount} tables</span>
      <span>·</span>
      <span>{assignedChairs}/{chairCount} seats assigned</span>
      <span>·</span>
      <span>{objects.length} objects</span>
      {selectedIds.length > 0 && <><span>·</span><span className="text-blue-500">{selectedIds.length} selected</span></>}
      <div className="ml-auto flex items-center gap-3">
        {gridVisible && <span>Grid on</span>}
        {snapToGrid && <span>Snap on</span>}
        <span className="font-mono">{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}
