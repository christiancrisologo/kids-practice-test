import { create } from 'zustand';
import { userPreferencesStorage, gameHistoryStorage, GameResult } from '../utils/storage';
import { createUser, getUserByUsername, createGameRecord } from '../utils/supabaseGame';
import { APP } from '../utils/supabaseTables';
import { Subject, SubjectQuestionType, AnswerFormat } from '../types/quiz';
import { isSupabaseEnabled, shouldSyncOnline } from '../utils/systemConfig';

export type Difficulty = 'easy' | 'hard';
export type QuestionType = 'input' | 'multiple-choice';
export type Category = 'places' | 'animals' | 'persons' | 'science' | 'technology' | 'actions' | 'other' | 'all' ;
export type Categories = Category[];
export interface Question {
  id: string | number;
  question: string;
  answer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  options?: string[]; // For multiple choice questions
  timeSpent?: number;
  difficulty: Difficulty,
  questionType: QuestionType,
  categories: Categories,
  definition?: string;
  category?: string;
  synonyms?: string[];
  antonyms?: string[];
  numLetters?: number;
}

export interface QuizSettings {
  username: string;
  difficulty: Difficulty;
  numberOfQuestions: number;
  timerPerQuestion: number;
  questionType: QuestionType;
  categories: Category[]; // New field for number types selection
  // Multi-subject fields
  subject?: Subject;
  subjectQuestionTypes?: SubjectQuestionType[];
  answerFormat?: AnswerFormat;
  yearLevel?: 'primary' | 'secondary' | 'high';
  // Enhanced settings for game mechanics
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
  challengeMode?: string;
}

export interface QuizState {
  _gameRecordSaved?: boolean;
  settings: QuizSettings;
  questions: Question[];
  currentQuestionIndex: number;
  timeRemaining: number;
  isQuizActive: boolean;
  isQuizCompleted: boolean;
  currentStreak: number;
  bestStreak: number;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  quizStartTime: number | null;
  overallTimeRemaining: number;
  overallTimerActive: boolean;
  updateSettings: (settings: Partial<QuizSettings>) => void;
  setQuestions: (questions: Question[]) => void;
  startQuiz: () => void;
  nextQuestion: () => void;
  submitAnswer: (answer: string) => void;
  setTimeRemaining: (time: number) => void;
  setOverallTimeRemaining: (time: number) => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  retryQuiz: (questions: Question[]) => void;
  loadUserPreferences: () => void;
  saveUserPreferences: () => void;
  saveGameResult: () => Promise<GameResult | null>;
  clearUserData: () => void;
}

export const defaultSettings: QuizSettings = {
  username: '',
  difficulty: 'easy',
  numberOfQuestions: 10,
  timerPerQuestion: 20,
  questionType: 'input',
  categories: ['all'],
  timerEnabled: true,
  questionsEnabled: true,
  minCorrectAnswers: 0,
  maxCorrectAnswers: 5,
  correctAnswersEnabled: false,
  minIncorrectAnswers: 0,
  maxIncorrectAnswers: 5,
  incorrectAnswersEnabled: false,
  overallTimerEnabled: false,
  overallTimerDuration: 180,
  challengeMode: undefined,
};

// Helper for Supabase save logic
export async function saveGameToSupabase({ username, score, quizDuration, settings }: {
  username: string;
  score: number;
  quizDuration: number;
  settings: QuizSettings;
}) {
  // Skip if Supabase is disabled
  if (!isSupabaseEnabled()) {
    console.log('[Quiz Store] Supabase is disabled - skipping cloud save');
    return;
  }

  // Skip if not online and sync is required
  if (shouldSyncOnline() && !navigator.onLine) {
    console.log('[Quiz Store] Offline - skipping Supabase save');
    return;
  }

  try {
    let user = await getUserByUsername(username);
    if (!user) {
      try {
        user = await createUser(username);
      } catch (err: unknown) {
        throw err;
      }
    }

    // User might be null if Supabase is disabled
    if (!user) {
      console.log('[Quiz Store] No user created - skipping game record save');
      return;
    }

    await createGameRecord({
      player_id: user.id,
      game_id: APP.ID,
      score,
      achievement: '', // Add achievement logic if needed
      challenge_mode: settings.challengeMode || 'none',
      game_duration: quizDuration,
      player_level: settings.difficulty,
      game_settings: JSON.parse(JSON.stringify(settings))
    });
  } catch (error) {
    console.error('Supabase save error:', error);
  }
}

