// app/admin/dashboard/page.js

'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabaseClient';
import { getFromCache, setInCache, clearCache } from '@/lib/cache';

import DashboardHeader from './components/DashboardHeader';
import StatsCards from './components/StatsCards';
import SearchAndFilter from './components/SearchAndFilter';
import UserTable from './components/UserTable';
import UserDetailModal from './components/UserDetailModal';
import { DashboardErrorBoundary } from '@/components/PageErrorBoundary';
import { FullPageLoader } from '@/components/LoadingSpinner';
import { DashboardSkeleton } from '@/components/Skeleton';
import { useNotifications, useAdminNotifications } from '@/lib/notificationSystem';

function AdminDashboardContent() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const { addNotification } = useNotifications();

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Fetch revenue data
  async function fetchRevenueData() {
    try {
      // Check cache first (cache for 30 minutes)
      const cachedRevenue = getFromCache('admin_total_revenue');
      if (cachedRevenue !== null && cachedRevenue !== undefined) {
        setTotalRevenue(cachedRevenue);
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('amount');

      if (!error && data) {
        const revenue = data.reduce((sum, row) => sum + (row.amount || 0), 0);
        setInCache('admin_total_revenue', revenue, 1800); // Cache for 30 minutes
        setTotalRevenue(revenue);
      } else {
        // If no data or error, set to 0
        setTotalRevenue(0);
      }
    } catch (error) {
      console.error('Error fetching revenue:', error);
      setTotalRevenue(0);
    }
  }

  // Simplified fetch users function
  const fetchUsers = async (searchQuery = '') => {
    try {
      // Skip cache if searching - only cache full user list
      if (!searchQuery.trim()) {
        const cachedUsers = getFromCache('admin_users_list');
        if (cachedUsers) {
          setUsers(cachedUsers);
          return;
        }
      }

      let query = supabase
        .from('profiles_new')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery.trim()) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Fetch error:', error.message);
        setUsers([]);
      } else {
        // Cache full user list only (not search results)
        if (!searchQuery.trim()) {
          setInCache('admin_users_list', data || [], 600); // Cache for 10 minutes
        }
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  // Setup real-time admin notifications
  useAdminNotifications((notification) => {
    addNotification(notification);
  });

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        // Check if user is admin from profiles_new table
        const { data: profile, error } = await supabase
          .from('profiles_new')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || !profile || profile.role !== 'admin') {
          console.error('Not admin or profile not found:', error);
          router.push('/login');
          return;
        }

        setCurrentUser(user);
        await fetchUsers();
        await fetchRevenueData();
        
        // Show welcome notification
        addNotification({
          type: 'info',
          title: 'Welcome Back',
          message: `Dashboard loaded successfully.`,
          duration: 4000,
        });
      } catch (error) {
        console.error('Error in initial fetch:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, [router, supabase]);

  // Search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (!loading) {
        setLoading(true);
        await fetchUsers(searchTerm);
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle user update callback
  const handleUserUpdate = (updatedUser) => {
    // Update the users list with the updated user data
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    
    // Clear users cache since data has changed
    clearCache('admin_users_list');
    
    // Update the selected user to show new data immediately
    setSelectedUser(updatedUser);
    
    // Also refresh the full user list from database to ensure consistency
    fetchUsers(searchTerm);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleCreateUser = () => {
    router.push('/admin/create-user');
  };

  const handleManagePolls = () => {
    router.push('/admin/polls');
  };

  const handleManageInventory = () => {
    router.push('/admin/inventory');
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <DashboardHeader
        onCreateUser={handleCreateUser}
        onManagePolls={handleManagePolls}
        onManageInventory={handleManageInventory}
        onLogout={handleLogout}
        currentUser={currentUser}
      />
     
      <div className="max-w-7xl mx-auto">
        <StatsCards
          totalUsers={users.length}
          activeUsers={users.filter(u => u.role === 'user').length}
          adminUsers={users.filter(u => u.role === 'admin').length}
          totalRevenue={totalRevenue}
        />

        <SearchAndFilter 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          placeholder="Search users by name or email..."
        />
       
        <UserTable
          users={users}
          onViewUser={(user) => setSelectedUser(user)}
          loading={loading}
        />
      </div>
     
      <UserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <DashboardErrorBoundary>
      <AdminDashboardContent />
    </DashboardErrorBoundary>
  );
}
