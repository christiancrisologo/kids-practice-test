import {
  Question,
  QuestionGenerator,
  QuestionGeneratorOptions,
  Subject,
  EnglishQuestionType,
  AnswerFormat,
  EnglishQuestion
} from '../../types/quiz';

interface VocabularyWord {
  word: string;
  definition: string;
  synonyms: string[];
  antonyms: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  partOfSpeech?: string;
}

const VOCABULARY: VocabularyWord[] = [
  // Easy
  { word: "happy", definition: "feeling or showing pleasure", synonyms: ["joyful", "cheerful", "glad"], antonyms: ["sad", "unhappy", "miserable"], difficulty: "easy" },
  { word: "big", definition: "of considerable size or extent", synonyms: ["large", "huge", "enormous"], antonyms: ["small", "tiny", "little"], difficulty: "easy" },
  { word: "fast", definition: "moving or capable of moving at high speed", synonyms: ["quick", "rapid", "swift"], antonyms: ["slow", "sluggish", "leisurely"], difficulty: "easy" },
  { word: "smart", definition: "having intelligence or good judgment", synonyms: ["intelligent", "clever", "bright"], antonyms: ["dumb", "stupid", "foolish"], difficulty: "easy" },
  { word: "brave", definition: "ready to face danger or pain", synonyms: ["courageous", "fearless", "bold"], antonyms: ["cowardly", "timid", "afraid"], difficulty: "easy" },
  
  // Medium
  { word: "abundant", definition: "existing in large quantities", synonyms: ["plentiful", "ample", "copious"], antonyms: ["scarce", "rare", "limited"], difficulty: "medium" },
  { word: "benevolent", definition: "well-meaning and kindly", synonyms: ["kind", "generous", "charitable"], antonyms: ["malevolent", "cruel", "mean"], difficulty: "medium" },
  { word: "diligent", definition: "showing care and effort", synonyms: ["hardworking", "industrious", "conscientious"], antonyms: ["lazy", "careless", "negligent"], difficulty: "medium" },
  { word: "eloquent", definition: "fluent and persuasive in speaking", synonyms: ["articulate", "expressive", "fluent"], antonyms: ["inarticulate", "tongue-tied", "hesitant"], difficulty: "medium" },
  { word: "frugal", definition: "sparing or economical", synonyms: ["thrifty", "economical", "prudent"], antonyms: ["wasteful", "extravagant", "lavish"], difficulty: "medium" },
  
  // Hard
  { word: "ephemeral", definition: "lasting for a very short time", synonyms: ["transient", "fleeting", "momentary"], antonyms: ["permanent", "lasting", "enduring"], difficulty: "hard" },
  { word: "ubiquitous", definition: "present everywhere", synonyms: ["omnipresent", "pervasive", "universal"], antonyms: ["rare", "scarce", "absent"], difficulty: "hard" },
  { word: "meticulous", definition: "showing great attention to detail", synonyms: ["careful", "precise", "thorough"], antonyms: ["careless", "sloppy", "negligent"], difficulty: "hard" },
  { word: "pragmatic", definition: "dealing with things practically", synonyms: ["practical", "realistic", "sensible"], antonyms: ["idealistic", "impractical", "unrealistic"], difficulty: "hard" },
  { word: "tenacious", definition: "persistent and determined", synonyms: ["persistent", "determined", "resolute"], antonyms: ["weak", "yielding", "irresolute"], difficulty: "hard" }
];

