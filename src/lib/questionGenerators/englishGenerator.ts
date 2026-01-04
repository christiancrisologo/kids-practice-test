import { Subject, EnglishQuestionType, SubjectQuestionType } from '../../types/quiz';
import { BaseQuestionGenerator } from './baseQuizGenerator';

/**
 * English question generator
 * Extends BaseQuestionGenerator with english-specific topic mappings
 */
export class EnglishQuestionGenerator extends BaseQuestionGenerator {
  protected subject = Subject.ENGLISH;

  /**
   * Map EnglishQuestionType to topic string for template filtering
   */
  protected mapQuestionTypeToTopic(questionType: SubjectQuestionType): string {
    const englishType = questionType as EnglishQuestionType;
    
    switch (englishType) {
      case EnglishQuestionType.VOCABULARY:
        return 'vocabulary';
      case EnglishQuestionType.GRAMMAR:
        return 'grammar';
      case EnglishQuestionType.SYNONYMS:
        return 'synonyms';
      case EnglishQuestionType.ANTONYMS:
        return 'antonyms';
      case EnglishQuestionType.SENTENCE_COMPLETION:
        return 'sentence_completion';
      default:
        return 'all';
    }
  }

  /**
   * Map topic string from template to EnglishQuestionType
   */
  protected mapTopicToQuestionType(topic: string): SubjectQuestionType {
    const topicLower = topic.toLowerCase().replace(/\s+/g, '_');
    
    switch (topicLower) {
      case 'vocabulary':
        return EnglishQuestionType.VOCABULARY;
      case 'grammar':
        return EnglishQuestionType.GRAMMAR;
      case 'synonyms':
        return EnglishQuestionType.SYNONYMS;
      case 'antonyms':
        return EnglishQuestionType.ANTONYMS;
      case 'sentence_completion':
        return EnglishQuestionType.SENTENCE_COMPLETION;
      case 'general':
      default:
        return EnglishQuestionType.VOCABULARY;
    }
  }
}

