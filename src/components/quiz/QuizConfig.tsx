'use client';

import { useState, useEffect } from 'react';
import { Subject, AnswerFormat } from '../../types/quiz';
import { MobileButton } from '../ui/MobileButton';
import { useIsMobile } from '../../utils/responsive';
import { getQuizDataSource } from '../../utils/systemConfig';
import settings from '../../configs/settings.json';

interface QuizConfigProps {
  subject?: Subject; // Optional subject from route parameter
  onConfigComplete: (config: {
    username: string;
    subject: Subject;
    questionTypes: string[];
    answerFormat: AnswerFormat;
    difficulty: 'easy' | 'medium' | 'hard';
    numberOfQuestions: number;
    timerPerQuestion: number;
    yearLevel: 'primary' | 'secondary' | 'high';
    // Challenge settings
    timerEnabled: boolean;
    questionsEnabled: boolean;
    minCorrectAnswers: number;
    maxCorrectAnswers: number;
    correctAnswersEnabled: boolean;
    minIncorrectAnswers: number;
    maxIncorrectAnswers: number;
    incorrectAnswersEnabled: boolean;
    overallTimerEnabled: boolean;
    overallTimerDuration: number;
    challengeMode?: string;
  }) => void;
}

// Math question types from math.json
const MATH_QUESTION_TYPES = ['basic', 'conversion', 'currency', 'geometry', 'time'];

// Load challenges from settings.json
const CHALLENGES = settings.challenges;

