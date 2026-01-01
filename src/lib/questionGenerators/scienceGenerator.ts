import {
  Question,
  QuestionGenerator,
  QuestionGeneratorOptions,
  Subject,
  ScienceQuestionType,
  AnswerFormat,
  ScienceQuestion
} from '../../types/quiz';

interface ScienceFact {
  question: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  wrongAnswers?: string[];
  explanation?: string;
}

const SCIENCE_FACTS: ScienceFact[] = [
  // Biology - Easy
  { question: "What is the largest organ in the human body?", answer: "Skin", category: "biology", difficulty: "easy", wrongAnswers: ["Heart", "Liver", "Brain"] },
  { question: "How many legs does a spider have?", answer: "8", category: "biology", difficulty: "easy", wrongAnswers: ["6", "10", "12"] },
  { question: "What do plants need to make food?", answer: "Sunlight", category: "biology", difficulty: "easy", wrongAnswers: ["Moonlight", "Darkness", "Rain"] },
  { question: "What is the process by which plants make food called?", answer: "Photosynthesis", category: "biology", difficulty: "easy", wrongAnswers: ["Respiration", "Digestion", "Fermentation"] },
  
  // Chemistry - Easy
  { question: "What is the chemical symbol for water?", answer: "H2O", category: "chemistry", difficulty: "easy", wrongAnswers: ["CO2", "O2", "H2"] },
  { question: "What is the chemical symbol for oxygen?", answer: "O2", category: "chemistry", difficulty: "easy", wrongAnswers: ["O", "Ox", "O3"] },
  { question: "What state of matter is water at room temperature?", answer: "Liquid", category: "chemistry", difficulty: "easy", wrongAnswers: ["Solid", "Gas", "Plasma"] },
  
  // Physics - Easy
  { question: "What force pulls objects toward Earth?", answer: "Gravity", category: "physics", difficulty: "easy", wrongAnswers: ["Magnetism", "Friction", "Electricity"] },
  { question: "What is the speed of light approximately?", answer: "300,000 km/s", category: "physics", difficulty: "easy", wrongAnswers: ["150,000 km/s", "500,000 km/s", "100,000 km/s"] },
  { question: "What type of energy does a moving car have?", answer: "Kinetic", category: "physics", difficulty: "easy", wrongAnswers: ["Potential", "Chemical", "Nuclear"] },
  
  // Earth Science - Easy
  { question: "What is the center of our solar system?", answer: "The Sun", category: "earth_science", difficulty: "easy", wrongAnswers: ["The Moon", "Earth", "Jupiter"] },
  { question: "How many planets are in our solar system?", answer: "8", category: "earth_science", difficulty: "easy", wrongAnswers: ["7", "9", "10"] },
  { question: "What is the largest planet in our solar system?", answer: "Jupiter", category: "earth_science", difficulty: "easy", wrongAnswers: ["Saturn", "Earth", "Mars"] },
  
  // Biology - Medium
  { question: "What is the powerhouse of the cell?", answer: "Mitochondria", category: "biology", difficulty: "medium", wrongAnswers: ["Nucleus", "Ribosome", "Chloroplast"] },
  { question: "What type of blood cells fight infection?", answer: "White blood cells", category: "biology", difficulty: "medium", wrongAnswers: ["Red blood cells", "Platelets", "Plasma"] },
  
  // Chemistry - Medium
  { question: "What is the pH of pure water?", answer: "7", category: "chemistry", difficulty: "medium", wrongAnswers: ["0", "14", "10"] },
  { question: "What gas do plants absorb from the atmosphere?", answer: "Carbon dioxide", category: "chemistry", difficulty: "medium", wrongAnswers: ["Oxygen", "Nitrogen", "Hydrogen"] },
  
  // Physics - Medium
  { question: "What is the unit of electrical resistance?", answer: "Ohm", category: "physics", difficulty: "medium", wrongAnswers: ["Volt", "Ampere", "Watt"] },
  { question: "What is the first law of motion also known as?", answer: "Law of Inertia", category: "physics", difficulty: "medium", wrongAnswers: ["Law of Acceleration", "Law of Action", "Law of Gravity"] },
  
  // Earth Science - Medium
  { question: "What layer of Earth's atmosphere contains the ozone layer?", answer: "Stratosphere", category: "earth_science", difficulty: "medium", wrongAnswers: ["Troposphere", "Mesosphere", "Thermosphere"] },
  { question: "What type of rock is formed from cooled lava?", answer: "Igneous", category: "earth_science", difficulty: "medium", wrongAnswers: ["Sedimentary", "Metamorphic", "Limestone"] },
  
  // Biology - Hard
  { question: "What is the process of cell division that produces gametes?", answer: "Meiosis", category: "biology", difficulty: "hard", wrongAnswers: ["Mitosis", "Binary fission", "Budding"] },
  { question: "What is the genetic material in cells called?", answer: "DNA", category: "biology", difficulty: "hard", wrongAnswers: ["RNA", "Protein", "Lipid"] },
  
  // Chemistry - Hard
  { question: "What is Avogadro's number approximately?", answer: "6.022 × 10²³", category: "chemistry", difficulty: "hard", wrongAnswers: ["3.14 × 10²³", "9.81 × 10²³", "1.00 × 10²⁴"] },
  { question: "What is the most abundant element in the universe?", answer: "Hydrogen", category: "chemistry", difficulty: "hard", wrongAnswers: ["Helium", "Oxygen", "Carbon"] },
  
  // Physics - Hard
  { question: "What is the quantum of electromagnetic radiation called?", answer: "Photon", category: "physics", difficulty: "hard", wrongAnswers: ["Electron", "Neutron", "Proton"] },
  { question: "What is the SI unit of force?", answer: "Newton", category: "physics", difficulty: "hard", wrongAnswers: ["Joule", "Pascal", "Watt"] },
  
  // Earth Science - Hard
  { question: "What is the boundary between two tectonic plates called?", answer: "Fault line", category: "earth_science", difficulty: "hard", wrongAnswers: ["Trench", "Ridge", "Rift"] },
  { question: "What is the study of earthquakes called?", answer: "Seismology", category: "earth_science", difficulty: "hard", wrongAnswers: ["Geology", "Meteorology", "Volcanology"] }
];

