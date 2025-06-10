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
  const { setAnswer, nextQuestion } = useQuiz();
  const [selections, setSelections] = useState<Record<number, 'A' | 'B'>>({});

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
      <h2 className="question-title">{question.text}</h2>
      
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
                  <span className="option-label">A</span>
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
                  <span className="option-label">B</span>
                  <span className="option-text">{pair.optionB.text}</span>
                </div>
              </label>
            </fieldset>
          </div>
        ))}
      </div>

      <div className="question-footer">
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