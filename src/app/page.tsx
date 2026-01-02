'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizConfig } from '../components/quiz/QuizConfig';
import { useQuizStore } from '../store/quiz-store';
import { Subject, AnswerFormat, SubjectQuestionType, Question } from '../types/quiz';
import { getQuestionGenerator } from '../lib/questionGenerators';

interface QuizConfigType {
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
}

export default function Home() {
  const router = useRouter();
  const { setCurrentSubject, updateSettings, setQuestions: setStoreQuestions } = useQuizStore();

  // Load subject from query parameter on initial mount (only on index page)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subjectParam = urlParams.get('subject');

    let subject: Subject = Subject.MATH; // Default to math

    if (subjectParam === 'science') {
      subject = Subject.SCIENCE;
    } else if (subjectParam === 'english') {
      subject = Subject.ENGLISH;
    }

    // Store subject in Redux store
    setCurrentSubject(subject);
  }, [setCurrentSubject]); // Empty dependency array - only run on mount

  const handleConfigComplete = (config: QuizConfigType) => {
    // Generate questions
    const generator = getQuestionGenerator(config.subject);
    const allQuestions: Question[] = [];
    const questionsPerType = Math.ceil(config.numberOfQuestions / config.questionTypes.length);

    config.questionTypes.forEach(type => {
      const typeQuestions = generator.generate({
        count: questionsPerType,
        difficulty: config.difficulty,
        questionType: type as SubjectQuestionType,
        answerFormat: config.answerFormat
      });
      allQuestions.push(...typeQuestions);
    });

    // Shuffle and limit to requested number
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const finalQuestions = shuffled.slice(0, config.numberOfQuestions);

    // Update store questions

    setStoreQuestions(finalQuestions as any);

    // Update store settings with username
    updateSettings({
      username: config.username,
      subject: config.subject,
      subjectQuestionTypes: config.questionTypes as SubjectQuestionType[],
      answerFormat: config.answerFormat,
      questionType: config.answerFormat === AnswerFormat.MCQ ? 'mcq' : 'text',
      difficulty: config.difficulty as 'easy' | 'hard',
      numberOfQuestions: config.numberOfQuestions,
      timerPerQuestion: config.timerPerQuestion,
      yearLevel: config.yearLevel,
      // Challenge settings
      timerEnabled: config.timerEnabled,
      questionsEnabled: config.questionsEnabled,
      minCorrectAnswers: config.minCorrectAnswers,
      maxCorrectAnswers: config.maxCorrectAnswers,
      correctAnswersEnabled: config.correctAnswersEnabled,
      minIncorrectAnswers: config.minIncorrectAnswers,
      maxIncorrectAnswers: config.maxIncorrectAnswers,
      incorrectAnswersEnabled: config.incorrectAnswersEnabled,
      overallTimerEnabled: config.overallTimerEnabled,
      overallTimerDuration: config.overallTimerDuration,
      challengeMode: config.challengeMode
    });

    // Navigate to quiz page (subject is already in Redux store)
    router.push('quiz');
  };

  return <QuizConfig onConfigComplete={handleConfigComplete} />;
}
