import { useState } from 'react';
import { useQuiz } from '../../contexts/QuizContext';
import { BinaryPair } from '../../types';

interface Question2Props {
  question: {
    id: string;
    text: string;
    pairs: BinaryPair[];
  };
}

export function Question2Binary({ question }: Question2Props) {
  const { state, setAnswer, nextQuestion, previousQuestion, canGoPrevious } = useQuiz();
  
  // Find existing answer for this question
  const existingAnswer = state.answers.find(answer => answer.questionId === question.id);
  const existingValue = existingAnswer?.value as Record<number, 'A' | 'B'> | undefined;
  
  const [selections, setSelections] = useState<Record<number, 'A' | 'B'>>(existingValue || {});

  const handleSelection = (pairIndex: number, option: 'A' | 'B') => {
    setSelections(prev => ({
      ...prev,
      [pairIndex]: option
    }));
  };

  const handleSubmit = () => {
    setAnswer({
      questionId: question.id,
      type: 'binary',
      value: selections
    });
    nextQuestion();
  };

  const allPairsAnswered = Object.keys(selections).length === question.pairs.length;
  const completedCount = Object.keys(selections).length;

  return (
    <div className="question-container">
      <h2 className="question-title" dangerouslySetInnerHTML={{__html: question.text}} />
      {question.instructions && (
        <p className="question-instructions" dangerouslySetInnerHTML={{__html: question.instructions}} />
      )}
      
      <div className="progress-indicator">
        <span>Progress: {completedCount} of {question.pairs.length} completed</span>
      </div>

      <div className="binary-pairs">
        {question.pairs.map((pair, index) => (
          <div key={index} className="binary-pair">
            <div className="pair-number">{index + 1}</div>
            
            <fieldset className="binary-options">
              <legend className="visually-hidden">
                Choose between {pair.optionA.text} and {pair.optionB.text}
              </legend>
              
              <label className={`binary-option option-a ${
                selections[index] === 'A' ? 'selected' : ''
              }`}>
                <input
                  type="radio"
                  name={`pair-${index}`}
                  value="A"
                  checked={selections[index] === 'A'}
                  onChange={() => handleSelection(index, 'A')}
                  className="radio-input"
                />
                <div className="option-content">
                  <span className="option-text">{pair.optionA.text}</span>
                </div>
              </label>

              <div className="vs-divider">VS</div>

              <label className={`binary-option option-b ${
                selections[index] === 'B' ? 'selected' : ''
              }`}>
                <input
                  type="radio"
                  name={`pair-${index}`}
                  value="B"
                  checked={selections[index] === 'B'}
                  onChange={() => handleSelection(index, 'B')}
                  className="radio-input"
                />
                <div className="option-content">
                  <span className="option-text">{pair.optionB.text}</span>
                </div>
              </label>
            </fieldset>
          </div>
        ))}
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
          disabled={!allPairsAnswered}
        >
          Continue
        </button>
      </div>
    </div>
  );
}