# Settings Source of Truth

## Overview

The app now uses the **fetched `settings.json`** as the single source of truth for all application settings, quiz configurations, and challenge modes. This ensures that all settings are loaded dynamically from `public/configs/settings.json` rather than static imports.

## Architecture

### Data Flow

```
1. App Loads
   ↓
2. QuizDataContext fetches configs/settings.json
   ↓
3. Settings are validated and stored in context
   ↓
4. setAppSettings() is called to cache settings in settingsManager
   ↓
5. All components use settingsManager to access settings
```

### Key Components

#### 1. **Settings Manager** (`src/utils/settingsManager.ts`)
- **Central cache** for all app settings
- Provides `setAppSettings()` to set the fetched data as source of truth
- Provides `getAppSettings()` to access cached settings
- Falls back to `src/configs/settings.json` during build time
- Exports helper functions for accessing specific settings:
  - `getChallengeModes()` - Get all challenge modes
  - `getChallengeMode(name)` - Get specific challenge
  - `getSystemConfig()` - Get system configuration
  - `getHintSettings()` - Get hint settings
  - `getYearLevelPresets()` - Get year level presets
  - `getQuizDataSource()` - Get quiz data source
  - `isSupabaseEnabled()` - Check if Supabase is enabled

#### 2. **QuizDataContext** (`src/contexts/math-data-context.tsx`)
- Fetches `configs/settings.json` from the public folder
- Validates the data is valid JSON
- Calls `setAppSettings()` to set it as the source of truth
- Handles both fresh loads and cached sessionStorage loads
- Logs: `[Settings] Loaded and set as source of truth for app configuration`

#### 3. **System Config** (`src/utils/systemConfig.ts`)
- **No longer imports settings.json statically**
- Uses `settingsManager.getSystemConfig()` to access settings
- Provides backward-compatible functions for system configuration

#### 4. **Challenge Modes** (`src/utils/challengeModes.ts`)
- **No longer imports settings.json statically**
- Uses `settingsManager.getChallengeModes()` to access challenges
- Provides functions for applying and validating challenge modes

#### 5. **Year Level Presets** (`src/utils/yearLevelPresets.ts`)
- **No longer imports settings.json statically**
- Uses `settingsManager.getYearLevelPresets()` to access presets
- Dynamically builds presets from fetched data

#### 6. **Quiz Config Component** (`src/components/quiz/QuizConfig.tsx`)
- **No longer imports settings.json statically**
- Uses `settingsManager.getChallengeModes()` to get challenges
- Dynamically loads challenge options from fetched settings

## Implementation Details

### Setting App Settings

When settings.json is loaded, the context calls:

```typescript
import { setAppSettings } from '@/utils/settingsManager';

// After fetching settings.json
setAppSettings(settingsData);
console.log('[Settings] Loaded and set as source of truth for app configuration');
```

### Accessing Settings

Components and utilities access settings through the manager:

```typescript
import { 
  getChallengeModes, 
  getSystemConfig, 
  getHintSettings 
} from '@/utils/settingsManager';

// Get all challenges
const challenges = getChallengeModes();

// Get system config
const systemConfig = getSystemConfig();

// Get hint settings
const hintSettings = getHintSettings();
```

### Cache Management

The system handles two scenarios:

1. **Fresh Load**: Fetches settings.json and calls `setAppSettings()`
2. **Cached Load**: Restores settings from sessionStorage and calls `setAppSettings()`

```typescript
// Cached load scenario
const cachedSettings = sessionStorage.getItem('quizSettings');
if (cachedSettings) {
  const parsedSettings = JSON.parse(cachedSettings);
  setSettings(parsedSettings);
  setAppSettings(parsedSettings); // Set as source of truth
}
```

### Build-Time Fallback

During build (SSG), settings aren't fetched yet, so the manager falls back to the static import:

```typescript
export function getAppSettings(): AppSettings {
  if (!cachedSettings) {
    console.warn('[Settings Manager] Settings not loaded yet, using default settings from src/configs');
    return defaultSettingsData as unknown as AppSettings;
  }
  return cachedSettings;
}
```

This ensures:
- ✅ Build succeeds with default settings
- ✅ Runtime uses fetched settings as source of truth
- ✅ No duplicate data or version mismatches

## Benefits

### ✅ Single Source of Truth
- All settings come from the fetched `public/configs/settings.json`
- No duplicate data or static imports at runtime
- Easy to update settings by modifying the JSON file

