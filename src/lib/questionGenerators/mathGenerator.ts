import {
  Question,
  QuestionGenerator,
  QuestionGeneratorOptions,
  Subject,
  MathQuestionType,
  AnswerFormat,
  MathQuestion
} from '../../types/quiz';
import {
  filterTemplates,
  generateMathQuestion,
  getMathTemplates
} from '../../utils/dynamicMathGenerator';

export class MathQuestionGenerator implements QuestionGenerator {
  private useDynamicGeneration = true; // Toggle to use JSON-based generation

  generate(options: QuestionGeneratorOptions): Question[] {
    const questions: Question[] = [];

    // Use dynamic generation from JSON if enabled
    if (this.useDynamicGeneration) {
      return this.generateFromJSON(options);
    }

    // Fallback to hardcoded generation
    for (let i = 0; i < options.count; i++) {
      const question = this.generateSingleQuestion(options);
      questions.push(question);
    }

    return questions;
  }

  private generateFromJSON(options: QuestionGeneratorOptions): Question[] {
    const { count, difficulty, answerFormat } = options;
    const questions: Question[] = [];

    // Get all templates from JSON
    const allTemplates = getMathTemplates();

    // Filter by difficulty
    const filteredTemplates = filterTemplates(difficulty);

    // If no templates match, use all templates
    const templates = filteredTemplates.length > 0 ? filteredTemplates : allTemplates;

    // Generate questions
    for (let i = 0; i < count; i++) {
      // Pick a random template
      const template = templates[Math.floor(Math.random() * templates.length)];

      // Generate question from template
      const generated = generateMathQuestion(template);

      // Convert to MathQuestion format
      const mathQuestion: MathQuestion = {
        id: `math-dynamic-${Date.now()}-${Math.random()}`,
        subject: Subject.MATH,
        questionType: this.mapTypeToQuestionType(generated.type),
        answerFormat,
        question: generated.question,
        answer: generated.answer.toString(),
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        hint: generated.hint,
        type: generated.type,
        level: generated.level,
        formula: generated.formula,
        variables: generated.variables
      };

      // Add multiple choice options if needed
      if (answerFormat === AnswerFormat.MULTIPLE_CHOICE) {
        mathQuestion.options = this.generateOptions(generated.answer, 4);
      }

      questions.push(mathQuestion);
    }

    return questions;
  }

  private mapTypeToQuestionType(type: string): MathQuestionType {
    // Map JSON type to MathQuestionType enum
    switch (type.toLowerCase()) {
      case 'basic':
        return MathQuestionType.ADDITION;
      case 'geometry':
        return MathQuestionType.FRACTIONS;
      case 'currency':
        return MathQuestionType.ALGEBRAIC;
      case 'time':
        return MathQuestionType.ALGEBRAIC;
      case 'conversion':
        return MathQuestionType.MULTIPLICATION;
      default:
        return MathQuestionType.ADDITION;
    }
  }

  private generateSingleQuestion(options: QuestionGeneratorOptions): MathQuestion {
    const { difficulty, questionType, answerFormat } = options;
    
    switch (questionType) {
      case MathQuestionType.ADDITION:
        return this.generateAddition(difficulty, answerFormat);
      case MathQuestionType.SUBTRACTION:
        return this.generateSubtraction(difficulty, answerFormat);
      case MathQuestionType.MULTIPLICATION:
        return this.generateMultiplication(difficulty, answerFormat);
      case MathQuestionType.DIVISION:
        return this.generateDivision(difficulty, answerFormat);
      case MathQuestionType.FRACTIONS:
        return this.generateFractions(difficulty, answerFormat);
      case MathQuestionType.ALGEBRAIC:
        return this.generateAlgebraic(difficulty, answerFormat);
      default:
        return this.generateAddition(difficulty, answerFormat);
    }
  }

  private generateAddition(difficulty: string, answerFormat: AnswerFormat): MathQuestion {
    const range = this.getRange(difficulty);
    const a = this.randomInt(range.min, range.max);
    const b = this.randomInt(range.min, range.max);
    const answer = a + b;

    const base: MathQuestion = {
      id: `math-add-${Date.now()}-${Math.random()}`,
      subject: Subject.MATH,
      questionType: MathQuestionType.ADDITION,
      answerFormat,
      question: `${a} + ${b} = ?`,
      answer: answer.toString(),
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      operands: [a, b],
      operator: '+'
    };

    if (answerFormat === AnswerFormat.MULTIPLE_CHOICE) {
      return {
        ...base,
        options: this.generateOptions(answer, 4)
      } as MathQuestion;
    }

    return base;
  }

  private generateSubtraction(difficulty: string, answerFormat: AnswerFormat): MathQuestion {
    const range = this.getRange(difficulty);
    const a = this.randomInt(range.min, range.max);
    const b = this.randomInt(range.min, a); // Ensure positive result
    const answer = a - b;

    const base: MathQuestion = {
      id: `math-sub-${Date.now()}-${Math.random()}`,
      subject: Subject.MATH,
      questionType: MathQuestionType.SUBTRACTION,
      answerFormat,
      question: `${a} - ${b} = ?`,
      answer: answer.toString(),
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      operands: [a, b],
      operator: '-'
    };

    if (answerFormat === AnswerFormat.MULTIPLE_CHOICE) {
      return {
        ...base,
        options: this.generateOptions(answer, 4)
      } as MathQuestion;
    }

    return base;
  }

