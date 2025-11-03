// app/api/admin/update-user/route.js - Fixed for Next.js 15 (role editing removed)
import { getSupabaseRouteClient } from '@/lib/supabaseRouteHandler';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    const supabase = await getSupabaseRouteClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles_new')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get request data
    const { userId, updateData } = await request.json();

    if (!userId || !updateData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!updateData.full_name?.trim() || !updateData.email?.trim()) {
      return NextResponse.json(
        { error: 'Full name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updateData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate contact number if provided
    if (updateData.contact_number && !/^\d{10,15}$/.test(updateData.contact_number)) {
      return NextResponse.json(
        { error: 'Contact number must be 10-15 digits' },
        { status: 400 }
      );
    }

    // HYBRID APPROACH: Admins can only update organizational fields
    // Personal identity fields (full_name, email) are excluded from admin updates
    const updateObject = {
      // Organizational fields - Admin CAN update these
      contact_number: updateData.contact_number?.trim() || null,
      dept: updateData.dept || null,
      year: updateData.year || null,
      updated_at: new Date().toISOString()
      // Personal fields (full_name, email) are NOT included - users must update these themselves
    };

    // Log if admin tried to update personal fields
    if (updateData.full_name || updateData.email) {
      console.warn(`Admin ${user.id} attempted to update personal fields (name/email) for user ${userId}. Only organizational fields were updated.`);
    }

    // Log warning if role update was attempted
    if (updateData.role) {
      console.warn(`Admin ${user.id} attempted to update role for user ${userId}, but role updates are disabled`);
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles_new')
      .update(updateObject)
      .eq('id', userId)
      .select();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: `Failed to update user profile: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Extract the first (and only) updated row
    const updatedProfile = updatedUser?.[0];

    if (!updatedProfile) {
      console.error('No rows updated. This usually means RLS policies are blocking the update.');
      return NextResponse.json(
        { error: 'Update failed: No rows affected. Please ensure RLS policies allow admin updates.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedProfile,
      message: 'User profile updated successfully (only organizational fields: dept, year, contact)',
      note: 'Full name and email can only be updated by the user themselves'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}