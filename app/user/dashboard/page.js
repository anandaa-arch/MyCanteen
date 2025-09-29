'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import DashboardHeader from './components/DashboardHeader'
import TodaysPollStatus from './components/TodaysPollStatus'
import StatsCards from './components/StatsCards'
import ActionCards from './components/ActionCards'
import QuickInfo from './components/QuickInfo'
import PollModal from './components/PollModal'

export default function UserDashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()
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
      .eq('email', user.email)
      .single();

    if (error || profile?.role !== 'user') {
      router.push('/login'); // Not a user
      return;
    }

    setCurrentUser({
      id: user.id,
      profile_id: profile.id,
      email: user.email,
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
      // Profile data
      const { data: profile } = await supabase
        .from('profiles_new')
        .select('total_bill')
        .eq('id', profileId)
        .single()

      // This month's meals from transactions
      const thisMonthStart = new Date()
      thisMonthStart.setDate(1)
      const thisMonthISO = thisMonthStart.toISOString().split('T')[0]

      const { count: monthlyMeals } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('profile_id', profileId)
        .gte('meal_date', thisMonthISO)

      // Today's poll response
      const today = new Date().toISOString().slice(0, 10)
      const { data: todaysPoll } = await supabase
        .from('poll_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      setUserStats({
        totalBill: profile?.total_bill || 0,
        thisMonthMeals: monthlyMeals || 0,
        todaysPollResponse: todaysPoll,
        confirmationStatus: todaysPoll?.confirmation_status || null
      })

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
        confirmation_status: 'pending'
      }

      // Use upsert to handle both insert and update
      const { error } = await supabase
        .from('poll_responses')
        .upsert(payload, { 
          onConflict: 'user_id,date',
          ignoreDuplicates: false 
        })

      if (error) {
        setPollMessage(`Error: ${error.message}`)
      } else {
        const isUpdate = userStats.todaysPollResponse !== null
        setPollMessage(
          attendance === 'no' 
            ? 'Noted: You chose not to attend today.'
            : `${isUpdate ? 'Updated' : 'Submitted'} your response for today's meal!`
        )
        
        await loadUserStats(currentUser.id, currentUser.profile_id)
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
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