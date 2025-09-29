// app/api/admin/update-user/route.js - Fixed for Next.js 15 (role editing removed)
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
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

    // Check if email is already taken by another user
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles_new')
      .select('id')
      .eq('email', updateData.email.trim().toLowerCase())
      .neq('id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking email uniqueness:', checkError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already taken by another user' },
        { status: 409 }
      );
    }

    // Prepare update object (EXPLICITLY EXCLUDING role - admins can no longer change roles)
    const updateObject = {
      full_name: updateData.full_name.trim(),
      email: updateData.email.trim().toLowerCase(),
      contact_number: updateData.contact_number?.trim() || null,
      department: updateData.department?.trim() || null,
      academic_year: updateData.academic_year || null
      // Note: role is explicitly NOT included in the update
    };

    // Log warning if role update was attempted
    if (updateData.role) {
      console.warn(`Admin ${user.id} attempted to update role for user ${userId}, but role updates are disabled`);
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles_new')
      .update(updateObject)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User profile updated successfully (role updates are not permitted)'
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