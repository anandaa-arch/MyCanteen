// app/user/billing/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabaseClient';
import { getFromCache, setInCache } from '@/lib/cache';
import BillingHeader from './components/BillingHeader';
import { CheckCircle, XCircle, Clock, AlertCircle, Calendar, UtensilsCrossed } from 'lucide-react';
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
  const [meals, setMeals] = useState([]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    checkAuthAndInitialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      await fetchUserMeals(user.id);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMeals = async (userId) => {
    try {
      // Check cache first (cache for 5 minutes)
      const cacheKey = `user_meals_billing_${userId}`;
      const cachedMeals = getFromCache(cacheKey);
      
      if (cachedMeals) {
        setMeals(cachedMeals);
        return;
      }

      // Fetch only admin-confirmed meals (must be confirmed_attended by admin)
      const { data: pollResponses, error } = await supabase
        .from('poll_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('present', true)
        .eq('confirmation_status', 'confirmed_attended')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching meals:', error);
        return;
      }

      // For each meal, check if payment exists
      const mealsWithPayment = await Promise.all(
        (pollResponses || []).map(async (meal) => {
          // Check if there's a payment for this specific meal
          const { data: payment } = await supabase
            .from('meal_payments')
            .select('*')
            .eq('poll_response_id', meal.id)
            .maybeSingle();

          const mealCost = meal.portion_size === 'full' ? 60 : 45;

          return {
            ...meal,
            cost: mealCost,
            payment: payment,
            isPaid: !!payment,
            paymentDate: payment?.payment_date,
            paymentMethod: payment?.payment_method
          };
        })
      );

      setInCache(cacheKey, mealsWithPayment, 300); // Cache for 5 minutes
      setMeals(mealsWithPayment);
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  // Calculate statistics from meals
  const totalBilled = meals.reduce((sum, meal) => sum + meal.cost, 0);
  const totalPaid = meals.filter(m => m.isPaid).reduce((sum, meal) => sum + meal.cost, 0);
  const totalDue = totalBilled - totalPaid;
  const totalMeals = meals.length;
  const paidMeals = meals.filter(m => m.isPaid).length;
  const unpaidMeals = meals.filter(m => !m.isPaid).length;
  if (loading) {
    return <BillingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BillingHeader userProfile={userProfile} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Billed</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalBilled.toFixed(2)}</p>
              </div>
              <UtensilsCrossed className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">₹{totalPaid.toFixed(2)}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Outstanding Due</p>
                <p className="text-2xl font-bold text-red-600">₹{totalDue.toFixed(2)}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Meals</p>
                <p className="text-2xl font-bold text-purple-600">{totalMeals}</p>
                <p className="text-xs text-gray-500 mt-1">{paidMeals} paid • {unpaidMeals} unpaid</p>
              </div>
              <Calendar className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Info Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Meal-by-Meal Billing:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Each meal you attend is listed below with its payment status</li>
                <li><strong className="text-green-700">✓ Paid</strong> meals are cleared. <strong className="text-red-700">✗ Unpaid</strong> meals need payment.</li>
                <li>Only <strong>ONE payment per meal</strong> is allowed</li>
                <li>Contact admin to make payments for unpaid meals</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Meal List */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Meals</h2>
            <p className="text-sm text-gray-500 mt-1">Individual meal billing and payment status</p>
          </div>

          {meals.length === 0 ? (
            <div className="p-12 text-center">
              <UtensilsCrossed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meals found</h3>
              <p className="text-gray-600">Your meal records will appear here once you attend.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meal Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {meals.map((meal) => {
                    const mealDate = new Date(meal.date);
                    const dayName = mealDate.toLocaleDateString('en-US', { weekday: 'short' });
                    const formattedDate = mealDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });

                    return (
                      <tr key={meal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{formattedDate}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{dayName}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            meal.portion_size === 'full' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {meal.portion_size === 'full' ? 'Full Meal' : 'Half Meal'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{meal.cost}</td>
                        <td className="px-6 py-4 text-sm">
                          {meal.isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3" />
                              Unpaid
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {meal.isPaid ? (
                            <>
                              {new Date(meal.paymentDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                              <div className="text-xs text-gray-500">{meal.paymentMethod}</div>
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
