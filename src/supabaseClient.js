
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase credentials not found. Check your .env file and ensure variables are prefixed with VITE_.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);