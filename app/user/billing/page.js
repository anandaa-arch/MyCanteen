// app/user/billing/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabaseClient';
import { getFromCache, setInCache } from '@/lib/cache';
import BillingHeader from './components/BillingHeader';
import BillingStatsCards from './components/BillingStatsCards';
import BillingHistory from './components/BillingHistory';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { BillingErrorBoundary } from '@/components/PageErrorBoundary';
import { FullPageLoader } from '@/components/LoadingSpinner';
import { BillingSkeleton } from '@/components/Skeleton';

function UserBillingPageContent() {
  const router = useRouter();
  const supabase = useSupabaseClient();

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
      await fetchUserBills(user.id); // Use user.id instead of profile.user_id
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBills = async (userId) => {
    try {
      // Check cache first (cache for 10 minutes)
      const cacheKey = `user_bills_${userId}`;
      const cachedBills = getFromCache(cacheKey);
      
      if (cachedBills) {
        setBills(cachedBills);
        return;
      }

      const response = await fetch(`/api/billing?action=get-user-bills&userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        const billsData = data.bills || [];
        setInCache(cacheKey, billsData, 600); // Cache for 10 minutes
        setBills(billsData);
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
    return <BillingSkeleton />;
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

export default function UserBillingPage() {
  return (
    <BillingErrorBoundary>
      <UserBillingPageContent />
    </BillingErrorBoundary>
  );
}
