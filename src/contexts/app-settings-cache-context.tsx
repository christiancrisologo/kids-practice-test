'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings } from '../types/settings';

export interface CachedAppSettings {
  settings: AppSettings;
  timestamp: number;
  version: string;
}

interface AppSettingsCacheContextType {
  settings: AppSettings | null;
  getSettings: () => AppSettings | null;
  setSettings: (settings: AppSettings) => void;
  clearSettings: () => void;
  isSettingsCached: () => boolean;
}

const AppSettingsCacheContext = createContext<AppSettingsCacheContextType | undefined>(undefined);

const CACHE_VERSION = '1.0.0';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const STORAGE_KEY = 'appSettings';

interface AppSettingsCacheProviderProps {
  children: ReactNode;
}

export const AppSettingsCacheProvider: React.FC<AppSettingsCacheProviderProps> = ({ children }) => {
  const [settings, setSettingsState] = useState<AppSettings | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed: CachedAppSettings = JSON.parse(cached);

          // Check if cache is still valid
          const isExpired = Date.now() - parsed.timestamp > CACHE_EXPIRY_MS;
          const isVersionMismatch = parsed.version !== CACHE_VERSION;

          if (!isExpired && !isVersionMismatch && parsed.settings) {
            setSettingsState(parsed.settings);
            console.log('[AppSettingsCache] Loaded settings from localStorage');
          } else {
            // Clear expired or invalid cache
            localStorage.removeItem(STORAGE_KEY);
            console.log('[AppSettingsCache] Cleared expired/invalid settings cache');
          }
        }
      } catch (error) {
        console.error('[AppSettingsCache] Error loading settings from localStorage:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    loadFromLocalStorage();
  }, []);

  const getSettings = (): AppSettings | null => {
    return settings;
  };

  const setSettings = (newSettings: AppSettings) => {
    // Update state
    setSettingsState(newSettings);

    // Save to localStorage
    try {
      const cachedData: CachedAppSettings = {
        settings: newSettings,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedData));
      console.log('[AppSettingsCache] Saved settings to localStorage');
    } catch (error) {
      console.error('[AppSettingsCache] Error saving settings to localStorage:', error);
    }
  };

  const clearSettings = () => {
    setSettingsState(null);
    localStorage.removeItem(STORAGE_KEY);
    console.log('[AppSettingsCache] Cleared settings cache');
  };

  const isSettingsCached = (): boolean => {
    return settings !== null;
  };

  return (
    <AppSettingsCacheContext.Provider
      value={{
        settings,
        getSettings,
        setSettings,
        clearSettings,
        isSettingsCached,
      }}
    >
      {children}
    </AppSettingsCacheContext.Provider>
  );
};

export const useAppSettingsCache = () => {
  const context = useContext(AppSettingsCacheContext);
  if (context === undefined) {
    throw new Error('useAppSettingsCache must be used within an AppSettingsCacheProvider');
  }
  return context;
};

