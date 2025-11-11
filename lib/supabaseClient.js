// lib/supabaseClient.js
'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Singleton pattern - reuse the same client instance
let supabaseClient = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient();
  }
  return supabaseClient;
}

// Hook for use in client components
export function useSupabaseClient() {
  return getSupabaseClient();
}
