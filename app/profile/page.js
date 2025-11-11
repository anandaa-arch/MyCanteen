'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InvoiceDownloadSection from '@/components/InvoiceDownloadSection';
import { ProfileErrorBoundary } from '@/components/PageErrorBoundary';
import { FullPageLoader } from '@/components/LoadingSpinner';
import { ProfileSkeleton } from '@/components/ProfileSkeleton';
import { getFromCache, setInCache, clearCache } from '@/lib/cache';

function ProfilePageContent() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);
  const fetchProfile = async () => {
    try {
      // Check cache first (cache for 10 minutes since profile doesn't change often)
      const cacheKey = 'user_profile';
      const cachedProfile = getFromCache(cacheKey);
      
      if (cachedProfile) {
        setProfile(cachedProfile);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/profile');
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      
      // Cache for 10 minutes
      setInCache(cacheKey, data, 600);
      
      setProfile(data);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="pt-20 pb-24 px-6 text-center">
        <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error || 'Profile not found'}</p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">Your Profile</h1>
        <p className="text-gray-700 mb-8 text-center">View your details and download invoices</p>

        {/* Profile Information Card */}
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-8">
          <div className="flex items-center mb-6 pb-4 border-b">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
              {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">👋 Hi, {profile.full_name}!</h2>
              <p className="text-sm text-gray-500">
                {profile.role === 'admin' ? '🔧 Administrator' : '👤 User'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-semibold text-gray-800">{profile.email}</p>
            </div>

            {profile.dept && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Department</p>
                <p className="font-semibold text-gray-800">{profile.dept}</p>
              </div>
            )}

            {profile.year && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Year</p>
                <p className="font-semibold text-gray-800">{profile.year}</p>
              </div>
            )}

            {profile.contact_number && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Contact Number</p>
                <p className="font-semibold text-gray-800">{profile.contact_number}</p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">User ID</p>
              <p className="font-semibold text-gray-800 text-xs break-all">{profile.id}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Member Since</p>
              <p className="font-semibold text-gray-800">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Generation Section */}
        <InvoiceDownloadSection 
          userId={profile.id} 
          userName={profile.full_name} 
          userEmail={profile.email}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProfileErrorBoundary>
      <ProfilePageContent />
    </ProfileErrorBoundary>
  );
}
