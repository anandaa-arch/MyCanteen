'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@/lib/supabaseClient'
import { getFromCache, setInCache, clearCache } from '@/lib/cache'

import DashboardHeader from './components/DashboardHeader'
import TodaysPollStatus from './components/TodaysPollStatus'
import StatsCards from './components/StatsCards'
import ActionCards from './components/ActionCards'
import QuickInfo from './components/QuickInfo'
import PollModal from './components/PollModal'
import { DashboardErrorBoundary } from '@/components/PageErrorBoundary'
import { FullPageLoader } from '@/components/LoadingSpinner'
import { DashboardSkeleton } from '@/components/Skeleton'
import { useNotifications } from '@/lib/notificationSystem'
import { usePaymentNotifications, usePollNotifications } from '@/lib/notificationSystem'

// Helper function to get current meal slot based on time
const getCurrentMealSlot = () => {
  const now = new Date();
  const hours = now.getHours();
  
  // Breakfast booking: 5:00 AM - 9:00 AM
  if (hours >= 5 && hours < 9) {
    return 'breakfast';
  }
  // Lunch booking: 9:00 AM - 2:00 PM (14:00)
  else if (hours >= 9 && hours < 14) {
    return 'lunch';
  }
  // Dinner booking: 2:00 PM - 10:00 PM (22:00)
  else if (hours >= 14 && hours < 22) {
    return 'dinner';
  }
  // After 10 PM, default to next day's breakfast
  else {
    return 'breakfast';
  }
};

const isResponseMarkedAttending = (response) => {
  if (!response) return false;
  return response.present === true && response.confirmation_status !== 'cancelled';
};

