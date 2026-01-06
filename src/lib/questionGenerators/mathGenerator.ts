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

    // Further filter by answertype property in templates if present
    const desiredAnswerType = answerFormat === AnswerFormat.MCQ ? 'mcq' : 'text';
    // If any template has an explicit answertype field, respect it
    const templatesWithAnswerType = filteredTemplates.filter(t => t && Object.prototype.hasOwnProperty.call(t, 'answertype'));
    let templates = filteredTemplates;
    if (templatesWithAnswerType.length > 0) {
      templates = templatesWithAnswerType.filter(t => {
        const at = (t as any).answertype;
        if (Array.isArray(at)) return at.includes(desiredAnswerType);
        if (typeof at === 'string') return at === desiredAnswerType;
        return false;
      });
    }

    // If no templates match, use all templates
    // fallback to all templates if none matched after filtering
    if (templates.length === 0) {
      templates = filteredTemplates.length > 0 ? filteredTemplates : allTemplates;
    }

    // If mcq is requested, prefer templates that contain variable placeholders (e.g., {{x}}, {{y}})
    let candidateTemplates = templates;
    if (answerFormat === AnswerFormat.MCQ) {
      const varRegex = /\{\{\w+\}\}/;
      const templatesWithVars = templates.filter(t => (t.formula && varRegex.test(t.formula)) || (t.question && varRegex.test(t.question)));
      if (templatesWithVars.length > 0) {
        candidateTemplates = templatesWithVars;
      }
    }

    // Ensure we have at least one candidate template; fall back to broader sets if needed
    if (!candidateTemplates || candidateTemplates.length === 0) {
      candidateTemplates = templates.length > 0 ? templates : allTemplates;
    }

    // Generate questions
    let skips = 0;
    for (let i = 0; i < count; i++) {
      // Pick a random template
      let template = candidateTemplates[Math.floor(Math.random() * candidateTemplates.length)];

      // If template is somehow undefined, fall back to a random template from allTemplates
      if (!template) {
        template = allTemplates.length > 0 ? allTemplates[Math.floor(Math.random() * allTemplates.length)] : undefined as any;
      }

      if (!template) {
        // No templates available at all; stop generating further questions
        console.log('[MathGen] No templates available to generate question; breaking out');
        break;
      }

      console.debug('[MathGen] using template', { topic: template.topic, formula: template.formula ? String(template.formula).slice(0, 60) : null });

      // Generate question from template (guard against template evaluation errors)
      let generated;
      try {
        generated = generateMathQuestion(template);
      } catch (err) {

        skips++;
        if (err instanceof Error) {
          if (err.message) {
            console.log('[MathGen] generateMathQuestion failed for template', { templateTopic: template.topic, error: err.message });
          }
        }
        if (skips > Math.max(50, count * 5)) {
          console.log('[MathGen] too many failed template generations, aborting early');
          break;
        }
        continue;
      }

      // Convert to MathQuestion format
      const mathQuestion: MathQuestion = {
        id: `math-dynamic-${Date.now()}-${Math.random()}`,
        subject: Subject.MATH,
        questionType: this.mapTopicToQuestionType(generated.topic),
        answerFormat,
        question: generated.question,
        answer: typeof generated.answer === 'number' ? generated.answer.toFixed(2) : generated.answer.toString(),
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        hint: generated.hint,
        topic: generated.topic,
        level: generated.level,
        formula: generated.formula,
        variables: generated.variables
      };

      // Add multiple choice options if needed
      if (answerFormat === AnswerFormat.MCQ) {
        // Convert answer to number if possible, otherwise use text-based options
        const answerNum = typeof generated.answer === 'number'
          ? generated.answer
          : parseFloat(generated.answer);

        if (!isNaN(answerNum)) {
          mathQuestion.options = this.generateOptions(answerNum, 4);
        } else {
          // For text-based answers, create simple options with the correct answer
          mathQuestion.options = this.generateTextOptions(generated.answer.toString(), 4);
        }
      }

      questions.push(mathQuestion);
    }

    // If for any reason we didn't generate enough questions (skipped bad templates),
    // fill the remainder using the built-in single-question generators.
    if (questions.length < count) {
      const mathTypes = Object.values(MathQuestionType) as MathQuestionType[];
      while (questions.length < count) {
        // pick a random math question type as fallback
        const rndType = mathTypes[Math.floor(Math.random() * mathTypes.length)];
        const fallback = this.generateSingleQuestion({ count: 1, difficulty, questionType: rndType as any, answerFormat });
        questions.push(fallback);
      }
    }

    return questions;
  }

  private mapTopicToQuestionType(topic: string): MathQuestionType {
    // Map JSON topic to MathQuestionType enum
    switch (topic.toLowerCase()) {
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
      answer: answer.toFixed(2),
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      operands: [a, b],
      operator: '+'
    };

    if (answerFormat === AnswerFormat.MCQ) {
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
      answer: answer.toFixed(2),
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      operands: [a, b],
      operator: '-'
    };

    if (answerFormat === AnswerFormat.MCQ) {
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
      answer: answer.toFixed(2),
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      operands: [a, b],
      operator: '×'
    };

    if (answerFormat === AnswerFormat.MCQ) {
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
      answer: quotient.toFixed(2),
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      operands: [dividend, divisor],
      operator: '÷'
    };

    if (answerFormat === AnswerFormat.MCQ) {
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

    if (answerFormat === AnswerFormat.MCQ) {
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
      answer: x.toFixed(2),
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      operands: [coefficient, constant, result],
      operator: 'algebraic'
    };

    if (answerFormat === AnswerFormat.MCQ) {
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
    const options = new Set<string>([correctAnswer.toFixed(2)]);

    console.log('[MathGen] generateOptions start', { correctAnswer, count, options });

    while (options.size < count) {
      const offset = this.randomInt(-10, 10);
      if (offset !== 0) {
        const wrongAnswer = correctAnswer + offset;
        if (wrongAnswer !== correctAnswer) {
          options.add(wrongAnswer.toFixed(2));
        }
      }
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  }

  private generateTextOptions(correctAnswer: string, count: number): string[] {
    // For text-based answers (like "3" for "How many vertices does a triangle have?")
    // Generate plausible wrong answers
    const options = new Set<string>([]);
    const correctNum = parseFloat(correctAnswer);

    // If the correct answer is a number, generate numeric options formatted to 2 decimals
    if (!isNaN(correctNum)) {
      options.add(correctNum.toFixed(2));
      while (options.size < count) {
        const offset = this.randomInt(-5, 5);
        console.log('[MathGen] generateTextOptions offset', offset);
        if (offset !== 0) {
          const wrongAnswer = correctNum + offset;
          console.log('[MathGen] generateTextOptions wrongAnswer', wrongAnswer);
          if (wrongAnswer > 0) {
            options.add(wrongAnswer.toFixed(2));
          }
        }
      }

      console.log('[MathGen] generateTextOptions numeric options', Array.from(options));
      return Array.from(options).sort(() => Math.random() - 0.5);
    }

    // For non-numeric text answers, return the correct answer only
    return [correctAnswer];
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
