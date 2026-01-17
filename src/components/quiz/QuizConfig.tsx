'use client';

import { useState, useEffect } from 'react';
import { Subject, AnswerFormat } from '../../types/quiz';
import { MobileButton } from '../ui/MobileButton';
import { useIsMobile } from '../../utils/responsive';
import { getChallengeModes } from '../../utils/settingsManager';
import { useQuizData } from '../../contexts/quiz-data-context';
import { useQuizStore } from '../../store/quiz-store';

interface QuizConfigProps {
  subject?: Subject; // Optional subject from route parameter
  onConfigComplete: (config: {
    username: string;
    subject: Subject;
    questionTypes: string[];
    answerFormat: AnswerFormat;
    difficulty: 'easy' | 'hard';
    numberOfQuestions: number;
    timerPerQuestion: number;
    yearLevel: 'primary' | 'junior-high' | 'senior-high';
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
const MATH_QUESTION_TYPES = ['basic', 'conversion', 'currency', 'geometry', 'time', 'algebra'];

export function QuizConfig({ subject: routeSubject, onConfigComplete }: QuizConfigProps) {
  const isMobile = useIsMobile();
  const { settings: appSettings } = useQuizData();
  const { currentSubject: subjectFromStore } = useQuizStore();
  const [username, setUsername] = useState('');

  // Get the subject name as string (e.g., 'math', 'science', 'english')
  const subjectName = routeSubject || subjectFromStore;

  // Get current subject configuration from settings
  const getCurrentSubjectConfig = () => {
    if (!appSettings?.subjects) return null;
    return appSettings.subjects.find((s: any) => s.name === subjectName);
  };

  const currentSubjectConfig = getCurrentSubjectConfig();

  // State declarations
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
  const [numberOfQuestions, setNumberOfQuestions] = useState(30);
  const [timerPerQuestion, setTimerPerQuestion] = useState(60);
  const [answerFormat, setAnswerFormat] = useState<AnswerFormat>(AnswerFormat.TEXT);
  const [hasHistory, setHasHistory] = useState(false);
  const [yearLevel, setYearLevel] = useState<'primary' | 'junior-high' | 'senior-high'>('primary');

  // Get available topics for the current year level and subject
  const getAvailableTopics = () => {
    if (!appSettings?.yearLevel || !currentSubjectConfig) {
      return MATH_QUESTION_TYPES;
    }

    // Find the year level configuration
    const yearLevelConfig = appSettings.yearLevel.find((yl: any) => yl.name === yearLevel);
    if (!yearLevelConfig || !yearLevelConfig.subjects) {
      // Fallback to all topics if year level not found
      return currentSubjectConfig.topics || MATH_QUESTION_TYPES;
    }

    // Get allowed topics for this subject and year level
    const allowedTopicNames = yearLevelConfig.subjects[subjectName] || [];

    // Filter topics to only show those allowed for this year level
    const allTopics = currentSubjectConfig.topics || [];
    return allTopics.filter((topic: any) => allowedTopicNames.includes(topic.name));
  };

  const availableTopics = getAvailableTopics();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    availableTopics.map((t: any) => t.name || t)
  ); // Pre-select all available topics

  // Update selected types when subject or year level changes
  useEffect(() => {
    const topics = getAvailableTopics();
    const topicNames = topics.map((t: any) => t.name || t);
    setSelectedTypes(topicNames);
  }, [subjectName, yearLevel]);

  const [showQuizSettings, setShowQuizSettings] = useState(false); // Hidden by default

  // Challenge mode state
  const [selectedChallenge, setSelectedChallenge] = useState<string>('No Challenge');

  // Get challenges from settings manager (fetched source of truth)
  const CHALLENGES = getChallengeModes();

  // Challenge settings (default to "No Challenge" settings)
  const defaultChallengeSettings = CHALLENGES[0]?.settings || {
    timerEnabled: true,
    questionsEnabled: true,
    minCorrectAnswers: 0,
    maxCorrectAnswers: 10,
    correctAnswersEnabled: false,
    minIncorrectAnswers: 0,
    maxIncorrectAnswers: 10,
    incorrectAnswersEnabled: false,
    overallTimerEnabled: false,
    overallTimerDuration: 0
  };
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

  // Get subject from route parameter or Redux store
  const subject = routeSubject || (subjectName as Subject);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-3 sm:p-4">
      <div className={`w-full ${isMobile ? 'max-w-2xl' : 'max-w-3xl'} bg-slate-800/90 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5`}>
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white px-2">{currentSubjectConfig?.label || 'Kids Practice Test'}</h1>
        </div>

        {/* Username Input */}
        <div className="bg-slate-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-700/50">
          <h3 className="text-gray-300 text-sm font-medium mb-3">Your Name</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="itsme"
              className="flex-1 p-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 focus:border-blue-500 focus:outline-none transition-all placeholder-gray-500"
              autoFocus
            />
            <button className="px-5 py-3 rounded-lg bg-slate-700/50 text-white border border-yellow-500/70 hover:bg-slate-600/50 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
              🔄 Reset
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Reset the game to change user</p>
        </div>

        {/* Year Level Selection */}
        <div className="bg-slate-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-700/50">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm sm:text-base">
            🎓 Select Your Year Level
          </h3>
          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3">
            {appSettings?.yearLevel?.map((yl: any) => (
              <button
                key={yl.name}
                onClick={() => setYearLevel(yl.name)}
                className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${yearLevel === yl.name
                  ? 'border-blue-500 bg-slate-700/60'
                  : 'border-slate-600/50 bg-slate-800/40'
                  }`}
              >
                <div className="text-2xl mb-2">
                  {yl.label.includes('Primary') ? '🎒' :
                    yl.label.includes('Junior') ? '📚' : '🎓'}
                </div>
                <div className="text-white font-semibold text-sm mb-1">{yl.label}</div>
                <div className="text-xs text-gray-400">{yl.description}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-blue-400 mt-3 flex items-center gap-1">
            ✨ Settings automatically applied based on year level!
          </p>
        </div>

        {/* Challenge Mode */}
        <div className="bg-slate-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-700/50">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm sm:text-base">
            🏆 Challenge Mode
          </h3>
          <select
            value={selectedChallenge}
            onChange={(e) => handleChallengeChange(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-700/50 text-gray-300 border border-slate-600 focus:border-blue-500 focus:outline-none transition-all text-sm sm:text-base"
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
          className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 transition-all flex items-center justify-center gap-2 text-white font-semibold shadow-lg text-sm sm:text-base"
        >
          ⚙️ Quiz Settings
        </button>

        {/* Collapsible Quiz Settings */}
        {showQuizSettings && (
          <div className="space-y-4 sm:space-y-5">
            {/* Answer Format Selection */}
            <div className="bg-slate-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-700/50">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm sm:text-base">
                🎯 Question Type
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAnswerFormat(AnswerFormat.TEXT)}
                  className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${answerFormat === AnswerFormat.TEXT
                    ? 'border-blue-500 bg-slate-700/60'
                    : 'border-slate-600/50 bg-slate-800/40'
                    }`}
                >
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-white font-semibold text-xs sm:text-sm mb-1">Text input</div>
                  <div className="text-xs text-gray-400">Type in the answer</div>
                </button>
                <button
                  onClick={() => setAnswerFormat(AnswerFormat.MCQ)}
                  className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${answerFormat === AnswerFormat.MCQ
                    ? 'border-blue-500 bg-slate-700/60'
                    : 'border-slate-600/50 bg-slate-800/40'
                    }`}
                >
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-white font-semibold text-xs sm:text-sm mb-1">Multiple Choice</div>
                  <div className="text-xs text-gray-400">Select from the options</div>
                </button>
              </div>
              <p className="text-xs text-blue-400 mt-3 flex items-center gap-1">
                💡 Your year level supports: Multiple Choice
              </p>
            </div>

            {/* Difficulty Selection */}
            <div className="bg-slate-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-700/50">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm sm:text-base">🎚️ Difficulty</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDifficulty('easy')}
                  className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${difficulty === 'easy'
                    ? 'border-blue-500 bg-slate-700/60'
                    : 'border-slate-600/50 bg-slate-800/40'
                    }`}
                >
                  <div className="text-2xl mb-2">🟢</div>
                  <div className="text-white font-semibold text-xs sm:text-sm mb-1">Easy</div>
                  <div className="text-xs text-gray-400">Basic and common questions</div>
                </button>
                <button
                  onClick={() => setDifficulty('hard')}
                  className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${difficulty === 'hard'
                    ? 'border-blue-500 bg-slate-700/60'
                    : 'border-slate-600/50 bg-slate-800/40'
                    }`}
                >
                  <div className="text-2xl mb-2">🔴</div>
                  <div className="text-white font-semibold text-xs sm:text-sm mb-1">Hard</div>
                  <div className="text-xs text-gray-400">Complex and advance questions</div>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3">Selected: {difficulty.toUpperCase()}</p>
            </div>

            {/* Topics (Question Types) */}
            <div className="bg-slate-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-700/50">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm sm:text-base">
                {subjectName === 'science' ? '🔬 Topics (Select Multiple)' :
                  subjectName === 'english' ? '📚 Topics (Select Multiple)' :
                    '🔢 Number Types (Select Multiple)'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableTopics.map((topic: any) => {
                  const topicName = topic.name || topic;
                  const topicLabel = topic.label || formatLabel(topicName);
                  const topicDescription = topic.description || '';

                  // Get icon based on topic name
                  const getTopicIcon = (name: string) => {
                    const lowerName = name.toLowerCase();
                    // Science icons
                    if (lowerName === 'general') return '🔬';
                    if (lowerName === 'biology') return '🧬';
                    if (lowerName === 'chemistry') return '⚗️';
                    if (lowerName === 'physics') return '⚛️';
                    if (lowerName.includes('earth')) return '🌍';
                    // Math icons
                    if (lowerName === 'basic') return '🔢';
                    if (lowerName === 'conversion') return '🔶';
                    if (lowerName === 'currency') return '💰';
                    if (lowerName === 'geometry') return '🔳';
                    if (lowerName === 'time') return '⏰';
                    if (lowerName === 'algebra') return '🧮';
                    // English icons
                    if (lowerName === 'vocabulary') return '📖';
                    if (lowerName === 'grammar') return '✍️';
                    if (lowerName === 'synonyms') return '🔄';
                    if (lowerName === 'antonyms') return '↔️';
                    if (lowerName.includes('sentence')) return '📝';
                    return '📚';
                  };

                  return (
                    <button
                      key={topicName}
                      onClick={() => handleTypeToggle(topicName)}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${selectedTypes.includes(topicName)
                        ? 'border-blue-500 bg-slate-700/60'
                        : 'border-slate-600/50 bg-slate-800/40'
                        }`}
                    >
                      <div className="text-xl sm:text-2xl mb-2">{getTopicIcon(topicName)}</div>
                      <div className="text-white font-semibold text-xs sm:text-sm mb-1">{topicLabel}</div>
                      {topicDescription && (
                        <div className="text-xs text-gray-400 line-clamp-2">{topicDescription}</div>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Selected: {selectedTypes.map(t => {
                  const topic = availableTopics.find((at: any) => (at.name || at) === t);
                  return (typeof topic === 'object' && topic?.label) ? topic.label : formatLabel(t);
                }).join(', ')}
              </p>
            </div>

            {/* Game Mechanics */}
            <div className="bg-slate-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-700/50">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm sm:text-base">
                🎮 Game Mechanics
              </h3>

              {/* Timer Settings Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-red-500">🔴</span>
                <span className="text-white font-medium text-sm sm:text-base">Timer Settings</span>
              </div>

              {/* Number of Questions */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-green-400 flex-shrink-0">📊</span>
                    <span className="text-white text-xs sm:text-sm truncate">Number of Questions</span>
                  </div>
                  <button
                    onClick={() => setQuestionsEnabled(!questionsEnabled)}
                    className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ${questionsEnabled ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${questionsEnabled ? 'ml-6' : 'ml-1'
                      }`} />
                  </button>
                </div>
                {questionsEnabled && (
                  <input
                    type="number"
                    value={Number.isFinite(numberOfQuestions) ? numberOfQuestions : ''}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setNumberOfQuestions(Number.isFinite(v) ? v : 10);
                    }}
                    min="5"
                    max="50"
                    className="w-full p-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                  />
                )}
              </div>

              {/* Timer per Question */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-red-500 flex-shrink-0">🔴</span>
                    <span className="text-white text-xs sm:text-sm truncate">Timer per Question</span>
                  </div>
                  <button
                    onClick={() => setTimerEnabled(!timerEnabled)}
                    className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ${timerEnabled ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${timerEnabled ? 'ml-6' : 'ml-1'
                      }`} />
                  </button>
                </div>
                {timerEnabled && (
                  <input
                    type="number"
                    value={Number.isFinite(timerPerQuestion) ? timerPerQuestion : ''}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setTimerPerQuestion(Number.isFinite(v) ? v : 60);
                    }}
                    min="5"
                    max="120"
                    className="w-full p-3 rounded-lg bg-slate-700/50 text-white border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                  />
                )}
              </div>

              {/* Overall Game Timer */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-red-500 flex-shrink-0">🔴</span>
                      <span className="text-white text-xs sm:text-sm">Overall Game Timer</span>
                    </div>
                    <p className="text-xs text-gray-400">Set a time limit for the entire quiz</p>
                  </div>
                  <button
                    onClick={() => setOverallTimerEnabled(!overallTimerEnabled)}
                    className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ${overallTimerEnabled ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${overallTimerEnabled ? 'ml-6' : 'ml-1'
                      }`} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-blue-400 mb-4 flex items-center gap-1 flex-wrap">
                💡 🔴 Primary School settings: 5 questions, 12s per question
              </p>

              {/* Correct Answers Goal */}
              <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 mb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-green-400 flex-shrink-0">✅</span>
                      <span className="text-white text-xs sm:text-sm font-medium">Correct Answers Goal</span>
                    </div>
                    <p className="text-xs text-gray-400">End quiz when reaching this range of correct answers</p>
                  </div>
                  <button
                    onClick={() => setCorrectAnswersEnabled(!correctAnswersEnabled)}
                    className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ${correctAnswersEnabled ? 'bg-blue-500' : 'bg-gray-600'
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
              <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-red-400 flex-shrink-0">❌</span>
                      <span className="text-white text-xs sm:text-sm font-medium">Incorrect Answers Limit</span>
                    </div>
                    <p className="text-xs text-gray-400">End quiz when reaching this range of incorrect answers</p>
                  </div>
                  <button
                    onClick={() => setIncorrectAnswersEnabled(!incorrectAnswersEnabled)}
                    className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ${incorrectAnswersEnabled ? 'bg-blue-500' : 'bg-gray-600'
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
            <div className="bg-slate-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-700/50">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2 text-sm sm:text-base">
                ⚙️ System Settings
              </h3>
              <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3">
                <button className="p-3 sm:p-4 rounded-xl border-2 border-slate-600/50 bg-slate-800/40 transition-all">
                  <div className="text-xl sm:text-2xl mb-2">🖥️</div>
                  <div className="text-white font-semibold text-xs sm:text-sm mb-1">System theme</div>
                  <div className="text-xs text-gray-400">Tap to cycle themes</div>
                </button>
                <button className="p-3 sm:p-4 rounded-xl border-2 border-blue-500 bg-slate-700/60 transition-all">
                  <div className="text-xl sm:text-2xl mb-2">✨</div>
                  <div className="text-white font-semibold text-xs sm:text-sm mb-1">Animations ON</div>
                  <div className="text-xs text-gray-400">Tap to turn off</div>
                </button>
                <button className="p-3 sm:p-4 rounded-xl border-2 border-blue-500 bg-slate-700/60 transition-all">
                  <div className="text-xl sm:text-2xl mb-2">🔊</div>
                  <div className="text-white font-semibold text-xs sm:text-sm mb-1">Sounds ON</div>
                  <div className="text-xs text-gray-400">Tap to turn off</div>
                </button>
              </div>
              <p className="text-xs text-yellow-400 mt-3 flex items-center gap-1 flex-wrap">
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
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 sm:py-5 rounded-xl shadow-lg text-base sm:text-lg"
          disabled={!username.trim()}
        >
          🚀 Start Quiz!
        </MobileButton>

        {/* View History Button */}
        {hasHistory && (
          <button
            onClick={() => window.location.href = '/history'}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
          >
            📊 View History
          </button>
        )}
      </div>
    </div >
  );
}

