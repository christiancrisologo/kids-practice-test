'use client';

import React, { ReactNode } from 'react';
import { useQuizData } from '../../contexts/quiz-data-context';
import { Preloader } from './Preloader';

interface AppLoaderProps {
  children: ReactNode;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ children }) => {
  const { isLoading, progress, error, isReady, message } = useQuizData();

  // Show error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-red-600 via-pink-600 to-purple-600">
        <div className="text-center px-6 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show preloader while loading
  if (isLoading || !isReady) {
    return <Preloader progress={progress} message={message} />;
  }

  // Show app content when ready
  return <>{children}</>;
};

