'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '../../store/quiz-store';
import { useIsMobile } from '../../utils/responsive';
import { playSound, vibrate } from '../../utils/enhanced-sounds';
import { useSystemSettings } from '../../contexts/system-settings-context';
import { animationClasses } from '../../utils/enhanced-animations';
import { useQuestionTransition, getBlockingOverlayClasses } from '../../utils/question-transitions';
import { getChallengeMode } from '../../utils/challengeModes';
import HeaderContent from '../../components/quiz/HeaderContent';
import { useQuizData } from '../../contexts/math-data-context';
import {
    isHintEnabledForLevel,
    isHintButtonVisible,
    getHintAutoShowDelay,
    type YearLevel
} from '../../types/settings';

export default function QuizPage() {
    const router = useRouter();
    const isMobile = useIsMobile();
    const { settings: systemSettings } = useSystemSettings();
    const { settings: globalSettings } = useQuizData();
    const {
        settings,
        questions,
        currentQuestionIndex,
        timeRemaining,
        isQuizActive,
        isQuizCompleted,
        correctAnswersCount,
        incorrectAnswersCount,
        overallTimeRemaining,
        overallTimerActive,
        startQuiz,
        nextQuestion,
        submitAnswer,
        setTimeRemaining,
        setOverallTimeRemaining,
        completeQuiz,
    } = useQuizStore();

    const [userInput, setUserInput] = useState('');
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [hintContent, setHintContent] = useState<string>('');
    const [showCountdown, setShowCountdown] = useState(true);
    const countdownNumbers = [3, 2, 1];
    const [countdownIdx, setCountdownIdx] = useState(0);

    // Refs for auto-focus
    const inputRef = useRef<HTMLInputElement>(null);

    // Question transition animations
    const { isUserInteractionBlocked } = useQuestionTransition(currentQuestionIndex, systemSettings.animations);

    const currentQuestion = questions[currentQuestionIndex];

    // Redirect to home if no questions are available
    useEffect(() => {
        if (questions.length === 0 && !isQuizActive && !isQuizCompleted) {
            router.push('/');
        }
    }, [questions.length, isQuizActive, isQuizCompleted, router]);

    // Start quiz when component mounts
    useEffect(() => {
        if (questions.length > 0 && !isQuizActive && !isQuizCompleted) {
            startQuiz();
        }
    }, [questions, isQuizActive, isQuizCompleted, startQuiz]);

    // Show countdown at the start of every question
    useEffect(() => {
        setShowCountdown(true);
        setCountdownIdx(0);
        if (isQuizActive && currentQuestion) {
            const interval = setInterval(() => {
                setCountdownIdx(prev => {
                    if (prev === countdownNumbers.length - 1) {
                        clearInterval(interval);
                        setShowCountdown(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 700);
            return () => clearInterval(interval);
        }
    }, [currentQuestionIndex, isQuizActive, currentQuestion, countdownNumbers.length]);

    // Clear all inputs and selections when question changes
    useEffect(() => {
        setUserInput('');
        setSelectedOption(null);
        setShowHint(false);
        setHintContent('');
        setFlashResult(null);
    }, [currentQuestionIndex]);

    // Flash result state
    const [flashResult, setFlashResult] = useState<null | 'correct' | 'incorrect'>(null);

    // Auto-show hint based on configuration
    useEffect(() => {
        if (!currentQuestion || !globalSettings?.system?.hint || showCountdown) return;

        const hintSettings = globalSettings.system.hint;

        // Map yearLevel to YearLevel type
        let yearLevel: YearLevel;
        if (settings.yearLevel === 'primary') {
            yearLevel = 'primary';
        } else if (settings.yearLevel === 'secondary') {
            yearLevel = 'junior';
        } else {
            yearLevel = 'senior';
        }

        // Check if hint is enabled for this level
        const isEnabled = isHintEnabledForLevel(hintSettings, yearLevel);
        if (!isEnabled) return;

        // Get hint text
        const hintText = ('hint' in currentQuestion && typeof currentQuestion.hint === 'string' && currentQuestion.hint)
            || `💡 Hint: Think carefully about the question.`;
        setHintContent(hintText);

        // Calculate delay for auto-showing hint
        const delay = getHintAutoShowDelay(hintSettings, settings.timerPerQuestion);

        // Auto-show hint after delay
        const timer = setTimeout(() => {
            setShowHint(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [currentQuestionIndex, currentQuestion, globalSettings, settings.yearLevel, settings.timerPerQuestion, showCountdown]);

    // Also show hint when the per-question timer reaches the configured show_time
    useEffect(() => {
        if (!currentQuestion || !globalSettings?.system?.hint || showCountdown) return;

        const hintSettings = globalSettings.system.hint;

        // Map yearLevel to YearLevel type
        let yearLevel: YearLevel;
        if (settings.yearLevel === 'primary') {
            yearLevel = 'primary';
        } else if (settings.yearLevel === 'secondary') {
            yearLevel = 'junior';
        } else {
            yearLevel = 'senior';
        }

        // Only proceed if hints are enabled for this level
        const isEnabled = isHintEnabledForLevel(hintSettings, yearLevel);
        if (!isEnabled) return;

        // Ensure a numeric show_time is present
        const showTime = typeof hintSettings.show_time === 'number' ? hintSettings.show_time : null;
        if (showTime === null) return;

        // Only react when timer is enabled for questions
        if (!settings.timerEnabled) return;

        if (timeRemaining === showTime) {
            const hintText = ('hint' in currentQuestion && typeof currentQuestion.hint === 'string' && currentQuestion.hint)
                || `💡 Hint: Think carefully about the question.`;
            setHintContent(hintText);
            setShowHint(true);
        }
    }, [timeRemaining, currentQuestionIndex, currentQuestion, globalSettings, settings.yearLevel, settings.timerEnabled, showCountdown]);

    // Timer logic - pause during countdown and animations, and check if timer is enabled
    useEffect(() => {
        // Always include all dependencies, even if some are unused
        if (!isQuizActive || !settings.timerEnabled || timeRemaining <= 0 || isUserInteractionBlocked || showCountdown === true) return;

        const timer = setInterval(() => {
            setTimeRemaining(timeRemaining - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isQuizActive, timeRemaining, setTimeRemaining, isUserInteractionBlocked, settings.timerEnabled, showCountdown]);

    // Overall timer logic - separate from question timer
    useEffect(() => {
        if (!isQuizActive || !settings.overallTimerEnabled || !overallTimerActive || overallTimeRemaining <= 0) return;

        const overallTimer = setInterval(() => {
            setOverallTimeRemaining(overallTimeRemaining - 1);
        }, 1000);

        return () => clearInterval(overallTimer);
    }, [isQuizActive, overallTimeRemaining, setOverallTimeRemaining, settings.overallTimerEnabled, overallTimerActive]);

    // Auto-advance when timer reaches 0 (only if timer is enabled)
    useEffect(() => {
        if (settings.timerEnabled && timeRemaining === 0 && isQuizActive) {
            handleTimeUp();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRemaining, isQuizActive, settings.timerEnabled]);

    // Handle overall timer timeout
    useEffect(() => {
        if (settings.overallTimerEnabled && overallTimeRemaining === 0 && isQuizActive) {
            // Force end the quiz when overall timer reaches 0
            playSound('incorrect', systemSettings); // Play warning sound
            vibrate(300, systemSettings); // Strong vibration
            completeQuiz();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [overallTimeRemaining, isQuizActive, settings.overallTimerEnabled]);

    // Redirect if no questions
    useEffect(() => {
        if (questions.length === 0) {
            router.push('/');
        }
    }, [questions.length, router]);

    // Redirect to results when quiz is completed
    useEffect(() => {
        if (isQuizCompleted) {
            router.push('/results');
        }
    }, [isQuizCompleted, router]);

    // Auto-focus input when new question starts or settings change
    useEffect(() => {
        if (currentQuestion && isQuizActive) {
            setTimeout(() => {
                if (settings.questionType === 'input') {

                    if (inputRef.current) inputRef.current.focus();
                }
            }, 100); // Small delay to ensure rendering is complete
        }
    }, [currentQuestion, isQuizActive, settings.questionType]);

    // Global Enter key handler
    useEffect(() => {
        const handleGlobalKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !isUserInteractionBlocked && isQuizActive) {
                // Check if user can submit based on question type
                let canSubmit = false;


                // Regular questions (integers, decimals)
                canSubmit = settings.questionType === 'input'
                    ? userInput.trim().length > 0
                    : selectedOption !== null;

                if (canSubmit) {
                    e.preventDefault();
                    handleSubmitAnswer();
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyPress);
        return () => window.removeEventListener('keydown', handleGlobalKeyPress);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        isUserInteractionBlocked,
        isQuizActive,
        settings.questionType,
        userInput,
        selectedOption,
    ]);

    // Speak word after 2 seconds on new question
    // Removed auto-speak after delay; now handled by countdown

    // Hint logic
    const handleHint = () => {
        if (!currentQuestion) return;

        // Check if question has a direct hint property (Math, Science, etc.)
        if ('hint' in currentQuestion && typeof currentQuestion.hint === 'string') {
            setHintContent(currentQuestion.hint);
            setShowHint(true);
            return;
        }

        // For spelling/English questions, build hint from available properties
        const hintOptions = [];
        if (currentQuestion.numLetters)
            hintOptions.push(`The word has ${currentQuestion.numLetters} letters.`);
        if (currentQuestion.category)
            hintOptions.push(`It's categorized as ${currentQuestion.category}.`);
        if (currentQuestion.synonyms && currentQuestion.synonyms.length)
            hintOptions.push(`A synonym is ${currentQuestion.synonyms[0]}.`);
        if (currentQuestion.antonyms && currentQuestion.antonyms.length)
            hintOptions.push(`An antonym is ${currentQuestion.antonyms[0]}.`);

        if (hintOptions.length === 0) {
            // Generic hint if no specific hint available
            setHintContent(`💡 Think carefully about the question!`);
        } else {
            const randomHint = hintOptions[Math.floor(Math.random() * hintOptions.length)];
            setHintContent(randomHint);
        }
        setShowHint(true);
    };

    const handleTimeUp = () => {
        // Submit empty/null answer when time runs out
        submitAnswer(''); // Submit empty string for timeout on fraction multiple choice


        // Clear all inputs
        setUserInput('');
        setSelectedOption(null);

        if (currentQuestionIndex >= questions.length - 1) {
            completeQuiz();
        } else {
            nextQuestion();
        }
    };

    const handleSubmitAnswer = () => {
        let isCorrect = false;

        let answer: string = '';
        if (settings.questionType === 'input') {
            answer = userInput;
        } else if (settings.questionType === 'multiple-choice') {
            answer = selectedOption !== null ? String(selectedOption) : '';
        }

        submitAnswer(answer);

        // Check if answer was correct (we need to check the updated question)
        const updatedQuestion = questions[currentQuestionIndex];
        if (updatedQuestion) {
            setTimeout(() => {
                const question = useQuizStore.getState().questions[currentQuestionIndex];
                isCorrect = question?.isCorrect || false;

                // Show visual and audio feedback
                if (isCorrect) {
                    playSound('correct', systemSettings);
                    vibrate([100, 50, 100], systemSettings);
                    setFlashResult('correct');
                } else {
                    playSound('incorrect', systemSettings);
                    vibrate(200, systemSettings);
                    setFlashResult('incorrect');
                }
                // Remove flash after 600ms
                setTimeout(() => setFlashResult(null), 600);
            }, 100);
        }

        // Clear all inputs
        setUserInput('');
        setSelectedOption(null);

        if (currentQuestionIndex >= questions.length - 1) {
            setTimeout(() => {
                playSound('completion', systemSettings);
                completeQuiz();
            }, 1000);
        } else {
            setTimeout(() => {
                nextQuestion();
                // Auto-focus after moving to next question
                setTimeout(() => {
                    if (settings.questionType === 'input') {
                        if (inputRef.current) inputRef.current.focus();
                    }
                }, 100);
            }, 1000);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isUserInteractionBlocked) {
            // Check if user can submit based on question type
            let canSubmit = false;

            // Regular questions (integers, decimals)
            canSubmit = settings.questionType === 'input'
                ? userInput.trim().length > 0
                : selectedOption !== null;

            if (canSubmit) {
                handleSubmitAnswer();
            }
        }
    };

    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 dark:from-indigo-900 dark:via-purple-800 dark:to-pink-900 flex items-center justify-center p-4">
                <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-2xl text-center ${isMobile ? 'p-6 max-w-sm' : 'p-8 max-w-md'}`}>
                    <div className={`${animationClasses.spin(systemSettings)} rounded-full h-16 w-16 border-b-2 border-purple-500 dark:border-purple-400 mx-auto`}></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quiz...</p>
                </div>
            </div>
        );
    }

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const headerContent = (<HeaderContent
        settings={settings}
        currentQuestionIndex={currentQuestionIndex}
        questions={questions}
        correctAnswersCount={correctAnswersCount}
        incorrectAnswersCount={incorrectAnswersCount}
        timeRemaining={timeRemaining}
        overallTimeRemaining={overallTimeRemaining}
        animationClasses={animationClasses}
        systemSettings={systemSettings}
        progress={progress}
    />);

    return (
        <div className={`min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-blue-500 dark:from-violet-900 dark:via-purple-800 dark:to-indigo-900 ${flashResult === 'correct' ? 'flash-correct' : ''} ${flashResult === 'incorrect' ? 'flash-incorrect' : ''}`}>
            {/* Header: mobile and desktop differ, rest is unified */}
            {isMobile && (<div className="bg-white dark:bg-slate-800 shadow-lg p-4 sticky top-0 z-10">{headerContent}</div>)}
            {/* Unified Content for both mobile and desktop */}
            <div className={`flex items-center justify-center p-4 min-h-screen`}>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-2xl relative">
                    {!isMobile && (<div className="text-center mb-8">{headerContent}</div>)}
                    {/* Countdown Animation */}
                    {showCountdown ? (
                        <div className="text-center mb-8">
                            <div className="text-8xl font-extrabold text-purple-600 dark:text-purple-300 mb-4 animate-pulse">
                                {countdownNumbers[countdownIdx]}
                            </div>
                            <div className="text-lg text-gray-600 dark:text-gray-400">
                                Get ready!
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                {/* Display question text */}
                                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                                    {currentQuestion.question}
                                </div>

                                {/* Action buttons */}
                                <div className="flex justify-center gap-4 mb-4">
                                    {/* Hint button visibility based on year level - always visible for primary, hidden for junior and senior */}
                                    {(() => {
                                        const yearLevel: YearLevel = settings.yearLevel === 'primary' ? 'primary'
                                            : settings.yearLevel === 'secondary' ? 'junior'
                                                : 'senior';
                                        const shouldShowButton = isHintButtonVisible(yearLevel);

                                        return shouldShowButton && !showHint && (
                                            <button onClick={handleHint} className="px-4 py-2 rounded bg-yellow-200 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100 font-bold">💡 Hint</button>
                                        );
                                    })()}
                                </div>

                                {showHint && (
                                    <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded text-yellow-900 dark:text-yellow-100 text-sm">{hintContent}</div>
                                )}
                            </div>
                            {/* Answer Input */}
                            <div className={`mb-8 ${getBlockingOverlayClasses(isUserInteractionBlocked)}`}>
                                {settings.questionType === 'input' ? (
                                    <div>
                                        {/** Question type input */}
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            className="w-full p-4 text-xl rounded-xl border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                            placeholder="Type your answer..."
                                            value={userInput}
                                            onChange={e => setUserInput(e.target.value)}
                                            onKeyDown={handleKeyPress}
                                            autoFocus
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {(currentQuestion.options ?? []).map((option, idx) => (
                                            <button
                                                key={option}
                                                className={`w-full p-4 text-xl rounded-xl border-2 font-bold ${selectedOption === idx ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'} border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                                                onClick={() => setSelectedOption(idx)}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Submit Button (used for both mobile and desktop) */}
                            <div className="space-y-4">
                                <button
                                    onClick={handleSubmitAnswer}
                                    disabled={(settings.questionType === 'input'
                                        ? !userInput.trim()
                                        : selectedOption === null)
                                    }
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {currentQuestionIndex >= questions.length - 1 ? '🏁 Finish Quiz' : '➡️ Next Question'}
                                </button>
                                {/* Finish Quiz Button - Show when timer and questions are disabled or set to 0 */}
                                {(!settings.timerEnabled && (!settings.questionsEnabled || settings.numberOfQuestions === 0)) && (
                                    <button
                                        onClick={() => completeQuiz()}
                                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 dark:hover:from-orange-700 dark:hover:to-red-700 transition-all transform hover:scale-105 shadow-lg"
                                    >
                                        🏁 Finish Quiz
                                    </button>
                                )}
                            </div>
                            {/* Challenge Mode Container - Bottom */}
                            {settings.challengeMode && (
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 border-t border-purple-200 dark:border-purple-700 mt-8">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center space-x-2 mb-2">
                                            <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">🏆 Challenge:</span>
                                            <span className="font-bold text-purple-800 dark:text-purple-300 text-sm">{settings.challengeMode}</span>
                                        </div>
                                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                            📋 {getChallengeMode(settings.challengeMode)?.description}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