function UserDashboardContent() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { addNotification } = useNotifications()
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Poll states
  const [pollOpen, setPollOpen] = useState(false)
  const [attendance, setAttendance] = useState('yes')
  const [mealType, setMealType] = useState('full')
  const [mealSlot, setMealSlot] = useState(getCurrentMealSlot()) // Auto-select based on current time
  const [pollLoading, setPollLoading] = useState(false)
  const [pollMessage, setPollMessage] = useState('')

  const getResponseForSlot = (slot, responses = []) => {
    if (!responses?.length) return null;
    return responses.find((resp) => resp.meal_slot === slot) || null;
  };

  const syncFormWithSlot = (slot, responses = []) => {
    const match = getResponseForSlot(slot, responses);
    if (match) {
      setAttendance(isResponseMarkedAttending(match) ? 'yes' : 'no');
      setMealType(match.portion_size);
    } else {
      setAttendance('yes');
      setMealType('full');
    }
  };

  const normalizeStats = (stats) => {
    if (!stats) return stats;
    if (Array.isArray(stats.todaysPollResponses)) return stats;

    const fallbackResponses = stats.todaysPollResponse
      ? [stats.todaysPollResponse]
      : [];

    const { todaysPollResponse, confirmationStatus, ...rest } = stats;
    return {
      ...rest,
      todaysPollResponses: fallbackResponses
    };
  };

  // User stats
  const [userStats, setUserStats] = useState({
    totalBill: 0,
    thisMonthMeals: 0,
    allTimeMeals: 0,
    todaysPollResponses: []
  })

  useEffect(() => {
    checkAuthAndLoadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Setup real-time payment notifications
  usePaymentNotifications(currentUser?.id, (notification) => {
    addNotification(notification);
  });

  // Setup real-time poll notifications
  usePollNotifications(currentUser?.id, (notification) => {
    addNotification(notification);
  });

  // Real-time subscription for instant updates when admin confirms attendance
  useEffect(() => {
    if (!currentUser) return;

    const today = new Date().toISOString().slice(0, 10);
    console.log('🔔 Setting up real-time subscription for user poll updates...');

    // Subscribe to changes in poll_responses for current user
    const channel = supabase
      .channel('user_poll_updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes
          schema: 'public',
          table: 'poll_responses',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('⚡ Real-time poll update detected:', payload);
          // Instantly refresh user stats when poll response changes
          clearCache(`user_stats_${currentUser.id}`);
          loadUserStats(currentUser.id, currentUser.profile_id);
          
          // Show notification for admin confirmation
          if (payload.eventType === 'UPDATE' && payload.new.confirmation_status === 'confirmed_attended') {
            addNotification({
              type: 'success',
              title: 'Attendance Confirmed',
              message: 'Your attendance has been confirmed by admin.',
              duration: 6000,
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active for user dashboard');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Unsubscribing from real-time updates');
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    syncFormWithSlot(mealSlot, userStats.todaysPollResponses)
  }, [mealSlot, userStats.todaysPollResponses])

const checkAuthAndLoadData = async () => {
  try {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login'); // Not logged in
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles_new')
      .select('*')
      .eq('id', user.id)  // ✅ Query by user ID, not email
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      router.push('/login');
      return;
    }

    if (!profile || profile.role !== 'user') {
      console.error('Not a user role or profile missing');
      router.push('/login');
      return;
    }

    setCurrentUser({
      id: user.id,
      profile_id: profile.id,
      email: profile.email || user.email,  // Use email from profile, fallback to auth
      name: profile.full_name || user.email.split('@')[0],
      role: profile.role
    });

    await loadUserStats(user.id, profile.id);
  } catch (err) {
    console.error('Error fetching user:', err);
    router.push('/login'); // Any error → login
  } finally {
    setLoading(false);
  }
};


  const loadUserStats = async (userId, profileId) => {
    try {
      // Check cache first (cache for 5 minutes since stats update frequently)
      const cacheKey = `user_stats_${userId}`;
      const cachedStats = getFromCache(cacheKey);
      
      if (cachedStats) {
        const normalized = normalizeStats(cachedStats)
        setUserStats(normalized);
        syncFormWithSlot(mealSlot, normalized.todaysPollResponses);
        return;
      }

      // Get current month and year
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()

      // Get monthly bills for total bill calculation
      const { data: allBills } = await supabase
        .from('monthly_bills')
        .select('total_amount')
        .eq('user_id', userId)

      // Calculate total bill from all bills
      const totalBill = allBills?.reduce((sum, bill) => sum + (bill.total_amount || 0), 0) || 0

      // Get all-time meals from poll_responses (more accurate than monthly_bills)
      const { data: allPollResponses } = await supabase
        .from('poll_responses')
        .select('date, portion_size')
        .eq('user_id', userId)
        .eq('present', true)

      const allTimeMeals = allPollResponses?.length || 0

      // Get this month's meals from poll_responses (more accurate for current month)
      const thisMonthMeals = allPollResponses?.filter(response => {
        const responseDate = new Date(response.date)
        return responseDate.getMonth() + 1 === currentMonth && 
               responseDate.getFullYear() === currentYear
      }).length || 0

      // Today's poll responses (all meal slots)
      const today = new Date().toISOString().slice(0, 10)
      let todaysPolls = []

      try {
        const { data, error: pollError } = await supabase
          .from('poll_responses')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .order('meal_slot', { ascending: true })
        
        if (!pollError && data) {
          todaysPolls = data
        } else if (pollError && !pollError.message?.includes('poll_responses')) {
          console.warn('Poll fetch warning:', pollError)
        }
      } catch (pollErr) {
        console.warn('Could not fetch poll responses:', pollErr)
      }

      const stats = normalizeStats({
        totalBill: totalBill,
        thisMonthMeals: thisMonthMeals,
        allTimeMeals: allTimeMeals,
        todaysPollResponses: todaysPolls
      });

      // Cache the stats
      setInCache(cacheKey, stats, 300); // 5 minute TTL
      setUserStats(stats)
      syncFormWithSlot(mealSlot, todaysPolls)
    } catch (err) {
      console.error('Error loading user stats:', err)
    }
  }

  const handleSubmitPoll = async () => {
    setPollMessage('')

    if (!currentUser) {
      setPollMessage('You must be logged in.')
      return
    }

    setPollLoading(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const isAttending = attendance === 'yes'
      const confirmationStatus = isAttending ? 'pending_customer_response' : 'cancelled'

      const payload = {
        user_id: currentUser.id,
        date: today,
        present: isAttending,
        portion_size: mealType,
        meal_slot: mealSlot, // NEW: include meal slot
        confirmation_status: confirmationStatus
      }

      // Use database function to handle upsert
      console.log('Submitting poll with payload:', payload);
      
      const { data: updatedData, error } = await supabase
        .rpc('upsert_poll_response', {
          p_user_id: payload.user_id,
          p_date: payload.date,
          p_present: payload.present,
          p_portion_size: payload.portion_size,
          p_meal_slot: payload.meal_slot,
          p_confirmation_status: payload.confirmation_status
        })

      console.log('Response data:', updatedData);
      console.log('Response error:', error);

      const existingResponse = getResponseForSlot(mealSlot, userStats.todaysPollResponses)

      if (error) {
        const errorMsg = error.message || error.details || JSON.stringify(error);
        setPollMessage(`Error: ${errorMsg}`)
        console.error('Poll update error:', error);
        console.error('Error details:', errorMsg);
        console.error('Payload:', payload);
      } else if (!updatedData || updatedData.length === 0) {
        console.warn('Warning: No data returned from upsert');
        const isUpdate = !!existingResponse
        setPollMessage(
          attendance === 'no' 
            ? '✅ Noted: You chose not to attend today.'
            : `✅ ${isUpdate ? 'Updated' : 'Submitted'} your response for today's meal!`
        )
        
        // Clear stats cache to force refresh
        clearCache(`user_stats_${currentUser.id}`);
        
        // Reload user stats to get updated data
        await loadUserStats(currentUser.id, currentUser.profile_id)
        
        // Close modal after 1.5 seconds
        setTimeout(() => setPollOpen(false), 1500)
      } else {
        const isUpdate = !!existingResponse
        setPollMessage(
          attendance === 'no' 
            ? '✅ Noted: You chose not to attend today.'
            : `✅ ${isUpdate ? 'Updated' : 'Submitted'} your response for today's meal!`
        )
        
        console.log('✅ Poll response updated:', updatedData);
        
        // Clear stats cache to force refresh
        clearCache(`user_stats_${currentUser.id}`);
        
        // Reload user stats to get updated data
        await loadUserStats(currentUser.id, currentUser.profile_id)
        
        // Close modal after 1.5 seconds
        setTimeout(() => setPollOpen(false), 1500)
      }
    } catch (err) {
      console.error(err)
      setPollMessage('Unexpected error while submitting poll.')
    } finally {
      setPollLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleOpenPoll = (slot) => {
    if (slot) {
      setMealSlot(slot)
      syncFormWithSlot(slot, userStats.todaysPollResponses)
    }
    setPollOpen(true)
    setPollMessage('') // Clear any previous messages
  }

  const handleClosePoll = () => {
    if (!pollLoading) {
      setPollOpen(false)
      setPollMessage('')
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TodaysPollStatus 
          userStats={userStats}
          onUpdateResponse={handleOpenPoll}
        />

        <StatsCards userStats={userStats} />

        <ActionCards 
          userStats={userStats}
          onSubmitResponse={handleOpenPoll}
        />

        <QuickInfo userStats={userStats} />
      </main>

      <PollModal 
        isOpen={pollOpen}
        onClose={handleClosePoll}
        userStats={userStats}
        attendance={attendance}
        setAttendance={setAttendance}
        mealType={mealType}
        setMealType={setMealType}
        mealSlot={mealSlot}
        setMealSlot={setMealSlot}
        pollLoading={pollLoading}
        pollMessage={pollMessage}
        onSubmitPoll={handleSubmitPoll}
      />
    </div>
  )
}
export default function UserDashboard() {
  return (
    <DashboardErrorBoundary>
      <UserDashboardContent />
    </DashboardErrorBoundary>
  )
}
