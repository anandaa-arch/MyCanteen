// lib/supabaseRouteHandler.js
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Get Supabase client for route handlers
 * Usage: const supabase = await getSupabaseRouteClient();
 */
export async function getSupabaseRouteClient() {
  const cookieStore = await cookies();
  return createRouteHandlerClient({ cookies: () => cookieStore });
}
