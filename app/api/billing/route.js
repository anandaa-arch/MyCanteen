// app/api/billing/route.js - ONLY CHANGE THESE LINES
import { getSupabaseRouteClient } from '@/lib/supabaseRouteHandler';
import { NextResponse } from 'next/server';

const MEAL_PRICES = {
  half: 45,
  full: 60
};

// Replace ONLY the permission checking section in your GET function
// Find this part in your existing code and replace it:

export async function GET(request) {
  try {
    const supabase = await getSupabaseRouteClient();
    
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

    const { data: profile, error: profileError } = await supabase
      .from('profiles_new')
      .select('role, id')
      .eq('id', user.id)
      .single();

    console.log('👤 User Profile Check:');
    console.log('User ID:', user.id);
    console.log('Profile found:', !!profile);
    console.log('Profile role:', profile?.role);
    console.log('Profile error:', profileError);

    // REPLACE THE OLD ADMIN CHECK WITH THIS:
    // Different permissions for different actions
    if (action === 'get-user-bills' || action === 'get-user-bill') {
      // Users can access their own bills, admins can access any bills
      if (profile?.role !== 'admin' && profile?.id !== userId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    } else {
      // All other actions require admin role
      if (!profile || profile.role !== 'admin') {
        console.log('❌ Admin check failed. Role:', profile?.role);
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    // Import admin client for database operations (bypass RLS)
    const { default: supabaseAdmin } = await import('@/lib/supabaseAdmin');

    // Rest of your switch statement stays the same
    switch (action) {
      case 'calculate-monthly':
        return await calculateMonthlyBills(supabaseAdmin, month, year);
      
      case 'get-user-bill':
        return await getUserBill(supabaseAdmin, userId, month, year);
      
      case 'get-all-bills':
        return await getAllBills(supabaseAdmin, month, year);
      
      case 'get-user-bills':
        return await getUserBills(supabaseAdmin, userId);
      
      case 'debug-poll-responses':
        // Debug action to see all poll responses for the month
        const debugMonth = searchParams.get('debugMonth');
        const debugYear = searchParams.get('debugYear');
        const { data: allResponses } = await supabase
          .from('poll_responses')
          .select('*')
          .eq('month', debugMonth)
          .eq('year', debugYear);
        return NextResponse.json({ allResponses });
      
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
    const supabase = await getSupabaseRouteClient();
    
    const body = await request.json();
    // ... rest of your POST function stays exactly the same
    const { action, userId, month, year, amount, paymentMethod, notes } = body;

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles_new')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    console.log('📋 POST Admin Check:');
    console.log('User:', user.id);
    console.log('Profile role:', profile?.role);
    console.log('Action:', action);

    if (!profile || profile.role !== 'admin') {
      console.log('❌ POST Admin check failed');
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Import admin client for database operations (bypass RLS)
    const { default: supabaseAdmin } = await import('@/lib/supabaseAdmin');

    switch (action) {
      case 'generate-bills':
        return await generateMonthlyBills(supabaseAdmin, month, year);
      
      case 'record-payment':
        return await recordPayment(supabaseAdmin, userId, month, year, amount, paymentMethod, notes, user.id);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Billing POST API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// ALL YOUR HELPER FUNCTIONS STAY EXACTLY THE SAME - NO CHANGES NEEDED
async function calculateMonthlyBillsData(supabase, month, year) {
  if (!month || !year) {
    throw new Error('Month and year are required');
  }

  // Get all confirmed poll responses for the specified month
  // The database stores dates as YYYY-MM-DD, so we need to filter by date range
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

  console.log('🔍 BILLING QUERY DEBUG:');
  console.log('Month:', month, 'Year:', year);
  console.log('Start Date:', startDate, 'End Date:', endDate);
  console.log('Looking for: confirmation_status="confirmed_attended" AND present=true');

  // First, get ALL confirmed poll responses (for debugging)
  const { data: allConfirmed, error: allError } = await supabase
    .from('poll_responses')
    .select('id, date, confirmation_status, present')
    .eq('confirmation_status', 'confirmed_attended')
    .eq('present', true);

  console.log('All confirmed records in DB:', allConfirmed?.length || 0);
  if (allConfirmed && allConfirmed.length > 0) {
    console.log('Sample confirmed records:', allConfirmed.slice(0, 3));
  }

  // Now get records for this specific month
  const { data: responses, error } = await supabase
    .from('poll_responses')
    .select(`
      id,
      user_id,
      date,
      portion_size,
      confirmation_status,
      present
    `)
    .eq('confirmation_status', 'confirmed_attended')
    .eq('present', true)
    .gte('date', startDate)
    .lte('date', endDate);

  console.log('Responses for month', month, '/', year, ':', responses?.length || 0);
  
  if (responses && responses.length > 0) {
    console.log('📋 Sample response:', JSON.stringify(responses[0], null, 2));
  }

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch poll responses: ${error.message}`);
  }

  // Get user profiles for all responses
  const userIds = responses?.map(r => r.user_id) || [];
  let profilesMap = {};
  
  if (userIds.length > 0) {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles_new')
      .select('id, full_name, email')
      .in('id', userIds);
    
    if (!profileError && profiles) {
      profiles.forEach(p => {
        profilesMap[p.id] = p;
      });
    }
  }

  // Calculate bills for each user
  const userBills = {};
  
  responses?.forEach(response => {
    const userId = response.user_id;
    const profile = profilesMap[userId];
    
    if (!userBills[userId]) {
      userBills[userId] = {
        user_id: userId,
        user_name: profile?.full_name || 'Unknown',
        user_email: profile?.email || 'Unknown',
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

  console.log('💰 Bills calculated for users:', Object.keys(userBills).length);

  return {
    bills: Object.values(userBills),
    month: parseInt(month),
    year: parseInt(year),
    summary: {
      total_users: Object.keys(userBills).length,
      total_amount: Object.values(userBills).reduce((sum, bill) => sum + bill.total_amount, 0),
      total_meals: Object.values(userBills).reduce((sum, bill) => sum + bill.half_meal_count + bill.full_meal_count, 0)
    }
  };
}

async function calculateMonthlyBills(supabase, month, year) {
  try {
    const result = await calculateMonthlyBillsData(supabase, month, year);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function generateMonthlyBills(supabase, month, year) {
  if (!month || !year) {
    return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
  }

  try {
    // Calculate the bills
    const calculationData = await calculateMonthlyBillsData(supabase, month, year);
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
  } catch (err) {
    console.error('Error in generateMonthlyBills:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate bills' }, { status: 500 });
  }
}

async function getUserBill(supabase, userId, month, year) {
  const { data: bill, error } = await supabase
    .from('monthly_bills')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error fetching user bill:', error);
    return NextResponse.json({ error: 'Failed to fetch user bill' }, { status: 500 });
  }

  if (!bill) {
    return NextResponse.json({ bill: null });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles_new')
    .select('full_name, email, contact_number, dept')
    .eq('id', userId)
    .single();

  // Get payment records
  const { data: payments } = await supabase
    .from('payment_records')
    .select('*')
    .eq('bill_id', bill.id);

  return NextResponse.json({ 
    bill: {
      ...bill,
      user_profile: profile,
      payment_records: payments || []
    }
  });
}

async function getAllBills(supabase, month, year) {
  let query = supabase
    .from('monthly_bills')
    .select('*')
    .order('total_amount', { ascending: false });

  if (month && year) {
    query = query.eq('month', month).eq('year', year);
  }

  const { data: bills, error } = await query;

  if (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
  }

  // Get user profiles separately and merge
  if (bills && bills.length > 0) {
    const userIds = [...new Set(bills.map(b => b.user_id))];
    const { data: profiles } = await supabase
      .from('profiles_new')
      .select('id, full_name, email, contact_number, dept')
      .in('id', userIds);

    const profilesMap = {};
    profiles?.forEach(p => {
      profilesMap[p.id] = p;
    });

    // Calculate actual paid amounts from meal_payments table
    const billsWithPayments = await Promise.all(
      bills.map(async (bill) => {
        // Get date range for this bill's month
        const startDate = `${bill.year}-${bill.month.toString().padStart(2, '0')}-01`;
        const endDate = new Date(bill.year, bill.month, 0).toISOString().split('T')[0];

        // Get all confirmed meals for this user in this month
        const { data: confirmedMeals } = await supabase
          .from('poll_responses')
          .select('id, portion_size')
          .eq('user_id', bill.user_id)
          .eq('present', true)
          .eq('confirmation_status', 'confirmed_attended')
          .gte('date', startDate)
          .lte('date', endDate);

        if (!confirmedMeals || confirmedMeals.length === 0) {
          return {
            ...bill,
            user_profile: profilesMap[bill.user_id] || null,
            paid_amount: 0,
            due_amount: bill.total_amount,
            status: 'pending'
          };
        }

        // Check which meals have been paid
        const mealIds = confirmedMeals.map(m => m.id);
        const { data: paidMeals } = await supabase
          .from('meal_payments')
          .select('poll_response_id, amount')
          .in('poll_response_id', mealIds);

        const paidAmount = paidMeals?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;
        const dueAmount = Math.max(0, bill.total_amount - paidAmount);

        let status = 'pending';
        if (paidAmount >= bill.total_amount) {
          status = 'paid';
        } else if (paidAmount > 0) {
          status = 'partial';
        }

        return {
          ...bill,
          user_profile: profilesMap[bill.user_id] || null,
          paid_amount: paidAmount,
          due_amount: dueAmount,
          status: status
        };
      })
    );

    return NextResponse.json({ bills: billsWithPayments });
  }

  return NextResponse.json({ bills: [] });
}

async function getUserBills(supabase, userId) {
  const { data: bills, error } = await supabase
    .from('monthly_bills')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) {
    console.error('Error fetching user bills:', error);
    return NextResponse.json({ error: 'Failed to fetch user bills' }, { status: 500 });
  }

  // Get payment records for all bills
  const billIds = bills?.map(b => b.id) || [];
  let paymentsMap = {};
  
  if (billIds.length > 0) {
    const { data: payments } = await supabase
      .from('payment_records')
      .select('*')
      .in('bill_id', billIds);

    payments?.forEach(p => {
      if (!paymentsMap[p.bill_id]) {
        paymentsMap[p.bill_id] = [];
      }
      paymentsMap[p.bill_id].push(p);
    });
  }

  // Calculate payment status for each bill
  const processedBills = bills?.map(bill => {
    const payments = paymentsMap[bill.id] || [];
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    const dueAmount = Math.max(0, bill.total_amount - totalPayments);
    
    let status = 'pending';
    if (totalPayments >= bill.total_amount) {
      status = 'paid';
    } else if (totalPayments > 0) {
      status = 'partial';
    }

    return {
      ...bill,
      payment_records: payments,
      paid_amount: totalPayments,
      due_amount: dueAmount,
      status: status
    };
  }) || [];

  return NextResponse.json({ bills: processedBills });
}

async function recordPayment(supabase, userId, month, year, amount, paymentMethod, notes, recordedBy) {
  // First get the bill (for legacy compatibility)
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

  // Record the payment in payment_records (legacy)
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

  // NEW: Also record in meal_payments table for individual meal tracking
  // Get only admin-confirmed unpaid meals for this user in this month
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  
  const { data: unpaidMeals, error: mealsError } = await supabase
    .from('poll_responses')
    .select('id, portion_size, date')
    .eq('user_id', userId)
    .eq('present', true)
    .eq('confirmation_status', 'confirmed_attended')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (!mealsError && unpaidMeals && unpaidMeals.length > 0) {
    // Check which meals are already paid
    const { data: existingPayments } = await supabase
      .from('meal_payments')
      .select('poll_response_id')
      .in('poll_response_id', unpaidMeals.map(m => m.id));
    
    const paidMealIds = new Set(existingPayments?.map(p => p.poll_response_id) || []);
    
    // Filter to only unpaid meals
    const mealsToPayFor = unpaidMeals.filter(m => !paidMealIds.has(m.id));
    
    // Calculate how many meals we can pay for with this amount
    let remainingAmount = parseFloat(amount);
    const mealPayments = [];
    
    for (const meal of mealsToPayFor) {
      const mealCost = meal.portion_size === 'full' ? 60 : 45;
      
      if (remainingAmount >= mealCost) {
        mealPayments.push({
          poll_response_id: meal.id,
          user_id: userId,
          amount: mealCost,
          payment_date: new Date().toISOString(),
          payment_method: paymentMethod || 'cash',
          recorded_by: recordedBy,
          notes: notes || `Payment for ${meal.portion_size} meal on ${meal.date}`
        });
        remainingAmount -= mealCost;
      }
      
      if (remainingAmount < 45) break; // Can't pay for any more meals
    }
    
    // Insert meal payments
    if (mealPayments.length > 0) {
      const { error: mealPaymentError } = await supabase
        .from('meal_payments')
        .insert(mealPayments);
      
      if (mealPaymentError) {
        console.error('Meal payment recording error:', mealPaymentError);
        // Don't fail the whole operation, just log it
      }
    }
  }

  return NextResponse.json({ 
    message: 'Payment recorded successfully',
    payment: payment
  });
}