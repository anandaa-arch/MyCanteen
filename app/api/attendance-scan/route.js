import { getSupabaseRouteClient } from '@/lib/supabaseRouteHandler';
import { ensurePollForSlot, pollResponsesSupportsPollId } from '@/lib/pollHelpers';
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
    const { scannedData, mealSlot } = body;

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

    const { userId, type } = qrPayload;

    if (!userId || type !== 'attendance') {
      return NextResponse.json(
        { error: 'Invalid QR code: missing userId or invalid type' },
        { status: 400 }
      );
    }

    const slot = (mealSlot || qrPayload.mealSlot || qrPayload.slot || '').toLowerCase();
    const validSlots = ['breakfast', 'lunch', 'dinner'];
    if (!slot) {
      return NextResponse.json(
        { error: 'Meal slot is required. Please select breakfast, lunch, or dinner.' },
        { status: 400 }
      );
    }
    if (!validSlots.includes(slot)) {
      return NextResponse.json(
        { error: 'Invalid meal slot provided.' },
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
    const { poll: todaysPoll, error: pollError } = await ensurePollForSlot(supabase, today, slot);

    if (pollError || !todaysPoll) {
      console.error('Poll fetch/create error:', pollError);
      return NextResponse.json(
        { error: 'Failed to load attendance poll', details: pollError?.message },
        { status: 500 }
      );
    }

    const pollIdSupport = await pollResponsesSupportsPollId(supabase);
    if (pollIdSupport.error) {
      console.warn('poll_id probe error:', pollIdSupport.error);
    }
    const canUsePollId = Boolean(todaysPoll.id) && pollIdSupport.supported;

    // Record the attendance
    const scanTimestamp = new Date().toISOString();
    
    let attendanceQuery = supabase
      .from('poll_responses')
      .select('id, confirmation_status, actual_meal_time')
      .eq('user_id', userId);

    if (canUsePollId) {
      attendanceQuery = attendanceQuery.eq('poll_id', todaysPoll.id);
    } else {
      attendanceQuery = attendanceQuery.eq('date', today).eq('meal_slot', slot);
    }

    const { data: existingAttendance, error: existingError } = await attendanceQuery.maybeSingle();

    let attendanceRecord;
    let isNewRecord = false;

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Attendance query error:', existingError);
      return NextResponse.json(
        { error: 'Failed to check existing attendance' },
        { status: 500 }
      );
    }

    if (!existingAttendance) {
      // Create new record
      const insertPayload = {
        user_id: userId,
        present: true,
        confirmation_status: 'confirmed_attended',
        attended_at: scanTimestamp,
        meal_slot: slot,
        actual_meal_time: scanTimestamp,
        date: today,
        created_at: scanTimestamp,
        updated_at: scanTimestamp
      };

      if (canUsePollId) {
        insertPayload.poll_id = todaysPoll.id;
      }

      const { data: newRecord, error: createError } = await supabase
        .from('poll_responses')
        .insert([insertPayload])
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
    } else {
      // Update existing record
      const { data: updatedRecord, error: updateError } = await supabase
        .from('poll_responses')
        .update({
          present: true,
          confirmation_status: 'confirmed_attended',
          attended_at: scanTimestamp,
          actual_meal_time: existingAttendance.actual_meal_time || scanTimestamp,
          meal_slot: slot,
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
        mealSlot: attendanceRecord.meal_slot || slot,
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
