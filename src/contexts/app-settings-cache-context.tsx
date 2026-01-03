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

  // Load from sessionStorage on mount
  useEffect(() => {
    const loadFromSessionStorage = () => {
      try {
        const cached = sessionStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed: CachedAppSettings = JSON.parse(cached);
          
          // Check if cache is still valid
          const isExpired = Date.now() - parsed.timestamp > CACHE_EXPIRY_MS;
          const isVersionMismatch = parsed.version !== CACHE_VERSION;

          if (!isExpired && !isVersionMismatch && parsed.settings) {
            setSettingsState(parsed.settings);
            console.log('[AppSettingsCache] Loaded settings from sessionStorage');
          } else {
            // Clear expired or invalid cache
            sessionStorage.removeItem(STORAGE_KEY);
            console.log('[AppSettingsCache] Cleared expired/invalid settings cache');
          }
        }
      } catch (error) {
        console.error('[AppSettingsCache] Error loading settings from sessionStorage:', error);
        sessionStorage.removeItem(STORAGE_KEY);
      }
    };

    loadFromSessionStorage();
  }, []);

  const getSettings = (): AppSettings | null => {
    return settings;
  };

  const setSettings = (newSettings: AppSettings) => {
    // Update state
    setSettingsState(newSettings);

    // Save to sessionStorage
    try {
      const cachedData: CachedAppSettings = {
        settings: newSettings,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cachedData));
      console.log('[AppSettingsCache] Saved settings to sessionStorage');
    } catch (error) {
      console.error('[AppSettingsCache] Error saving settings to sessionStorage:', error);
    }
  };

  const clearSettings = () => {
    setSettingsState(null);
    sessionStorage.removeItem(STORAGE_KEY);
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

