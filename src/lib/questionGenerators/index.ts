// Question generator exports
export { MathQuestionGenerator } from './mathGenerator';
export { BaseQuestionGenerator } from './baseQuizGenerator';
export { ScienceQuestionGenerator } from './scienceGenerator';
export { EnglishQuestionGenerator } from './englishGenerator';
export { HistoryQuestionGenerator } from './historyGenerator';

import { MathQuestionGenerator } from './mathGenerator';
import { ScienceQuestionGenerator } from './scienceGenerator';
import { EnglishQuestionGenerator } from './englishGenerator';
import { HistoryQuestionGenerator } from './historyGenerator';
import { Subject, QuestionGenerator } from '../../types/quiz';

/**
 * Factory function to get the appropriate question generator for a subject
 */
export function getQuestionGenerator(subject: Subject): QuestionGenerator {
  switch (subject) {
    case Subject.MATH:
      return new MathQuestionGenerator();
    case Subject.SCIENCE:
      return new ScienceQuestionGenerator();
    case Subject.ENGLISH:
      return new EnglishQuestionGenerator();
    case Subject.HISTORY:
      return new HistoryQuestionGenerator();
    default:
      throw new Error(`Unknown subject: ${subject}`);
  }
}

