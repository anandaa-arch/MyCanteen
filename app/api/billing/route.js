// app/api/billing/route.js - ONLY CHANGE THESE LINES
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const MEAL_PRICES = {
  half: 45,
  full: 60
};

// Replace ONLY the permission checking section in your GET function
// Find this part in your existing code and replace it:

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles_new')
      .select('role, user_id') // ADD user_id to the select
      .eq('id', user.id)
      .single();

    // REPLACE THE OLD ADMIN CHECK WITH THIS:
    // Different permissions for different actions
    if (action === 'get-user-bills' || action === 'get-user-bill') {
      // Users can access their own bills, admins can access any bills
      if (profile?.role !== 'admin' && profile?.user_id !== userId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    } else {
      // All other actions require admin role
      if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    // Rest of your switch statement stays the same
    switch (action) {
      case 'calculate-monthly':
        return await calculateMonthlyBills(supabase, month, year);
      
      case 'get-user-bill':
        return await getUserBill(supabase, userId, month, year);
      
      case 'get-all-bills':
        return await getAllBills(supabase, month, year);
      
      case 'get-user-bills':
        return await getUserBills(supabase, userId);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Billing API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export async function POST(request) {
  try {
    // CHANGE THIS LINE:
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const body = await request.json();
    // ... rest of your POST function stays exactly the same
    const { action, userId, month, year, amount, paymentMethod, notes } = body;

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles_new')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    switch (action) {
      case 'generate-bills':
        return await generateMonthlyBills(supabase, month, year);
      
      case 'record-payment':
        return await recordPayment(supabase, userId, month, year, amount, paymentMethod, notes, profile.full_name);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Billing POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ALL YOUR HELPER FUNCTIONS STAY EXACTLY THE SAME - NO CHANGES NEEDED
async function calculateMonthlyBills(supabase, month, year) {
  if (!month || !year) {
    return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
  }

  // Get all confirmed poll responses for the specified month
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

  const { data: responses, error } = await supabase
    .from('poll_responses')
    .select(`
      user_id,
      portion_size,
      profiles_new!poll_responses_user_id_fkey(user_id, full_name, email)
    `)
    .eq('confirmation_status', 'confirmed')
    .eq('present', true)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch poll responses' }, { status: 500 });
  }

  // Calculate bills for each user
  const userBills = {};
  
  responses?.forEach(response => {
    const userId = response.user_id;
    if (!userBills[userId]) {
      userBills[userId] = {
        user_id: userId,
        user_name: response.profiles_new?.full_name,
        user_email: response.profiles_new?.email,
        half_meal_count: 0,
        full_meal_count: 0,
        half_meal_cost: 0,
        full_meal_cost: 0,
        total_amount: 0
      };
    }

    if (response.portion_size === 'half') {
      userBills[userId].half_meal_count++;
      userBills[userId].half_meal_cost += MEAL_PRICES.half;
    } else {
      userBills[userId].full_meal_count++;
      userBills[userId].full_meal_cost += MEAL_PRICES.full;
    }
    
    userBills[userId].total_amount = userBills[userId].half_meal_cost + userBills[userId].full_meal_cost;
  });

  return NextResponse.json({ 
    bills: Object.values(userBills),
    month: parseInt(month),
    year: parseInt(year),
    summary: {
      total_users: Object.keys(userBills).length,
      total_amount: Object.values(userBills).reduce((sum, bill) => sum + bill.total_amount, 0),
      total_meals: Object.values(userBills).reduce((sum, bill) => sum + bill.half_meal_count + bill.full_meal_count, 0)
    }
  });
}

async function generateMonthlyBills(supabase, month, year) {
  if (!month || !year) {
    return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
  }

  // First calculate the bills
  const calculation = await calculateMonthlyBills(supabase, month, year);
  const calculationData = await calculation.json();

  if (!calculation.ok) {
    return calculation;
  }

  const bills = calculationData.bills;
  
  // Insert or update bills in database
  const billsToUpsert = bills.map(bill => ({
    user_id: bill.user_id,
    month: parseInt(month),
    year: parseInt(year),
    total_amount: bill.total_amount,
    half_meal_count: bill.half_meal_count,
    full_meal_count: bill.full_meal_count,
    half_meal_cost: bill.half_meal_cost,
    full_meal_cost: bill.full_meal_cost,
    due_amount: bill.total_amount,
    status: 'pending'
  }));

  const { data, error } = await supabase
    .from('monthly_bills')
    .upsert(billsToUpsert, { 
      onConflict: 'user_id,month,year',
      ignoreDuplicates: false 
    })
    .select();

  if (error) {
    console.error('Error generating bills:', error);
    return NextResponse.json({ error: 'Failed to generate bills' }, { status: 500 });
  }

  return NextResponse.json({ 
    message: 'Bills generated successfully',
    bills_generated: data?.length || 0,
    bills: data
  });
}

async function getUserBill(supabase, userId, month, year) {
  const { data, error } = await supabase
    .from('monthly_bills')
    .select(`
      *,
      profiles_new!monthly_bills_user_id_fkey(user_id, full_name, email, contact_number),
      payment_records(*)
    `)
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    return NextResponse.json({ error: 'Failed to fetch user bill' }, { status: 500 });
  }

  return NextResponse.json({ bill: data });
}

async function getAllBills(supabase, month, year) {
  let query = supabase
    .from('monthly_bills')
    .select(`
      *,
      profiles_new!monthly_bills_user_id_fkey(user_id, full_name, email, contact_number, department)
    `)
    .order('total_amount', { ascending: false });

  if (month && year) {
    query = query.eq('month', month).eq('year', year);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
  }

  return NextResponse.json({ bills: data });
}

// Replace your existing getUserBills function with this enhanced version:

async function getUserBills(supabase, userId) {
  const { data: bills, error } = await supabase
    .from('monthly_bills')
    .select(`
      *,
      payment_records(
        id,
        amount,
        payment_method,
        payment_date,
        notes,
        recorded_by
      )
    `)
    .eq('user_id', userId)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) {
    console.error('Error fetching user bills:', error);
    return NextResponse.json({ error: 'Failed to fetch user bills' }, { status: 500 });
  }

  // Calculate payment status for each bill
  const processedBills = bills?.map(bill => {
    const totalPayments = bill.payment_records?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    const dueAmount = Math.max(0, bill.total_amount - totalPayments);
    
    let status = 'pending';
    if (totalPayments >= bill.total_amount) {
      status = 'paid';
    } else if (totalPayments > 0) {
      status = 'partial';
    }

    return {
      ...bill,
      paid_amount: totalPayments,
      due_amount: dueAmount,
      status: status
    };
  }) || [];

  return NextResponse.json({ bills: processedBills });
}

async function recordPayment(supabase, userId, month, year, amount, paymentMethod, notes, recordedBy) {
  // First get the bill
  const { data: bill, error: billError } = await supabase
    .from('monthly_bills')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year)
    .single();

  if (billError) {
    return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
  }

  // Record the payment
  const { data: payment, error: paymentError } = await supabase
    .from('payment_records')
    .insert({
      bill_id: bill.id,
      user_id: userId,
      amount: parseFloat(amount),
      payment_method: paymentMethod || 'cash',
      notes: notes,
      recorded_by: recordedBy
    })
    .select()
    .single();

  if (paymentError) {
    console.error('Payment recording error:', paymentError);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }

  return NextResponse.json({ 
    message: 'Payment recorded successfully',
    payment: payment
  });
}