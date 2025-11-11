"use client";

import { QRCode } from "react-qrcode-logo";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function UserQRPage() {
  const router = useRouter();
  const [qrData, setQrData] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfileAndGenerateQR = async () => {
    try {
      setLoading(true);
      setError("");
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

  useEffect(() => {
    fetchProfileAndGenerateQR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Generating your QR code...</p>
        </div>
      </div>
    );
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 py-8 sm:py-12">
      {/* Back Button */}
      <button
        onClick={() => router.push('/user/dashboard')}
        className="absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-gray-600 hover:text-gray-800 hover:bg-white active:bg-gray-100 rounded-lg transition touch-manipulation"
      >
        <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        <span className="text-sm sm:text-base">Back</span>
      </button>

      <div className="max-w-md w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2 text-center">Your Attendance QR</h1>
        <p className="text-sm sm:text-base text-gray-700 mb-6 sm:mb-8 text-center px-2">
          Show this QR code to the admin for marking your attendance
        </p>

        {/* User Info Card */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg mb-4 sm:mb-6">
          <div className="flex items-center mb-4 pb-4 border-b">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mr-3 flex-shrink-0">
              {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate">{profile.full_name}</h2>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{profile.email}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            {profile.dept && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Department:</span>
                <span className="font-semibold text-gray-800">{profile.dept}</span>
              </div>
            )}
            {profile.year && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Year:</span>
                <span className="font-semibold text-gray-800">{profile.year}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
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

        {/* QR Code - Responsive sizing */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col items-center">
          {qrData && (
            <>
              <QRCode
                value={qrData}
                size={typeof window !== 'undefined' && window.innerWidth < 640 ? Math.min(window.innerWidth - 120, 250) : 280}
                bgColor="#ffffff"
                fgColor="#000000"
                qrStyle="squares"
                eyeRadius={5}
                quietZone={20}
                ecLevel="H"
              />
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-xs text-gray-500 mb-1 sm:mb-2">QR Code Generated</p>
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
          className="w-full mt-4 sm:mt-6 px-6 py-3 sm:py-3.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition shadow-lg hover:shadow-xl touch-manipulation text-sm sm:text-base"
        >
          🔄 Refresh QR Code
        </button>

        {/* Info Note */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs sm:text-sm text-blue-800">
            <strong>📌 Note:</strong> This QR code contains your encrypted attendance information. 
            Present it to the admin for verification and attendance marking.
          </p>
        </div>
      </div>
    </div>
  );
}
