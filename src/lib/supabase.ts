import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  throw new Error('Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Expected format: https://your-project.supabase.co');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Since we're not using authentication
  },
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Supabase ${operation} error:`, error);
  
  // Log more details for debugging
  if (error.details) {
    console.error('Error details:', error.details);
  }
  if (error.hint) {
    console.error('Error hint:', error.hint);
  }
  
  // Provide more specific error messages
  if (error.code === 'PGRST116') {
    throw new Error(`Failed to ${operation}: Table or view not found. Please check your database schema.`);
  } else if (error.code === 'PGRST301') {
    throw new Error(`Failed to ${operation}: Permission denied. Please check your RLS policies.`);
  } else if (error.code === 'PGRST103') {
    throw new Error(`Failed to ${operation}: Invalid query syntax. Please check your query parameters.`);
  } else if (error.message?.includes('fetch')) {
    throw new Error(`Failed to ${operation}: Network error. Please check your internet connection.`);
  } else if (error.message?.includes('JWT')) {
    throw new Error(`Failed to ${operation}: Authentication error. Please check your Supabase keys.`);
  } else {
    throw new Error(`Failed to ${operation}: ${error.message || 'Unknown error'}`);
  }
};