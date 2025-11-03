// app/api/user/profile/route.js - Fetch current user's profile
import { getSupabaseRouteClient } from '@/lib/supabaseRouteHandler';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = await getSupabaseRouteClient();
    
    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // 2. Fetch user profile from profiles_new
    const { data: profile, error: profileError } = await supabase
      .from('profiles_new')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // 3. Return profile data (exclude sensitive info if needed)
    return NextResponse.json({
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      dept: profile.dept,
      year: profile.year,
      contact_number: profile.contact_number,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    });

  } catch (error) {
    console.error('User profile GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
