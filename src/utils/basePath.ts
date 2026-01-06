
/**
 * Get the full URL for a config file
 * Next.js automatically prepends the basePath from next.config.ts when using absolute paths
 * @param path - The path to the config file (e.g., 'configs/settings.json')
 * @returns The absolute path (Next.js will add basePath automatically)
 */
export function getConfigUrl(path: string): string {
  const basePath = window.location.origin || '';

  return `${basePath}/${path}`;
}

/**
 * Get the full URL for any asset
 * @param path - The path to the asset
 * @returns The absolute path (Next.js will add basePath automatically)
 */
export function getAssetUrl(path: string): string {
  const basePath = window.location.origin || '';

  return `${basePath}/${path}`;
}