interface GrammarRule {
  question: string;
  answer: string;
  wrongAnswers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

const GRAMMAR_QUESTIONS: GrammarRule[] = [
  // Easy
  { question: "Choose the correct verb: She ___ to school every day.", answer: "goes", wrongAnswers: ["go", "going", "gone"], difficulty: "easy" },
  { question: "Which is correct: ___ book is on the table.", answer: "The", wrongAnswers: ["A", "An", "This"], difficulty: "easy" },
  { question: "Choose the correct form: I ___ happy yesterday.", answer: "was", wrongAnswers: ["am", "is", "were"], difficulty: "easy" },
  
  // Medium
  { question: "Choose the correct pronoun: John and ___ went to the store.", answer: "I", wrongAnswers: ["me", "myself", "mine"], difficulty: "medium" },
  { question: "Which is correct: She has ___ apples than me.", answer: "more", wrongAnswers: ["much", "most", "many"], difficulty: "medium" },
  { question: "Choose the correct form: If I ___ rich, I would travel.", answer: "were", wrongAnswers: ["was", "am", "be"], difficulty: "medium" },
  
  // Hard
  { question: "Choose the correct form: The data ___ been analyzed.", answer: "have", wrongAnswers: ["has", "is", "are"], difficulty: "hard" },
  { question: "Which is correct: Neither of the students ___ ready.", answer: "is", wrongAnswers: ["are", "were", "be"], difficulty: "hard" },
  { question: "Choose the correct form: I wish I ___ studied harder.", answer: "had", wrongAnswers: ["have", "has", "would"], difficulty: "hard" }
];

export class EnglishQuestionGenerator implements QuestionGenerator {
  generate(options: QuestionGeneratorOptions): Question[] {
    const questions: Question[] = [];
    const { count, difficulty, questionType, answerFormat } = options;
    
    for (let i = 0; i < count; i++) {
      const question = this.generateSingleQuestion(difficulty, questionType, answerFormat, i);
      questions.push(question);
    }
    
    return questions;
  }

  private generateSingleQuestion(
    difficulty: string,
    questionType: string,
    answerFormat: AnswerFormat,
    index: number
  ): EnglishQuestion {
    switch (questionType) {
      case EnglishQuestionType.VOCABULARY:
        return this.generateVocabulary(difficulty, answerFormat, index);
      case EnglishQuestionType.GRAMMAR:
        return this.generateGrammar(difficulty, answerFormat, index);
      case EnglishQuestionType.SYNONYMS:
        return this.generateSynonyms(difficulty, answerFormat, index);
      case EnglishQuestionType.ANTONYMS:
        return this.generateAntonyms(difficulty, answerFormat, index);
      case EnglishQuestionType.SENTENCE_COMPLETION:
        return this.generateSentenceCompletion(difficulty, answerFormat, index);
      default:
        return this.generateVocabulary(difficulty, answerFormat, index);
    }
  }

  private generateVocabulary(difficulty: string, answerFormat: AnswerFormat, index: number): EnglishQuestion {
    const words = VOCABULARY.filter(w => w.difficulty === difficulty || difficulty === 'medium');
    const word = words[Math.floor(Math.random() * words.length)];
    
    const base: EnglishQuestion = {
      id: `english-vocab-${Date.now()}-${index}`,
      subject: Subject.ENGLISH,
      questionType: EnglishQuestionType.VOCABULARY,
      answerFormat,
      question: `What is the definition of "${word.word}"?`,
      answer: word.definition,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      word: word.word,
      definition: word.definition,
      synonyms: word.synonyms,
      antonyms: word.antonyms
    };

    if (answerFormat === AnswerFormat.MCQ) {
      const wrongDefs = VOCABULARY
        .filter(w => w.word !== word.word)
        .map(w => w.definition)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const options = [word.definition, ...wrongDefs].sort(() => Math.random() - 0.5);
      return { ...base, options } as EnglishQuestion;
    }

    return base;
  }

  private generateGrammar(difficulty: string, answerFormat: AnswerFormat, index: number): EnglishQuestion {
    const questions = GRAMMAR_QUESTIONS.filter(q => q.difficulty === difficulty || difficulty === 'medium');
    const grammarQ = questions[Math.floor(Math.random() * questions.length)];
    
    const base: EnglishQuestion = {
      id: `english-grammar-${Date.now()}-${index}`,
      subject: Subject.ENGLISH,
      questionType: EnglishQuestionType.GRAMMAR,
      answerFormat,
      question: grammarQ.question,
      answer: grammarQ.answer,
      difficulty: difficulty as 'easy' | 'medium' | 'hard'
    };

    if (answerFormat === AnswerFormat.MCQ) {
      const options = [grammarQ.answer, ...grammarQ.wrongAnswers].sort(() => Math.random() - 0.5);
      return { ...base, options } as EnglishQuestion;
    }

    return base;
  }

