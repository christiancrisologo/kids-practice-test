// Question generator exports
export { MathQuestionGenerator } from './mathGenerator';
export { ScienceQuestionGenerator } from './scienceGenerator';
export { EnglishQuestionGenerator } from './englishGenerator';

import { MathQuestionGenerator } from './mathGenerator';
import { ScienceQuestionGenerator } from './scienceGenerator';
import { EnglishQuestionGenerator } from './englishGenerator';
import { Subject, QuestionGenerator } from '../../types/quiz';

export function getQuestionGenerator(subject: Subject): QuestionGenerator {
  switch (subject) {
    case Subject.MATH:
      return new MathQuestionGenerator();
    case Subject.SCIENCE:
      return new ScienceQuestionGenerator();
    case Subject.ENGLISH:
      return new EnglishQuestionGenerator();
    default:
      throw new Error(`Unknown subject: ${subject}`);
  }
}

