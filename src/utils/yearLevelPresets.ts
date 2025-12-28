import type { Difficulty, QuestionType, } from '../store/quiz-store';
import settings from '../configs/settings.json';

export type YearLevel = 'primary' | 'junior-high' | 'senior-high';

export interface YearLevelPreset {
  label: string;
  difficulty: Difficulty;
  numberOfQuestions: number;
  timerPerQuestion: number;
  questionType: QuestionType[];
  categories: string[];
  description: string;
  // Enhanced settings
  timerEnabled: boolean;
  questionsEnabled: boolean;
  minCorrectAnswers: number;
  maxCorrectAnswers: number;
  correctAnswersEnabled: boolean;
  minIncorrectAnswers: number;
  maxIncorrectAnswers: number;
  incorrectAnswersEnabled: boolean;
  // Overall timer settings
  overallTimerEnabled: boolean;
  overallTimerDuration: number;
}

// Dynamically build yearLevelPresets from settings.json
function buildYearLevelPresets() {
  const presets: { [key: string]: YearLevelPreset } = {};
  if (settings.yearLevel) {
    settings.yearLevel.forEach((preset: {
      name: string;
      label: string;
      difficulty: string;
      numberOfQuestions: number;
      timerPerQuestion: number;
      questionType: string[];
      categories: string[];
      description: string;
      timerEnabled: boolean;
      questionsEnabled: boolean;
      minCorrectAnswers: number;
      maxCorrectAnswers: number;
      correctAnswersEnabled: boolean;
      minIncorrectAnswers: number;
      maxIncorrectAnswers: number;
      incorrectAnswersEnabled: boolean;
      overallTimerEnabled: boolean;
      overallTimerDuration: number;
    }) => {
      presets[preset.name] = {
        label: preset.label,
        difficulty: preset.difficulty as Difficulty,
        numberOfQuestions: preset.numberOfQuestions,
        timerPerQuestion: preset.timerPerQuestion,
        questionType: preset.questionType as QuestionType[],
        categories: preset.categories,
        description: preset.description,
        timerEnabled: preset.timerEnabled,
        questionsEnabled: preset.questionsEnabled,
        minCorrectAnswers: preset.minCorrectAnswers,
        maxCorrectAnswers: preset.maxCorrectAnswers,
        correctAnswersEnabled: preset.correctAnswersEnabled,
        minIncorrectAnswers: preset.minIncorrectAnswers,
        maxIncorrectAnswers: preset.maxIncorrectAnswers,
        incorrectAnswersEnabled: preset.incorrectAnswersEnabled,
        overallTimerEnabled: preset.overallTimerEnabled,
        overallTimerDuration: preset.overallTimerDuration,
      };
    });
  }
  return presets;
}

export const yearLevelPresets = buildYearLevelPresets();

export const getYearLevelPreset = (yearLevel: string): YearLevelPreset | undefined => {
  return yearLevelPresets[yearLevel];
};

export const applyYearLevelPreset = (yearLevel: string) => {
  const preset = getYearLevelPreset(yearLevel);
  if (!preset) return undefined;
  return {
    difficulty: preset.difficulty,
    numberOfQuestions: preset.numberOfQuestions,
    timerPerQuestion: preset.timerPerQuestion,
    questionType: preset.questionType[0], // Take the first question type as default
    numberTypes: preset.categories,
    // Enhanced settings
    timerEnabled: preset.timerEnabled,
    questionsEnabled: preset.questionsEnabled,
    minCorrectAnswers: preset.minCorrectAnswers,
    maxCorrectAnswers: preset.maxCorrectAnswers,
    correctAnswersEnabled: preset.correctAnswersEnabled,
    minIncorrectAnswers: preset.minIncorrectAnswers,
    maxIncorrectAnswers: preset.maxIncorrectAnswers,
    incorrectAnswersEnabled: preset.incorrectAnswersEnabled,
    // Overall timer settings
    overallTimerEnabled: preset.overallTimerEnabled,
    overallTimerDuration: preset.overallTimerDuration,
  };
};