  private generateSynonyms(difficulty: string, answerFormat: AnswerFormat, index: number): EnglishQuestion {
    const words = VOCABULARY.filter(w => w.difficulty === difficulty || difficulty === 'medium');
    const word = words[Math.floor(Math.random() * words.length)];
    const correctSynonym = word.synonyms[0];

    const base: EnglishQuestion = {
      id: `english-syn-${Date.now()}-${index}`,
      subject: Subject.ENGLISH,
      questionType: EnglishQuestionType.SYNONYMS,
      answerFormat,
      question: `What is a synonym for "${word.word}"?`,
      answer: correctSynonym,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      word: word.word,
      synonyms: word.synonyms
    };

    if (answerFormat === AnswerFormat.MCQ) {
      const wrongOptions = word.antonyms.slice(0, 2);
      const otherWords = VOCABULARY
        .filter(w => w.word !== word.word)
        .map(w => w.word)
        .slice(0, 1);
      const options = [correctSynonym, ...wrongOptions, ...otherWords].sort(() => Math.random() - 0.5);
      return { ...base, options } as EnglishQuestion;
    }

    return base;
  }

  private generateAntonyms(difficulty: string, answerFormat: AnswerFormat, index: number): EnglishQuestion {
    const words = VOCABULARY.filter(w => w.difficulty === difficulty || difficulty === 'medium');
    const word = words[Math.floor(Math.random() * words.length)];
    const correctAntonym = word.antonyms[0];

    const base: EnglishQuestion = {
      id: `english-ant-${Date.now()}-${index}`,
      subject: Subject.ENGLISH,
      questionType: EnglishQuestionType.ANTONYMS,
      answerFormat,
      question: `What is an antonym for "${word.word}"?`,
      answer: correctAntonym,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      word: word.word,
      antonyms: word.antonyms
    };

    if (answerFormat === AnswerFormat.MCQ) {
      const wrongOptions = word.synonyms.slice(0, 2);
      const otherWords = VOCABULARY
        .filter(w => w.word !== word.word)
        .map(w => w.word)
        .slice(0, 1);
      const options = [correctAntonym, ...wrongOptions, ...otherWords].sort(() => Math.random() - 0.5);
      return { ...base, options } as EnglishQuestion;
    }

    return base;
  }

  private generateSentenceCompletion(difficulty: string, answerFormat: AnswerFormat, index: number): EnglishQuestion {
    const words = VOCABULARY.filter(w => w.difficulty === difficulty || difficulty === 'medium');
    const word = words[Math.floor(Math.random() * words.length)];

    const sentences = [
      `The ${word.word} student received high marks.`,
      `She felt very ${word.word} about the news.`,
      `The ${word.word} solution solved the problem.`
    ];

    const sentence = sentences[Math.floor(Math.random() * sentences.length)];

    const base: EnglishQuestion = {
      id: `english-sent-${Date.now()}-${index}`,
      subject: Subject.ENGLISH,
      questionType: EnglishQuestionType.SENTENCE_COMPLETION,
      answerFormat,
      question: `Complete the sentence: "${sentence.replace(word.word, '___')}"`,
      answer: word.word,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      word: word.word
    };

    if (answerFormat === AnswerFormat.MCQ) {
      const wrongWords = VOCABULARY
        .filter(w => w.word !== word.word)
        .map(w => w.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const options = [word.word, ...wrongWords].sort(() => Math.random() - 0.5);
      return { ...base, options } as EnglishQuestion;
    }

    return base;
  }

  validateAnswer(question: Question, userAnswer: string): boolean {
    const normalizedAnswer = userAnswer.trim().toLowerCase();
    const correctAnswer = question.answer.trim().toLowerCase();

    // For synonym/antonym questions, accept any valid answer
    if (question.questionType === EnglishQuestionType.SYNONYMS && 'synonyms' in question) {
      const englishQ = question as EnglishQuestion;
      return englishQ.synonyms?.some(syn => syn.toLowerCase() === normalizedAnswer) || false;
    }

    if (question.questionType === EnglishQuestionType.ANTONYMS && 'antonyms' in question) {
      const englishQ = question as EnglishQuestion;
      return englishQ.antonyms?.some(ant => ant.toLowerCase() === normalizedAnswer) || false;
    }

    return normalizedAnswer === correctAnswer;
  }
}
