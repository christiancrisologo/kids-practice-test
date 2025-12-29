/**
 * Settings Manager - Single Source of Truth for App Settings
 * 
 * This module manages all app settings using the fetched settings.json as the source of truth.
 * It provides a centralized cache that gets populated when settings.json is loaded.
 */

import type { AppSettings, HintSettings } from '@/types/settings';
import defaultSettingsData from '../configs/settings.json';

// Cache for the fetched settings
let cachedSettings: AppSettings | null = null;

/**
 * Set the app settings from fetched data
 * This should be called by the QuizDataContext when settings.json is loaded
 */
export function setAppSettings(settings: AppSettings): void {
  cachedSettings = settings;
  console.log('[Settings Manager] Settings loaded and cached as source of truth');
}

/**
 * Get the cached app settings
 * Falls back to default settings if not yet loaded
 */
export function getAppSettings(): AppSettings {
  if (!cachedSettings) {
    console.warn('[Settings Manager] Settings not loaded yet, using default settings from src/configs');
    return defaultSettingsData as unknown as AppSettings;
  }
  return cachedSettings;
}

/**
 * Check if settings have been loaded from the fetched source
 */
export function areSettingsLoaded(): boolean {
  return cachedSettings !== null;
}

/**
 * Get hint settings
 */
export function getHintSettings(): HintSettings {
  const settings = getAppSettings();
  return settings.system.hint;
}

/**
 * Get all challenge modes
 */
export function getChallengeModes() {
  const settings = getAppSettings();
  return settings.challenges || [];
}

/**
 * Get a specific challenge mode by name
 */
export function getChallengeMode(name: string) {
  const challenges = getChallengeModes();
  return challenges.find(challenge => challenge.name === name);
}

/**
 * Get year level presets
 */
export function getYearLevelPresets() {
  const settings = getAppSettings();
  return settings.yearLevel || [];
}

/**
 * Get system configuration
 */
export function getSystemConfig() {
  const settings = getAppSettings();
  return settings.system;
}

/**
 * Get theme settings
 */
export function getThemeSettings() {
  const settings = getAppSettings();
  return settings.system.theme;
}

/**
 * Get supabase settings
 */
export function getSupabaseSettings() {
  const settings = getAppSettings();
  return settings.system.supabase;
}

/**
 * Get storage settings
 */
export function getStorageSettings() {
  const settings = getAppSettings();
  return settings.system.storage;
}

/**
 * Get quiz data source
 */
export function getQuizDataSource(): string {
  const settings = getAppSettings();
  return settings.system['quiz-data'] || 'math';
}

/**
 * Check if Supabase is enabled
 */
export function isSupabaseEnabled(): boolean {
  const settings = getSupabaseSettings();
  return settings.enabled;
}

/**
 * Get default quiz configuration from settings
 * This can be used to initialize quiz config with values from settings.json
 */
export function getDefaultQuizConfig() {
  const challenges = getChallengeModes();
  const defaultChallenge = challenges.find(c => c.name === 'No Challenge') || challenges[0];
  
  return {
    numberOfQuestions: defaultChallenge?.settings?.numberOfQuestions || 10,
    timerPerQuestion: defaultChallenge?.settings?.timerPerQuestion || 20,
    timerEnabled: defaultChallenge?.settings?.timerEnabled ?? true,
    questionsEnabled: defaultChallenge?.settings?.questionsEnabled ?? true,
    minCorrectAnswers: defaultChallenge?.settings?.minCorrectAnswers || 0,
    maxCorrectAnswers: defaultChallenge?.settings?.maxCorrectAnswers || 10,
    correctAnswersEnabled: defaultChallenge?.settings?.correctAnswersEnabled ?? false,
    minIncorrectAnswers: defaultChallenge?.settings?.minIncorrectAnswers || 0,
    maxIncorrectAnswers: defaultChallenge?.settings?.maxIncorrectAnswers || 10,
    incorrectAnswersEnabled: defaultChallenge?.settings?.incorrectAnswersEnabled ?? false,
    overallTimerEnabled: defaultChallenge?.settings?.overallTimerEnabled ?? false,
    overallTimerDuration: defaultChallenge?.settings?.overallTimerDuration || 180,
  };
}

