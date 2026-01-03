/**
 * Get the base path for the application
 * This is needed for GitHub Pages deployment where the app is served from a subdirectory
 */
export function getBasePath(): string {
  // In production (GitHub Pages), the base path is /kids-practice-test
  // In development, there's no base path
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? '/kids-practice-test' : '';
}

/**
 * Get the full URL for a config file
 * @param path - The path to the config file (e.g., 'configs/settings.json')
 * @returns The full URL with base path
 */
export function getConfigUrl(path: string): string {
  const basePath = getBasePath();
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${basePath}/${cleanPath}`;
}

/**
 * Get the full URL for any asset
 * @param path - The path to the asset
 * @returns The full URL with base path
 */
export function getAssetUrl(path: string): string {
  const basePath = getBasePath();
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${basePath}/${cleanPath}`;
}

