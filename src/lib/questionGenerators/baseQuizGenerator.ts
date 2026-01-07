import {
  Question,
  QuestionGenerator,
  QuestionGeneratorOptions,
  Subject,
  SubjectQuestionType,
  AnswerFormat,
  BaseQuestion
} from '../../types/quiz';
import { getRandomTemplates, type QuestionTemplate } from '../../utils/templateLoader';

/**
 * Base question generator that works with template-based questions
 * Can be extended for specific subjects (Science, English, History)
 */
export abstract class BaseQuestionGenerator implements QuestionGenerator {
  protected abstract subject: Subject;

  generate(options: QuestionGeneratorOptions): Question[] {
    return this.generateFromTemplates(options);
  }

  /**
   * Generate questions from templates
   */
  protected generateFromTemplates(options: QuestionGeneratorOptions): Question[] {
    const { count, difficulty, questionType, answerFormat, topics } = options;
    const questions: Question[] = [];

    // If topics are specified, generate questions for each topic
    if (topics && topics.length > 0) {
      console.log(`[${this.subject}Gen] Generating questions for specific topics:`, topics);

      const questionsPerTopic = Math.ceil(count / topics.length);
      const answerType = answerFormat === AnswerFormat.MCQ ? 'mcq' : 'text';

      topics.forEach(topicName => {
        const templates = getRandomTemplates(
          this.subject,
          questionsPerTopic,
          difficulty,
          topicName,
          answerType
        );

        templates.forEach((template, index) => {
          const question = this.createQuestionFromTemplate(template, answerFormat, index);
          questions.push(question);
        });
      });

      // Shuffle and limit to requested count
      const shuffled = questions.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }

    // Original behavior: use questionType to determine topic
    const topic = this.mapQuestionTypeToTopic(questionType);
    const answerType = answerFormat === AnswerFormat.MCQ ? 'mcq' : 'text';

    console.log(`[${this.subject}Gen] Generating questions from templates:`, {
      count,
      difficulty,
      questionType,
      topic,
      answerFormat,
      answerType
    });

    // Get random templates from the template loader
    const templates = getRandomTemplates(
      this.subject,
      count,
      difficulty,
      topic,
      answerType
    );

    console.log(`[${this.subject}Gen] Retrieved templates:`, templates.length);

    // Convert templates to Question objects
    templates.forEach((template, index) => {
      const question = this.createQuestionFromTemplate(template, answerFormat, index);
      console.log(`[${this.subject}Gen] Created question:`, {
        id: question.id,
        question: question.question.substring(0, 50) + '...',
        answer: question.answer,
        hasOptions: 'options' in question,
        optionsCount: 'options' in question ? (question as any).options?.length : 0
      });
      questions.push(question);
    });

    return questions;
  }

  /**
   * Create a question from a template
   * Can be overridden by subclasses for subject-specific behavior
   */
  protected createQuestionFromTemplate(
    template: QuestionTemplate,
    answerFormat: AnswerFormat,
    index: number
  ): Question {
    const base: BaseQuestion = {
      id: `${this.subject}-${template.topic.toLowerCase().replace(/\s+/g, '_')}-${Date.now()}-${index}`,
      subject: this.subject,
      questionType: this.mapTopicToQuestionType(template.topic),
      answerFormat,
      question: template.question,
      answer: template.answer,
      difficulty: template.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'
    };

    // Add optional fields if they exist
    const questionWithExtras = {
      ...base,
      ...(template.hint && { hint: template.hint }),
      ...(template.topic && { category: template.topic.toLowerCase().replace(/\s+/g, '_') })
    };

    // Generate MCQ options if requested
    if (answerFormat === AnswerFormat.MCQ) {
      const options = template.options && template.options.length >= 4
        ? this.shuffleArray([...template.options])
        : this.generateOptions(template);

      return { ...questionWithExtras, options } as Question;
    }

    return questionWithExtras as Question;
  }

  /**
   * Generate MCQ options for a question
   * Uses template options if available
   */
  protected generateOptions(template: QuestionTemplate): string[] {
    const options = new Set<string>();

    // Always include the correct answer
    options.add(template.answer);

    // If template has options, use them
    if (template.options && template.options.length > 0) {
      template.options.forEach(opt => options.add(opt));
    }

    return this.shuffleArray(Array.from(options));
  }

  /**
   * Shuffle an array randomly
   */
  protected shuffleArray<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
  }

  /**
   * Map question type enum to topic string for template filtering
   * Must be implemented by subclasses
   */
  protected abstract mapQuestionTypeToTopic(questionType: SubjectQuestionType): string;

  /**
   * Map topic string from template to question type enum
   * Must be implemented by subclasses
   */
  protected abstract mapTopicToQuestionType(topic: string): SubjectQuestionType;

  /**
   * Validate user answer against correct answer
   */
  validateAnswer(question: Question, userAnswer: string): boolean {
    const normalizedAnswer = userAnswer.trim().toLowerCase();
    const correctAnswer = question.answer.trim().toLowerCase();
    return normalizedAnswer === correctAnswer;
  }
}

