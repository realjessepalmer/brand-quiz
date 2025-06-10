import { useState } from 'react';
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
  const { setAnswer, nextQuestion } = useQuiz();
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

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
      <h2 className="question-title">{question.text}</h2>
      <p className="question-instructions">Select all that apply</p>

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