const { getQuestionGenerator } = require('../src/lib/questionGenerators');
const { Subject, AnswerFormat } = require('../src/types/quiz');

function run() {
  const gen = getQuestionGenerator(Subject.MATH);
  const opts = {
    count: 10,
    difficulty: 'hard',
    questionType: 'basic',
    answerFormat: AnswerFormat.MCQ
  };

  try {
    const qs = gen.generate(opts);
    console.log('Generated', qs.length, 'questions');
    console.log(qs.slice(0,3).map(q=>({id:q.id, question:q.question, options: q.options ? q.options.slice(0,3) : undefined})));
  } catch (err) {
    console.error('Generation error:', err);
  }
}

run();
