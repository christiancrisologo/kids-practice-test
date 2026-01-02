// No static import - data will be passed as parameter
let cachedScienceData: ScienceQuestionTemplate[] | null = null;

export interface ScienceQuestionTemplate {
  question: string;
  answer: string;
  options?: string[];
  difficulty: string;
  level: string;
  hint?: string;
  topic: string;
  answertype: string[];
}

/**
 * Set the science data to be used for question generation
 * This should be called with the fetched science.json data
 */
export function setScienceData(data: ScienceQuestionTemplate[]): void {
  cachedScienceData = data;
}

/**
 * Get the cached science data
 * @internal
 */
export function getScienceData(): ScienceQuestionTemplate[] {
  if (!cachedScienceData) {
    console.warn('Science data not loaded yet. Using empty array.');
    return [];
  }
  return cachedScienceData;
}

/**
 * Filter science questions by criteria
 */
export function filterScienceQuestions(
  difficulty: string,
  topic: string,
  answerType: string
): ScienceQuestionTemplate[] {
  const data = getScienceData();

  return data.filter(q => {
    // Match difficulty (case-insensitive)
    const difficultyMatch = difficulty === 'medium'
      ? q.difficulty.toLowerCase() !== 'hard'
      : q.difficulty.toLowerCase() === difficulty.toLowerCase();

    // Match topic (case-insensitive)
    let topicMatch = false;
    if (topic === 'all' || topic === 'general') {
      // Match all topics
      topicMatch = true;
    } else {
      // Normalize both the filter topic and question topic for comparison
      const normalizedFilterTopic = topic.toLowerCase().replace(/\s+/g, ' ').trim();
      const normalizedQuestionTopic = q.topic.toLowerCase().replace(/\s+/g, ' ').trim();

      // Check for exact match or if question topic starts with filter topic
      // This handles "General" matching "General Science" and "Earth and space" matching "Earth and Space"
      topicMatch = normalizedQuestionTopic === normalizedFilterTopic ||
                   normalizedQuestionTopic.startsWith(normalizedFilterTopic);
    }

    // Match answer type
    const answerTypeMatch = q.answertype.includes(answerType);

    return difficultyMatch && topicMatch && answerTypeMatch;
  });
}

/**
 * Get a random selection of science questions
 */
export function getRandomScienceQuestions(
  count: number,
  difficulty: string,
  topic: string,
  answerType: string
): ScienceQuestionTemplate[] {
  const allData = getScienceData();
  console.log('[ScienceData] Total questions available:', allData.length);
  console.log('[ScienceData] Filtering with:', { difficulty, topic, answerType });

  // Log sample of available topics
  if (allData.length > 0) {
    const uniqueTopics = [...new Set(allData.map(q => q.topic))];
    console.log('[ScienceData] Available topics in data:', uniqueTopics);
  }

  const filtered = filterScienceQuestions(difficulty, topic, answerType);
  console.log('[ScienceData] Filtered questions:', filtered.length);

  if (filtered.length === 0) {
    console.warn('[ScienceData] No science questions found matching criteria, using all questions');
    return getScienceData().slice(0, count);
  }

  // Shuffle and select
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);

  // If we don't have enough questions, repeat them
  const result: ScienceQuestionTemplate[] = [];
  for (let i = 0; i < count; i++) {
    result.push(shuffled[i % shuffled.length]);
  }

  console.log('[ScienceData] Returning', result.length, 'questions');
  return result;
}

