import mathData from '../configs/math.json';

export interface MathQuestionTemplate {
  question: string;
  formula: string;
  difficulty: string;
  level: string;
  hint: string;
  type: string;
}

export interface GeneratedMathQuestion {
  question: string;
  answer: number;
  formula: string;
  difficulty: string;
  level: string;
  hint: string;
  type: string;
  variables: Record<string, number>;
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
    // Using Function constructor instead of eval for safer evaluation
    const result = new Function(`return ${expression}`)();

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
  
  // Generate random values for variables
  const values = generateVariableValues(variables, template.difficulty);
  
  // Replace variables in question
  const question = replaceVariables(template.question, values);
  
  // Calculate answer using formula
  const answer = evaluateFormula(template.formula, values);
  
  // Replace variables in hint
  const hint = replaceVariables(template.hint, values);
  
  return {
    question,
    answer,
    formula: template.formula,
    difficulty: template.difficulty,
    level: template.level,
    hint,
    type: template.type,
    variables: values
  };
}

/**
 * Get all math question templates from JSON
 */
export function getMathTemplates(): MathQuestionTemplate[] {
  return mathData as MathQuestionTemplate[];
}

/**
 * Filter templates by criteria
 */
export function filterTemplates(
  difficulty?: string,
  level?: string,
  type?: string
): MathQuestionTemplate[] {
  let templates = getMathTemplates();
  
  if (difficulty) {
    templates = templates.filter(t => t.difficulty === difficulty);
  }
  
  if (level) {
    templates = templates.filter(t => t.level === level);
  }
  
  if (type) {
    templates = templates.filter(t => t.type === type);
  }
  
  return templates;
}

