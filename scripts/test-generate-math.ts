import { MathQuestionGenerator } from '../src/lib/questionGenerators/mathGenerator';
import { AnswerFormat } from '../src/types/quiz';
import { setMathData } from '../src/utils/dynamicMathGenerator';
import fs from 'fs';
import path from 'path';

async function run() {
  const gen = new MathQuestionGenerator();

  // Load math.json from public/configs and set it into the generator utilities
  try {
    const txt = fs.readFileSync(path.join(process.cwd(), 'public', 'configs', 'math.json'), 'utf-8');
    const raw = JSON.parse(txt);
    // Keep only templates that explicitly allow MCQ
    const data = raw.filter((t: any) => {
      const at = t.answertype;
      const df = t.difficulty;
      const isDf = df === 'hard';
      if (!at || !df) return false;
      if (Array.isArray(at)) return at.includes('mcq') && isDf;
      if (typeof at === 'string') return at === 'mcq' && isDf;
      return false;
    });
    setMathData(data);
    console.log('Loaded math.json templates (mcq-only):', data.length, 'of', raw.length);
  } catch (err) {
    console.warn('Failed to load math.json:', err && (err as any).message ? (err as any).message : err);
  }

  const envCount = parseInt(process.env.COUNT || '', 10);
  const options = {
    count: !isNaN(envCount) && envCount > 0 ? envCount : 10,
    difficulty: 'hard',
    answerFormat: AnswerFormat.MCQ,
  } as any;
  console.log('Using options.count =', options.count);

  try {
    const questions = gen.generate(options);
    console.log('Generated', questions.length, 'questions');
    questions.forEach((q, i) => {
      console.log(`\n[Q${i+1}] id=${q.id} type=${(q as any).questionType} difficulty=${q.difficulty}`);
      console.log('question:', (q as any).question);
      console.log('answer:', q.answer);
      if ((q as any).options) console.log('options:', (q as any).options.join(', '));
    });
  } catch (err) {
    console.error('Test run failed:', err);
    process.exit(2);
  }
}

run();
