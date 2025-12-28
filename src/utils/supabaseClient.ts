import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseEnabled, logSystemConfig } from './systemConfig';

let supabase: SupabaseClient | null = null;
let supabaseInitialized = false;

// Log system configuration on module load
logSystemConfig();

// Only initialize Supabase if enabled in system config
if (isSupabaseEnabled()) {
	try {
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
		const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
		if (!supabaseUrl || !supabaseAnonKey) {
			console.warn('[Supabase] URL or Anon Key is missing. Running in offline mode with localStorage.');
		} else {
			supabase = createClient(supabaseUrl, supabaseAnonKey);
			supabaseInitialized = true;
			console.log('[Supabase] Client initialized:', supabaseUrl);
		}
	} catch (err) {
		console.error('[Supabase] Initialization error:', err);
		console.log('[Supabase] Falling back to localStorage-only mode');
	}
} else {
	console.log('[Supabase] Disabled in system configuration. Using localStorage-only mode.');
}

/**
 * Check if Supabase client is available and initialized
 */
export function isSupabaseAvailable(): boolean {
	return supabaseInitialized && supabase !== null;
}

/**
 * Get Supabase client (returns null if not available)
 */
export function getSupabaseClient(): SupabaseClient | null {
	return supabase;
}

export { supabase };