  private generateMultiplication(difficulty: string, answerFormat: AnswerFormat): MathQuestion {
    const range = this.getMultiplicationRange(difficulty);
    const a = this.randomInt(range.min, range.max);
    const b = this.randomInt(range.min, range.max);
    const answer = a * b;

    const base: MathQuestion = {
      id: `math-mul-${Date.now()}-${Math.random()}`,
      subject: Subject.MATH,
      questionType: MathQuestionType.MULTIPLICATION,
      answerFormat,
      question: `${a} × ${b} = ?`,
      answer: answer.toString(),
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      operands: [a, b],
      operator: '×'
    };

    if (answerFormat === AnswerFormat.MULTIPLE_CHOICE) {
      return {
        ...base,
        options: this.generateOptions(answer, 4)
      } as MathQuestion;
    }

    return base;
  }

  private generateDivision(difficulty: string, answerFormat: AnswerFormat): MathQuestion {
    const range = this.getMultiplicationRange(difficulty);
    const divisor = this.randomInt(range.min, range.max);
    const quotient = this.randomInt(range.min, range.max);
    const dividend = divisor * quotient; // Ensure whole number result

    const base: MathQuestion = {
      id: `math-div-${Date.now()}-${Math.random()}`,
      subject: Subject.MATH,
      questionType: MathQuestionType.DIVISION,
      answerFormat,
      question: `${dividend} ÷ ${divisor} = ?`,
      answer: quotient.toString(),
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      operands: [dividend, divisor],
      operator: '÷'
    };

    if (answerFormat === AnswerFormat.MULTIPLE_CHOICE) {
      return {
        ...base,
        options: this.generateOptions(quotient, 4)
      } as MathQuestion;
    }

    return base;
  }

  private generateFractions(difficulty: string, answerFormat: AnswerFormat): MathQuestion {
    const range = this.getRange(difficulty);
    const numerator = this.randomInt(1, range.max);
    const denominator = this.randomInt(2, 10);
    const answer = (numerator / denominator).toFixed(2);

    const base: MathQuestion = {
      id: `math-frac-${Date.now()}-${Math.random()}`,
      subject: Subject.MATH,
      questionType: MathQuestionType.FRACTIONS,
      answerFormat,
      question: `What is ${numerator}/${denominator} as a decimal?`,
      answer: answer,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      operands: [numerator, denominator],
      operator: '/'
    };

    if (answerFormat === AnswerFormat.MULTIPLE_CHOICE) {
      return {
        ...base,
        options: this.generateDecimalOptions(parseFloat(answer), 4)
      } as MathQuestion;
    }

    return base;
  }

  private generateAlgebraic(difficulty: string, answerFormat: AnswerFormat): MathQuestion {
    const range = this.getRange(difficulty);
    const x = this.randomInt(1, range.max);
    const coefficient = this.randomInt(2, 10);
    const constant = this.randomInt(1, range.max);
    const result = coefficient * x + constant;

    const base: MathQuestion = {
      id: `math-alg-${Date.now()}-${Math.random()}`,
      subject: Subject.MATH,
      questionType: MathQuestionType.ALGEBRAIC,
      answerFormat,
      question: `If ${coefficient}x + ${constant} = ${result}, what is x?`,
      answer: x.toString(),
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      operands: [coefficient, constant, result],
      operator: 'algebraic'
    };

    if (answerFormat === AnswerFormat.MULTIPLE_CHOICE) {
      return {
        ...base,
        options: this.generateOptions(x, 4)
      } as MathQuestion;
    }

    return base;
  }

  validateAnswer(question: Question, userAnswer: string): boolean {
    const normalizedAnswer = userAnswer.trim().toLowerCase();
    const correctAnswer = question.answer.trim().toLowerCase();

    // For decimal answers, allow small rounding differences
    const userNum = parseFloat(normalizedAnswer);
    const correctNum = parseFloat(correctAnswer);

    if (!isNaN(userNum) && !isNaN(correctNum)) {
      return Math.abs(userNum - correctNum) < 0.01;
    }

    return normalizedAnswer === correctAnswer;
  }

  private getRange(difficulty: string): { min: number; max: number } {
    switch (difficulty) {
      case 'easy':
        return { min: 1, max: 10 };
      case 'medium':
        return { min: 10, max: 50 };
      case 'hard':
        return { min: 50, max: 100 };
      default:
        return { min: 1, max: 10 };
    }
  }

  private getMultiplicationRange(difficulty: string): { min: number; max: number } {
    switch (difficulty) {
      case 'easy':
        return { min: 1, max: 10 };
      case 'medium':
        return { min: 5, max: 12 };
      case 'hard':
        return { min: 10, max: 20 };
      default:
        return { min: 1, max: 10 };
    }
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateOptions(correctAnswer: number, count: number): string[] {
    const options = new Set<string>([correctAnswer.toString()]);

    while (options.size < count) {
      const offset = this.randomInt(-10, 10);
      if (offset !== 0) {
        const wrongAnswer = correctAnswer + offset;
        if (wrongAnswer > 0) {
          options.add(wrongAnswer.toString());
        }
      }
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  }

  private generateDecimalOptions(correctAnswer: number, count: number): string[] {
    const options = new Set<string>([correctAnswer.toFixed(2)]);

    while (options.size < count) {
      const offset = (Math.random() - 0.5) * 2;
      const wrongAnswer = correctAnswer + offset;
      if (wrongAnswer > 0) {
        options.add(wrongAnswer.toFixed(2));
      }
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  }
}
