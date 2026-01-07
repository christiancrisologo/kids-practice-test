#!/usr/bin/env node

/**
 * Demo script to showcase the dynamic math question generator
 * Run with: node scripts/demo-math-generator.js
 */

const mathData = require('../src/configs/math.json');

// Extract variables from template
function extractVariables(template) {
  const regex = /\{\{(\w+)\}\}/g;
  const variables = [];
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  
  return variables;
}

// Generate random values based on difficulty
function generateVariableValues(variables, difficulty) {
  const values = {};
  
  let min = 1, max = 10;
  switch (difficulty) {
    case 'easy':
      min = 1; max = 10;
      break;
    case 'medium':
      min = 5; max = 50;
      break;
    case 'hard':
      min = 10; max = 100;
      break;
  }
  
  variables.forEach(varName => {
    values[varName] = Math.floor(Math.random() * (max - min + 1)) + min;
  });
  
  return values;
}

// Replace variables in template
function replaceVariables(template, values) {
  let result = template;
  
  Object.entries(values).forEach(([varName, value]) => {
    const regex = new RegExp(`\\{\\{${varName}\\}\\}`, 'g');
    result = result.replace(regex, value.toString());
  });
  
  return result;
}

// Evaluate formula
function evaluateFormula(formula, values) {
  const expression = replaceVariables(formula, values);
  
  try {
    const result = new Function(`return ${expression}`)();
    return Math.round(result * 100) / 100;
  } catch (error) {
    console.error('Error evaluating formula:', formula, error);
    return 0;
  }
}

// Generate a question
function generateQuestion(template) {
  const variables = extractVariables(template.question + template.formula);
  const values = generateVariableValues(variables, template.difficulty);
  const question = replaceVariables(template.question, values);
  const answer = evaluateFormula(template.formula, values);
  const hint = replaceVariables(template.hint, values);

  return {
    question,
    answer,
    hint,
    variables,
    difficulty: template.difficulty,
    topic: template.topic,
    level: template.level
  };
}

// Main demo
console.log('🧮 Dynamic Math Question Generator Demo\n');
console.log('=' .repeat(60));

// Show some statistics
console.log(`\n📊 Statistics:`);
console.log(`Total templates: ${mathData.length}`);

const byDifficulty = mathData.reduce((acc, t) => {
  acc[t.difficulty] = (acc[t.difficulty] || 0) + 1;
  return acc;
}, {});

const byTopic = mathData.reduce((acc, t) => {
  acc[t.topic] = (acc[t.topic] || 0) + 1;
  return acc;
}, {});

console.log(`By difficulty:`, byDifficulty);
console.log(`By topic:`, byTopic);

// Generate sample questions
console.log('\n' + '='.repeat(60));
console.log('\n📝 Sample Generated Questions:\n');

const difficulties = ['easy', 'medium', 'hard'];

difficulties.forEach(difficulty => {
  const templates = mathData.filter(t => t.difficulty === difficulty);
  if (templates.length > 0) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const generated = generateQuestion(template);

    console.log(`\n${difficulty.toUpperCase()} Question:`);
    console.log(`  Topic: ${generated.topic}`);
    console.log(`  Level: ${generated.level}`);
    console.log(`  Question: ${generated.question}`);
    console.log(`  Answer: ${generated.answer}`);
    console.log(`  Hint: ${generated.hint}`);
    console.log(`  Variables: ${JSON.stringify(generated.variables)}`);
  }
});

// Show how same template generates different questions
console.log('\n' + '='.repeat(60));
console.log('\n🔄 Same Template, Different Questions:\n');

const sampleTemplate = mathData[0];
console.log(`Template: "${sampleTemplate.question}"`);
console.log(`Formula: "${sampleTemplate.formula}"\n`);

for (let i = 1; i <= 3; i++) {
  const generated = generateQuestion(sampleTemplate);
  console.log(`Generation ${i}:`);
  console.log(`  Question: ${generated.question}`);
  console.log(`  Answer: ${generated.answer}`);
  console.log(`  Variables: ${JSON.stringify(generated.variables)}\n`);
}

console.log('=' .repeat(60));
console.log('\n✅ Demo complete!\n');

