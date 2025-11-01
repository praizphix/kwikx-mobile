import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isDevelopment = import.meta.env.DEV;
const isConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create a simple mock client for development
const createMockClient = () => ({
  auth: {
    signUp: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
    signInWithPassword: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    resetPasswordForEmail: async () => ({ error: { message: 'Supabase not configured' } }),
    updateUser: async () => ({ error: { message: 'Supabase not configured' } }),
    verifyOtp: async () => ({ error: { message: 'Supabase not configured' } }),
    resend: async () => ({ error: { message: 'Supabase not configured' } })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        maybeSingle: async () => ({ data: null, error: null }),
        order: () => ({
          limit: () => ({ data: [], error: null })
        })
      }),
      order: () => ({ data: [], error: null }),
      limit: () => ({ data: [], error: null }),
      in: () => ({ data: [], error: null })
    }),
    insert: () => ({ error: { message: 'Supabase not configured' } }),
    update: () => ({ eq: () => ({ error: { message: 'Supabase not configured' } }) }),
    upsert: () => ({ error: { message: 'Supabase not configured' } }),
    delete: () => ({ eq: () => ({ error: { message: 'Supabase not configured' } }) })
  }),
  storage: {
    from: () => ({ upload: async () => ({ data: null, error: { message: 'Supabase not configured' } }) })
  },
  rpc: async () => ({ error: { message: 'Supabase not configured' } })
});

let supabase;

if (isConfigured) {
  try {
    // Validate URL format
    new URL(supabaseUrl);
    
    // Create the Supabase client with minimal configuration
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Invalid Supabase URL format:', error);
    supabase = createMockClient();
  }
} else {
  console.warn('⚠️ Supabase not configured - using mock client for development');
  supabase = createMockClient();
}

export const supabaseConfig = {
  isConfigured,
  isDevelopment,
  url: supabaseUrl,
  hasValidConfig: isConfigured && supabaseUrl && supabaseAnonKey
};

export { supabase };
export default supabase;