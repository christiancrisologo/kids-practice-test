'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SettingsData = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QuestionDataArray = any[];

interface QuizDataContextType {
  isLoading: boolean;
  progress: number;
  error: string | null;
  isReady: boolean;
  settings: SettingsData | null;
  questionData: QuestionDataArray | null;
}

const QuizDataContext = createContext<QuizDataContextType>({
  isLoading: true,
  progress: 0,
  error: null,
  isReady: false,
  settings: null,
  questionData: null,
});

export const useQuizData = () => useContext(QuizDataContext);

interface QuizDataProviderProps {
  children: ReactNode;
}

export const QuizDataProvider: React.FC<QuizDataProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [questionData, setQuestionData] = useState<QuestionDataArray | null>(null);

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setIsLoading(true);
        setProgress(0);

        // Add delay for development to see preloader
        const isDev = process.env.NODE_ENV === 'development';
        const delay = isDev ? 300 : 100; // Slower in dev mode

        // STAGE 1: Load settings.json (0-40%)
        setProgress(5);
        await new Promise(resolve => setTimeout(resolve, delay));

        setProgress(10);
        const settingsResponse = await fetch('/configs/settings.json');

        if (!settingsResponse.ok) {
          throw new Error('Failed to load settings');
        }

        setProgress(20);
        await new Promise(resolve => setTimeout(resolve, delay));

        const settingsData = await settingsResponse.json();
        setSettings(settingsData);

        setProgress(30);
        await new Promise(resolve => setTimeout(resolve, delay));

        // STAGE 2: Determine which question data to load (40-50%)
        setProgress(40);

        // Check for query parameter first
        let quizDataType = settingsData.system?.['quiz-data'] || 'math';

        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const queryQuizData = urlParams.get('quiz-data');
          if (queryQuizData) {
            quizDataType = queryQuizData;
          }
        }

        setProgress(50);
        await new Promise(resolve => setTimeout(resolve, delay));

        // STAGE 3: Load question data JSON (50-80%)
        setProgress(55);
        const questionDataUrl = `/configs/${quizDataType}.json`;
        const questionResponse = await fetch(questionDataUrl);

        if (!questionResponse.ok) {
          throw new Error(`Failed to load ${quizDataType} questions`);
        }

        setProgress(65);
        await new Promise(resolve => setTimeout(resolve, delay));

        const questionsData = await questionResponse.json();
        setQuestionData(questionsData);

        if (!Array.isArray(questionsData) || questionsData.length === 0) {
          throw new Error('Invalid question data');
        }

        setProgress(75);
        await new Promise(resolve => setTimeout(resolve, delay));

        // STAGE 4: Validate and prepare (80-100%)
        setProgress(85);

        // Store in sessionStorage for faster subsequent loads
        try {
          sessionStorage.setItem('quizSettings', JSON.stringify(settingsData));
          sessionStorage.setItem('quizDataType', quizDataType);
          sessionStorage.setItem('questionsCount', questionsData.length.toString());
          sessionStorage.setItem('quizDataLoaded', 'true');
        } catch (e) {
          console.warn('SessionStorage not available:', e);
        }

        setProgress(95);
        await new Promise(resolve => setTimeout(resolve, delay));

        // Complete
        setProgress(100);
        await new Promise(resolve => setTimeout(resolve, delay * 1.5));

        setIsReady(true);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading quiz data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quiz data');
        setIsLoading(false);
      }
    };

    // Check if already loaded in this session
    const alreadyLoaded = sessionStorage.getItem('quizDataLoaded') === 'true';

    if (alreadyLoaded) {
      // Skip loading animation if already loaded in this session
      try {
        const cachedSettings = sessionStorage.getItem('quizSettings');
        if (cachedSettings) {
          setSettings(JSON.parse(cachedSettings));
        }
      } catch (e) {
        console.warn('Failed to load cached settings:', e);
      }
      setProgress(100);
      setIsReady(true);
      setIsLoading(false);
    } else {
      loadQuizData();
    }
  }, []);

  return (
    <QuizDataContext.Provider value={{ isLoading, progress, error, isReady, settings, questionData }}>
      {children}
    </QuizDataContext.Provider>
  );
};

