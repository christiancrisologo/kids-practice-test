'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubjectSelection } from '../components/SubjectSelection';
import { useQuizStore } from '../store/quiz-store';
import { useQuizData } from '../contexts/quiz-data-context';
import { setTemplateData } from '../utils/templateLoader';
import { setMathData } from '../utils/dynamicMathGenerator';
import { getConfigUrl } from '../utils/basePath';

interface SubjectInfo {
  name: string;
  label: string;
  description: string;
}

export default function Home() {
  const router = useRouter();
  const { setCurrentSubject } = useQuizStore();
  const { isReady, settings } = useQuizData();
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [isLoadingSubject, setIsLoadingSubject] = useState(false);
  const [hasSubjectParam, setHasSubjectParam] = useState(false);

  // Check for subject query parameter and handle routing
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const subjectParam = urlParams.get('subject');

    if (subjectParam) {
      // Has subject param - wait for data to load then redirect to /select
      setHasSubjectParam(true);

      if (isReady) {
        console.log('[Home] Subject param detected and data ready, redirecting to /select');
        router.push(`/select?subject=${subjectParam}`);
      }
    } else {
      // No subject param - show subject selection
      setHasSubjectParam(false);

      // Load subjects from settings when ready
      if (isReady && settings) {
        const subjectsFromSettings = settings.subjects || [];
        setSubjects(subjectsFromSettings);
      }
    }
  }, [isReady, settings, router]);

  // Handle subject selection
  const handleSubjectSelect = async (subjectName: string) => {
    setIsLoadingSubject(true);

    try {
      console.log(`[Home] Loading ${subjectName} data...`);

      // Store subject in Redux
      setCurrentSubject(subjectName as any);

      // Store subject in sessionStorage for quiz-data-context
      sessionStorage.setItem('quizDataType', subjectName);

      // Load the subject's question data
      const questionDataUrl = getConfigUrl(`configs/${subjectName}.json`);
      console.log(`[Home] Fetching from:`, questionDataUrl);

      const response = await fetch(questionDataUrl);
      if (!response.ok) {
        throw new Error(`Failed to load ${subjectName} questions`);
      }

      const questionData = await response.json();
      console.log(`[Home] Loaded ${questionData.length} ${subjectName} questions`);

      // Set the data in the appropriate loader
      if (subjectName === 'math') {
        setMathData(questionData);
      } else {
        setTemplateData(subjectName, questionData);
      }

      // Navigate to select page with subject parameter
      router.push(`/select?subject=${subjectName}`);
    } catch (error) {
      console.error(`[Home] Error loading ${subjectName}:`, error);
      alert(`Failed to load ${subjectName} questions. Please try again.`);
      setIsLoadingSubject(false);
    }
  };

  // Show loading while waiting for initial data or redirecting
  if (!isReady || hasSubjectParam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {hasSubjectParam ? 'Loading quiz data...' : 'Initializing...'}
          </p>
        </div>
      </div>
    );
  }

  // Show subject selection
  return (
    <SubjectSelection
      subjects={subjects}
      onSubjectSelect={handleSubjectSelect}
      isLoading={isLoadingSubject}
    />
  );
}
