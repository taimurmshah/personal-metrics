import { createClient } from '@supabase/supabase-js';

// Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in your environment variables
const supabaseUrl = process.env.SUPABASE_URL;
// Prefer the service role key for privileged server-side access, but fall back to anon key in non-prod
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: SUPABASE_URL');
}

const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

if (!supabaseKey) {
  throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
}

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        // Recommended settings for server-side auth
        // autoRefreshToken: true, // Handled automatically by default unless disabled
        // persistSession: false, // Don't persist session on server, rely on client-side
        // detectSessionInUrl: false // Not typically needed on server
    }
}); 