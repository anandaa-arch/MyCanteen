// app/api/invoice/route.js

import { NextResponse } from 'next/server';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import { getSupabaseRouteClient } from '@/lib/supabaseRouteHandler';

const MEAL_PRICES = {
  half: 45,
  full: 60
};

const normalizeDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().split('T')[0];
};

export async function POST(request) {
  try {
    const supabase = await getSupabaseRouteClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, userName, startDate, endDate } = await request.json();

    // Validate input
    const normalizedStart = normalizeDate(startDate);
    const normalizedEnd = normalizeDate(endDate);

    if (!userId || !normalizedStart || !normalizedEnd) {
      return NextResponse.json(
        { error: 'Missing or invalid parameters' },
        { status: 400 }
      );
    }

    if (new Date(normalizedStart) > new Date(normalizedEnd)) {
      return NextResponse.json(
        { error: 'startDate must be before endDate' },
        { status: 400 }
      );
    }

    const { data: requesterProfile, error: requesterError } = await supabase
      .from('profiles_new')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (requesterError || !requesterProfile) {
      return NextResponse.json(
        { error: 'Unable to load requester profile' },
        { status: 403 }
      );
    }

    const isAdmin = requesterProfile.role === 'admin';
    const isSelfRequest = user.id === userId;

    if (!isAdmin && !isSelfRequest) {
      return NextResponse.json(
        { error: 'Forbidden: insufficient privileges' },
        { status: 403 }
      );
    }

    const { data: targetProfile, error: targetError } = await supabase
      .from('profiles_new')
      .select('id, full_name, dept')
      .eq('id', userId)
      .single();

    if (targetError || !targetProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const invoiceUserName = targetProfile.full_name || userName || 'Account';
    const invoiceDept = targetProfile.dept || 'N/A';

    // Fetch confirmed poll responses (meals) for the date range
    const { data: pollResponses, error: mealsError } = await supabase
      .from('poll_responses')
      .select('id, date, portion_size, confirmation_status, present')
      .eq('user_id', userId)
      .eq('confirmation_status', 'confirmed_attended')
      .eq('present', true)
      .gte('date', normalizedStart)
      .lte('date', normalizedEnd)
      .order('date', { ascending: true });

    if (mealsError) {
      console.error('Error fetching meals:', mealsError);
      throw new Error(`Database error: ${mealsError.message}`);
    }

    // Calculate meal counts and totals
    let halfMealCount = 0;
    let fullMealCount = 0;
    
    pollResponses?.forEach(response => {
      if (response.portion_size === 'half') {
        halfMealCount++;
      } else if (response.portion_size === 'full') {
        fullMealCount++;
      }
    });

    const halfMealCost = halfMealCount * MEAL_PRICES.half;
    const fullMealCost = fullMealCount * MEAL_PRICES.full;
    const totalAmount = halfMealCost + fullMealCost;

    // Prepare meals array for PDF
    const meals = [];
    if (halfMealCount > 0) {
      meals.push({
        description: 'Half Plate Meal',
        quantity: halfMealCount,
        unitPrice: MEAL_PRICES.half,
        total: halfMealCost
      });
    }
    if (fullMealCount > 0) {
      meals.push({
        description: 'Full Plate Meal',
        quantity: fullMealCount,
        unitPrice: MEAL_PRICES.full,
        total: fullMealCost
      });
    }

    // Prepare invoice data
    const invoiceData = {
      invoiceNumber: `INV-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN'),
      user: {
        name: invoiceUserName,
        id: userId,
        department: invoiceDept,
      },
      dateRange: {
        start: new Date(normalizedStart).toLocaleDateString('en-IN'),
        end: new Date(normalizedEnd).toLocaleDateString('en-IN')
      },
      meals: meals,
      totalAmount: totalAmount
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Validate PDF buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF buffer is empty');
    }

    // Return PDF as response
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice_${invoiceUserName}_${normalizedStart}_to_${normalizedEnd}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating invoice:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate invoice',
        message: error.message
      },
      { status: 500 }
    );
  }
}
