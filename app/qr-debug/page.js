'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QRDebugPage() {
  const router = useRouter();
  const [debug, setDebug] = useState({
    userProfile: null,
    qrData: null,
    profileError: null,
    libTest: null,
    message: 'Loading...'
  });

  useEffect(() => {
    testQRGeneration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const testQRGeneration = async () => {
    try {
      // Test 1: Fetch profile
      console.log('🔍 Test 1: Fetching user profile...');
      const profileResponse = await fetch('/api/user/profile');
      
      if (profileResponse.status === 401) {
        setDebug(prev => ({
          ...prev,
          message: 'Not authenticated. Redirecting to login...',
          profileError: 'User not logged in'
        }));
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      if (!profileResponse.ok) {
        throw new Error(`Profile API returned ${profileResponse.status}`);
      }

      const profile = await profileResponse.json();
      console.log('✅ Profile fetched:', profile);

      // Test 2: Create QR data
      const qrPayload = {
        userId: profile.id,
        name: profile.full_name,
        email: profile.email,
        dept: profile.dept || 'N/A',
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split("T")[0],
        type: "attendance"
      };
      console.log('✅ QR payload created:', qrPayload);

      // Test 3: Check library
      try {
        const { QRCode } = await import('react-qrcode-logo');
        console.log('✅ react-qrcode-logo library loaded');
        setDebug(prev => ({
          ...prev,
          libTest: 'Library loaded successfully'
        }));
      } catch (libErr) {
        console.error('❌ Library load error:', libErr);
        setDebug(prev => ({
          ...prev,
          libTest: `Library error: ${libErr.message}`
        }));
      }

      setDebug(prev => ({
        ...prev,
        userProfile: profile,
        qrData: qrPayload,
        message: '✅ All tests passed! QR generation should work.'
      }));

    } catch (error) {
      console.error('❌ Error:', error);
      setDebug(prev => ({
        ...prev,
        profileError: error.message,
        message: `❌ Error: ${error.message}`
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-600 mb-8">🔧 QR Generation Debug Panel</h1>

        {/* Status */}
        <div className={`p-6 rounded-lg mb-6 ${debug.profileError ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          <p className={`text-lg font-semibold ${debug.profileError ? 'text-red-700' : 'text-green-700'}`}>
            {debug.message}
          </p>
        </div>

        {/* User Profile */}
        {debug.userProfile && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">👤 User Profile</h2>
            <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded">
              <p><span className="font-bold">ID:</span> {debug.userProfile.id}</p>
              <p><span className="font-bold">Name:</span> {debug.userProfile.full_name}</p>
              <p><span className="font-bold">Email:</span> {debug.userProfile.email}</p>
              <p><span className="font-bold">Dept:</span> {debug.userProfile.dept || 'N/A'}</p>
              <p><span className="font-bold">Role:</span> {debug.userProfile.role}</p>
            </div>
          </div>
        )}

        {/* QR Data */}
        {debug.qrData && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🔐 QR Payload (JSON)</h2>
            <div className="bg-gray-50 p-4 rounded text-sm font-mono overflow-auto max-h-48">
              <pre>{JSON.stringify(debug.qrData, null, 2)}</pre>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This data will be encoded in the QR code
            </p>
          </div>
        )}

        {/* Library Test */}
        {debug.libTest && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📚 Library Status</h2>
            <p className={`text-sm ${debug.libTest.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
              {debug.libTest}
            </p>
          </div>
        )}

        {/* Error Details */}
        {debug.profileError && (
          <div className="bg-red-50 p-6 rounded-lg shadow-md mb-6 border border-red-200">
            <h2 className="text-xl font-bold text-red-700 mb-4">❌ Error Details</h2>
            <p className="text-sm text-red-600 font-mono">{debug.profileError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={testQRGeneration}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            🔄 Retry Test
          </button>
          <button
            onClick={() => router.push('/qr')}
            disabled={!debug.userProfile}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✅ Go to QR Page
          </button>
          <button
            onClick={() => router.push('/user/dashboard')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-4">📋 How QR Works</h3>
          <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
            <li>User fetches their profile data from the API</li>
            <li>App creates a JSON payload with user info + timestamp</li>
            <li>QR code library encodes the JSON into QR visual</li>
            <li>User shows QR to admin for scanning</li>
            <li>Admin&apos;s scanner decodes the JSON</li>
            <li>System records attendance with timestamp</li>
            <li>User can view attendance history</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
