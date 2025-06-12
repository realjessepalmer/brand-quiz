import React, { createContext, useContext, useReducer, ReactNode, useMemo } from 'react';
import { QuizState, QuizAnswer, ArchetypeResult, QuizData } from '../types';
import { ArchetypeScorer } from '../utils/ArchetypeScorer';
import quizData from '../quiz-data.json';

interface QuizContextType {
  state: QuizState;
  totalQuestions: number;
  startQuiz: () => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (questionIndex: number) => void;
  setAnswer: (answer: QuizAnswer) => void;
  calculateResults: () => void;
  resetQuiz: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

type QuizAction = 
  | { type: 'START_QUIZ' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'SET_ANSWER'; payload: QuizAnswer }
  | { type: 'CALCULATE_RESULTS'; payload: ArchetypeResult[] }
  | { type: 'RESET_QUIZ' }
  | { type: 'GO_TO_QUESTION'; payload: number };

const initialState: QuizState = {
  isStarted: false,
  currentQuestion: 0,
  answers: [],
  scores: {},
  results: [],
  isComplete: false,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_QUIZ':
      return {
        ...state,
        isStarted: true,
      };
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestion: state.currentQuestion + 1,
      };
    case 'PREVIOUS_QUESTION':
      return {
        ...state,
        currentQuestion: Math.max(0, state.currentQuestion - 1),
      };
    case 'GO_TO_QUESTION':
      return {
        ...state,
        currentQuestion: Math.max(0, Math.min(action.payload, (quizData.quizQuestions.length - 1))),
      };
    case 'SET_ANSWER':
      const existingAnswerIndex = state.answers.findIndex(
        answer => answer.questionId === action.payload.questionId
      );
      
      const updatedAnswers = existingAnswerIndex >= 0
        ? state.answers.map((answer, index) => 
            index === existingAnswerIndex ? action.payload : answer
          )
        : [...state.answers, action.payload];
      
      return {
        ...state,
        answers: updatedAnswers,
      };
    case 'CALCULATE_RESULTS':
      return {
        ...state,
        results: action.payload,
        isComplete: true,
      };
    case 'RESET_QUIZ':
      return initialState;
    default:
      return state;
  }
}

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  
  const totalQuestions = quizData.quizQuestions.length;
  const scorer = useMemo(() => new ArchetypeScorer(quizData as QuizData), []);
  
  const canGoNext = state.currentQuestion < totalQuestions - 1;
  const canGoPrevious = state.currentQuestion > 0;

  const startQuiz = () => {
    dispatch({ type: 'START_QUIZ' });
  };

  const nextQuestion = () => {
    if (state.currentQuestion + 1 >= totalQuestions) {
      const results = scorer.calculateResults(state.answers);
      dispatch({ type: 'CALCULATE_RESULTS', payload: results });
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  };

  const previousQuestion = () => {
    dispatch({ type: 'PREVIOUS_QUESTION' });
  };
  
  const goToQuestion = (questionIndex: number) => {
    dispatch({ type: 'GO_TO_QUESTION', payload: questionIndex });
  };

  const setAnswer = (answer: QuizAnswer) => {
    dispatch({ type: 'SET_ANSWER', payload: answer });
  };

  const calculateResults = () => {
    const results = scorer.calculateResults(state.answers);
    dispatch({ type: 'CALCULATE_RESULTS', payload: results });
  };

  const resetQuiz = () => {
    dispatch({ type: 'RESET_QUIZ' });
  };

  const contextValue = useMemo(() => ({
    state,
    totalQuestions,
    startQuiz,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    setAnswer,
    calculateResults,
    resetQuiz,
    canGoNext,
    canGoPrevious,
  }), [state, canGoNext, canGoPrevious]);

  return (
    <QuizContext.Provider value={contextValue}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}