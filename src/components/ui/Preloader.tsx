'use client';

import React from 'react';

interface PreloaderProps {
  progress: number;
  message?: string;
}

export const Preloader: React.FC<PreloaderProps> = ({ progress, message = 'Loading...' }) => {
  // Determine loading stage message based on progress
  const getStageMessage = () => {
    if (progress < 40) return 'Loading settings...';
    if (progress < 50) return 'Checking configuration...';
    if (progress < 80) return 'Loading questions...';
    if (progress < 95) return 'Preparing quiz...';
    return 'Almost ready...';
  };

  const stageMessage = message || getStageMessage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-900 dark:via-blue-900 dark:to-cyan-900">
      <div className="text-center px-6 max-w-md w-full">
        {/* Logo/Icon */}
        <div className="mb-8 animate-bounce">
          <div className="text-8xl mb-4">🎓</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Kids Practice Test
          </h1>
          <p className="text-white/80 text-sm">
            Preparing your learning experience...
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="mb-6">
          <div className="relative w-full h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            {/* Progress Bar Fill */}
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Progress Percentage */}
          <div className="mt-3 flex items-center justify-between text-white/90 text-sm">
            <span>{stageMessage}</span>
            <span className="font-bold">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Loading Dots Animation */}
        <div className="flex justify-center gap-2 mb-4">
          <div className="w-3 h-3 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>

        {/* Fun Facts or Tips */}
        <div className="text-white/70 text-xs italic">
          {progress < 30 && "💡 Tip: Practice makes perfect!"}
          {progress >= 30 && progress < 60 && "🌟 Did you know? Math is everywhere!"}
          {progress >= 60 && progress < 90 && "🚀 Almost ready to start learning!"}
          {progress >= 90 && "✨ Get ready for an amazing quiz!"}
        </div>
      </div>

      {/* Add shimmer animation to global styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

