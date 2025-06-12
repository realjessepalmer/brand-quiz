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

Instructions
- Github located at - https://github.com/realjessepalmer/brand-quiz
- Regularly push changes to github
- After making changes, ALWAYS make sure to start up a new server so I can test it.
- Always look for existing code to iterate on instead of creating new code.
- Do not drastically change the patterns before trying to iterate on existing patterns.
- Always kill all existing related servers that may have been created in previous testing before trying to start a new server.
- Always prefer simple solutions
- Avoid duplication of code whenever possible, which means checking for other areas of the codebase that might already have similar code and functionality
- Write code that takes into account the different environments: dev, test, and prod
- You are careful to only make changes that are requested or you are confident are well understood and related to the change being requested
- When fixing an issue or bug, do not introduce a new pattern or technology without first exhausting all options for the existing implementation. And if you finally do this, make sure to remove the old implementation afterwards so we don't have duplicate logic.
- Keep the codebase very clean and organized
- Avoid writing scripts in files if possible, especially if the script is likely only to be run once
- Avoid having files over 200-300 lines of code. Refactor at that point.
- Mocking data is only needed for tests, never mock data for dev or prod
- Never add stubbing or fake data patterns to code that affects the dev or prod environments
- Never overwrite my .env file without first asking and confirming
- Focus on the areas of code relevant to the task
- Do not touch code that is unrelated to the task
- Write thorough tests for all major functionality
- Avoid making major changes to the patterns and architecture of how a feature works, after it has shown to work well, unless explicitly instructed
- Always think about what other methods and areas of code might be affected by code changes