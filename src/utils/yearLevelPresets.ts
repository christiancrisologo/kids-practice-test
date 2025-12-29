import type { Difficulty, QuestionType, } from '../store/quiz-store';
import { getYearLevelPresets as getYearLevelPresetsFromSettings } from './settingsManager';

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

// Dynamically build yearLevelPresets from fetched settings
function buildYearLevelPresets() {
  const presets: { [key: string]: YearLevelPreset } = {};
  const yearLevelData = getYearLevelPresetsFromSettings();

  if (yearLevelData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (yearLevelData as any[]).forEach((preset: any) => {
      if (preset.name) {
        presets[preset.name] = {
          label: preset.label || preset.name,
          difficulty: preset.difficulty as Difficulty,
          numberOfQuestions: preset.numberOfQuestions || preset.settings?.numberOfQuestions || 10,
          timerPerQuestion: preset.timerPerQuestion || preset.settings?.timerPerQuestion || 20,
          questionType: (preset.questionType || ['input']) as QuestionType[],
          categories: preset.categories || [],
          description: preset.description || '',
          timerEnabled: preset.timerEnabled ?? preset.settings?.timerEnabled ?? true,
          questionsEnabled: preset.questionsEnabled ?? preset.settings?.questionsEnabled ?? true,
          minCorrectAnswers: preset.minCorrectAnswers ?? preset.settings?.minCorrectAnswers ?? 0,
          maxCorrectAnswers: preset.maxCorrectAnswers ?? preset.settings?.maxCorrectAnswers ?? 10,
          correctAnswersEnabled: preset.correctAnswersEnabled ?? preset.settings?.correctAnswersEnabled ?? false,
          minIncorrectAnswers: preset.minIncorrectAnswers ?? preset.settings?.minIncorrectAnswers ?? 0,
          maxIncorrectAnswers: preset.maxIncorrectAnswers ?? preset.settings?.maxIncorrectAnswers ?? 10,
          incorrectAnswersEnabled: preset.incorrectAnswersEnabled ?? preset.settings?.incorrectAnswersEnabled ?? false,
          overallTimerEnabled: preset.overallTimerEnabled ?? preset.settings?.overallTimerEnabled ?? false,
          overallTimerDuration: preset.overallTimerDuration ?? preset.settings?.overallTimerDuration ?? 180,
        };
      }
    });
  }
  return presets;
}

export const getYearLevelPreset = (yearLevel: string): YearLevelPreset | undefined => {
  const presets = buildYearLevelPresets();
  return presets[yearLevel];
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
