'use client';

import React from 'react';
import type { Question } from '../../store/quiz-store';
import { MultipleChoiceOptions } from './MultipleChoiceOptions';
import AnswerInput from './AnswerInput';
import { useIsMobile } from '../../utils/responsive';

interface QuestionDisplayProps {
    currentQuestion: Question;
    userAnswer?: string;
    selectedOption?: number | null;
    onAnswerChange?: (answer: string) => void;
    onOptionSelect?: (index: number) => void;
    showResult?: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
    currentQuestion,
    userAnswer = '',
    selectedOption = null,
    onAnswerChange,
    onOptionSelect,
    showResult = false
}) => {
    const isMobile = useIsMobile();

    if (!currentQuestion) return <div>No question available.</div>;

    // Check if question has options (multiple choice)
    const hasOptions = 'options' in currentQuestion && Array.isArray(currentQuestion.options);
    const isMultipleChoice = hasOptions && currentQuestion.options && currentQuestion.options.length > 0;

    return (
        <div className="space-y-8">
            {/* Question Text - Large and Centered */}
            <div className={`text-center ${isMobile ? 'text-4xl' : 'text-6xl'} font-bold text-white py-12`}>
                {currentQuestion.question}
            </div>

            {/* Answer Section */}
            <div className="mt-8">
                {isMultipleChoice ? (
                    <MultipleChoiceOptions
                        options={currentQuestion.options || []}
                        selectedOption={selectedOption}
                        onSelect={onOptionSelect || (() => { })}
                        disabled={showResult}
                        correctAnswer={showResult ? currentQuestion.answer : undefined}
                        showCorrect={showResult}
                    />
                ) : (
                    <AnswerInput
                        value={userAnswer}
                        onChange={onAnswerChange || (() => { })}
                        placeholder="Enter your answer"
                        disabled={showResult}
                    />
                )}
            </div>

            {/* Show correct answer if wrong */}
            {showResult && !currentQuestion.isCorrect && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border-2 border-green-500">
                    <div className="font-semibold text-green-800 dark:text-green-200">
                        Correct Answer: {currentQuestion.answer}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionDisplay;
