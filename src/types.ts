export interface Archetype {
  id: string;
  name: string;
  description: string;
  traits: string[];
  examples: string[];
  color: string;
}

export interface QuizOption {
  text: string;
  archetype?: string;
  archetypes?: string[];
}

export interface BinaryPair {
  optionA: QuizOption;
  optionB: QuizOption;
}

export type QuestionType = 'rankWithCutoff' | 'binary' | 'singleChoice' | 'multiSelect' | 'negativeSelect' | 'dynamicMatrix';

export interface QuestionScale {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

export interface QuestionScoring {
  pointsPerSelection?: number;
  pointsPerArchetype?: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: QuestionType;
  instructions?: string;
  scoring: QuestionScoring;
  options?: QuizOption[];
  pairs?: BinaryPair[];
  requiredSelections?: number;
  displayCount?: number;
  selectionLogic?: string;
  scale?: QuestionScale;
}

export interface ScoringAlgorithm {
  alwaysReturnThree: boolean;
  normalizeToHundredPercent: boolean;
}

export interface ScoringConfig {
  algorithm: ScoringAlgorithm;
  resultDisplay: Record<string, unknown>;
}

export interface QuizData {
  archetypes: Archetype[];
  quizQuestions: QuizQuestion[];
  scoringConfig: ScoringConfig;
}

export interface QuizAnswer {
  questionId: string;
  type: QuestionType;
  value: unknown;
}

export type ArchetypeStrength = 'primary' | 'secondary' | 'tertiary';

export interface ArchetypeResult {
  archetype: string;
  percentage: number;
  strength: ArchetypeStrength;
}

export interface QuizState {
  currentQuestion: number;
  answers: QuizAnswer[];
  scores: Record<string, number>;
  results: ArchetypeResult[];
  isComplete: boolean;
}