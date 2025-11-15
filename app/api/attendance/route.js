import { getSupabaseRouteClient } from '@/lib/supabaseRouteHandler';
import { ensurePollForSlot, pollResponsesSupportsPollId } from '@/lib/pollHelpers';
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
      return NextResponse.json(
        { error: 'Invalid QR data format' },
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

    // Ensure today's poll exists for the selected slot
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

    // Create or update attendance record
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
      // No existing record - create new one
      const insertPayload = {
        user_id: userId,
        present: true,
        confirmation_status: 'confirmed_attended',
        attended_at: scanTimestamp,
        actual_meal_time: scanTimestamp,
        meal_slot: slot,
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
          { error: 'Failed to record attendance' },
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
          { error: 'Failed to update attendance' },
          { status: 500 }
        );
      }

      attendanceRecord = updatedRecord;
      isNewRecord = false;
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
          actual_meal_time,
          confirmed_at,
          updated_at,
          created_at,
          date,
          portion_size,
          meal_slot
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
      const absent = responses?.filter(r => r.present === false || r.confirmation_status === 'cancelled').length || 0;
      
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
    const mealSlot = searchParams.get('mealSlot');
    const targetDate = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!pollId && !(mealSlot && targetDate)) {
      return NextResponse.json(
        { error: 'Provide pollId or mealSlot+date' },
        { status: 400 }
      );
    }

    const pollIdResult = await pollResponsesSupportsPollId(supabase);
    if (pollIdResult.error) {
      console.warn('poll_id probe error:', pollIdResult.error);
    }

    const selectionFields = [
      'id',
      'user_id',
      'present',
      'confirmation_status',
      'attended_at',
      'actual_meal_time',
      'created_at',
      'updated_at',
      'meal_slot',
      'date'
    ];

    if (pollIdResult.supported) {
      selectionFields.splice(2, 0, 'poll_id');
    }

    const attendanceQuery = supabase
      .from('poll_responses')
      .select(selectionFields.join(', '))
      .eq('confirmation_status', 'confirmed_attended')
      .order('attended_at', { ascending: false })
      .limit(limit);

    if (pollId) {
      if (!pollIdResult.supported) {
        return NextResponse.json(
          { error: 'pollId filtering unavailable in current database schema' },
          { status: 400 }
        );
      }
      attendanceQuery.eq('poll_id', pollId);
    } else {
      attendanceQuery.eq('meal_slot', mealSlot).eq('date', targetDate);
    }

    const { data: attendanceRecords, error: fetchError } = await attendanceQuery;

    if (fetchError) {
      console.error('Fetch attendance error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch attendance records' },
        { status: 500 }
      );
    }

    let enrichedRecords = attendanceRecords || [];

    if (enrichedRecords.length) {
      const userIds = [...new Set(enrichedRecords.map((record) => record.user_id).filter(Boolean))];

      if (userIds.length) {
        const { data: profileRows, error: profileFetchError } = await supabase
          .from('profiles_new')
          .select('id, full_name, email, dept, year')
          .in('id', userIds);

        if (profileFetchError) {
          console.warn('Profile lookup error:', profileFetchError);
        } else {
          const profileMap = Object.fromEntries(profileRows.map((profile) => [profile.id, profile]));
          enrichedRecords = enrichedRecords.map((record) => ({
            ...record,
            profiles_new: profileMap[record.user_id] || null,
          }));
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: enrichedRecords,
      count: enrichedRecords.length
    });

  } catch (error) {
    console.error('Attendance GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
