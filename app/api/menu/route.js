import { getSupabaseRouteClient } from '@/lib/supabaseRouteHandler';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = await getSupabaseRouteClient();
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const date = searchParams.get('date');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { default: supabaseAdmin } = await import('@/lib/supabaseAdmin');

    switch (action) {
      case 'get-today':
        return await getTodayMenu(supabaseAdmin);
      
      case 'get-by-date':
        return await getMenuByDate(supabaseAdmin, date);
      
      case 'get-monthly':
        return await getMonthlyMenu(supabaseAdmin, year, month);
      
      case 'get-all':
        return await getAllMenus(supabaseAdmin);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Menu API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await getSupabaseRouteClient();
    
    const body = await request.json();
    const { action, ...data } = body;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles_new')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { default: supabaseAdmin } = await import('@/lib/supabaseAdmin');

    switch (action) {
      case 'create-menu':
        return await createMenu(supabaseAdmin, data);
      
      case 'update-menu':
        return await updateMenu(supabaseAdmin, data);
      
      case 'delete-menu':
        return await deleteMenu(supabaseAdmin, data.id);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Menu POST API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function getTodayMenu(supabase) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('date', today)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching today menu:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }

  return NextResponse.json({ menu: data || [] });
}

async function getMenuByDate(supabase, date) {
  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching menu by date:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }

  return NextResponse.json({ menu: data || [] });
}

async function getMonthlyMenu(supabase, year, month) {
  if (!year || !month) {
    return NextResponse.json({ error: 'Year and month are required' }, { status: 400 });
  }

  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching monthly menu:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }

  return NextResponse.json({ menu: data || [] });
}

async function getAllMenus(supabase) {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching all menus:', error);
    return NextResponse.json({ error: 'Failed to fetch menus' }, { status: 500 });
  }

  return NextResponse.json({ menus: data || [] });
}

async function createMenu(supabase, data) {
  const { date, items, description } = data;

  if (!date || !items || items.length === 0) {
    return NextResponse.json({ error: 'Date and items are required' }, { status: 400 });
  }

  const { data: menu, error } = await supabase
    .from('menus')
    .insert({
      date,
      items,
      description: description || null,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating menu:', error);
    return NextResponse.json({ error: 'Failed to create menu' }, { status: 500 });
  }

  return NextResponse.json({ menu, message: 'Menu created successfully' });
}

async function updateMenu(supabase, data) {
  const { id, date, items, description } = data;

  if (!id) {
    return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 });
  }

  const updateData = {};
  if (date) updateData.date = date;
  if (items) updateData.items = items;
  if (description) updateData.description = description;

  const { data: menu, error } = await supabase
    .from('menus')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json({ error: 'Failed to update menu' }, { status: 500 });
  }

  return NextResponse.json({ menu, message: 'Menu updated successfully' });
}

async function deleteMenu(supabase, id) {
  if (!id) {
    return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('menus')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting menu:', error);
    return NextResponse.json({ error: 'Failed to delete menu' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Menu deleted successfully' });
}
