import { getSupabaseRouteClient } from '@/lib/supabaseRouteHandler';
import { fetchPollsForDate } from '@/lib/pollHelpers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = await getSupabaseRouteClient();

    // Ensure caller is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure caller is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles_new')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const fallbackDate = new Date().toISOString().split('T')[0];
    const targetDate = dateParam || fallbackDate;

    const { polls, error, warning } = await fetchPollsForDate(supabase, targetDate);

    if (error) {
      console.error('Poll lookup error:', error);
      const isMissingTable = error.code === '42P01';
      if (isMissingTable) {
        return NextResponse.json({ date: targetDate, polls: [], warning: 'Polls table unavailable' });
      }

      return NextResponse.json(
        { error: 'Failed to fetch polls', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ date: targetDate, polls, warning });
  } catch (err) {
    console.error('Admin polls API error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
