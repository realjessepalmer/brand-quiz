import { useState, useEffect, useRef } from 'react';
import { useQuiz } from '../../contexts/QuizContext';
import { QuizOption } from '../../types';

interface Question4Props {
  question: {
    id: string;
    text: string;
    options: QuizOption[];
  };
}

export function Question4MultiSelect({ question }: Question4Props) {
  const { state, setAnswer, nextQuestion, previousQuestion, canGoPrevious } = useQuiz();
  
  // Find existing answer for this question
  const existingAnswer = state.answers.find(answer => answer.questionId === question.id);
  const existingValue = existingAnswer?.value as number[] | undefined;
  
  const [selectedIndices, setSelectedIndices] = useState<number[]>(existingValue || []);


  const handleSelection = (index: number) => {
    setSelectedIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleSubmit = () => {
    setAnswer({
      questionId: question.id,
      type: 'multiSelect',
      value: selectedIndices
    });
    nextQuestion();
  };

  return (
    <div className="question-container">
      <h2 className="question-title" dangerouslySetInnerHTML={{__html: question.text}} />
      {question.instructions ? (
        <p className="question-instructions" dangerouslySetInnerHTML={{__html: question.instructions}} />
      ) : (
        <p className="question-instructions">Select all that apply</p>
      )}

      <fieldset className="multi-select-options">
        <legend className="visually-hidden">Select all that apply</legend>
        {question.options.map((option, index) => (
          <label
            key={index}
            className={`checkbox-option ${selectedIndices.includes(index) ? 'selected' : ''}`}
          >
            <input
              type="checkbox"
              name={`question-${question.id}`}
              value={index}
              checked={selectedIndices.includes(index)}
              onChange={() => handleSelection(index)}
              className="checkbox-input"
            />
            <span className="checkbox-indicator">
              <span className="checkbox-check">✓</span>
            </span>
            <span className="option-text">{option.text}</span>
          </label>
        ))}
      </fieldset>

      <div className="selected-count">
        {selectedIndices.length} behavior{selectedIndices.length !== 1 ? 's' : ''} selected
      </div>

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
          Continue
        </button>
      </div>
    </div>
  );
}