import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  text: string;
  rank?: number;
  onClick?: (id: string) => void;
}

export function SortableItem({ id, text, rank, onClick }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`draggable-item ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(id)}
      title="Click to move between zones or drag to reorder"
      data-testid={`sortable-item-${id}`}
    >
      {rank && <span className="rank-number">{rank}</span>}
      <span className="item-text">{text}</span>
      <div className="drag-handle" aria-hidden="true">
        <span className="drag-dots">⋮⋮</span>
      </div>
    </div>
  );
}