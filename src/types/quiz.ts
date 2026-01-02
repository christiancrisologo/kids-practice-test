// Core type definitions for multi-subject practice test

export enum Subject {
  MATH = 'math',
  SCIENCE = 'science',
  ENGLISH = 'english'
}

export enum MathQuestionType {
  ADDITION = 'addition',
  SUBTRACTION = 'subtraction',
  MULTIPLICATION = 'multiplication',
  DIVISION = 'division',
  FRACTIONS = 'fractions',
  ALGEBRAIC = 'algebraic'
}

export enum ScienceQuestionType {
  BASIC_FACTS = 'basic_facts',
  BIOLOGY = 'biology',
  CHEMISTRY = 'chemistry',
  PHYSICS = 'physics',
  EARTH_SPACE = 'earth_space'
}

export enum EnglishQuestionType {
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  SYNONYMS = 'synonyms',
  ANTONYMS = 'antonyms',
  SENTENCE_COMPLETION = 'sentence_completion'
}

export type SubjectQuestionType =
  | MathQuestionType
  | ScienceQuestionType
  | EnglishQuestionType;

export enum AnswerFormat {
  TEXT = 'text',
  MCQ = 'mcq'
}

export interface BaseQuestion {
  id: string | number;
  subject: Subject;
  questionType: SubjectQuestionType;
  answerFormat: AnswerFormat;
  question: string;
  answer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  timeSpent?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  answerFormat: AnswerFormat.MCQ;
  options: string[];
}

export interface InputQuestion extends BaseQuestion {
  answerFormat: AnswerFormat.TEXT;
  placeholder?: string;
}

export interface MathQuestion extends BaseQuestion {
  subject: Subject.MATH;
  questionType: MathQuestionType;
  operands?: number[];
  operator?: string;
  showWork?: boolean;
  hint?: string;
  type?: string;
  level?: string;
  formula?: string;
  variables?: Record<string, number>;
  options?: string[];
}

export interface ScienceQuestion extends BaseQuestion {
  subject: Subject.SCIENCE;
  questionType: ScienceQuestionType;
  category?: string;
  hint?: string;
}

export interface EnglishQuestion extends BaseQuestion {
  subject: Subject.ENGLISH;
  questionType: EnglishQuestionType;
  word?: string;
  definition?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export type Question =
  | MathQuestion
  | ScienceQuestion
  | EnglishQuestion
  | MultipleChoiceQuestion
  | InputQuestion;

export interface QuizConfig {
  subject: Subject;
  questionTypes: SubjectQuestionType[];
  answerFormat: AnswerFormat;
  numberOfQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timerPerQuestion?: number;
  timerEnabled?: boolean;
}

export interface QuestionGeneratorOptions {
  count: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: SubjectQuestionType;
  answerFormat: AnswerFormat;
}

export interface QuestionGenerator {
  generate(options: QuestionGeneratorOptions): Question[];
  validateAnswer(question: Question, userAnswer: string): boolean;
}

