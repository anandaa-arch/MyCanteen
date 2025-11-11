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
  const [pollLoading, setPollLoading] = useState(false)
  const [pollMessage, setPollMessage] = useState('')

  // User stats
  const [userStats, setUserStats] = useState({
    totalBill: 0,
    thisMonthMeals: 0,
    todaysPollResponse: null,
    confirmationStatus: null
  })

  useEffect(() => {
    checkAuthAndLoadData()
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
  }, [currentUser]);

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
        setUserStats(cachedStats);
        // Also set form values if poll response exists
        if (cachedStats.todaysPollResponse) {
          setAttendance(cachedStats.todaysPollResponse.present ? 'yes' : 'no');
          setMealType(cachedStats.todaysPollResponse.portion_size);
        }
        return;
      }

      // Get current month and year
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()

      // Get monthly bills for this month and total from all months
      const { data: currentBill } = await supabase
        .from('monthly_bills')
        .select('*')
        .eq('user_id', userId)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .single()

      const { data: allBills } = await supabase
        .from('monthly_bills')
        .select('total_amount')
        .eq('user_id', userId)

      // Calculate total bill from all bills and this month's meals
      const totalBill = allBills?.reduce((sum, bill) => sum + (bill.total_amount || 0), 0) || 0
      const thisMonthMeals = (currentBill?.half_meal_count || 0) + (currentBill?.full_meal_count || 0)

      // Today's poll response
      const today = new Date().toISOString().slice(0, 10)
      let todaysPoll = null;
      
      try {
        const { data, error: pollError } = await supabase
          .from('poll_responses')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .single()
        
        if (!pollError) {
          todaysPoll = data;
        } else if (!pollError.message?.includes('poll_responses')) {
          // Log error only if it's not about missing table
          console.warn('Poll fetch warning:', pollError);
        }
      } catch (pollErr) {
        console.warn('Could not fetch poll response:', pollErr);
      }

      const stats = {
        totalBill: totalBill,
        thisMonthMeals: thisMonthMeals,
        todaysPollResponse: todaysPoll,
        confirmationStatus: todaysPoll?.confirmation_status || null
      };

      // Cache the stats
      setInCache(cacheKey, stats, 300); // 5 minute TTL
      setUserStats(stats)

      // Set form values if poll response exists
      if (todaysPoll) {
        setAttendance(todaysPoll.present ? 'yes' : 'no')
        setMealType(todaysPoll.portion_size)
      }
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

      const payload = {
        user_id: currentUser.id,
        date: today,
        present: attendance === 'yes',
        portion_size: mealType,
        confirmation_status: 'pending_customer_response'
      }

      // Use upsert to handle both insert and update
      const { data: updatedData, error } = await supabase
        .from('poll_responses')
        .upsert(payload, { 
          onConflict: 'user_id,date',
          ignoreDuplicates: false 
        })
        .select()

      if (error) {
        setPollMessage(`Error: ${error.message}`)
        console.error('Poll update error:', error);
      } else {
        const isUpdate = userStats.todaysPollResponse !== null
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

  const handleOpenPoll = () => {
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
