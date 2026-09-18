import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Checks whether valid Supabase environment variables are supplied.
 */
export const isSupabaseConfigured: boolean = Boolean(
  rawSupabaseUrl &&
    rawSupabaseAnonKey &&
    !rawSupabaseUrl.includes('your-project') &&
    rawSupabaseAnonKey !== 'your-anon-key'
);

// Fallback dummy credentials to prevent build crashes or SSR exceptions if env is missing
const resolvedUrl = isSupabaseConfigured && rawSupabaseUrl
  ? rawSupabaseUrl
  : 'https://ceijfadsyboalzzcykiy.supabase.co';

const resolvedAnonKey = isSupabaseConfigured && rawSupabaseAnonKey
  ? rawSupabaseAnonKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

/**
 * Resilient Supabase Client instance optimized for Realtime Broadcast and Presence.
 * Disables session persistence and locks since this is an anonymous real-time room.
 */
export const supabase: SupabaseClient = createClient(resolvedUrl, resolvedAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      // Support smooth keystroke broadcasting without hitting default 10 msgs/sec threshold
      eventsPerSecond: 25,
    },
    timeout: 10000,
    heartbeatIntervalMs: 15000,
    reconnectAfterMs: (tries: number) => {
      // Exponential backoff with ceiling (1s, 2s, 4s, 8s, up to 10s)
      return Math.min(Math.pow(2, tries) * 500, 10000);
    },
  },
});