### ✅ Dynamic Updates
- Changes to `public/configs/settings.json` are immediately reflected
- No need to rebuild or restart the app
- Supports runtime configuration

### ✅ Consistent Data
- Same settings used across all components
- No risk of version mismatches between static and dynamic data
- Centralized settings management

### ✅ Better Performance
- Settings are fetched once and cached
- No redundant imports or bundling
- Smaller bundle size (no static JSON in bundle at runtime)

### ✅ Type Safety
- TypeScript types ensure settings structure is correct
- Build-time validation with fallback to default settings
- Runtime validation when settings are loaded

## File Structure

```
public/configs/
  └── settings.json          # Source of truth (fetched at runtime)

src/configs/
  └── settings.json          # Copy for build compatibility (fallback only)
  └── math.json              # Copy for build compatibility

src/utils/
  └── settingsManager.ts     # Central cache and settings access
  └── systemConfig.ts        # System configuration (uses manager)
  └── challengeModes.ts      # Challenge modes (uses manager)
  └── yearLevelPresets.ts    # Year level presets (uses manager)

src/contexts/
  └── math-data-context.tsx  # Fetches and sets settings

src/components/quiz/
  └── QuizConfig.tsx         # Uses settings from manager
```

## Migration Notes

### Before
```typescript
// Static import (OLD - removed)
import settings from '../configs/settings.json';

const CHALLENGES = settings.challenges;
```

### After
```typescript
// Dynamic cache (NEW)
import { getChallengeModes } from '@/utils/settingsManager';

const CHALLENGES = getChallengeModes();
```

## Testing

To verify the settings source of truth:

1. **Check Console Logs**:
   - Look for `[Settings] Loaded and set as source of truth for app configuration`
   - During build, you'll see `[Settings Manager] Settings not loaded yet, using default settings from src/configs`
   - At runtime, settings should be loaded from the fetched source

2. **Modify settings.json**:
   - Edit `public/configs/settings.json`
   - Change a challenge name or add a new challenge
   - Refresh the app
   - Verify the changes appear in the quiz config

3. **Check Challenge Modes**:
   - Start quiz configuration
   - Verify challenge dropdown shows challenges from settings.json
   - Select a challenge and verify settings are applied

4. **Check System Config**:
   - Verify theme, Supabase, and storage settings are loaded
   - Check browser console for system config log

## Troubleshooting

### "Settings not loaded yet" Warning

If you see this warning at runtime (not during build):
- The context hasn't loaded settings.json yet
- Components are trying to access settings before they're ready

**Solution**: Ensure components only render after `isReady` is true in the context.

### Settings Not Updating

If changes to settings.json don't appear:
1. Clear browser cache and sessionStorage
2. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
3. Check browser console for fetch errors
4. Verify `public/configs/settings.json` was updated (not just `src/configs/settings.json`)

### Build Errors

If you get "Cannot find module" errors:
- Ensure `src/configs/settings.json` exists (copy from public if needed)
- This file is needed for TypeScript type checking during build
- It's used as a fallback during SSG, but not at runtime

### Type Errors

If you get type mismatch errors:
- Check that `src/types/settings.ts` matches the structure of your settings.json
- Ensure `AppSettings` interface is up to date
- The manager uses `as unknown as AppSettings` for the fallback to handle minor type differences

## Files Modified

- ✅ `src/utils/settingsManager.ts` - **NEW** - Central settings cache and manager
- ✅ `src/contexts/math-data-context.tsx` - Added setAppSettings() calls
- ✅ `src/utils/systemConfig.ts` - Removed static import, uses settingsManager
- ✅ `src/utils/challengeModes.ts` - Removed static import, uses settingsManager
- ✅ `src/utils/yearLevelPresets.ts` - Removed static import, uses settingsManager
- ✅ `src/components/quiz/QuizConfig.tsx` - Removed static import, uses settingsManager

## Related Documentation

- See `MATH_DATA_SOURCE.md` for how math question data is managed
- Both systems follow the same pattern: fetch → cache → use

## Summary

The settings system now follows the same pattern as the math data system:
1. **Fetch** settings.json at runtime
2. **Cache** in settingsManager
3. **Use** cached settings throughout the app
4. **Fallback** to static import only during build

This ensures `public/configs/settings.json` is the single source of truth for all app configuration! 🎉


