// app/admin/polls/page.js
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabaseClient';

import PollHeader from './components/PollHeader';
import PollFilters from './components/PollFilters';
import PollResponseTable from './components/PollResponseTable';
import { PollsErrorBoundary } from '@/components/PageErrorBoundary';
import { FullPageLoader } from '@/components/LoadingSpinner';
import { DashboardSkeleton } from '@/components/Skeleton';

function AdminPollsPageContent() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [pollResponses, setPollResponses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, confirmed, no-response
  const [lastRefresh, setLastRefresh] = useState(null);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  useEffect(() => {
    checkAuthAndInitialize();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchPollData();
    }
  }, [selectedDate, currentUser]);

  // Real-time subscription to poll_responses table for instant updates
  useEffect(() => {
    if (!currentUser) return;

    console.log('🔔 Setting up real-time subscription for poll responses...');

    // Subscribe to changes in poll_responses table
    const channel = supabase
      .channel('poll_responses_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'poll_responses',
          filter: `date=eq.${selectedDate}`
        },
        (payload) => {
          console.log('⚡ Real-time update detected:', payload);
          
          // Show brief notification
          setShowUpdateNotification(true);
          setTimeout(() => setShowUpdateNotification(false), 3000);
          
          // Instantly refresh data when any change occurs
          fetchPollData();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active');
        }
      });

    // Cleanup subscription on unmount or date change
    return () => {
      console.log('🔌 Unsubscribing from real-time updates');
      supabase.removeChannel(channel);
    };
  }, [currentUser, selectedDate]);

  const checkAuthAndInitialize = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles_new')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/unauthorized');
        return;
      }

      setCurrentUser(user);
      
      // Fetch all users for reference
      const { data: users } = await supabase
        .from('profiles_new')
        .select('id, full_name, email, contact_number')
        .eq('role', 'user');
      
      setAllUsers(users || []);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchPollData = async () => {
    try {
      setLoading(true);
      
      console.log(`🔄 Fetching poll data for ${selectedDate}...`);
      
      // First get poll responses
      const { data: responses, error: pollError } = await supabase
        .from('poll_responses')
        .select('*')
        .eq('date', selectedDate);

      if (pollError) {
        console.error('Poll fetch error:', pollError);
        throw pollError;
      }

      console.log(`✅ Fetched ${responses?.length || 0} poll responses`);
      setLastRefresh(new Date());

      // Then get user profiles for those responses
      if (responses && responses.length > 0) {
        const userIds = responses.map(r => r.user_id);
        const { data: profiles, error: profileError } = await supabase
          .from('profiles_new')
          .select('id, full_name, email, contact_number')
          .in('id', userIds);

        if (profileError) {
          console.error('Profile fetch error:', profileError);
        } else {
          // Merge profiles into responses
          const responsesWithProfiles = responses.map(response => ({
            ...response,
            profiles_new: profiles?.find(p => p.id === response.user_id) || null
          }));
          setPollResponses(responsesWithProfiles);
          return;
        }
      }

      setPollResponses(responses || []);
    } catch (error) {
      console.error('Error fetching poll data:', error);
      setPollResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePollUpdate = () => {
    fetchPollData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Calculate statistics
  const pollStats = {
    totalUsers: allUsers.length,
    totalResponses: pollResponses.length,
    pendingConfirmations: pollResponses.filter(r => r.confirmation_status === 'pending').length,
    confirmedResponses: pollResponses.filter(r => r.confirmation_status === 'confirmed_attended').length,
    attendingUsers: pollResponses.filter(r => r.present).length,
    noResponseUsers: allUsers.length - pollResponses.length,
    fullMeals: pollResponses.filter(r => r.present && r.portion_size === 'full').length,
    halfMeals: pollResponses.filter(r => r.present && r.portion_size === 'half').length,
  };

  // Filter responses based on selected filter
  const getFilteredData = () => {
    const usersWithResponses = pollResponses.map(response => ({
      ...response,
      user_data: response.profiles_new,
      hasResponse: true
    }));

    const usersWithoutResponses = allUsers
      .filter(user => !pollResponses.some(response => response.user_id === user.id))
      .map(user => ({
        user_id: user.id,
        user_data: user,
        hasResponse: false,
        present: false,
        portion_size: 'full',
        confirmation_status: null,
        date: selectedDate
      }));

    const allUsersData = [...usersWithResponses, ...usersWithoutResponses];

    switch (filterStatus) {
      case 'pending':
        return allUsersData.filter(item => item.confirmation_status === 'pending_customer_response' || item.confirmation_status === 'awaiting_admin_confirmation');
      case 'confirmed':
        return allUsersData.filter(item => item.confirmation_status === 'confirmed_attended');
      case 'no-response':
        return allUsersData.filter(item => !item.hasResponse);
      case 'attending':
        return allUsersData.filter(item => item.present);
      default:
        return allUsersData;
    }
  };

  if (loading && !currentUser) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Real-time Update Notification */}
      {showUpdateNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in-right">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-medium">Poll data updated!</span>
        </div>
      )}

      <PollHeader 
        onLogout={handleLogout}
        currentUser={currentUser}
        onRefresh={fetchPollData}
      />
      
     
      
      <PollFilters 
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        lastRefresh={lastRefresh}
      />
      
      <PollResponseTable 
        data={getFilteredData()}
        onPollUpdate={handlePollUpdate}
        loading={loading}
        selectedDate={selectedDate}
      />
    </div>
  );
}

export default function AdminPollsPage() {
  return (
    <PollsErrorBoundary>
      <AdminPollsPageContent />
    </PollsErrorBoundary>
  );
}
