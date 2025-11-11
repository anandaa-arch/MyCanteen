// app/api/inventory-items/route.js - SECURED
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

    // 3. Fetch inventory items
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Inventory items GET error:', error);
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

    // 3. Validate and create inventory item
    const body = await request.json();
    const { name, category, unit_price, selling_price, current_stock, supplier, unit } = body;

    // Input validation
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    const parsedUnitPrice = parseFloat(unit_price || 0);
    const parsedSellingPrice = selling_price ? parseFloat(selling_price) : null;
    const parsedStock = parseInt(current_stock || 0);

    if (isNaN(parsedUnitPrice) || parsedUnitPrice < 0) {
      return NextResponse.json(
        { error: 'Invalid unit price' },
        { status: 400 }
      );
    }

    if (parsedSellingPrice !== null && (isNaN(parsedSellingPrice) || parsedSellingPrice < 0)) {
      return NextResponse.json(
        { error: 'Invalid selling price' },
        { status: 400 }
      );
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      return NextResponse.json(
        { error: 'Invalid stock quantity' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .insert([{
        name: name.trim(),
        category: category.trim(),
        unit: unit?.trim() || 'pcs',
        unit_price: parsedUnitPrice,
        selling_price: parsedSellingPrice,
        current_stock: parsedStock,
        supplier: supplier?.trim() || null
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Inventory items POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}