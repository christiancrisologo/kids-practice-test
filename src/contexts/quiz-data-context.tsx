'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppSettings } from '@/types/settings';
import { setMathData, type MathQuestionTemplate } from '@/utils/dynamicMathGenerator';
import { setScienceData, type ScienceQuestionTemplate } from '@/utils/dynamicScienceGenerator';
import { setAppSettings } from '@/utils/settingsManager';
import { useQuizDataCache, QuizDataType } from './quiz-data-cache-context';
import { useAppSettingsCache } from './app-settings-cache-context';
import { getConfigUrl } from '@/utils/basePath';


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

  // Get cache contexts
  const quizDataCache = useQuizDataCache();
  const appSettingsCache = useAppSettingsCache();

  useEffect(() => {
    const quizDataType = getQuizDataSource() as QuizDataType;
    const cachedSettings = appSettingsCache.getSettings();

    const loadQuizData = async () => {
      try {
        setIsLoading(true);
        setIsReady(false);
        setProgress(0);

        // Add delay for development to see preloader
        const isDev = process.env.NODE_ENV === 'development';
        const delay = isDev ? 300 : 100; // Slower in dev mode

        // STAGE 1: Load settings.json (0-40%)
        setProgress(5);
        setMessage('Initializing...');
        await new Promise(resolve => setTimeout(resolve, delay));


        let settingsData: AppSettings;

        if (cachedSettings) {
          // Use cached settings
          setProgress(20);
          setMessage('Loading cached settings...');
          settingsData = cachedSettings;
          console.log('[QuizData] Using cached settings');
          await new Promise(resolve => setTimeout(resolve, delay / 2));
        } else {
          // Fetch settings from server
          setProgress(10);
          setMessage('Loading settings data...');
          await new Promise(resolve => setTimeout(resolve, delay));

          const settingsUrl = getConfigUrl('configs/settings.json');
          const settingsResponse = await fetch(settingsUrl);

          if (!settingsResponse.ok) {
            throw new Error(
              'CRITICAL ERROR: Failed to load settings.json. The application cannot run without this file. ' +
              `Status: ${settingsResponse.status} ${settingsResponse.statusText}`
            );
          }

          setProgress(20);
          await new Promise(resolve => setTimeout(resolve, delay));

          try {
            settingsData = await settingsResponse.json();
          } catch (parseError) {
            throw new Error(
              'CRITICAL ERROR: settings.json is not valid JSON. Please check the file format. ' +
              `Error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
            );
          }

          // Cache the settings
          appSettingsCache.setSettings(settingsData);
          console.log('[QuizData] Fetched and cached settings');

          setProgress(30);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Set as the source of truth for all settings
        setAppSettings(settingsData);
        setSettings(settingsData);

        setProgress(40);
        await new Promise(resolve => setTimeout(resolve, delay));

        // STAGE 2: Determine which question data to load (40-50%)
        setProgress(45);
        setMessage(`Preparing ${quizDataType} questions...`);
        await new Promise(resolve => setTimeout(resolve, delay));

        setProgress(50);
        await new Promise(resolve => setTimeout(resolve, delay));

        // STAGE 3: Load question data JSON (50-90%)
        // Check if question data is cached
        const cachedQuestionData = quizDataCache.getQuizData(quizDataType);
        let questionsData: any[];

        if (cachedQuestionData) {
          // Use cached question data
          setProgress(70);
          setMessage(`Loading cached ${quizDataType} questions...`);
          questionsData = cachedQuestionData;
          console.log(`[QuizData] Using cached ${quizDataType} questions (${questionsData.length} items)`);
          await new Promise(resolve => setTimeout(resolve, delay / 2));
        } else {
          // Fetch question data from server
          setProgress(60);
          setMessage(`Loading ${quizDataType} questions...`);
          await new Promise(resolve => setTimeout(resolve, delay));

          const questionDataUrl = getConfigUrl(`configs/${quizDataType}.json`);
          const questionResponse = await fetch(questionDataUrl);

          if (!questionResponse.ok) {
            throw new Error(`Failed to load ${quizDataType} questions`);
          }

          setProgress(75);
          await new Promise(resolve => setTimeout(resolve, delay));

          questionsData = await questionResponse.json();

          if (!Array.isArray(questionsData) || questionsData.length === 0) {
            throw new Error('Invalid question data');
          }

          // Cache the question data
          quizDataCache.setQuizData(quizDataType, questionsData);
          console.log(`[QuizData] Fetched and cached ${quizDataType} questions (${questionsData.length} items)`);

          setProgress(85);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        setQuestionData(questionsData);

        // Set data as the source of truth for question generation based on type
        if (quizDataType === 'math') {
          try {
            setMathData(questionsData as MathQuestionTemplate[]);
            console.log('[Math Data] Set as source of truth for question generation:', questionsData.length, 'templates');
          } catch (error) {
            console.error('[Math Data] Failed to set math data:', error);
          }
        } else if (quizDataType === 'science') {
          try {
            setScienceData(questionsData as ScienceQuestionTemplate[]);
            console.log('[Science Data] Set as source of truth for question generation:', questionsData.length, 'templates');
          } catch (error) {
            console.error('[Science Data] Failed to set science data:', error);
          }
        }

        setProgress(90);
        await new Promise(resolve => setTimeout(resolve, delay));

        // STAGE 4: Validate and prepare (90-100%)
        setProgress(95);
        setMessage('Finalizing...');

        // Store metadata in sessionStorage for tracking
        try {
          sessionStorage.setItem('quizDataType', quizDataType);
          sessionStorage.setItem('questionsCount', questionsData.length.toString());
          sessionStorage.setItem('quizDataLoaded', 'true');
        } catch (e) {
          console.warn('SessionStorage not available:', e);
        }

        setProgress(99);
        await new Promise(resolve => setTimeout(resolve, delay / 2));

        // Complete
        setProgress(100);
        setMessage('Ready!');
        await new Promise(resolve => setTimeout(resolve, delay));

        setIsReady(true);
        setIsLoading(false);

      } catch (err) {
        console.error('Error loading quiz data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quiz data');
        setIsReady(false);
        setIsLoading(false);
      }
    };

    if (quizDataCache.isDataCached(quizDataType) && appSettingsCache.isSettingsCached()) {
      setSettings(appSettingsCache.getSettings());
      setQuestionData(quizDataCache.getQuizData(quizDataType));
      setIsLoading(false);
      setIsReady(true);
    } else {
      loadQuizData();
    }

  }, [quizDataCache, appSettingsCache]);

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

