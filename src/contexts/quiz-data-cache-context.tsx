'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types for quiz data
export type QuizDataType = 'math' | 'science' | 'english';

export interface CachedQuizData {
  data: any[];
  timestamp: number;
  version: string;
}

export interface QuizDataCacheState {
  math: any[] | null;
  science: any[] | null;
  english: any[] | null;
}

interface QuizDataCacheContextType {
  cache: QuizDataCacheState;
  getQuizData: (type: QuizDataType) => any[] | null;
  setQuizData: (type: QuizDataType, data: any[]) => void;
  clearCache: (type?: QuizDataType) => void;
  isDataCached: (type: QuizDataType) => boolean;
}

const QuizDataCacheContext = createContext<QuizDataCacheContextType | undefined>(undefined);

const CACHE_VERSION = '1.0.0';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface QuizDataCacheProviderProps {
  children: ReactNode;
}

export const QuizDataCacheProvider: React.FC<QuizDataCacheProviderProps> = ({ children }) => {
  const [cache, setCache] = useState<QuizDataCacheState>({
    math: null,
    science: null,
    english: null,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const loadFromLocalStorage = () => {
      const types: QuizDataType[] = ['math', 'science', 'english'];
      const newCache: QuizDataCacheState = { math: null, science: null, english: null };

      types.forEach(type => {
        try {
          const cached = localStorage.getItem(`quizData_${type}`);
          if (cached) {
            const parsed: CachedQuizData = JSON.parse(cached);

            // Check if cache is still valid
            const isExpired = Date.now() - parsed.timestamp > CACHE_EXPIRY_MS;
            const isVersionMismatch = parsed.version !== CACHE_VERSION;

            if (!isExpired && !isVersionMismatch && Array.isArray(parsed.data)) {
              newCache[type] = parsed.data;
              console.log(`[QuizDataCache] Loaded ${type} from localStorage (${parsed.data.length} items)`);
            } else {
              // Clear expired or invalid cache
              localStorage.removeItem(`quizData_${type}`);
              console.log(`[QuizDataCache] Cleared expired/invalid ${type} cache`);
            }
          }
        } catch (error) {
          console.error(`[QuizDataCache] Error loading ${type} from localStorage:`, error);
          localStorage.removeItem(`quizData_${type}`);
        }
      });

      setCache(newCache);
    };

    loadFromLocalStorage();
  }, []);

  const getQuizData = (type: QuizDataType): any[] | null => {
    return cache[type];
  };

  const setQuizData = (type: QuizDataType, data: any[]) => {
    // Update state
    setCache(prev => ({
      ...prev,
      [type]: data,
    }));

    // Save to localStorage
    try {
      const cachedData: CachedQuizData = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      localStorage.setItem(`quizData_${type}`, JSON.stringify(cachedData));
      console.log(`[QuizDataCache] Saved ${type} to localStorage (${data.length} items)`);
    } catch (error) {
      console.error(`[QuizDataCache] Error saving ${type} to localStorage:`, error);
    }
  };

  const clearCache = (type?: QuizDataType) => {
    if (type) {
      // Clear specific type
      setCache(prev => ({
        ...prev,
        [type]: null,
      }));
      localStorage.removeItem(`quizData_${type}`);
      console.log(`[QuizDataCache] Cleared ${type} cache`);
    } else {
      // Clear all
      setCache({ math: null, science: null, english: null, history: null });
      localStorage.removeItem('quizData_math');
      localStorage.removeItem('quizData_science');
      localStorage.removeItem('quizData_english');
      localStorage.removeItem('quizData_history');
      console.log('[QuizDataCache] Cleared all cache');
    }
  };

  const isDataCached = (type: QuizDataType): boolean => {
    return cache[type] !== null && Array.isArray(cache[type]) && cache[type]!.length > 0;
  };

  return (
    <QuizDataCacheContext.Provider
      value={{
        cache,
        getQuizData,
        setQuizData,
        clearCache,
        isDataCached,
      }}
    >
      {children}
    </QuizDataCacheContext.Provider>
  );
};

export const useQuizDataCache = () => {
  const context = useContext(QuizDataCacheContext);
  if (context === undefined) {
    throw new Error('useQuizDataCache must be used within a QuizDataCacheProvider');
  }
  return context;
};