export class ScienceQuestionGenerator implements QuestionGenerator {
  generate(options: QuestionGeneratorOptions): Question[] {
    const questions: Question[] = [];
    const { count, difficulty, questionType, answerFormat } = options;
    
    // Filter facts by difficulty and question type
    let availableFacts = SCIENCE_FACTS.filter(fact => {
      if (difficulty !== 'medium' && fact.difficulty !== difficulty) return false;
      if (difficulty === 'medium' && fact.difficulty === 'hard') return false;
      
      if (questionType !== ScienceQuestionType.BASIC_FACTS) {
        return fact.category === questionType.replace('_', ' ').toLowerCase();
      }
      return true;
    });
    
    // If not enough facts, use all available
    if (availableFacts.length < count) {
      availableFacts = SCIENCE_FACTS;
    }
    
    // Shuffle and select
    const shuffled = availableFacts.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));
    
    // Generate questions
    for (let i = 0; i < count; i++) {
      const fact = selected[i % selected.length];
      questions.push(this.createQuestion(fact, answerFormat, i));
    }
    
    return questions;
  }

  private createQuestion(fact: ScienceFact, answerFormat: AnswerFormat, index: number): ScienceQuestion {
    const base: ScienceQuestion = {
      id: `science-${fact.category}-${Date.now()}-${index}`,
      subject: Subject.SCIENCE,
      questionType: this.mapCategoryToType(fact.category),
      answerFormat,
      question: fact.question,
      answer: fact.answer,
      difficulty: fact.difficulty,
      category: fact.category,
      explanation: fact.explanation
    };

    if (answerFormat === AnswerFormat.MCQ && fact.wrongAnswers) {
      const options = [fact.answer, ...fact.wrongAnswers].sort(() => Math.random() - 0.5);
      return { ...base, options } as ScienceQuestion;
    }

    return base;
  }

  private mapCategoryToType(category: string): ScienceQuestionType {
    switch (category) {
      case 'biology': return ScienceQuestionType.BIOLOGY;
      case 'chemistry': return ScienceQuestionType.CHEMISTRY;
      case 'physics': return ScienceQuestionType.PHYSICS;
      case 'earth_science': return ScienceQuestionType.EARTH_SCIENCE;
      default: return ScienceQuestionType.BASIC_FACTS;
    }
  }

  validateAnswer(question: Question, userAnswer: string): boolean {
    const normalizedAnswer = userAnswer.trim().toLowerCase();
    const correctAnswer = question.answer.trim().toLowerCase();
    return normalizedAnswer === correctAnswer;
  }
}

