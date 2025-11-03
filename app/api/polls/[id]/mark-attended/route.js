// app/api/polls/[id]/mark-attended/route.js - CUSTOMER
// Endpoint for customers to mark themselves as attended

import { getSupabaseRouteClient } from '@/lib/supabaseRouteHandler';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    // Validate ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid poll response ID' },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseRouteClient();

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { action } = body;

    // Validate action
    const validActions = ['mark_attended', 'cancel'];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { 
          error: `Invalid action. Must be one of: ${validActions.join(', ')}`,
          valid_actions: validActions
        },
        { status: 400 }
      );
    }

    // 3. Get the poll response to verify ownership
    const { data: pollResponse, error: fetchError } = await supabase
      .from('poll_responses')
      .select('id, user_id, confirmation_status')
      .eq('id', id)
      .single();

    if (fetchError || !pollResponse) {
      return NextResponse.json(
        { error: 'Poll response not found' },
        { status: 404 }
      );
    }

    // Verify ownership - customer can only modify their own responses
    if (pollResponse.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - Cannot modify other user\'s poll response' },
        { status: 403 }
      );
    }

    // Determine new status based on action
    let newStatus;
    if (action === 'mark_attended') {
      newStatus = 'awaiting_admin_confirmation';
    } else if (action === 'cancel') {
      newStatus = 'cancelled';
    }

    // 4. Update the poll response
    const { data, error } = await supabase
      .from('poll_responses')
      .update({
        confirmation_status: newStatus,
        attended_at: action === 'mark_attended' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Poll mark attended error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: action === 'mark_attended' 
        ? 'Marked as attending - waiting for admin confirmation'
        : 'Response cancelled',
      data
    });

  } catch (error) {
    console.error('Poll mark attended error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
