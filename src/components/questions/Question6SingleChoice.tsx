import { useState } from 'react';
import { useQuiz } from '../../contexts/QuizContext';
import { QuizOption } from '../../types';

interface Question6Props {
  question: {
    id: string;
    text: string;
    options: QuizOption[];
  };
}

export function Question6SingleChoice({ question }: Question6Props) {
  const { state, setAnswer, nextQuestion, previousQuestion, canGoPrevious } = useQuiz();
  
  // Find existing answer for this question
  const existingAnswer = state.answers.find(answer => answer.questionId === question.id);
  const existingValue = existingAnswer?.value as number | undefined;
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(existingValue ?? null);

  const handleSelection = (index: number) => {
    setSelectedIndex(index);
  };

  const handleSubmit = () => {
    if (selectedIndex !== null) {
      setAnswer({
        questionId: question.id,
        type: 'singleChoice',
        value: selectedIndex
      });
      nextQuestion();
    }
  };

  return (
    <div className="question-container">
      <h2 className="question-title" dangerouslySetInnerHTML={{__html: question.text}} />
      {question.instructions && (
        <p className="question-instructions" dangerouslySetInnerHTML={{__html: question.instructions}} />
      )}

      <fieldset className="transformation-options">
        <legend className="visually-hidden">{question.text}</legend>
        {question.options.map((option, index) => (
          <label
            key={index}
            className={`transformation-option ${selectedIndex === index ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={index}
              checked={selectedIndex === index}
              onChange={() => handleSelection(index)}
              className="radio-input"
            />
            <span className="radio-indicator">
              <span className="radio-dot"></span>
            </span>
            <span className="option-text">{option.text}</span>
          </label>
        ))}
      </fieldset>

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
          disabled={selectedIndex === null}
        >
          Continue
        </button>
      </div>
    </div>
  );
}