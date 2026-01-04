import { Subject, HistoryQuestionType, SubjectQuestionType } from '../../types/quiz';
import { BaseQuestionGenerator } from './baseQuizGenerator';

/**
 * History question generator
 * Extends BaseQuestionGenerator with history-specific topic mappings
 */
export class HistoryQuestionGenerator extends BaseQuestionGenerator {
  protected subject = Subject.HISTORY;

  /**
   * Map HistoryQuestionType to topic string for template filtering
   */
  protected mapQuestionTypeToTopic(questionType: SubjectQuestionType): string {
    const historyType = questionType as HistoryQuestionType;
    
    switch (historyType) {
      case HistoryQuestionType.GENERAL:
        return 'general';
      case HistoryQuestionType.WORLD_HISTORY:
        return 'world_history';
      case HistoryQuestionType.US_HISTORY:
        return 'us_history';
      case HistoryQuestionType.ANCIENT_HISTORY:
        return 'ancient_history';
      case HistoryQuestionType.MODERN_HISTORY:
        return 'modern_history';
      default:
        return 'all';
    }
  }

  /**
   * Map topic string from template to HistoryQuestionType
   */
  protected mapTopicToQuestionType(topic: string): SubjectQuestionType {
    const topicLower = topic.toLowerCase().replace(/\s+/g, '_');
    
    switch (topicLower) {
      case 'general':
        return HistoryQuestionType.GENERAL;
      case 'world_history':
        return HistoryQuestionType.WORLD_HISTORY;
      case 'us_history':
        return HistoryQuestionType.US_HISTORY;
      case 'ancient_history':
        return HistoryQuestionType.ANCIENT_HISTORY;
      case 'modern_history':
        return HistoryQuestionType.MODERN_HISTORY;
      default:
        return HistoryQuestionType.GENERAL;
    }
  }
}

