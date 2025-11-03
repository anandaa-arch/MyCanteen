// app/api/reminders/route.js - SECURED
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

    // 3. Fetch reminders
    const { data, error } = await supabase
      .from('reminders')
      .select(`
        *,
        inventory_items(name)
      `)
      .order('next_due_date');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Reminders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
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

    // 3. Validate and create reminder
    const body = await request.json();
    const { name, item_id, description, recurrence, next_due_date } = body;

    // Input validation
    if (!name || !recurrence || !next_due_date) {
      return NextResponse.json(
        { error: 'Name, recurrence, and next due date are required' },
        { status: 400 }
      );
    }

    const validRecurrences = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!validRecurrences.includes(recurrence)) {
      return NextResponse.json(
        { error: 'Invalid recurrence. Must be one of: daily, weekly, monthly, yearly' },
        { status: 400 }
      );
    }

    // Validate date format
    if (isNaN(Date.parse(next_due_date))) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Verify item exists if item_id provided
    if (item_id) {
      const { data: item, error: itemError } = await supabase
        .from('inventory_items')
        .select('id')
        .eq('id', item_id)
        .single();

      if (itemError || !item) {
        return NextResponse.json(
          { error: 'Invalid item ID' },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from('reminders')
      .insert([{
        name: name.trim(),
        item_id: item_id || null,
        description: description?.trim() || null,
        recurrence,
        next_due_date
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Reminders POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}