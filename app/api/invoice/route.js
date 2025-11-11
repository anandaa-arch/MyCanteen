// app/api/invoice/route.js

import { NextResponse } from 'next/server';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import { supabaseAdmin } from '@/lib/supabase';

const MEAL_PRICES = {
  half: 45,
  full: 60
};

export async function POST(request) {
  try {
    const { userId, userName, startDate, endDate } = await request.json();

    // Validate input
    if (!userId || !userName || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch confirmed poll responses (meals) for the date range
    const { data: pollResponses, error: mealsError } = await supabaseAdmin
      .from('poll_responses')
      .select('id, date, portion_size, confirmation_status, present')
      .eq('user_id', userId)
      .eq('confirmation_status', 'confirmed_attended')
      .eq('present', true)
      .gte('date', startDate)
      .lte('date', endDate)
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
        name: userName,
        id: userId,
        department: 'N/A',
      },
      dateRange: {
        start: new Date(startDate).toLocaleDateString('en-IN'),
        end: new Date(endDate).toLocaleDateString('en-IN')
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
        'Content-Disposition': `attachment; filename="Invoice_${userName}_${startDate}_to_${endDate}.pdf"`,
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
