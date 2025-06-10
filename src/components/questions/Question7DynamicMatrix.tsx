import { useState, useEffect } from 'react';
import { useQuiz } from '../../contexts/QuizContext';
import { QuizOption } from '../../types';
import quizData from '../../quiz-data.json';

interface Question7Props {
  question: {
    id: string;
    text: string;
    options: QuizOption[];
    displayCount: number;
    scale: {
      min: number;
      max: number;
      minLabel: string;
      maxLabel: string;
    };
  };
}

export function Question7DynamicMatrix({ question }: Question7Props) {
  const { state, setAnswer, nextQuestion } = useQuiz();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [displayedOptions, setDisplayedOptions] = useState<QuizOption[]>([]);

  useEffect(() => {
    // Calculate which traits to show based on previous answers
    const topArchetypes = getTopScoringArchetypes();
    const relevantOptions = question.options.filter(option => 
      topArchetypes.includes((option as any).archetype || '')
    );
    
    // If we don't have enough from top archetypes, fill with others
    const remainingOptions = question.options.filter(option => 
      !relevantOptions.includes(option)
    );
    
    const optionsToShow = [
      ...relevantOptions,
      ...remainingOptions
    ].slice(0, question.displayCount);
    
    setDisplayedOptions(optionsToShow);
  }, [state.answers, question.options, question.displayCount]);

  const getTopScoringArchetypes = (): string[] => {
    // Simple logic to determine top archetypes based on previous answers
    // In a real implementation, this would use partial scoring
    const archetypeCounts: Record<string, number> = {};
    
    state.answers.forEach(answer => {
      const q = quizData.quizQuestions.find(q => q.id === answer.questionId);
      if (!q) return;
      
      // Count archetype mentions based on question type
      if (q.type === 'multiSelect' && Array.isArray(answer.value)) {
        answer.value.forEach((index: number) => {
          const option = q.options?.[index];
          if (option && (option as any).archetype) {
            archetypeCounts[(option as any).archetype] = (archetypeCounts[(option as any).archetype] || 0) + 1;
          }
        });
      }
    });
    
    return Object.entries(archetypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([archetype]) => archetype);
  };

  const handleRating = (optionText: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [optionText]: rating
    }));
  };

  const handleSubmit = () => {
    setAnswer({
      questionId: question.id,
      type: 'dynamicMatrix',
      value: ratings
    });
    nextQuestion();
  };

  const allRated = displayedOptions.every(option => 
    ratings[option.text] !== undefined
  );

  const scaleValues = Array.from(
    { length: question.scale.max - question.scale.min + 1 }, 
    (_, i) => question.scale.min + i
  );

  return (
    <div className="question-container">
      <h2 className="question-title">{question.text}</h2>
      
      <div className="scale-labels">
        <span className="scale-label-min">{question.scale.minLabel}</span>
        <span className="scale-label-max">{question.scale.maxLabel}</span>
      </div>

      <div className="matrix-container">
        {displayedOptions.map((option, index) => (
          <div key={index} className="matrix-row">
            <div className="trait-label">{option.text}</div>
            
            <div className="rating-scale">
              {scaleValues.map(value => (
                <button
                  key={value}
                  className={`scale-button ${ratings[option.text] === value ? 'selected' : ''}`}
                  onClick={() => handleRating(option.text, value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="completion-indicator">
        {Object.keys(ratings).length} of {displayedOptions.length} traits rated
      </div>

      <div className="question-footer">
        <button 
          onClick={handleSubmit}
          className="btn-primary"
          disabled={!allRated}
        >
          Complete Quiz
        </button>
      </div>
    </div>
  );
}