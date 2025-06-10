import { useEffect, useMemo } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { QuizQuestion } from '../types';
import { Question1RankWithCutoff } from './questions/Question1RankWithCutoff';
import { Question2Binary } from './questions/Question2Binary';
import { Question3SingleChoice } from './questions/Question3SingleChoice';
import { Question4MultiSelect } from './questions/Question4MultiSelect';
import { Question5NegativeSelect } from './questions/Question5NegativeSelect';
import { Question6SingleChoice } from './questions/Question6SingleChoice';
import { Question7DynamicMatrix } from './questions/Question7DynamicMatrix';
import { ResultsDisplay } from './ResultsDisplay';
import quizData from '../quiz-data.json';

const QuizProgress = ({ current, total }: { current: number; total: number }) => (
  <div className="quiz-header">
    <div className="progress-bar">
      <div 
        className="progress-fill"
        style={{ 
          width: `${((current + 1) / total) * 100}%` 
        }}
      />
    </div>
    <div className="progress-text">
      Question {current + 1} of {total}
    </div>
  </div>
);

const QuestionRenderer = ({ question }: { question: any }) => {
  switch (question.type) {
    case 'rankWithCutoff':
      return <Question1RankWithCutoff question={question} />;
    case 'binary':
      return <Question2Binary question={question} />;
    case 'singleChoice':
      return question.id === 'q6' ? 
        <Question6SingleChoice question={question} /> :
        <Question3SingleChoice question={question} />;
    case 'multiSelect':
      return <Question4MultiSelect question={question} />;
    case 'negativeSelect':
      return <Question5NegativeSelect question={question} />;
    case 'dynamicMatrix':
      return <Question7DynamicMatrix question={question} />;
    default:
      return <div>Unknown question type: {question.type}</div>;
  }
};

export function Quiz() {
  const { state, resetQuiz, totalQuestions } = useQuiz();
  
  const questions = useMemo(() => quizData.quizQuestions, []);
  const currentQuestion = questions[state.currentQuestion];

  useEffect(() => {
    const scrollToTop = () => {
      const quizContent = document.querySelector('.quiz-content');
      if (quizContent) {
        quizContent.scrollTop = 0;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    scrollToTop();
  }, [state.currentQuestion, state.isComplete]);

  if (state.isComplete) {
    return (
      <div className="quiz-container">
        <ResultsDisplay results={state.results} onRestart={resetQuiz} />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="quiz-container">
        <div className="error-message">
          Quiz question not found. Please restart the quiz.
        </div>
        <button onClick={resetQuiz} className="btn-primary">
          Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <QuizProgress current={state.currentQuestion} total={totalQuestions} />
      <div className="quiz-content">
        <QuestionRenderer question={currentQuestion as any} />
      </div>
    </div>
  );
}