// No static import - data will be passed as parameter
let cachedMathData: MathQuestionTemplate[] | null = null;

export interface MathQuestionTemplate {
  question: string;
  formula: string;
  difficulty: string;
  level: string;
  hint: string;
  topic: string;
  options?: string[]; // Optional predefined options for MCQ
}

export interface GeneratedMathQuestion {
  question: string;
  answer: number | string; // Support both numeric and text answers
  formula: string;
  difficulty: string;
  level: string;
  hint: string;
  topic: string;
  variables: Record<string, number>;
  options?: string[]; // Optional predefined options from template
}

/**
 * Set the math data to be used for question generation
 * This should be called with the fetched math.json data
 */
export function setMathData(data: MathQuestionTemplate[]): void {
  cachedMathData = data;
}

/**
 * Get the cached math data
 * @internal
 */
export function getMathData(): MathQuestionTemplate[] {
  if (!cachedMathData) {
    console.warn('Math data not loaded yet. Using empty array.');
    return [];
  }
  return cachedMathData;
}

/**
 * Extract variable names from a template string
 * e.g., "What is {{x}} + {{y}}?" => ["x", "y"]
 */
function extractVariables(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  
  return variables;
}

/**
 * Generate random values for variables based on difficulty
 */
function generateVariableValues(
  variables: string[],
  difficulty: string
): Record<string, number> {
  const values: Record<string, number> = {};
  
  // Define ranges based on difficulty
  let min = 1;
  let max = 10;
  
  switch (difficulty) {
    case 'easy':
      min = 1;
      max = 10;
      break;
    case 'medium':
      min = 5;
      max = 50;
      break;
    case 'hard':
      min = 10;
      max = 100;
      break;
  }
  
  // Generate random values for each variable
  variables.forEach(varName => {
    values[varName] = Math.floor(Math.random() * (max - min + 1)) + min;
  });
  
  return values;
}

/**
 * Replace template variables with actual values
 * e.g., "What is {{x}} + {{y}}?" with {x: 2, y: 4} => "What is 2 + 4?"
 */
function replaceVariables(
  template: string,
  values: Record<string, number>
): string {
  let result = template;
  
  Object.entries(values).forEach(([varName, value]) => {
    const regex = new RegExp(`\\{\\{${varName}\\}\\}`, 'g');
    result = result.replace(regex, value.toString());
  });
  
  return result;
}

/**
 * Evaluate a formula with variable values
 * e.g., "{{x}} + {{y}}" with {x: 2, y: 4} => 6
 */
function evaluateFormula(
  formula: string,
  values: Record<string, number>
): number {
  // Replace variables in formula
  const expression = replaceVariables(formula, values);

  // Safely evaluate the mathematical expression
  try {
    // Support common math helpers in templates (e.g. floor(x), ceil(x), sqrt(x))
    // by rewriting them to use Math.* or aliasing them in a function scope.
    const replacements: Record<string, string> = {
      '\\bfloor\\s*\\(': 'Math.floor(',
      '\\bceil\\s*\\(': 'Math.ceil(',
      '\\babs\\s*\\(': 'Math.abs(',
      '\\bsqrt\\s*\\(': 'Math.sqrt(',
      '\\bround\\s*\\(': 'Math.round(',
      '\\bpow\\s*\\(': 'Math.pow(',
      '\\bmin\\s*\\(': 'Math.min(',
      '\\bmax\\s*\\(': 'Math.max('
    };

    let sanitized = expression;
    Object.entries(replacements).forEach(([pattern, replacement]) => {
      sanitized = sanitized.replace(new RegExp(pattern, 'g'), replacement);
    });

    // Using Function constructor instead of eval for evaluation
    const result = new Function(`return (${sanitized})`)();

    // Round to 2 decimal places to avoid floating point issues
    return Math.round(result * 100) / 100;
  } catch (error) {
    console.error('Error evaluating formula:', formula, error);
    return 0;
  }
}

/**
 * Generate a single math question from a template
 */
export function generateMathQuestion(
  template: MathQuestionTemplate
): GeneratedMathQuestion {
  // Extract variables from question and formula
  const variables = extractVariables(template.question + template.formula);

  console.log('[MathGen] variabls : ', { template, variables });

  // Check if this is a non-variable question (no {{x}} placeholders)
  const hasVariables = variables.length > 0;

  if (!hasVariables) {
    // No variables - use formula directly as the answer
    return {
      question: template.question,
      answer: template.formula, // Use formula as-is (could be text or number)
      formula: template.formula,
      difficulty: template.difficulty,
      level: template.level,
      hint: template.hint,
      topic: template.topic,
      variables: {},
      options: template.options // Pass through predefined options if available
    };
  }

  // Generate random values for variables
  const values = generateVariableValues(variables, template.difficulty);

  console.log('[MathGen] values : ', values);

  // Replace variables in question
  const question = replaceVariables(template.question, values);

  console.log('[MathGen] question : ', question);

  // Calculate answer using formula
  const answer = evaluateFormula(template.formula, values);

  console.log('[MathGen] answer : ', answer);

  // Replace variables in hint
  const hint = replaceVariables(template.hint, values);

  console.log('[MathGen] hint : ', hint);

  return {
    question,
    answer,
    formula: template.formula,
    difficulty: template.difficulty,
    level: template.level,
    hint,
    topic: template.topic,
    variables: values,
    options: template.options // Pass through predefined options if available
  };
}

/**
 * Get all math question templates from cached data
 */
export function getMathTemplates(): MathQuestionTemplate[] {
  return getMathData();
}

/**
 * Filter templates by criteria
 */
export function filterTemplates(
  difficulty?: string,
  level?: string,
  topic?: string
): MathQuestionTemplate[] {
  let templates = getMathTemplates();

  if (difficulty) {
    templates = templates.filter(t => t.difficulty === difficulty);
  }

  if (level) {
    templates = templates.filter(t => t.level === level);
  }

  if (topic) {
    templates = templates.filter(t => t.topic === topic);
  }

  return templates;
}

