'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabaseClient';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';
import { FullPageLoader } from '@/components/LoadingSpinner';
import { MealHistoryErrorBoundary } from '@/components/PageErrorBoundary';

function MealHistoryPageContent() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  const [loading, setLoading] = useState(true);
  const [pollResponses, setPollResponses] = useState([]);
  const [stats, setStats] = useState({
    totalMeals: 0,
    fullMeals: 0,
    halfMeals: 0,
    attendedDays: 0
  });

  useEffect(() => {
    const checkAuthAndLoadHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles_new')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile || profile.role !== 'user') {
          router.push('/login');
          return;
        }

        await fetchMealHistory(user.id);
      } catch (error) {
        console.error('Error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthAndLoadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMealHistory = async (userId) => {
    try {
      const { data: responses } = await supabase
        .from('poll_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('present', true)
        .order('date', { ascending: false });

      if (responses) {
        setPollResponses(responses);

        // Calculate stats
        const fullMeals = responses.filter(r => r.portion_size === 'full').length;
        const halfMeals = responses.filter(r => r.portion_size === 'half').length;
        const total = fullMeals + halfMeals;

        setStats({
          totalMeals: total,
          fullMeals: fullMeals,
          halfMeals: halfMeals,
          attendedDays: responses.length
        });
      }
    } catch (error) {
      console.error('Error fetching meal history:', error);
    }
  };

  if (loading) {
    return <FullPageLoader text="Loading your meal history..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meal History</h1>
              <p className="text-gray-600 text-sm mt-1">Your dining records and meal preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Meals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMeals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Full Meals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.fullMeals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Half Meals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.halfMeals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Attended Days</p>
                <p className="text-2xl font-bold text-gray-900">{stats.attendedDays}</p>
              </div>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Meal Records</h2>
          </div>

          {pollResponses.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No meal history yet. Submit your first meal preference in &ldquo;Today&apos;s Poll&rdquo;!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Day</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Meal Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Portion Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pollResponses.map((response) => {
                    const date = new Date(response.date);
                    const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });
                    const dateStr = date.toLocaleDateString('en-IN');

                    return (
                      <tr key={response.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{dateStr}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{dayName}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            Canteen Meal
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            response.portion_size === 'full'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {response.portion_size === 'full' ? 'Full Meal (₹60)' : 'Half Meal (₹45)'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            ✓ Attended
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Section */}
        {pollResponses.length > 0 && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-2">📊 Your Meal Summary</h3>
            <ul className="text-green-800 text-sm space-y-1">
              <li>✓ You have attended <strong>{stats.attendedDays}</strong> days</li>
              <li>✓ Total meals consumed: <strong>{stats.totalMeals}</strong></li>
              <li>✓ Full meals: <strong>{stats.fullMeals}</strong> × ₹60 = ₹{stats.fullMeals * 60}</li>
              <li>✓ Half meals: <strong>{stats.halfMeals}</strong> × ₹45 = ₹{stats.halfMeals * 45}</li>
              <li>✓ Total amount: <strong>₹{(stats.fullMeals * 60) + (stats.halfMeals * 45)}</strong></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MealHistoryPage() {
  return (
    <MealHistoryErrorBoundary>
      <MealHistoryPageContent />
    </MealHistoryErrorBoundary>
  );
}
