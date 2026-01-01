const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../public/configs/math.json');
const raw = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(raw);

const difficulty = 'hard';
const answerFormat = 'mcq';
const desiredAnswerType = answerFormat === 'mcq' ? 'mcq' : 'text';

console.log('[DebugMathGen] total templates', data.length);

const filteredTemplates = data.filter(t => t.difficulty === difficulty);
console.log('[DebugMathGen] after difficulty filter', filteredTemplates.length);

const templatesWithAnswerType = filteredTemplates.filter(t => t && Object.prototype.hasOwnProperty.call(t, 'answertype'));
console.log('[DebugMathGen] templatesWithAnswerType', templatesWithAnswerType.length);

let templates = filteredTemplates;
if (templatesWithAnswerType.length > 0) {
  templates = templatesWithAnswerType.filter(t => {
    const at = t.answertype;
    if (Array.isArray(at)) return at.includes(desiredAnswerType);
    if (typeof at === 'string') return at === desiredAnswerType;
    return false;
  });
}
console.log('[DebugMathGen] templates after answertype filter', templates.length);

const varRegex = /\{\{\w+\}\}/;
const templatesWithVars = templates.filter(t => (t.formula && varRegex.test(t.formula)) || (t.question && varRegex.test(t.question)));
console.log('[DebugMathGen] templatesWithVars', templatesWithVars.length);

let candidateTemplates = templates;
if (templatesWithVars.length > 0) candidateTemplates = templatesWithVars;

if (!candidateTemplates || candidateTemplates.length === 0) {
  console.warn('[DebugMathGen] No candidate templates after filtering; falling back to templates/allTemplates');
  candidateTemplates = templates.length > 0 ? templates : data;
}

console.log('[DebugMathGen] candidateTemplates count', candidateTemplates.length);

// show first 10 samples
candidateTemplates.slice(0, 10).forEach((t, i) => {
  console.log(`--- sample ${i+1} ---`);
  console.log('question:', t.question);
  console.log('formula:', t.formula);
  console.log('answertype:', t.answertype);
});
