import settingsData from '../configs/settings.json';

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

// Load system configuration from settings.json
export const systemConfig: SystemConfig = settingsData.system as SystemConfig;

/**
 * Check if Supabase is enabled in the system configuration
 */
export function isSupabaseEnabled(): boolean {
  return systemConfig.supabase.enabled;
}

/**
 * Check if we should use localStorage
 */
export function shouldUseLocalStorage(): boolean {
  return systemConfig.storage.useLocalStorage || !isSupabaseEnabled();
}

/**
 * Check if we should sync with Supabase when online
 */
export function shouldSyncOnline(): boolean {
  return isSupabaseEnabled() && systemConfig.supabase.syncOnline;
}

/**
 * Check if we should fallback to localStorage when Supabase fails
 */
export function shouldFallbackToLocalStorage(): boolean {
  return systemConfig.supabase.fallbackToLocalStorage;
}

/**
 * Get the default theme
 */
export function getDefaultTheme(): 'light' | 'dark' {
  return systemConfig.theme.default;
}

/**
 * Check if user can change theme preference
 */
export function canChangeTheme(): boolean {
  return systemConfig.theme.allowUserPreference;
}

/**
 * Get max history records to store
 */
export function getMaxHistoryRecords(): number {
  return systemConfig.storage.maxHistoryRecords;
}

/**
 * Get the quiz data source
 */
export function getQuizDataSource(): 'math' | 'english' | 'science' {
  return systemConfig['quiz-data'];
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

