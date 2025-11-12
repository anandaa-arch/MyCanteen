import { getSupabaseRouteClient } from '@/lib/supabaseRouteHandler';
import { NextResponse } from 'next/server';

export async function POST(request) {
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
        { error: 'Only admins can record attendance' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { scannedData } = body;

    if (!scannedData) {
      return NextResponse.json(
        { error: 'scannedData is required' },
        { status: 400 }
      );
    }

    let qrPayload;
    try {
      qrPayload = typeof scannedData === 'string' 
        ? JSON.parse(scannedData) 
        : scannedData;
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid QR data format' },
        { status: 400 }
      );
    }

    const { userId, type, timestamp } = qrPayload;

    if (!userId || type !== 'attendance') {
      return NextResponse.json(
        { error: 'Invalid QR code: missing userId or invalid type' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: scannedUser, error: userError } = await supabase
      .from('profiles_new')
      .select('id, full_name, email')
      .eq('id', userId)
      .single();

    if (userError || !scannedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get today's poll
    const today = new Date().toISOString().split('T')[0];
    const { data: todaysPoll, error: pollError } = await supabase
      .from('polls')
      .select('id')
      .eq('poll_date', today)
      .single();

    if (pollError || !todaysPoll) {
      return NextResponse.json(
        { error: 'No active poll for today' },
        { status: 400 }
      );
    }

    // Create or update attendance record
    const scanTimestamp = new Date().toISOString();
    
    // Check if attendance already recorded
    const { data: existingAttendance, error: existingError } = await supabase
      .from('poll_responses')
      .select('id, confirmation_status')
      .eq('poll_id', todaysPoll.id)
      .eq('user_id', userId)
      .single();

    let attendanceRecord;
    let isNewRecord = false;

    if (existingError?.code === 'PGRST116') {
      // No existing record - create new one
      const { data: newRecord, error: createError } = await supabase
        .from('poll_responses')
        .insert([
          {
            poll_id: todaysPoll.id,
            user_id: userId,
            present: true,
            confirmation_status: 'confirmed_attended',
            attended_at: scanTimestamp,
            created_at: scanTimestamp,
            updated_at: scanTimestamp
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error('Create attendance error:', createError);
        return NextResponse.json(
          { error: 'Failed to record attendance' },
          { status: 500 }
        );
      }

      attendanceRecord = newRecord;
      isNewRecord = true;
    } else if (!existingError && existingAttendance) {
      // Update existing record
      const { data: updatedRecord, error: updateError } = await supabase
        .from('poll_responses')
        .update({
          present: true,
          confirmation_status: 'confirmed_attended',
          attended_at: scanTimestamp,
          updated_at: scanTimestamp
        })
        .eq('id', existingAttendance.id)
        .select()
        .single();

      if (updateError) {
        console.error('Update attendance error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update attendance' },
          { status: 500 }
        );
      }

      attendanceRecord = updatedRecord;
      isNewRecord = false;
    } else {
      console.error('Attendance query error:', existingError);
      return NextResponse.json(
        { error: 'Failed to check existing attendance' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isNewRecord 
        ? 'Attendance recorded successfully' 
        : 'Attendance updated successfully',
      data: {
        attendanceId: attendanceRecord.id,
        userId: scannedUser.id,
        userName: scannedUser.full_name,
        userEmail: scannedUser.email,
        status: attendanceRecord.confirmation_status,
        attendedAt: attendanceRecord.attended_at,
        isNewRecord
      }
    });

  } catch (error) {
    console.error('Attendance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch recent attendance scans
export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Handle user attendance request (doesn't require admin)
    if (action === 'get-user-attendance') {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles_new')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return NextResponse.json(
          { error: 'Failed to load user profile' },
          { status: 500 }
        );
      }

      // Get user's attendance history
      const { data: responses, error: responsesError } = await supabase
        .from('poll_responses')
        .select(`
          id,
          present,
          confirmation_status,
          attended_at,
          created_at,
          date,
          portion_size
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (responsesError) {
        console.error('Responses fetch error:', responsesError);
        return NextResponse.json(
          { error: 'Failed to load attendance records' },
          { status: 500 }
        );
      }

      // Calculate stats
      const present = responses?.filter(r => r.confirmation_status === 'confirmed_attended').length || 0;
      const absent = responses?.filter(r => r.present === false).length || 0;
      
      // Only count records where user made a clear choice (present OR absent)
      // Don't count pending/awaiting confirmation as they haven't finalized attendance
      const total = present + absent;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;

      return NextResponse.json({
        success: true,
        user: profile,
        attendanceHistory: responses || [],
        stats: {
          totalPresent: present,
          totalAbsent: absent,
          attendanceRate: `${rate}%`
        }
      });
    }

    // Admin-only actions below
    // Check if user is admin
    const { data: adminProfile, error: adminProfileError } = await supabase
      .from('profiles_new')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfileError || adminProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can view attendance' },
        { status: 403 }
      );
    }

    const pollId = searchParams.get('pollId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!pollId) {
      return NextResponse.json(
        { error: 'pollId is required' },
        { status: 400 }
      );
    }

    // Get attendance records for the poll
    const { data: attendanceRecords, error: fetchError } = await supabase
      .from('poll_responses')
      .select(`
        id,
        user_id,
        poll_id,
        present,
        confirmation_status,
        attended_at,
        created_at,
        updated_at,
        profiles_new:user_id (
          id,
          full_name,
          email,
          dept,
          year
        )
      `)
      .eq('poll_id', pollId)
      .eq('confirmation_status', 'confirmed_attended')
      .order('attended_at', { ascending: false })
      .limit(limit);

    if (fetchError) {
      console.error('Fetch attendance error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch attendance records' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: attendanceRecords,
      count: attendanceRecords.length
    });

  } catch (error) {
    console.error('Attendance GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
