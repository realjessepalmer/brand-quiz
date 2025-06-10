# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (TypeScript compile + Vite build)
- `npm run lint` - Run ESLint for code linting

## Architecture Overview

This is a React brand archetype quiz application built with TypeScript and Vite. The app determines a user's brand personality through a multi-question quiz with various question types.

### Core Architecture

The application follows a React Context + Reducer pattern for state management:

- **QuizContext** (`src/contexts/QuizContext.tsx`) - Manages global quiz state including current question, answers, and results using `useReducer`
- **ArchetypeScorer** (`src/utils/ArchetypeScorer.ts`) - Complex scoring algorithm that calculates brand archetype results based on user answers and configurable thresholds
- **Quiz Data** (`src/quiz-data.json`) - Static configuration containing archetypes, questions, and scoring parameters

### Question System

The quiz supports 6 different question types defined in `types.ts`:
- `rankWithCutoff` - Sortable ranking with above/below threshold
- `binary` - A/B choice pairs
- `singleChoice` - Single option selection  
- `multiSelect` - Multiple option selection
- `negativeSelect` - Select items to avoid
- `dynamicMatrix` - Rating scale matrix

Each question type has its own component in `src/components/questions/` and scoring logic in `ArchetypeScorer.ts`.

### Key Dependencies

- **@dnd-kit** - Drag and drop functionality for ranking questions
- **framer-motion** - Animations and transitions
- **React 19** - Latest React with concurrent features

### Scoring Algorithm

The `ArchetypeScorer` implements a scoring algorithm that:
- Calculates raw scores across all 12 brand archetypes
- Always returns exactly 3 top-scoring archetypes
- Normalizes the top 3 scores to sum to 100%
- Results are returned as primary/secondary/tertiary with percentages that total 100%