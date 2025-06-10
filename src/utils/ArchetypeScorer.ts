import { ArchetypeResult, QuizAnswer, QuizData, QuizQuestion, QuestionType, ArchetypeStrength } from '../types';

export class ArchetypeScorer {
  constructor(private readonly quizData: QuizData) {
    // Constructor now simplified since we always return 3 archetypes summing to 100%
  }

  calculateResults(answers: QuizAnswer[]): ArchetypeResult[] {
    const rawScores = this.calculateRawScores(answers);
    
    // Find minimum score to handle negative values
    const minScore = Math.min(...Object.values(rawScores));
    
    // If we have negative scores, shift all scores to make them positive
    const adjustedScores: Record<string, number> = {};
    if (minScore < 0) {
      Object.entries(rawScores).forEach(([archetype, score]) => {
        adjustedScores[archetype] = score - minScore; // Subtract negative = add positive
      });
    } else {
      Object.assign(adjustedScores, rawScores);
    }
    
    // Always get the top 3 archetypes by adjusted score
    const sortedArchetypes = Object.entries(adjustedScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // If no scores at all, return default archetypes with equal percentages
    if (sortedArchetypes.every(([, score]) => score === 0)) {
      return [
        { archetype: 'everyman', percentage: 34, strength: 'primary' },
        { archetype: 'caregiver', percentage: 33, strength: 'secondary' },
        { archetype: 'hero', percentage: 33, strength: 'tertiary' }
      ];
    }

    return this.formatResults(sortedArchetypes);
  }

  private calculateRawScores(answers: QuizAnswer[]): Record<string, number> {
    const scores: Record<string, number> = Object.fromEntries(
      this.quizData.archetypes.map(archetype => [archetype.id, 0])
    );

    for (const answer of answers) {
      const question = this.findQuestion(answer.questionId);
      if (!question) {
        console.warn(`Question not found for ID: ${answer.questionId}`);
        continue;
      }

      this.scoreAnswer(answer, question, scores);
    }

    return scores;
  }
  
  private findQuestion(questionId: string): QuizQuestion | undefined {
    return this.quizData.quizQuestions.find(q => q.id === questionId);
  }
  
  private scoreAnswer(answer: QuizAnswer, question: QuizQuestion, scores: Record<string, number>): void {
    const scoringMethods: Record<QuestionType, (answer: QuizAnswer, question: QuizQuestion, scores: Record<string, number>) => void> = {
      rankWithCutoff: this.scoreRankWithCutoff.bind(this),
      binary: this.scoreBinary.bind(this),
      singleChoice: this.scoreSingleChoice.bind(this),
      multiSelect: this.scoreMultiSelect.bind(this),
      negativeSelect: this.scoreNegativeSelect.bind(this),
      dynamicMatrix: this.scoreDynamicMatrix.bind(this),
    };
    
    const scoringMethod = scoringMethods[question.type];
    if (scoringMethod) {
      scoringMethod(answer, question, scores);
    } else {
      console.warn(`Unknown question type: ${question.type}`);
    }
  }

  private scoreRankWithCutoff(answer: QuizAnswer, question: QuizQuestion, scores: Record<string, number>) {
    if (typeof answer.value === 'object' && answer.value !== null && 'aboveTheLine' in answer.value) {
      const { aboveTheLine } = answer.value as { aboveTheLine: string[] };
      
      // Give points based on ranking: 1st place = 5 points, 2nd = 4 points, etc.
      // Max 5 points to keep balanced with other questions
      aboveTheLine.forEach((optionText: string, index: number) => {
        const option = question.options?.find((opt) => opt.text === optionText);
        if (option?.archetype) {
          const points = Math.max(1, 6 - index); // 5, 4, 3, 2, 1 points
          scores[option.archetype] += points;
        }
      });
    }
  }

  private scoreBinary(answer: QuizAnswer, question: QuizQuestion, scores: Record<string, number>) {
    if (typeof answer.value === 'object' && answer.value !== null && question.pairs) {
      const selections = answer.value as Record<number, 'A' | 'B'>;
      
      question.pairs.forEach((pair, pairIndex: number) => {
        const selectedOption = selections[pairIndex];
        if (selectedOption === 'A') {
          pair.optionA.archetypes?.forEach((archetype: string) => {
            scores[archetype] += 1.5; // 1.5 points per archetype (3 total per pair / 2 archetypes)
          });
        } else if (selectedOption === 'B') {
          pair.optionB.archetypes?.forEach((archetype: string) => {
            scores[archetype] += 1.5; // 1.5 points per archetype (3 total per pair / 2 archetypes)
          });
        }
      });
    }
  }

  private scoreSingleChoice(answer: QuizAnswer, question: QuizQuestion, scores: Record<string, number>) {
    if (typeof answer.value === 'number' && question.options) {
      const selectedIndex = answer.value as number;
      const selectedOption = question.options[selectedIndex];
      
      if (selectedOption?.archetypes) {
        // Distribute points evenly among archetypes (total 5 points per question)
        const pointsPerArchetype = 5 / selectedOption.archetypes.length;
        selectedOption.archetypes.forEach((archetype: string) => {
          scores[archetype] += pointsPerArchetype;
        });
      } else if (selectedOption?.archetype) {
        // Single archetype gets all 5 points
        scores[selectedOption.archetype] += 5;
      }
    }
  }

  private scoreMultiSelect(answer: QuizAnswer, question: QuizQuestion, scores: Record<string, number>) {
    if (Array.isArray(answer.value) && question.options && question.scoring.pointsPerSelection) {
      const selectedIndices = answer.value as number[];
      const pointsPerSelection = question.scoring.pointsPerSelection;
      
      selectedIndices.forEach((index: number) => {
        const option = question.options![index];
        if (option?.archetype) {
          scores[option.archetype] += pointsPerSelection;
        }
      });
    }
  }

  private scoreNegativeSelect(answer: QuizAnswer, question: QuizQuestion, scores: Record<string, number>) {
    if (Array.isArray(answer.value) && question.options && question.scoring.pointsPerSelection) {
      const selectedIndices = answer.value as number[];
      const pointsPerSelection = question.scoring.pointsPerSelection; // This should be negative (e.g., -5)
      
      selectedIndices.forEach((index: number) => {
        const option = question.options![index];
        if (option?.archetype) {
          // Since pointsPerSelection is already negative, we add it (which subtracts)
          scores[option.archetype] += pointsPerSelection;
        }
      });
    }
  }

  private scoreDynamicMatrix(answer: QuizAnswer, question: QuizQuestion, scores: Record<string, number>) {
    if (typeof answer.value === 'object' && answer.value !== null && question.options) {
      const ratings = answer.value as Record<string, number>;
      
      Object.entries(ratings).forEach(([optionText, rating]) => {
        const option = question.options!.find((opt) => opt.text === optionText);
        if (option?.archetype && typeof rating === 'number') {
          scores[option.archetype] += rating;
        }
      });
    }
  }

  private formatResults(archetypes: [string, number][]): ArchetypeResult[] {
    // Ensure we always have exactly 3 archetypes
    const topThree = archetypes.slice(0, 3);
    const total = topThree.reduce((sum, [, score]) => sum + score, 0);
    
    if (total === 0) {
      // Fallback to equal distribution if no scores
      return [
        { archetype: topThree[0][0], percentage: 34, strength: 'primary' },
        { archetype: topThree[1][0], percentage: 33, strength: 'secondary' },
        { archetype: topThree[2][0], percentage: 33, strength: 'tertiary' }
      ];
    }
    
    // Calculate percentages and ensure they sum to 100%
    const strengthMap: ArchetypeStrength[] = ['primary', 'secondary', 'tertiary'];
    const rawPercentages = topThree.map(([, score]) => (score / total) * 100);
    
    // Round percentages and adjust to ensure they sum to exactly 100%
    const roundedPercentages = rawPercentages.map(p => Math.round(p));
    const sum = roundedPercentages.reduce((a, b) => a + b, 0);
    
    // Adjust the largest percentage to make the sum exactly 100%
    if (sum !== 100) {
      const maxIndex = roundedPercentages.indexOf(Math.max(...roundedPercentages));
      roundedPercentages[maxIndex] += (100 - sum);
    }
    
    return topThree.map(([archetype], index) => ({
      archetype,
      percentage: roundedPercentages[index],
      strength: strengthMap[index]
    }));
  }
}