
// app/admin/dashboard/page.js - Alternative approach using profiles_new table

'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import DashboardHeader from './components/DashboardHeader';
import StatsCards from './components/StatsCards';
import SearchBar from './components/SearchAndFilter';
import UserTable from './components/UserTable';
import UserDetailModal from './components/UserDetailModal';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Fetch revenue data
  async function fetchRevenueData() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount');

      if (!error && data) {
        const revenue = data.reduce((sum, row) => sum + row.amount, 0);
        setTotalRevenue(revenue);
      }
    } catch (error) {
      console.error('Error fetching revenue:', error);
    }
  }

  // Simplified fetch users function
  const fetchUsers = async (searchQuery = '') => {
    try {
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
        console.log('Fetched users:', data?.length || 0);
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

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
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    
    setSelectedUser(updatedUser);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        onCreateUser={handleCreateUser}
        onManagePolls={handleManagePolls}
        onManageInventory={handleManageInventory}
        onLogout={handleLogout}
        currentUser={currentUser}
      />
     
      <StatsCards
        totalUsers={users.length}
        activeUsers={users.filter(u => u.role === 'user').length}
        adminUsers={users.filter(u => u.role === 'admin').length}
        totalRevenue={totalRevenue}
      />

      <SearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        placeholder="Search users by name or email..."
      />
     
      <UserTable
        users={users}
        onViewUser={(user) => setSelectedUser(user)}
        loading={loading}
      />
     
      <UserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
}