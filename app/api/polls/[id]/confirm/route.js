// app/api/polls/[id]/confirm/route.js - ADMIN ONLY
// Endpoint for admin to confirm/reject poll responses

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

    // 2. Check admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles_new')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const { action, admin_notes } = body;

    // Validate action
    const validActions = ['confirm_attended', 'no_show', 'reject'];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { 
          error: `Invalid action. Must be one of: ${validActions.join(', ')}`,
          valid_actions: validActions
        },
        { status: 400 }
      );
    }

    // Map action to confirmation_status
    const statusMap = {
      'confirm_attended': 'confirmed_attended',
      'no_show': 'no_show',
      'reject': 'rejected'
    };

    const newStatus = statusMap[action];

    // 4. Update the poll response
    const { data, error } = await supabase
      .from('poll_responses')
      .update({
        confirmation_status: newStatus,
        confirmed_by: user.id,
        confirmed_at: new Date().toISOString(),
        admin_notes: admin_notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Poll confirmation update error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'PGRST116' ? 404 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Poll response ${action.replace('_', ' ')} successfully`,
      data
    });

  } catch (error) {
    console.error('Poll confirmation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
