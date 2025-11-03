import { getSupabaseRouteClient } from '@/lib/supabaseRouteHandler';
import { NextResponse } from 'next/server';

// POST: Record attendance scan (alternative - creates poll if needed)
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
      console.error('JSON parse error:', err);
      return NextResponse.json(
        { error: 'Invalid QR data format - must be valid JSON' },
        { status: 400 }
      );
    }

    const { userId, type, timestamp, name, email } = qrPayload;

    if (!userId || type !== 'attendance') {
      return NextResponse.json(
        { error: 'Invalid QR code: missing userId or invalid type' },
        { status: 400 }
      );
    }

    // Verify user exists
    const { data: scannedUser, error: userError } = await supabase
      .from('profiles_new')
      .select('id, full_name, email')
      .eq('id', userId)
      .single();

    if (userError || !scannedUser) {
      return NextResponse.json(
        { error: 'User not found in system' },
        { status: 404 }
      );
    }

    // Get or create today's poll
    const today = new Date().toISOString().split('T')[0];
    
    // Try to get today's poll
    let { data: todaysPoll, error: pollError } = await supabase
      .from('polls')
      .select('id')
      .eq('poll_date', today)
      .single();

    // If no poll exists, create one
    if (pollError?.code === 'PGRST116') {
      const { data: newPoll, error: createPollError } = await supabase
        .from('polls')
        .insert([
          {
            poll_date: today,
            title: `Attendance - ${today}`,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select('id')
        .single();

      if (createPollError) {
        console.error('Create poll error:', createPollError);
        return NextResponse.json(
          { error: 'Failed to create attendance poll' },
          { status: 500 }
        );
      }

      todaysPoll = newPoll;
    } else if (pollError) {
      console.error('Poll fetch error:', pollError);
      return NextResponse.json(
        { error: 'Failed to fetch poll' },
        { status: 500 }
      );
    }

    // Record the attendance
    const scanTimestamp = new Date().toISOString();
    
    // Check for existing record
    const { data: existingAttendance, error: existingError } = await supabase
      .from('poll_responses')
      .select('id, confirmation_status')
      .eq('poll_id', todaysPoll.id)
      .eq('user_id', userId)
      .single();

    let attendanceRecord;
    let isNewRecord = false;

    if (existingError?.code === 'PGRST116') {
      // Create new record
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
          { error: 'Failed to record attendance', details: createError.message },
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
          { error: 'Failed to update attendance', details: updateError.message },
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

    console.log(`✅ Attendance recorded for ${scannedUser.full_name} on ${today}`);

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
        date: today,
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

// GET: Fetch attendance records for today or a specific poll
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

    // Check if user is admin (or get own records if not admin)
    const { data: profile, error: profileError } = await supabase
      .from('profiles_new')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const isAdmin = profile?.role === 'admin';
    const { searchParams } = new URL(request.url);
    const pollId = searchParams.get('pollId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const userId = searchParams.get('userId');

    // If admin and asking for poll, get those records
    if (isAdmin && pollId) {
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
          profiles_new!user_id (
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
    }

    // If not admin, get own records (current user or specified userId if admin)
    const recordUserId = isAdmin && userId ? userId : user.id;

    const { data: myRecords, error: myRecordsError } = await supabase
      .from('poll_responses')
      .select('id, poll_id, present, confirmation_status, attended_at, created_at')
      .eq('user_id', recordUserId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (myRecordsError) {
      console.error('Fetch my records error:', myRecordsError);
      return NextResponse.json(
        { error: 'Failed to fetch records' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: myRecords,
      count: myRecords.length,
      isForUser: recordUserId
    });

  } catch (error) {
    console.error('Attendance GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
