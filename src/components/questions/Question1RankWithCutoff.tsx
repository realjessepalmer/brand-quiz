import { useState, useEffect, useRef } from 'react';
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
  const { state, setAnswer, nextQuestion, previousQuestion, canGoPrevious } = useQuiz();
  
  // Find existing answer for this question
  const existingAnswer = state.answers.find(answer => answer.questionId === question.id);
  const existingValue = existingAnswer?.value as { aboveTheLine: string[]; belowTheLine: string[] } | undefined;
  
  const [aboveTheLine, setAboveTheLine] = useState<string[]>(existingValue?.aboveTheLine || []);
  const [belowTheLine, setBelowTheLine] = useState<string[]>(
    existingValue?.belowTheLine || question.options.map(opt => opt.text)
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showTopScrollIndicator, setShowTopScrollIndicator] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if content is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (containerRef.current) {
        const { scrollHeight, clientHeight } = containerRef.current;
        setShowScrollIndicator(scrollHeight > clientHeight);
      }
    };

    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    
    return () => window.removeEventListener('resize', checkScrollable);
  }, [aboveTheLine, belowTheLine]);

  // Handle scroll indicators based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const isScrollable = scrollHeight > clientHeight;
        const isAtTop = scrollTop < 50;
        const isAtBottom = scrollTop > scrollHeight - clientHeight - 50;

        if (isScrollable) {
          setShowScrollIndicator(!isAtBottom);
          setShowTopScrollIndicator(!isAtTop && scrollTop > 100);
        } else {
          setShowScrollIndicator(false);
          setShowTopScrollIndicator(false);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

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
        delay: 100,
        tolerance: 5,
        distance: 8,
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
    // Since Step 1 items are not draggable, we only handle reordering within Step 2
    return;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Only handle reordering within Step 2 (above zone)
    const activeInAbove = aboveTheLine.includes(activeId);
    const overInAbove = aboveTheLine.includes(overId);

    if (activeInAbove && overInAbove) {
      // Reorder within above list only
      const oldIndex = aboveTheLine.indexOf(activeId);
      const newIndex = aboveTheLine.indexOf(overId);
      setAboveTheLine(arrayMove(aboveTheLine, oldIndex, newIndex));
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
    <div className="question-container mobile-optimized" style={{ position: 'relative' }} ref={containerRef}>
      {/* Top Scroll Indicator */}
      {showTopScrollIndicator && (
        <div className="scroll-indicator-top">
          <span className="scroll-arrow">↑</span>
          <span>Scroll up to see more</span>
        </div>
      )}
      
      <div className="question-header">
        <h2 className="question-title" dangerouslySetInnerHTML={{__html: question.text}} />
        <p className="question-instructions" dangerouslySetInnerHTML={{__html: question.instructions}} />
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <div className="ranking-zones two-column">
          {/* Step 1: Available values zone - Click only, no DnD */}
          <div className="droppable-zone">
            <div className="zone below-zone">
              <h3 className="zone-title">Step 1: Available Values (Tap to Choose)</h3>
              <div className="sortable-list compact-grid">
                {belowTheLine.map((itemText) => (
                  <div
                    key={itemText}
                    className="draggable-item clickable-item"
                    onClick={() => handleItemClick(itemText)}
                  >
                    <div className="item-text">{itemText}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Ranking zone - DnD enabled for ranking */}
          <DroppableZone id="above-zone">
            <SortableContext items={aboveTheLine} strategy={verticalListSortingStrategy}>
              <div className="zone above-zone">
                <h3 className="zone-title">Step 2: Rank Your Chosen Values (Most Important First)</h3>
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
                      Tap values above to add them here, then use the handle (⋮⋮) to drag and rank
                    </div>
                  )}
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
        {canGoPrevious ? (
          <button 
            onClick={previousQuestion}
            className="btn-secondary"
          >
            Back
          </button>
        ) : (
          <div className="button-spacer"></div>
        )}
        <button 
          onClick={handleSubmit}
          className="btn-primary"
        >
          Continue ({aboveTheLine.length})
        </button>
      </div>

      {/* Bottom Scroll Indicator */}
      {showScrollIndicator && (
        <div className="scroll-indicator">
          <span>Scroll down to continue</span>
          <span className="scroll-arrow">↓</span>
        </div>
      )}
    </div>
  );
}