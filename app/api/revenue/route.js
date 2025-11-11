// app/api/revenue/route.js - SECURED
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

    // 3. Fetch revenue data
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let query = supabase
      .from('revenues')
      .select(`
        *,
        inventory_items(name)
      `)
      .order('sold_at', { ascending: false })
      .limit(500);

    if (from) query = query.gte('sold_at', from);
    if (to) query = query.lte('sold_at', to);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Revenue GET error:', error);
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

    // 3. Validate and create revenue record
    const body = await request.json();
    const { item_id, quantity, unit_price } = body;

    // Input validation
    if (!item_id || !quantity || !unit_price) {
      return NextResponse.json(
        { error: 'Item ID, quantity, and unit price are required' },
        { status: 400 }
      );
    }

    const parsedQuantity = parseInt(quantity);
    const parsedUnitPrice = parseFloat(unit_price);

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      );
    }

    if (isNaN(parsedUnitPrice) || parsedUnitPrice < 0) {
      return NextResponse.json(
        { error: 'Invalid unit price' },
        { status: 400 }
      );
    }

    // Verify item exists
    const { data: item, error: itemError } = await supabase
      .from('inventory_items')
      .select('id, current_stock')
      .eq('id', item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      );
    }

    // Check stock availability
    if (item.current_stock < parsedQuantity) {
      return NextResponse.json(
        { error: `Insufficient stock. Available: ${item.current_stock}` },
        { status: 400 }
      );
    }

    const total = parsedQuantity * parsedUnitPrice;

    // Insert revenue record
    const { data: revenue, error: revenueError } = await supabase
      .from('revenues')
      .insert([{
        item_id,
        quantity: parsedQuantity,
        unit_price: parsedUnitPrice,
        total
      }])
      .select()
      .single();

    if (revenueError) throw revenueError;

    // Insert inventory log (stock out)
    const { data: log, error: logError } = await supabase
      .from('inventory_logs')
      .insert([{
        item_id,
        type: 'out',
        quantity: parsedQuantity,
        total_amount: total,
        note: 'Sale'
      }])
      .select()
      .single();

    if (logError) throw logError;

    return NextResponse.json({ revenue, log });
  } catch (error) {
    console.error('Revenue POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}