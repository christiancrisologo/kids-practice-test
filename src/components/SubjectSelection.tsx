'use client';

import { useState } from 'react';
import { MobileButton } from './ui/MobileButton';

interface SubjectInfo {
  name: string;
  label: string;
  description: string;
  icon?: string;
}

interface SubjectSelectionProps {
  subjects: SubjectInfo[];
  onSubjectSelect: (subjectName: string) => void;
  isLoading?: boolean;
}

const SUBJECT_ICONS: Record<string, string> = {
  math: '🔢',
  science: '🔬',
  english: '📚',
  history: '📜'
};

const SUBJECT_COLORS: Record<string, string> = {
  math: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  science: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  english: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  history: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
};

export function SubjectSelection({ subjects, onSubjectSelect, isLoading }: SubjectSelectionProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const handleSubjectClick = (subjectName: string) => {
    setSelectedSubject(subjectName);
    onSubjectSelect(subjectName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-4">
            🎓 Kids Practice Test
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Choose a subject to start practicing
          </p>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {subjects.map((subject) => {
            const icon = SUBJECT_ICONS[subject.name] || '📖';
            const colorClass = SUBJECT_COLORS[subject.name] || 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700';
            const isSelected = selectedSubject === subject.name;
            const isDisabled = isLoading && selectedSubject !== subject.name;

            return (
              <button
                key={subject.name}
                onClick={() => handleSubjectClick(subject.name)}
                disabled={isDisabled || isLoading}
                className={`
                  relative p-8 rounded-2xl shadow-lg transition-all duration-300
                  ${isSelected 
                    ? 'ring-4 ring-purple-500 scale-105' 
                    : 'hover:scale-105 hover:shadow-xl'
                  }
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  bg-gradient-to-br ${colorClass}
                  text-white
                `}
              >
                {/* Loading Spinner */}
                {isLoading && isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-2xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                  </div>
                )}

                {/* Icon */}
                <div className="text-6xl mb-4">{icon}</div>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-2">{subject.label}</h2>

                {/* Description */}
                <p className="text-white text-opacity-90">
                  {subject.description}
                </p>

                {/* Selected Indicator */}
                {isSelected && !isLoading && (
                  <div className="absolute top-4 right-4 bg-white text-purple-600 rounded-full p-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Loading Message */}
        {isLoading && selectedSubject && (
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">
              Loading {subjects.find(s => s.name === selectedSubject)?.label}...
            </p>
          </div>
        )}

        {/* Info Text */}
        {!isLoading && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Select a subject to configure your quiz settings</p>
          </div>
        )}
      </div>
    </div>
  );
}

