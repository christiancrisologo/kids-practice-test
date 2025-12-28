'use client';

import { useIsMobile } from '../../utils/responsive';

interface MultipleChoiceOptionsProps {
  options: string[];
  selectedOption: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
  correctAnswer?: string;
  showCorrect?: boolean;
}

export function MultipleChoiceOptions({
  options,
  selectedOption,
  onSelect,
  disabled = false,
  correctAnswer,
  showCorrect = false
}: MultipleChoiceOptionsProps) {
  const isMobile = useIsMobile();

  const getOptionClass = (index: number, option: string) => {
    const baseClass = `w-full p-4 rounded-xl border-2 transition-all text-left ${
      isMobile ? 'text-base' : 'text-lg'
    }`;
    
    // Show correct/incorrect after answer
    if (showCorrect && correctAnswer) {
      if (option === correctAnswer) {
        return `${baseClass} border-green-500 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200`;
      }
      if (selectedOption === index && option !== correctAnswer) {
        return `${baseClass} border-red-500 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200`;
      }
      return `${baseClass} border-gray-300 dark:border-gray-600 opacity-50`;
    }
    
    // Normal selection state
    if (selectedOption === index) {
      return `${baseClass} border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 font-semibold`;
    }
    
    if (disabled) {
      return `${baseClass} border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed`;
    }
    
    return `${baseClass} border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer`;
  };

  const getOptionLabel = (index: number) => {
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    return labels[index] || String(index + 1);
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => !disabled && onSelect(index)}
          disabled={disabled}
          className={getOptionClass(index, option)}
        >
          <div className="flex items-center gap-3">
            <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              selectedOption === index
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              {getOptionLabel(index)}
            </span>
            <span className="flex-1">{option}</span>
            {showCorrect && correctAnswer && option === correctAnswer && (
              <span className="text-2xl">✓</span>
            )}
            {showCorrect && selectedOption === index && option !== correctAnswer && (
              <span className="text-2xl">✗</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

