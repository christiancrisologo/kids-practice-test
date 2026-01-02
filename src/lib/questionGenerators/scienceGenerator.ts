import {
  Question,
  QuestionGenerator,
  QuestionGeneratorOptions,
  Subject,
  ScienceQuestionType,
  AnswerFormat,
  ScienceQuestion
} from '../../types/quiz';
import { getRandomScienceQuestions, type ScienceQuestionTemplate } from '../../utils/dynamicScienceGenerator';

interface ScienceFact {
  question: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  wrongAnswers?: string[];
  explanation?: string;
}

export class ScienceQuestionGenerator implements QuestionGenerator {
  private useDynamicGeneration = true; // Toggle to use JSON-based generation

  generate(options: QuestionGeneratorOptions): Question[] {
    // Use dynamic generation from JSON if enabled
    if (this.useDynamicGeneration) {
      return this.generateFromJSON(options);
    }

    return [];
  }

  private generateFromJSON(options: QuestionGeneratorOptions): Question[] {
    const { count, difficulty, questionType, answerFormat } = options;
    const questions: Question[] = [];

    // Map questionType to topic
    const topic = this.mapQuestionTypeToTopic(questionType);
    const answerType = answerFormat === AnswerFormat.MCQ ? 'mcq' : 'text';

    console.log('[ScienceGen] Generating questions from JSON:', {
      count,
      difficulty,
      questionType,
      topic,
      answerFormat,
      answerType
    });

    // Get questions from JSON
    const templates = getRandomScienceQuestions(
      count,
      difficulty,
      topic,
      answerType
    );

    console.log('[ScienceGen] Retrieved templates:', templates.length);

    // Convert templates to Question objects
    templates.forEach((template, index) => {
      const scienceQuestion = this.createQuestionFromTemplate(template, answerFormat, index);
      console.log('[ScienceGen] Created question:', {
        id: scienceQuestion.id,
        question: scienceQuestion.question.substring(0, 50) + '...',
        answer: scienceQuestion.answer,
        hasOptions: 'options' in scienceQuestion,
        optionsCount: 'options' in scienceQuestion ? (scienceQuestion as any).options?.length : 0
      });
      questions.push(scienceQuestion);
    });

    return questions;
  }

  private createQuestionFromTemplate(
    template: ScienceQuestionTemplate,
    answerFormat: AnswerFormat,
    index: number
  ): ScienceQuestion {
    const base: ScienceQuestion = {
      id: `science-${template.topic.toLowerCase().replace(/\s+/g, '_')}-${Date.now()}-${index}`,
      subject: Subject.SCIENCE,
      questionType: this.mapTopicToQuestionType(template.topic),
      answerFormat,
      question: template.question,
      answer: template.answer,
      difficulty: template.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
      category: template.topic.toLowerCase().replace(/\s+/g, '_'),
      hint: template.hint
    };

    // Generate MCQ options if requested
    if (answerFormat === AnswerFormat.MCQ) {
      // Use options from template if available, otherwise generate them
      const options = template.options && template.options.length >= 4
        ? this.shuffleArray([...template.options])
        : this.generateScienceOptions(template);

      return { ...base, options } as ScienceQuestion;
    }

    return base;
  }

  /**
   * Generate MCQ options for a science question
   * Uses template options if available, otherwise creates plausible wrong answers
   */
  private generateScienceOptions(template: ScienceQuestionTemplate): string[] {
    const options = new Set<string>();

    // Always include the correct answer
    options.add(template.answer);

    // If template has options, use them
    if (template.options && template.options.length > 0) {
      template.options.forEach(opt => options.add(opt));
    }

    // If we still need more options, we can't generate plausible wrong answers
    // for science questions without domain knowledge, so just use what we have
    // The template should provide all options

    return this.shuffleArray(Array.from(options));
  }

  /**
   * Shuffle an array randomly
   */
  private shuffleArray<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
  }

  private mapQuestionTypeToTopic(questionType: string): string {
    // Map ScienceQuestionType to topic string (matching science.json format)
    switch (questionType.toLowerCase()) {
      case 'biology':
        return 'Biology';
      case 'chemistry':
        return 'Chemistry';
      case 'physics':
        return 'Physics';
      case 'earth_space':
        return 'Earth and space';
      case 'general':
      case 'basic_facts':
      default:
        return 'all';
    }
  }

  private mapTopicToQuestionType(topic: string): ScienceQuestionType {
    // Map topic string to ScienceQuestionType
    const topicLower = topic.toLowerCase();
    switch (topicLower) {
      case 'biology':
        return ScienceQuestionType.BIOLOGY;
      case 'chemistry':
        return ScienceQuestionType.CHEMISTRY;
      case 'physics':
        return ScienceQuestionType.PHYSICS;
      case 'earth and space':
        return ScienceQuestionType.EARTH_SPACE;
      case 'general':
      default:
        return ScienceQuestionType.BASIC_FACTS;
    }
  }

  private createQuestion(fact: ScienceFact, answerFormat: AnswerFormat, index: number): ScienceQuestion {
    const base: ScienceQuestion = {
      id: `science-${fact.category}-${Date.now()}-${index}`,
      subject: Subject.SCIENCE,
      questionType: this.mapCategoryToType(fact.category),
      answerFormat,
      question: fact.question,
      answer: fact.answer,
      difficulty: fact.difficulty,
      category: fact.category,
      hint: fact.explanation
    };

    if (answerFormat === AnswerFormat.MCQ && fact.wrongAnswers) {
      const options = [fact.answer, ...fact.wrongAnswers].sort(() => Math.random() - 0.5);
      return { ...base, options } as ScienceQuestion;
    }

    return base;
  }

  private mapCategoryToType(category: string): ScienceQuestionType {
    switch (category) {
      case 'biology': return ScienceQuestionType.BIOLOGY;
      case 'chemistry': return ScienceQuestionType.CHEMISTRY;
      case 'physics': return ScienceQuestionType.PHYSICS;
      case 'earth_space': return ScienceQuestionType.EARTH_SPACE;
      default: return ScienceQuestionType.BASIC_FACTS;
    }
  }

  validateAnswer(question: Question, userAnswer: string): boolean {
    const normalizedAnswer = userAnswer.trim().toLowerCase();
    const correctAnswer = question.answer.trim().toLowerCase();
    return normalizedAnswer === correctAnswer;
  }
}

