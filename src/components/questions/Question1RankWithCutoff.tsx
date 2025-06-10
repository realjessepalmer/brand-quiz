import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useQuiz } from '../../contexts/QuizContext';
import { SortableItem } from './SortableItem';
import { QuizOption } from '../../types';

interface Question1Props {
  question: {
    id: string;
    text: string;
    instructions: string;
    options: QuizOption[];
  };
}

export function Question1RankWithCutoff({ question }: Question1Props) {
  const { setAnswer, nextQuestion } = useQuiz();
  const [aboveTheLine, setAboveTheLine] = useState<string[]>([]);
  const [belowTheLine, setBelowTheLine] = useState<string[]>(
    question.options.map(opt => opt.text)
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  // Click to move items (alternative to drag and drop)
  const handleItemClick = (itemText: string) => {
    if (aboveTheLine.includes(itemText)) {
      // Move from above to below
      setAboveTheLine(prev => prev.filter(item => item !== itemText));
      setBelowTheLine(prev => [...prev, itemText]);
    } else {
      // Move from below to above
      setBelowTheLine(prev => prev.filter(item => item !== itemText));
      setAboveTheLine(prev => [...prev, itemText]);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we're dropping into a zone
    if (overId === 'above-zone' || overId === 'below-zone') {
      const isActiveInAbove = aboveTheLine.includes(activeId);
      const isActiveInBelow = belowTheLine.includes(activeId);
      
      if (overId === 'above-zone' && isActiveInBelow) {
        // Move from below to above
        setBelowTheLine(prev => prev.filter(item => item !== activeId));
        setAboveTheLine(prev => [...prev, activeId]);
      } else if (overId === 'below-zone' && isActiveInAbove) {
        // Move from above to below
        setAboveTheLine(prev => prev.filter(item => item !== activeId));
        setBelowTheLine(prev => [...prev, activeId]);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle reordering within the same list
    const activeInAbove = aboveTheLine.includes(activeId);
    const overInAbove = aboveTheLine.includes(overId);
    const activeInBelow = belowTheLine.includes(activeId);
    const overInBelow = belowTheLine.includes(overId);

    if (activeInAbove && overInAbove) {
      // Reorder within above list
      const oldIndex = aboveTheLine.indexOf(activeId);
      const newIndex = aboveTheLine.indexOf(overId);
      setAboveTheLine(arrayMove(aboveTheLine, oldIndex, newIndex));
    } else if (activeInBelow && overInBelow) {
      // Reorder within below list
      const oldIndex = belowTheLine.indexOf(activeId);
      const newIndex = belowTheLine.indexOf(overId);
      setBelowTheLine(arrayMove(belowTheLine, oldIndex, newIndex));
    }
  };

  const handleSubmit = () => {
    setAnswer({
      questionId: question.id,
      type: 'rankWithCutoff',
      value: {
        aboveTheLine,
        belowTheLine
      }
    });
    nextQuestion();
  };

  const draggedItem = activeId ? 
    question.options.find(opt => opt.text === activeId) : null;

  function DroppableZone({ children, id }: { children: React.ReactNode; id: string }) {
    const { isOver, setNodeRef } = useDroppable({ id });
    
    return (
      <div ref={setNodeRef} className={`droppable-zone ${isOver ? 'drag-over' : ''}`}>
        {children}
      </div>
    );
  }

  return (
    <div className="question-container mobile-optimized">
      <div className="question-header">
        <h2 className="question-title">{question.text}</h2>
        <p className="question-instructions">{question.instructions}</p>
        <p className="interaction-help">💡 Tap to move between zones, or drag to reorder</p>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <div className="ranking-zones">
          {/* Above the line zone */}
          <DroppableZone id="above-zone">
            <SortableContext items={aboveTheLine} strategy={verticalListSortingStrategy}>
              <div className="zone above-zone">
                <h3 className="zone-title">Important Values</h3>
                <div className="sortable-list">
                  {aboveTheLine.map((itemText, index) => (
                    <SortableItem
                      key={itemText}
                      id={itemText}
                      text={itemText}
                      rank={index + 1}
                      onClick={handleItemClick}
                    />
                  ))}
                  {aboveTheLine.length === 0 && (
                    <div className="empty-zone">
                      Tap or drag important values here
                    </div>
                  )}
                </div>
              </div>
            </SortableContext>
          </DroppableZone>

          {/* Cutoff line */}
          <div className="cutoff-divider">
            <span className="cutoff-label">Values that matter to your brand</span>
          </div>

          {/* Below the line zone */}
          <DroppableZone id="below-zone">
            <SortableContext items={belowTheLine} strategy={verticalListSortingStrategy}>
              <div className="zone below-zone">
                <h3 className="zone-title">Less Important</h3>
                <div className="sortable-list">
                  {belowTheLine.map((itemText) => (
                    <SortableItem
                      key={itemText}
                      id={itemText}
                      text={itemText}
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              </div>
            </SortableContext>
          </DroppableZone>
        </div>

        <DragOverlay>
          {draggedItem ? (
            <div className="draggable-item dragging">
              {draggedItem.text}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="question-footer">
        <button 
          onClick={handleSubmit}
          className="btn-primary"
        >
          Continue ({aboveTheLine.length})
        </button>
      </div>
    </div>
  );
}