export const useQuizStore = create<QuizState>((set, get) => ({
  _gameRecordSaved: false,
  settings: defaultSettings,
  questions: [],
  currentQuestionIndex: 0,
  timeRemaining: defaultSettings.timerPerQuestion,
  isQuizActive: false,
  isQuizCompleted: false,
  currentStreak: 0,
  bestStreak: 0,
  correctAnswersCount: 0,
  incorrectAnswersCount: 0,
  quizStartTime: null,
  overallTimeRemaining: defaultSettings.overallTimerDuration,
  overallTimerActive: false,

  updateSettings: (newSettings: Partial<QuizSettings>) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },
  setQuestions: (questions: Question[]) => {
    set({ questions, currentQuestionIndex: 0 });
  },
  startQuiz: () => {
    set((state) => ({
      isQuizActive: true,
      isQuizCompleted: false,
      currentQuestionIndex: 0,
      timeRemaining: state.settings.timerEnabled ? state.settings.timerPerQuestion : 0,
      correctAnswersCount: 0,
      incorrectAnswersCount: 0,
      quizStartTime: Date.now(),
      overallTimeRemaining: state.settings.overallTimerEnabled ? state.settings.overallTimerDuration : 0,
      overallTimerActive: state.settings.overallTimerEnabled,
      _gameRecordSaved: false,
    }));
  },
  nextQuestion: () => {
    set((state) => {
      const nextIndex = state.currentQuestionIndex + 1;
      const isCompleted = nextIndex >= state.questions.length;
      const shouldEndBasedOnCorrect = state.settings.correctAnswersEnabled && state.correctAnswersCount >= state.settings.maxCorrectAnswers;
      const shouldEndBasedOnIncorrect = state.settings.incorrectAnswersEnabled && state.incorrectAnswersCount >= state.settings.maxIncorrectAnswers;
      const shouldComplete = isCompleted || shouldEndBasedOnCorrect || shouldEndBasedOnIncorrect;
      return {
        currentQuestionIndex: nextIndex,
        timeRemaining: shouldComplete ? 0 : (state.settings.timerEnabled ? state.settings.timerPerQuestion : 0),
        isQuizCompleted: shouldComplete,
        isQuizActive: !shouldComplete,
      };
    });
  },
  submitAnswer: (answer: string) => {
    set((state) => {
      const currentIdx = state.currentQuestionIndex;
      const questions = [...state.questions];
      const currentQuestion = questions[currentIdx];
      let isCorrect = false;
      if (currentQuestion) {
        // For input type, compare string; for multiple-choice, compare index
        if (state.settings.questionType === 'input') {
          isCorrect = typeof answer === 'string' && answer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
          currentQuestion.userAnswer = answer;
        } else if (state.settings.questionType === 'multiple-choice' && currentQuestion.options) {
          const idx = typeof answer === 'number' ? answer : parseInt(answer as string);
          isCorrect = currentQuestion.options[idx] === currentQuestion.answer;
          currentQuestion.userAnswer = currentQuestion.options[idx];
        }
        currentQuestion.isCorrect = isCorrect;
        questions[currentIdx] = currentQuestion;
      }
      return {
        questions,
        correctAnswersCount: isCorrect ? state.correctAnswersCount + 1 : state.correctAnswersCount,
        incorrectAnswersCount: !isCorrect ? state.incorrectAnswersCount + 1 : state.incorrectAnswersCount,
      };
    });
  },
  setTimeRemaining: (time: number) => {
    set({ timeRemaining: time });
  },
  setOverallTimeRemaining: (time: number) => {
    set({ overallTimeRemaining: time });
  },
  completeQuiz: async () => {
  set({ isQuizActive: false, isQuizCompleted: true, overallTimerActive: false });
  // Saving is now handled in the results page, not here
  },
  resetQuiz: () => {
    set({
      questions: [],
      currentQuestionIndex: 0,
      timeRemaining: get().settings.timerEnabled ? get().settings.timerPerQuestion : 0,
      isQuizActive: false,
      isQuizCompleted: false,
      currentStreak: 0,
      bestStreak: 0,
      correctAnswersCount: 0,
      incorrectAnswersCount: 0,
      quizStartTime: null,
      overallTimeRemaining: get().settings.overallTimerDuration,
      overallTimerActive: false,
    });
  },
  retryQuiz: (questions: Question[]) => {
    set({
      questions,
      currentQuestionIndex: 0,
      timeRemaining: get().settings.timerEnabled ? get().settings.timerPerQuestion : 0,
      isQuizActive: false,
      isQuizCompleted: false,
      currentStreak: 0,
      correctAnswersCount: 0,
      incorrectAnswersCount: 0,
      quizStartTime: null,
      overallTimeRemaining: get().settings.overallTimerDuration,
      overallTimerActive: false,
      _gameRecordSaved: false,
    });
  },
  loadUserPreferences: () => {
    const preferences = userPreferencesStorage.load();
    if (preferences) {
      set(() => ({}));
    }
  },
  saveUserPreferences: () => {
    const state = get();
    // Get userId from localStorage (kids_practice_test_quiz_user)
    let userId = '';
    if (typeof window !== 'undefined') {
      const userRaw = localStorage.getItem('kids_practice_test_quiz_user');
      if (userRaw) {
        try {
          const userObj = JSON.parse(userRaw);
          userId = userObj.userId || '';
        } catch {}
      }
    }
    userPreferencesStorage.save({
      userId,
      userName: state.settings.username,
      settings: state.settings,
      lastUpdated: new Date(),
    });
  },

  saveGameResult: async () => {
    const state = get();
    if (!state.isQuizCompleted || state.questions.length === 0) {
      return null;
    }
    if (get()._gameRecordSaved) {
      return null;
    }

    const correctAnswers = state.questions.filter(q => q.isCorrect).length;
    const totalQuestions = state.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const totalTimeSpent = state.questions.reduce((total, q) => total + (q.timeSpent || 0), 0);
    const quizDuration = state.quizStartTime ? Math.round((Date.now() - state.quizStartTime) / 1000) : totalTimeSpent;

    // Get userId from localStorage
    let userId = '';
    let userName = state.settings.username;
    if (typeof window !== 'undefined') {
      const userRaw = localStorage.getItem('kids_practice_test_quiz_user');
      if (userRaw) {
        try {
          const userObj = JSON.parse(userRaw);
          userId = userObj.userId || '';
          userName = userObj.userName || userName;
        } catch {}
      }
    }

    // If online, check user in DB by userName, create if not found, then save game record
    if (navigator.onLine && userName) {
      try {
        let user = await getUserByUsername(userName);
        if (!user) {
          user = await createUser(userName);
        }
        if (user && user.id) {
          userId = user.id;
          // Update user reference in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('kids_practice_test_quiz_user', JSON.stringify({ userId, userName }));
          }
        }
        await createGameRecord({
          player_id: userId,
          game_id: APP.ID,
          score,
          achievement: '',
          challenge_mode: state.settings.challengeMode || 'none',
          game_duration: quizDuration,
          player_level: state.settings.difficulty,
          game_settings: (state.settings as unknown) as Record<string, unknown>,
        });
      } catch (error) {
        console.error('Supabase save error:', error);
      }
    }

    // Save to localStorage (always, for offline support)
    const gameResult = gameHistoryStorage.save({
      settings: state.settings,
      questions: state.questions.map(q => ({
        question: q.question,
        correctAnswer: q.answer.toString(),
        userAnswer: q.userAnswer?.toString() || '',
        isCorrect: q.isCorrect || false,
        timeSpent: q.timeSpent || 0,
      })),
      totalQuestions,
      correctAnswers,
      incorrectAnswers: state.incorrectAnswersCount,
      score,
      timeSpent: totalTimeSpent,
      quizDuration,
      averageTimePerQuestion: totalQuestions > 0 ? Math.round(totalTimeSpent / totalQuestions) : 0,
      created_at: new Date().toISOString(),
    }, !navigator.onLine);
    set({ _gameRecordSaved: true });
    return gameResult;
  },
  clearUserData: () => {
    userPreferencesStorage.clear();
    gameHistoryStorage.clear();
    set({ settings: defaultSettings, questions: [], currentQuestionIndex: 0 });
  },
}));