export function QuizConfig({ subject: routeSubject, onConfigComplete }: QuizConfigProps) {
  const isMobile = useIsMobile();
  const [username, setUsername] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(MATH_QUESTION_TYPES); // Pre-select all types
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [timerPerQuestion, setTimerPerQuestion] = useState(20);
  const [answerFormat, setAnswerFormat] = useState<AnswerFormat>(AnswerFormat.INPUT);
  const [hasHistory, setHasHistory] = useState(false);
  const [yearLevel, setYearLevel] = useState<'primary' | 'secondary' | 'high'>('primary');
  const [showQuizSettings, setShowQuizSettings] = useState(false); // Hidden by default

  // Challenge mode state
  const [selectedChallenge, setSelectedChallenge] = useState<string>('No Challenge');

  // Challenge settings (default to "No Challenge" settings)
  const defaultChallengeSettings = CHALLENGES[0].settings;
  const [timerEnabled, setTimerEnabled] = useState(defaultChallengeSettings.timerEnabled);
  const [questionsEnabled, setQuestionsEnabled] = useState(defaultChallengeSettings.questionsEnabled);
  const [minCorrectAnswers, setMinCorrectAnswers] = useState(defaultChallengeSettings.minCorrectAnswers);
  const [maxCorrectAnswers, setMaxCorrectAnswers] = useState(defaultChallengeSettings.maxCorrectAnswers);
  const [correctAnswersEnabled, setCorrectAnswersEnabled] = useState(defaultChallengeSettings.correctAnswersEnabled);
  const [minIncorrectAnswers, setMinIncorrectAnswers] = useState(defaultChallengeSettings.minIncorrectAnswers);
  const [maxIncorrectAnswers, setMaxIncorrectAnswers] = useState(defaultChallengeSettings.maxIncorrectAnswers);
  const [incorrectAnswersEnabled, setIncorrectAnswersEnabled] = useState(defaultChallengeSettings.incorrectAnswersEnabled);
  const [overallTimerEnabled, setOverallTimerEnabled] = useState(defaultChallengeSettings.overallTimerEnabled);
  const [overallTimerDuration, setOverallTimerDuration] = useState(defaultChallengeSettings.overallTimerDuration);

  // Get subject from route parameter or system config
  const subject = routeSubject || (getQuizDataSource() as Subject);

  // Load username from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('quiz-username');
    if (savedUsername) {
      setUsername(savedUsername);
    }

    // Check if there's history in localStorage
    const history = localStorage.getItem('quizHistory');
    setHasHistory(!!history && JSON.parse(history).length > 0);
  }, []);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Handle challenge selection
  const handleChallengeChange = (challengeName: string) => {
    setSelectedChallenge(challengeName);

    // Find the challenge settings
    const challenge = CHALLENGES.find(c => c.name === challengeName);
    if (!challenge) return;

    const settings = challenge.settings;

    // Apply challenge settings
    setTimerEnabled(settings.timerEnabled);
    setQuestionsEnabled(settings.questionsEnabled);
    setMinCorrectAnswers(settings.minCorrectAnswers);
    setMaxCorrectAnswers(settings.maxCorrectAnswers);
    setCorrectAnswersEnabled(settings.correctAnswersEnabled);
    setMinIncorrectAnswers(settings.minIncorrectAnswers);
    setMaxIncorrectAnswers(settings.maxIncorrectAnswers);
    setIncorrectAnswersEnabled(settings.incorrectAnswersEnabled);
    setOverallTimerEnabled(settings.overallTimerEnabled);
    setOverallTimerDuration(settings.overallTimerDuration);

    // Apply numberOfQuestions and timerPerQuestion if they exist in challenge settings
    if ('numberOfQuestions' in settings) {
      setNumberOfQuestions(settings.numberOfQuestions as number);
    }
    if ('timerPerQuestion' in settings) {
      setTimerPerQuestion(settings.timerPerQuestion as number);
    }
  };

  const handleSubmit = () => {
    if (!username.trim()) {
      alert('Please enter your name');
      return;
    }

    if (selectedTypes.length === 0) {
      alert('Please select at least one question type');
      return;
    }

    // Save username to localStorage
    localStorage.setItem('quiz-username', username.trim());

    onConfigComplete({
      username: username.trim(),
      subject,
      questionTypes: selectedTypes,
      answerFormat,
      difficulty,
      numberOfQuestions,
      timerPerQuestion,
      yearLevel,
      // Challenge settings
      timerEnabled,
      questionsEnabled,
      minCorrectAnswers,
      maxCorrectAnswers,
      correctAnswersEnabled,
      minIncorrectAnswers,
      maxIncorrectAnswers,
      incorrectAnswersEnabled,
      overallTimerEnabled,
      overallTimerDuration,
      challengeMode: selectedChallenge
    });
  };

  const formatLabel = (str: string) => {
    return str.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className={`w-full ${isMobile ? 'max-w-2xl' : 'max-w-3xl'} bg-slate-800/90 rounded-3xl shadow-2xl p-8 space-y-5`}>
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-white">Kids Practice Test</h1>
        </div>

        {/* Username Input */}
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
          <h3 className="text-gray-300 text-sm font-medium mb-3">Your Name</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="itsme"
              className="flex-1 p-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 focus:border-blue-500 focus:outline-none transition-all placeholder-gray-500"
              autoFocus
            />
            <button className="px-5 py-3 rounded-lg bg-slate-700/50 text-white border border-yellow-500/70 hover:bg-slate-600/50 transition-all flex items-center gap-2">
              🔄 Reset
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Reset the game to change user</p>
        </div>

        {/* Year Level Selection */}
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            🎓 Select Your Year Level
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setYearLevel('primary')}
              className={`p-5 rounded-xl border-2 transition-all ${yearLevel === 'primary'
                ? 'border-blue-500 bg-slate-700/60'
                : 'border-slate-600/50 bg-slate-800/40'
                }`}
            >
              <div className="text-2xl mb-2">🔴</div>
              <div className="text-white font-semibold text-sm mb-1">Primary School</div>
              <div className="text-xs text-gray-400">Basic math for young learners</div>
            </button>
            <button
              onClick={() => setYearLevel('secondary')}
              className={`p-5 rounded-xl border-2 transition-all ${yearLevel === 'secondary'
                ? 'border-blue-500 bg-slate-700/60'
                : 'border-slate-600/50 bg-slate-800/40'
                }`}
            >
              <div className="text-2xl mb-2">🎓</div>
              <div className="text-white font-semibold text-sm mb-1">Junior High School</div>
              <div className="text-xs text-gray-400">Intermediate math concepts</div>
            </button>
            <button
              onClick={() => setYearLevel('high')}
              className={`p-5 rounded-xl border-2 transition-all ${yearLevel === 'high'
                ? 'border-blue-500 bg-slate-700/60'
                : 'border-slate-600/50 bg-slate-800/40'
                }`}
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-white font-semibold text-sm mb-1">Senior High School</div>
              <div className="text-xs text-gray-400">Advanced math challenges</div>
            </button>
          </div>
          <p className="text-xs text-blue-400 mt-3 flex items-center gap-1">
            ✨ Settings automatically applied for 🔴 Primary School!
          </p>
        </div>

        {/* Challenge Mode */}
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            🏆 Challenge Mode
          </h3>
          <select
            value={selectedChallenge}
            onChange={(e) => handleChallengeChange(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-700/50 text-gray-300 border border-slate-600 focus:border-blue-500 focus:outline-none transition-all"
          >
            {CHALLENGES.map((challenge) => (
              <option key={challenge.name} value={challenge.name}>
                {challenge.name}
              </option>
            ))}
          </select>
          {selectedChallenge !== 'No Challenge' && (
            <p className="text-xs text-yellow-400 mt-3 flex items-center gap-1">
              ⚡ {CHALLENGES.find(c => c.name === selectedChallenge)?.description}
            </p>
          )}
        </div>

        {/* Quiz Settings Toggle Button */}
        <button
          onClick={() => setShowQuizSettings(!showQuizSettings)}
          className="w-full p-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 transition-all flex items-center justify-center gap-2 text-white font-semibold shadow-lg"
        >
          ⚙️ Quiz Settings
        </button>

        {/* Collapsible Quiz Settings */}
        {showQuizSettings && (
          <div className="space-y-5">
            {/* Answer Format Selection */}
            <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                🎯 Question Type
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAnswerFormat(AnswerFormat.INPUT)}
                  className={`p-5 rounded-xl border-2 transition-all ${answerFormat === AnswerFormat.INPUT
                    ? 'border-blue-500 bg-slate-700/60'
                    : 'border-slate-600/50 bg-slate-800/40'
                    }`}
                >
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-white font-semibold text-sm mb-1">Math Expression</div>
                  <div className="text-xs text-gray-400">e.g., 4 + 3 = ?</div>
                </button>
                <button
                  onClick={() => setAnswerFormat(AnswerFormat.MULTIPLE_CHOICE)}
                  className={`p-5 rounded-xl border-2 transition-all ${answerFormat === AnswerFormat.MULTIPLE_CHOICE
                    ? 'border-blue-500 bg-slate-700/60'
                    : 'border-slate-600/50 bg-slate-800/40'
                    }`}
                >
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-white font-semibold text-sm mb-1">Multiple Choice</div>
                  <div className="text-xs text-gray-400">3 options</div>
                </button>
              </div>
              <p className="text-xs text-blue-400 mt-3 flex items-center gap-1">
                💡 Your year level supports: Multiple Choice
              </p>
            </div>

            {/* Number Types (Question Types) */}
            <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                🔢 Number Types (Select Multiple)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {['basic', 'conversion', 'currency'].map(type => (
                  <button
                    key={type}
                    onClick={() => handleTypeToggle(type)}
                    className={`p-4 rounded-xl border-2 transition-all ${selectedTypes.includes(type)
                      ? 'border-blue-500 bg-slate-700/60'
                      : 'border-slate-600/50 bg-slate-800/40'
                      }`}
                  >
                    <div className="text-2xl mb-2">
                      {type === 'basic' ? '🔢' : type === 'conversion' ? '🔶' : '💰'}
                    </div>
                    <div className="text-white font-semibold text-sm mb-1">{formatLabel(type)}</div>
                    <div className="text-xs text-gray-400">
                      {type === 'basic' ? 'Whole numbers (1, 2, 3...)' :
                        type === 'conversion' ? 'Decimal numbers (1.5, 2.25...)' :
                          'Money calculations ($1.50, $2.25...)'}
                    </div>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {['geometry', 'time'].map(type => (
                  <button
                    key={type}
                    onClick={() => handleTypeToggle(type)}
                    className={`p-4 rounded-xl border-2 transition-all ${selectedTypes.includes(type)
                      ? 'border-blue-500 bg-slate-700/60'
                      : 'border-slate-600/50 bg-slate-800/40'
                      }`}
                  >
                    <div className="text-2xl mb-2">
                      {type === 'geometry' ? '🔳' : '⏰'}
                    </div>
                    <div className="text-white font-semibold text-sm mb-1">{formatLabel(type)}</div>
                    <div className="text-xs text-gray-400">
                      {type === 'geometry' ? 'Fraction numbers (1/2, 3/4...)' : 'Time calculations (1:30, 2:45...)'}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">Selected: {selectedTypes.join(', ')}</p>
              <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                💡 🔴 Primary School includes: Integers
              </p>
            </div>

            {/* Game Mechanics */}
            <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                🎮 Game Mechanics
              </h3>

              {/* Timer Settings Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-red-500">🔴</span>
                <span className="text-white font-medium">Timer Settings</span>
              </div>

              {/* Number of Questions */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">📊</span>
                    <span className="text-white text-sm">Number of Questions</span>
                  </div>
                  <button
                    onClick={() => setQuestionsEnabled(!questionsEnabled)}
                    className={`w-12 h-6 rounded-full transition-all ${questionsEnabled ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${questionsEnabled ? 'ml-6' : 'ml-1'
                      }`} />
                  </button>
                </div>
                {questionsEnabled && (
                  <input
                    type="number"
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 10)}
                    min="5"
                    max="50"
                    className="w-full p-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Timer per Question */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">🔴</span>
                    <span className="text-white text-sm">Timer per Question</span>
                  </div>
                  <button
                    onClick={() => setTimerEnabled(!timerEnabled)}
                    className={`w-12 h-6 rounded-full transition-all ${timerEnabled ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${timerEnabled ? 'ml-6' : 'ml-1'
                      }`} />
                  </button>
                </div>
                {timerEnabled && (
                  <input
                    type="number"
                    value={timerPerQuestion}
                    onChange={(e) => setTimerPerQuestion(parseInt(e.target.value) || 20)}
                    min="5"
                    max="120"
                    className="w-full p-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Overall Game Timer */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-red-500">🔴</span>
                      <span className="text-white text-sm">Overall Game Timer</span>
                    </div>
                    <p className="text-xs text-gray-400">Set a time limit for the entire quiz</p>
                  </div>
                  <button
                    onClick={() => setOverallTimerEnabled(!overallTimerEnabled)}
                    className={`w-12 h-6 rounded-full transition-all ${overallTimerEnabled ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${overallTimerEnabled ? 'ml-6' : 'ml-1'
                      }`} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-blue-400 mb-4 flex items-center gap-1">
                💡 🔴 Primary School settings: 5 questions, 12s per question
              </p>

              {/* Correct Answers Goal */}
              <div className="bg-slate-800/50 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-green-400">✅</span>
                      <span className="text-white text-sm font-medium">Correct Answers Goal</span>
                    </div>
                    <p className="text-xs text-gray-400">End quiz when reaching this range of correct answers</p>
                  </div>
                  <button
                    onClick={() => setCorrectAnswersEnabled(!correctAnswersEnabled)}
                    className={`w-12 h-6 rounded-full transition-all ${correctAnswersEnabled ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${correctAnswersEnabled ? 'ml-6' : 'ml-1'
                      }`} />
                  </button>
                </div>
                {!correctAnswersEnabled && (
                  <p className="text-center text-gray-500 text-sm mt-3">Toggle to enable</p>
                )}
              </div>

              {/* Incorrect Answers Limit */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-red-400">❌</span>
                      <span className="text-white text-sm font-medium">Incorrect Answers Limit</span>
                    </div>
                    <p className="text-xs text-gray-400">End quiz when reaching this range of incorrect answers</p>
                  </div>
                  <button
                    onClick={() => setIncorrectAnswersEnabled(!incorrectAnswersEnabled)}
                    className={`w-12 h-6 rounded-full transition-all ${incorrectAnswersEnabled ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${incorrectAnswersEnabled ? 'ml-6' : 'ml-1'
                      }`} />
                  </button>
                </div>
                {!incorrectAnswersEnabled && (
                  <p className="text-center text-gray-500 text-sm mt-3">Toggle to enable</p>
                )}
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                ⚙️ System Settings
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button className="p-4 rounded-xl border-2 border-slate-600/50 bg-slate-800/40 transition-all">
                  <div className="text-2xl mb-2">🖥️</div>
                  <div className="text-white font-semibold text-sm mb-1">System theme</div>
                  <div className="text-xs text-gray-400">Tap to cycle themes</div>
                </button>
                <button className="p-4 rounded-xl border-2 border-blue-500 bg-slate-700/60 transition-all">
                  <div className="text-2xl mb-2">✨</div>
                  <div className="text-white font-semibold text-sm mb-1">Animations ON</div>
                  <div className="text-xs text-gray-400">Tap to turn off</div>
                </button>
                <button className="p-4 rounded-xl border-2 border-blue-500 bg-slate-700/60 transition-all">
                  <div className="text-2xl mb-2">🔊</div>
                  <div className="text-white font-semibold text-sm mb-1">Sounds ON</div>
                  <div className="text-xs text-gray-400">Tap to turn off</div>
                </button>
              </div>
              <p className="text-xs text-yellow-400 mt-3 flex items-center gap-1">
                💡 Settings are saved automatically and persist across sessions
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <MobileButton
          onClick={handleSubmit}
          variant="primary"
          size="lg"
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-5 rounded-xl shadow-lg text-lg"
          disabled={!username.trim()}
        >
          🚀 Start Quiz!
        </MobileButton>

        {/* View History Button */}
        {hasHistory && (
          <button
            onClick={() => window.location.href = '/history'}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            📊 View History
          </button>
        )}
      </div>
    </div >
  );
}

