import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Returns true if valid, non-placeholder Supabase credentials have been configured.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes('your-project-id') &&
      !supabaseAnonKey.includes('your-anon-key') &&
      supabaseUrl.startsWith('https://')
  );
}

// Fallback to placeholder client if not configured so the app initializes safely without throwing
const effectiveUrl = isSupabaseConfigured() ? supabaseUrl : 'https://demo-ethionutrition.supabase.co';
const effectiveKey = isSupabaseConfigured()
  ? supabaseAnonKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy-signature';

export const supabase = createClient(effectiveUrl, effectiveKey);
