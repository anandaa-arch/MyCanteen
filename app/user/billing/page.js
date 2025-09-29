// app/user/billing/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import BillingHeader from './components/BillingHeader';
import BillingStatsCards from './components/BillingStatsCards';
import BillingHistory from './components/BillingHistory';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function UserBillingPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState([]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    checkAuthAndInitialize();
  }, []);

  const checkAuthAndInitialize = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles_new')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'user') {
        router.push('/login');
        return;
      }

      setCurrentUser(user);
      setUserProfile(profile);
      await fetchUserBills(profile.user_id);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBills = async (userId) => {
    try {
      const response = await fetch(`/api/billing?action=get-user-bills&userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setBills(data.bills || []);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      partial: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      pending: { color: "bg-red-100 text-red-800", icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status.toUpperCase()}
      </span>
    );
  };

  // Calculate user billing statistics
  const totalStats = {
    totalBilled: bills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0),
    totalPaid: bills.reduce((sum, bill) => sum + (bill.paid_amount || 0), 0),
    totalDue: bills.reduce((sum, bill) => sum + (bill.due_amount || 0), 0),
    totalMeals: bills.reduce((sum, bill) => sum + (bill.half_meal_count || 0) + (bill.full_meal_count || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BillingHeader userProfile={userProfile} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BillingStatsCards totalStats={totalStats} />
        
        <BillingHistory 
          bills={bills} 
          getStatusBadge={getStatusBadge} 
          months={months} 
        />
      </div>
    </div>
  );
}