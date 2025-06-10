import { useState } from 'react';
import { useQuiz } from '../../contexts/QuizContext';
import { QuizOption } from '../../types';

interface Question5Props {
  question: {
    id: string;
    text: string;
    options: QuizOption[];
    requiredSelections: number;
  };
}

export function Question5NegativeSelect({ question }: Question5Props) {
  const { setAnswer, nextQuestion } = useQuiz();
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleSelection = (index: number) => {
    setSelectedIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else if (prev.length < question.requiredSelections) {
        return [...prev, index];
      } else {
        // Replace the first selection with the new one
        return [...prev.slice(1), index];
      }
    });
  };

  const handleSubmit = () => {
    setAnswer({
      questionId: question.id,
      type: 'negativeSelect',
      value: selectedIndices
    });
    nextQuestion();
  };

  const isComplete = selectedIndices.length === question.requiredSelections;

  return (
    <div className="question-container">
      <h2 className="question-title">{question.text}</h2>
      <p className="question-instructions">Select any {question.requiredSelections} options (order doesn't matter)</p>
      
      <div className="selection-counter">
        <span className="counter-text">
          {selectedIndices.length} of {question.requiredSelections} selected
        </span>
        <div className="counter-dots">
          {Array.from({ length: question.requiredSelections }, (_, i) => (
            <div 
              key={i} 
              className={`counter-dot ${i < selectedIndices.length ? 'filled' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="negative-select-options">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`negative-option ${selectedIndices.includes(index) ? 'selected' : ''}`}
            onClick={() => handleSelection(index)}
            disabled={selectedIndices.length >= question.requiredSelections && !selectedIndices.includes(index)}
          >
            <div className="selection-indicator">
              {selectedIndices.includes(index) && (
                <span className="selection-check">✓</span>
              )}
            </div>
            <span className="option-text">{option.text}</span>
          </button>
        ))}
      </div>

      <div className="question-footer">
        <button 
          onClick={handleSubmit}
          className="btn-primary"
          disabled={!isComplete}
        >
          Continue
        </button>
      </div>
    </div>
  );
}