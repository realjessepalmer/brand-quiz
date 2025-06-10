import { ArchetypeResult, QuizAnswer, QuizData, QuizQuestion, QuestionType, ArchetypeStrength } from '../types';

interface ScoringThresholds {
  minThreshold: number;
  singleDominanceRatio: number;
  dualInclusionRatio: number;
  tripleInclusionRatio: number;
}

export class ArchetypeScorer {
  private readonly thresholds: ScoringThresholds;

  constructor(private readonly quizData: QuizData) {
    this.thresholds = {
      minThreshold: quizData.scoringConfig?.algorithm?.minThreshold ?? 10,
      singleDominanceRatio: quizData.scoringConfig?.algorithm?.singleDominanceRatio ?? 0.50,
      dualInclusionRatio: quizData.scoringConfig?.algorithm?.dualInclusionRatio ?? 0.65,
      tripleInclusionRatio: quizData.scoringConfig?.algorithm?.tripleInclusionRatio ?? 0.45,
    };
  }

  calculateResults(answers: QuizAnswer[]): ArchetypeResult[] {
    const rawScores = this.calculateRawScores(answers);
    
    const validArchetypes = Object.entries(rawScores)
      .filter(([_, score]) => score >= this.thresholds.minThreshold)
      .sort((a, b) => b[1] - a[1]);

    if (validArchetypes.length === 0) {
      return [];
    }

    const [topArchetype, topScore] = validArchetypes[0];
    const totalScore = validArchetypes.reduce((sum, [_, score]) => sum + score, 0);

    if (topScore > totalScore * this.thresholds.singleDominanceRatio) {
      return [{
        archetype: topArchetype,
        percentage: 100,
        strength: 'dominant'
      }];
    }

    if (validArchetypes.length >= 2) {
      const secondScore = validArchetypes[1][1];
      
      if (secondScore < topScore * this.thresholds.dualInclusionRatio) {
        return this.formatResults(validArchetypes.slice(0, 1));
      }

      if (validArchetypes.length >= 3) {
        const thirdScore = validArchetypes[2][1];
        if (thirdScore >= topScore * this.thresholds.tripleInclusionRatio) {
          return this.formatResults(validArchetypes.slice(0, 3));
        }
      }

      return this.formatResults(validArchetypes.slice(0, 2));
    }

    return this.formatResults(validArchetypes.slice(0, 1));
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
      
      aboveTheLine.forEach((optionText: string, index: number) => {
        const option = question.options?.find((opt) => opt.text === optionText);
        if (option?.archetype) {
          scores[option.archetype] += (12 - index);
        }
      });
    }
  }

  private scoreBinary(answer: QuizAnswer, question: QuizQuestion, scores: Record<string, number>) {
    if (Array.isArray(answer.value) && question.pairs) {
      const selections = answer.value as string[];
      
      question.pairs.forEach((pair, pairIndex: number) => {
        const selectedOption = selections[pairIndex];
        if (selectedOption === 'A') {
          pair.optionA.archetypes?.forEach((archetype: string) => {
            scores[archetype] += 3;
          });
        } else if (selectedOption === 'B') {
          pair.optionB.archetypes?.forEach((archetype: string) => {
            scores[archetype] += 3;
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
        const pointsPerArchetype = question.scoring.pointsPerArchetype || 2.67;
        selectedOption.archetypes.forEach((archetype: string) => {
          scores[archetype] += pointsPerArchetype;
        });
      } else if (selectedOption?.archetype) {
        const points = question.scoring.pointsPerSelection || 6;
        scores[selectedOption.archetype] += points;
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
      const pointsPerSelection = question.scoring.pointsPerSelection;
      
      selectedIndices.forEach((index: number) => {
        const option = question.options![index];
        if (option?.archetype) {
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
    const total = archetypes.reduce((sum, [_, score]) => sum + score, 0);
    
    if (total === 0) {
      return [];
    }
    
    const strengthMap: ArchetypeStrength[] = ['primary', 'secondary', 'tertiary'];
    
    return archetypes.map(([archetype, score], index) => ({
      archetype,
      percentage: Math.round((score / total) * 100),
      strength: strengthMap[index] || 'tertiary'
    }));
  }
}