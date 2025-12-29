import { getSystemConfig } from './settingsManager';

export interface SystemConfig {
  theme: {
    default: 'light' | 'dark';
    allowUserPreference: boolean;
  };
  supabase: {
    enabled: boolean;
    syncOnline: boolean;
    fallbackToLocalStorage: boolean;
  };
  storage: {
    useLocalStorage: boolean;
    maxHistoryRecords: number;
  };
  'quiz-data': 'math' | 'english' | 'science';
}

/**
 * Check if Supabase is enabled in the system configuration
 */
export function isSupabaseEnabled(): boolean {
  const config = getSystemConfig();
  return config.supabase.enabled;
}

/**
 * Check if we should use localStorage
 */
export function shouldUseLocalStorage(): boolean {
  const config = getSystemConfig();
  return config.storage.useLocalStorage || !isSupabaseEnabled();
}

/**
 * Check if we should sync with Supabase when online
 */
export function shouldSyncOnline(): boolean {
  const config = getSystemConfig();
  return isSupabaseEnabled() && config.supabase.syncOnline;
}

/**
 * Check if we should fallback to localStorage when Supabase fails
 */
export function shouldFallbackToLocalStorage(): boolean {
  const config = getSystemConfig();
  return config.supabase.fallbackToLocalStorage;
}

/**
 * Get the default theme
 */
export function getDefaultTheme(): 'light' | 'dark' {
  const config = getSystemConfig();
  return config.theme.default;
}

/**
 * Check if user can change theme preference
 */
export function canChangeTheme(): boolean {
  const config = getSystemConfig();
  return config.theme.allowUserPreference;
}

/**
 * Get max history records to store
 */
export function getMaxHistoryRecords(): number {
  const config = getSystemConfig();
  return config.storage.maxHistoryRecords;
}

/**
 * Get the quiz data source
 */
export function getQuizDataSource(): 'math' | 'english' | 'science' {
  const config = getSystemConfig();
  return config['quiz-data'] as 'math' | 'english' | 'science';
}

/**
 * Log system configuration status
 */
export function logSystemConfig(): void {
  console.log('[System Config] Configuration loaded:', {
    supabaseEnabled: isSupabaseEnabled(),
    useLocalStorage: shouldUseLocalStorage(),
    syncOnline: shouldSyncOnline(),
    fallbackToLocalStorage: shouldFallbackToLocalStorage(),
    defaultTheme: getDefaultTheme(),
    maxHistoryRecords: getMaxHistoryRecords(),
    quizDataSource: getQuizDataSource()
  });
}

