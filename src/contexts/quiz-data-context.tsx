'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppSettings } from '@/types/settings';
import { setMathData, type MathQuestionTemplate } from '@/utils/dynamicMathGenerator';
import { setScienceData, type ScienceQuestionTemplate } from '@/utils/dynamicScienceGenerator';
import { setAppSettings } from '@/utils/settingsManager';


type QuestionDataArray = any[];

interface QuizDataContextType {
  isLoading: boolean;
  progress: number;
  error: string | null;
  isReady: boolean;
  settings: AppSettings | null;
  questionData: QuestionDataArray | null;
  message: string;
}

const QuizDataContext = createContext<QuizDataContextType>({
  isLoading: true,
  progress: 0,
  error: null,
  isReady: false,
  settings: null,
  questionData: null,
  message: 'Loading...'
});

export const useQuizData = () => useContext(QuizDataContext);

interface QuizDataProviderProps {
  children: ReactNode;
}


/**
 * Get the quiz data source from URL parameter, default to 'math'
 * Note: Subject is now determined by URL query parameter (?subject=math|science|english)
 */
export function getQuizDataSource(): string {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    if (subject === 'science' || subject === 'english') {
      return subject;
    }
  }

  return 'math'; // Default to math
}


export const QuizDataProvider: React.FC<QuizDataProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [questionData, setQuestionData] = useState<QuestionDataArray | null>(null);
  const [message, setMessage] = useState('Loading...');

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

        setMessage(`Loading settings data...`);

        setProgress(10);
        const settingsResponse = await fetch('/configs/settings.json');

        if (!settingsResponse.ok) {
          throw new Error(
            'CRITICAL ERROR: Failed to load settings.json. The application cannot run without this file. ' +
            `Status: ${settingsResponse.status} ${settingsResponse.statusText}`
          );
        }

        setProgress(20);
        await new Promise(resolve => setTimeout(resolve, delay));

        let settingsData: AppSettings;
        try {
          settingsData = await settingsResponse.json();
        } catch (parseError) {
          throw new Error(
            'CRITICAL ERROR: settings.json is not valid JSON. Please check the file format. ' +
            `Error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
          );
        }

        // Set as the source of truth for all settings
        setAppSettings(settingsData);
        setSettings(settingsData);
        console.log('[Settings] Loaded and set as source of truth for app configuration');

        setProgress(30);
        await new Promise(resolve => setTimeout(resolve, delay));

        // STAGE 2: Determine which question data to load (40-50%)
        setProgress(40);

        // Get subject from Redux store (set on index page load)
        // Import useQuizStore dynamically to avoid circular dependencies
        const { useQuizStore } = await import('../store/quiz-store');
        const currentSubject = useQuizStore.getState().currentSubject;
        // Convert Subject enum to string, default to 'math' if not set
        const quizDataType = currentSubject || getQuizDataSource();

        setProgress(50);
        await new Promise(resolve => setTimeout(resolve, delay));

        // STAGE 3: Load question data JSON (50-80%)
        setProgress(55);
        setMessage(`Loading ${quizDataType} questions...`);
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

        // Set data as the source of truth for question generation based on type
        if (quizDataType === 'math') {
          try {
            setMathData(questionsData as MathQuestionTemplate[]);
            console.log('[Math Data] Loaded and set as source of truth for question generation:', questionsData.length, 'templates');
          } catch (error) {
            console.error('[Math Data] Failed to set math data:', error);
          }
        } else if (quizDataType === 'science') {
          try {
            setScienceData(questionsData as ScienceQuestionTemplate[]);
            console.log('[Science Data] Loaded and set as source of truth for question generation:', questionsData.length, 'templates');
          } catch (error) {
            console.error('[Science Data] Failed to set science data:', error);
          }
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

    loadQuizData();

    // Skip loading animation if already loaded in this session
    try {
      const cachedSettings = sessionStorage.getItem('quizSettings');
      if (cachedSettings) {
        const parsedSettings = JSON.parse(cachedSettings);
        setSettings(parsedSettings);
        // Also set as source of truth in settings manager
        setAppSettings(parsedSettings);
      }

      // Also restore question data if it was cached
      const quizDataType = sessionStorage.getItem('quizDataType');
      if (quizDataType === 'math') {
        // Re-fetch math data to set it in the generator
        fetch('/configs/math.json')
          .then(res => res.json())
          .then(data => {
            setMathData(data as MathQuestionTemplate[]);
            setQuestionData(data);
            console.log('[Math Data] Restored from cache');
          })
          .catch(err => console.error('[Math Data] Failed to restore:', err));
      } else if (quizDataType === 'science') {
        // Re-fetch science data to set it in the generator
        fetch('/configs/science.json')
          .then(res => res.json())
          .then(data => {
            setScienceData(data as ScienceQuestionTemplate[]);
            setQuestionData(data);
            console.log('[Science Data] Restored from cache');
          })
          .catch(err => console.error('[Science Data] Failed to restore:', err));
      }
    } catch (e) {
      console.warn('Failed to load cached settings:', e);
    }
    setProgress(100);
    setIsReady(true);
    setIsLoading(false);

  }, []);

  return (
    <QuizDataContext.Provider value={{
      isLoading,
      progress,
      error,
      isReady,
      settings,
      questionData,
      message
    }}>
      {children}
    </QuizDataContext.Provider>
  );
};

