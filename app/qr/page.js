"use client";

import { QRCode } from "react-qrcode-logo";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRErrorBoundary } from '@/components/PageErrorBoundary';
import { QRCodeSkeleton } from '@/components/Skeleton';

function QRPageContent() {
  const router = useRouter();
  const [qrData, setQrData] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfileAndGenerateQR();
  }, []);

  const fetchProfileAndGenerateQR = async () => {
    try {
      const response = await fetch('/api/user/profile');
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const userData = await response.json();
      setProfile(userData);

      // Generate QR data with actual user information
      const qrPayload = {
        userId: userData.id,
        name: userData.full_name,
        email: userData.email,
        dept: userData.dept || 'N/A',
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split("T")[0],
        type: "attendance"
      };

      setQrData(JSON.stringify(qrPayload));
    } catch (err) {
      console.error('QR generation error:', err);
      setError('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <QRCodeSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-6">
        <div className="max-w-md mx-auto">
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center mb-4">
            <p className="text-red-700 mb-4 font-semibold">⚠️ {error || 'Failed to load user data'}</p>
            <div className="text-sm text-red-600 mb-4 text-left">
              <p className="mb-2"><strong>What might be wrong:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Not logged in</li>
                <li>Profile not created</li>
                <li>Network error</li>
                <li>Session expired</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={fetchProfileAndGenerateQR}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              🔄 Retry
            </button>
            <button
              onClick={() => router.push('/user/dashboard')}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
            >
              ← Go Back
            </button>
            <button
              onClick={() => router.push('/qr-debug')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              🔧 Debug
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-6 py-12">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">Your Attendance QR</h1>
        <p className="text-gray-700 mb-8 text-center">
          Show this QR code to the admin for marking your attendance
        </p>

        {/* User Info Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <div className="flex items-center mb-4 pb-4 border-b">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-3">
              {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800">{profile.full_name}</h2>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {profile.dept && (
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-semibold text-gray-800">{profile.dept}</span>
              </div>
            )}
            {profile.year && (
              <div className="flex justify-between">
                <span className="text-gray-600">Year:</span>
                <span className="font-semibold text-gray-800">{profile.year}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold text-gray-800">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
          {qrData && (
            <>
              <QRCode
                value={qrData}
                size={240}
                bgColor="#ffffff"
                fgColor="#2563eb"
                qrStyle="dots"
                eyeRadius={8}
                logoImage="/MyCanteen-logo.jpg"
                logoWidth={50}
                logoHeight={50}
                removeQrCodeBehindLogo={true}
              />
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 mb-2">QR Code Generated</p>
                <p className="text-xs text-gray-400 font-mono">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchProfileAndGenerateQR}
          className="w-full mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
        >
          🔄 Refresh QR Code
        </button>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>📌 Note:</strong> This QR code contains your encrypted attendance information. 
            Present it to the admin for verification and attendance marking.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function QRPage() {
  return (
    <QRErrorBoundary>
      <QRPageContent />
    </QRErrorBoundary>
  );
}
