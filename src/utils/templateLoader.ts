/**
 * Generic template loader for question generation
 * Supports loading and filtering templates from JSON files
 */

export interface QuestionTemplate {
  question: string;
  answer: string;
  options?: string[];
  difficulty: string;
  level?: string;
  hint?: string;
  topic: string;
  answertype: string | string[];
}

// Cache for loaded templates
const templateCache = new Map<string, QuestionTemplate[]>();

/**
 * Set template data for a subject (used by data loaders)
 */
export function setTemplateData(subject: string, data: QuestionTemplate[]): void {
  templateCache.set(subject.toLowerCase(), data);
  console.log(`[TemplateLoader] Loaded ${data.length} templates for ${subject}`);
}

/**
 * Get cached template data for a subject
 */
export function getTemplateData(subject: string): QuestionTemplate[] {
  const data = templateCache.get(subject.toLowerCase());
  if (!data) {
    console.warn(`[TemplateLoader] No templates loaded for ${subject}. Using empty array.`);
    return [];
  }
  return data;
}

/**
 * Filter templates by criteria
 */
export function filterTemplates(
  subject: string,
  difficulty: string,
  topic: string,
  answerType: string
): QuestionTemplate[] {
  const data = getTemplateData(subject);

  return data.filter(template => {
    // Match difficulty
    const difficultyMatch = difficulty === 'medium'
      ? template.difficulty.toLowerCase() !== 'hard'
      : template.difficulty.toLowerCase() === difficulty.toLowerCase();

    if (!difficultyMatch) return false;

    // Match topic (if not 'all')
    const topicMatch = topic === 'all' || 
      template.topic.toLowerCase() === topic.toLowerCase() ||
      template.topic.toLowerCase().replace(/\s+/g, '_') === topic.toLowerCase();

    if (!topicMatch) return false;

    // Match answer type
    const templateAnswerType = template.answertype;
    const answerTypeMatch = Array.isArray(templateAnswerType)
      ? templateAnswerType.includes(answerType)
      : templateAnswerType === answerType;

    return answerTypeMatch;
  });
}

/**
 * Get random templates from filtered results
 */
export function getRandomTemplates(
  subject: string,
  count: number,
  difficulty: string,
  topic: string,
  answerType: string
): QuestionTemplate[] {
  const filtered = filterTemplates(subject, difficulty, topic, answerType);

  console.log(`[TemplateLoader] Filtered ${filtered.length} templates for ${subject}:`, {
    difficulty,
    topic,
    answerType
  });

  if (filtered.length === 0) {
    console.warn(`[TemplateLoader] No templates found for ${subject} with criteria:`, {
      difficulty,
      topic,
      answerType
    });
    return [];
  }

  // Shuffle and return requested count
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Clear template cache (useful for testing)
 */
export function clearTemplateCache(): void {
  templateCache.clear();
}

