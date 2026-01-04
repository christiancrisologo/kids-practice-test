import { Subject, ScienceQuestionType, SubjectQuestionType } from '../../types/quiz';
import { BaseQuestionGenerator } from './baseQuizGenerator';

/**
 * Science question generator
 * Extends BaseQuestionGenerator with science-specific topic mappings
 */
export class ScienceQuestionGenerator extends BaseQuestionGenerator {
  protected subject = Subject.SCIENCE;

  /**
   * Map ScienceQuestionType to topic string for template filtering
   */
  protected mapQuestionTypeToTopic(questionType: SubjectQuestionType): string {
    const scienceType = questionType as ScienceQuestionType;
    
    switch (scienceType) {
      case ScienceQuestionType.BIOLOGY:
        return 'biology';
      case ScienceQuestionType.CHEMISTRY:
        return 'chemistry';
      case ScienceQuestionType.PHYSICS:
        return 'physics';
      case ScienceQuestionType.EARTH_SPACE:
        return 'earth_space';
      case ScienceQuestionType.BASIC_FACTS:
      default:
        return 'all';
    }
  }

  /**
   * Map topic string from template to ScienceQuestionType
   */
  protected mapTopicToQuestionType(topic: string): SubjectQuestionType {
    const topicLower = topic.toLowerCase().replace(/\s+/g, '_');
    
    switch (topicLower) {
      case 'biology':
        return ScienceQuestionType.BIOLOGY;
      case 'chemistry':
        return ScienceQuestionType.CHEMISTRY;
      case 'physics':
        return ScienceQuestionType.PHYSICS;
      case 'earth_space':
      case 'earth_and_space':
        return ScienceQuestionType.EARTH_SPACE;
      case 'general':
      default:
        return ScienceQuestionType.BASIC_FACTS;
    }
  }
}

