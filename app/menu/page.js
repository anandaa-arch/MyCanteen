'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabaseClient';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { FullPageLoader } from '@/components/LoadingSpinner';
import { getFromCache, setInCache } from '@/lib/cache';
import { MenuErrorBoundary } from '@/components/PageErrorBoundary';
import { MenuSkeleton } from '@/components/Skeleton';

function MenuPageContent() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    checkAuthAndLoadMenu();
  }, []);

  const checkAuthAndLoadMenu = async () => {
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

      setUserRole(profile?.role);
      await fetchTodayMenu();
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayMenu = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      setCurrentDate(today);

      // Check cache first (cache for 1 hour since menu doesn't change often)
      const cacheKey = `menu_${today}`;
      const cachedMenu = getFromCache(cacheKey);
      
      if (cachedMenu) {
        setMenu(cachedMenu);
        return;
      }

      const response = await fetch(`/api/menu?action=get-by-date&date=${today}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Menu API response:', data);
        // Extract items from menu records
        if (data.menu && data.menu.length > 0) {
          const allItems = data.menu.flatMap(menuRecord => menuRecord.items || []);
          setInCache(cacheKey, allItems, 3600); // Cache for 1 hour
          setMenu(allItems);
        } else {
          setInCache(cacheKey, [], 3600); // Cache empty result too
          setMenu([]);
        }
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  if (loading) {
    return <MenuSkeleton />;
  }

  const dateObj = new Date(currentDate);
  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Today&apos;s Menu</h1>
              <p className="text-gray-600 text-sm mt-1">Check out what&apos;s being served today!</p>
            </div>
          </div>

          {userRole === 'admin' && (
            <Link
              href="/admin/menu"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Manage Menus →
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Info */}
        <div className="flex items-center gap-2 text-gray-600 mb-6">
          <Calendar className="w-5 h-5" />
          <span className="font-medium">{formattedDate}</span>
        </div>

        {menu.length === 0 ? (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Menu Available</h3>
            <p className="text-gray-600">
              The admin hasn&apos;t set up today&apos;s menu yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {menu.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h2>
                {item.description && (
                  <p className="text-gray-600 text-sm">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Additional Info */}
        {menu.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">📝 Quick Info</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>✓ Select your meal preference in &ldquo;Today&apos;s Poll&rdquo;</li>
              <li>✓ Use &ldquo;My Bills&rdquo; to track your charges</li>
              <li>✓ Menu is updated daily by the admin</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <MenuErrorBoundary>
      <MenuPageContent />
    </MenuErrorBoundary>
  );
}