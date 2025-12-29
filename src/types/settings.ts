// Settings configuration types

export interface HintSettings {
  enable_primary_level: boolean;
  enable_junior_level: boolean;
  enable_senior_level: boolean;
  show_time: number; // Time in seconds before auto-showing hint
}

export interface ThemeSettings {
  default: 'light' | 'dark';
  allowUserPreference: boolean;
}

export interface SupabaseSettings {
  enabled: boolean;
  syncOnline: boolean;
  fallbackToLocalStorage: boolean;
}

export interface StorageSettings {
  useLocalStorage: boolean;
  maxHistoryRecords: number;
}

export interface SystemSettings {
  theme: ThemeSettings;
  supabase: SupabaseSettings;
  storage: StorageSettings;
  'quiz-data': string;
  hint: HintSettings;
}

export interface ChallengeSettings {
  timerEnabled: boolean;
  questionsEnabled: boolean;
  numberOfQuestions?: number;
  timerPerQuestion?: number;
  minCorrectAnswers: number;
  maxCorrectAnswers: number;
  correctAnswersEnabled: boolean;
  minIncorrectAnswers: number;
  maxIncorrectAnswers: number;
  incorrectAnswersEnabled: boolean;
  overallTimerEnabled: boolean;
  overallTimerDuration: number;
}

export interface Challenge {
  name: string;
  description: string;
  settings: ChallengeSettings;
}

export interface YearLevelPreset {
  name: string;
  description: string;
  settings: ChallengeSettings;
}

export interface AppSettings {
  system: SystemSettings;
  challenges: Challenge[];
  yearLevel: YearLevelPreset[];
}

export type YearLevel = 'primary' | 'junior' | 'senior';

// Helper function to check if hint should be enabled for a year level
export function isHintEnabledForLevel(
  hintSettings: HintSettings,
  yearLevel: YearLevel
): boolean {
  switch (yearLevel) {
    case 'primary':
      return hintSettings.enable_primary_level;
    case 'junior':
      return hintSettings.enable_junior_level;
    case 'senior':
      return hintSettings.enable_senior_level;
    default:
      return false;
  }
}

// Helper function to check if hint button should be visible
export function isHintButtonVisible(yearLevel: YearLevel): boolean {
  // Hint button is always visible for primary, hidden for junior and senior
  return yearLevel === 'primary';
}

// Helper function to determine if hint should auto-show
export function shouldAutoShowHint(
  hintSettings: HintSettings,
  yearLevel: YearLevel,
  timerPerQuestion: number
): boolean {
  const isEnabled = isHintEnabledForLevel(hintSettings, yearLevel);
  if (!isEnabled) return false;

  // If show_time is greater than or equal to timer, show permanently
  return hintSettings.show_time >= timerPerQuestion;
}

// Helper function to get hint auto-show delay
export function getHintAutoShowDelay(
  hintSettings: HintSettings,
  timerPerQuestion: number
): number {
  // If show_time is greater than timer, show immediately
  if (hintSettings.show_time >= timerPerQuestion) {
    return 0;
  }
  // Otherwise, show after show_time seconds
  return hintSettings.show_time * 1000; // Convert to milliseconds
}

