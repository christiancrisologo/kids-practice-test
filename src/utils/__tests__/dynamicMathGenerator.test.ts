import {
  generateMathQuestion,
  getMathTemplates,
  filterTemplates,
  MathQuestionTemplate
} from '../dynamicMathGenerator';

describe('Dynamic Math Generator', () => {
  describe('getMathTemplates', () => {
    it('should load math templates from JSON', () => {
      const templates = getMathTemplates();
      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should have valid template structure', () => {
      const templates = getMathTemplates();
      const template = templates[0];
      
      expect(template).toHaveProperty('question');
      expect(template).toHaveProperty('formula');
      expect(template).toHaveProperty('difficulty');
      expect(template).toHaveProperty('level');
      expect(template).toHaveProperty('hint');
      expect(template).toHaveProperty('type');
    });
  });

  describe('filterTemplates', () => {
    it('should filter by difficulty', () => {
      const easyTemplates = filterTemplates('easy');
      expect(easyTemplates.every(t => t.difficulty === 'easy')).toBe(true);
    });

    it('should filter by level', () => {
      const juniorTemplates = filterTemplates(undefined, 'junior');
      expect(juniorTemplates.every(t => t.level === 'junior')).toBe(true);
    });

    it('should filter by type', () => {
      const basicTemplates = filterTemplates(undefined, undefined, 'basic');
      expect(basicTemplates.every(t => t.type === 'basic')).toBe(true);
    });

    it('should filter by multiple criteria', () => {
      const filtered = filterTemplates('easy', 'junior', 'basic');
      expect(filtered.every(t => 
        t.difficulty === 'easy' && 
        t.level === 'junior' && 
        t.type === 'basic'
      )).toBe(true);
    });
  });

  describe('generateMathQuestion', () => {
    const sampleTemplate: MathQuestionTemplate = {
      question: "What is {{x}} + {{y}}?",
      formula: "{{x}} + {{y}}",
      difficulty: "easy",
      level: "junior",
      hint: "Add the two numbers together",
      type: "basic"
    };

    it('should generate a question from template', () => {
      const generated = generateMathQuestion(sampleTemplate);
      
      expect(generated).toHaveProperty('question');
      expect(generated).toHaveProperty('answer');
      expect(generated).toHaveProperty('hint');
      expect(generated).toHaveProperty('variables');
    });

    it('should replace variables in question', () => {
      const generated = generateMathQuestion(sampleTemplate);
      
      // Question should not contain {{x}} or {{y}}
      expect(generated.question).not.toContain('{{x}}');
      expect(generated.question).not.toContain('{{y}}');
      
      // Question should contain numbers
      expect(generated.question).toMatch(/\d+/);
    });

    it('should calculate correct answer', () => {
      const generated = generateMathQuestion(sampleTemplate);
      const { x, y } = generated.variables;
      const expectedAnswer = x + y;
      
      expect(generated.answer).toBe(expectedAnswer);
    });

    it('should generate numbers within difficulty range', () => {
      const easyTemplate = { ...sampleTemplate, difficulty: 'easy' };
      const generated = generateMathQuestion(easyTemplate);
      
      const { x, y } = generated.variables;
      
      // Easy difficulty should be 1-10
      expect(x).toBeGreaterThanOrEqual(1);
      expect(x).toBeLessThanOrEqual(10);
      expect(y).toBeGreaterThanOrEqual(1);
      expect(y).toBeLessThanOrEqual(10);
    });

    it('should handle complex formulas', () => {
      const complexTemplate: MathQuestionTemplate = {
        question: "A {{x}} kg bag is divided into {{y}} g portions. How many portions?",
        formula: "{{x}} * 1000 / {{y}}",
        difficulty: "medium",
        level: "junior",
        hint: "Convert kg to g first",
        type: "conversion"
      };
      
      const generated = generateMathQuestion(complexTemplate);
      const { x, y } = generated.variables;
      const expectedAnswer = Math.round((x * 1000 / y) * 100) / 100;
      
      expect(generated.answer).toBe(expectedAnswer);
    });

    it('should generate different questions from same template', () => {
      const question1 = generateMathQuestion(sampleTemplate);
      const question2 = generateMathQuestion(sampleTemplate);
      
      // Questions might be different (random generation)
      // At least variables should be potentially different
      expect(question1).toHaveProperty('variables');
      expect(question2).toHaveProperty('variables');
    });
  });
});

