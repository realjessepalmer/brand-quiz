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

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click when dragging
    if (!isDragging && onClick) {
      onClick(id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`draggable-item ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      title="Tap to remove or use handle to drag"
      data-testid={`sortable-item-${id}`}
    >
      {rank && <span className="rank-number">{rank}</span>}
      <span className="item-text" onClick={handleClick}>{text}</span>
      <div className="drag-handle" {...listeners} aria-label="Drag to reorder">
        <span className="drag-dots">⋮⋮</span>
      </div>
    </div>
  );
}