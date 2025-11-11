'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import QRScanner from '@/components/QRScanner';
import { CheckCircle, XCircle, Camera, Clock, User, AlertCircle, Loader } from 'lucide-react';
import { FullPageLoader } from '@/components/LoadingSpinner';

export default function AdminQRScannerPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [todaysPoll, setTodaysPoll] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [scanStats, setScanStats] = useState({
    total: 0,
    attended: 0,
    pending: 0
  });
  const [scanning, setScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState(null);

  // Initialize
  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      setLoading(true);

      // Check authentication
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        router.push('/login');
        return;
      }

      // Check if admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles_new')
        .select('role, full_name')
        .eq('id', authUser.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        setError('Only admins can access the scanner');
        return;
      }

      setUser({ id: authUser.id, ...profile });

      // Get today's poll (or it will be created automatically when scanning)
      const today = new Date().toISOString().split('T')[0];
      const { data: poll } = await supabase
        .from('polls')
        .select('id, poll_date, title')
        .eq('poll_date', today)
        .single();

      if (poll) {
        setTodaysPoll(poll);
        await fetchAttendanceData(poll.id);
      } else {
        // No poll yet - that's OK, it will be created when first QR is scanned
        setTodaysPoll(null);
        setScanStats({ total: 0, attended: 0, pending: 0 });
        setRecentScans([]);
      }

    } catch (err) {
      console.error('Auth check error:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async (pollId) => {
    try {
      // Get attendance records
      const { data: records, error: recordsError } = await supabase
        .from('poll_responses')
        .select(`
          id,
          user_id,
          present,
          confirmation_status,
          attended_at,
          created_at,
          profiles_new:user_id (
            id,
            full_name,
            email,
            dept,
            year
          )
        `)
        .eq('poll_id', pollId)
        .eq('confirmation_status', 'confirmed_attended')
        .order('attended_at', { ascending: false })
        .limit(20);

      if (recordsError) {
        console.error('Records fetch error:', recordsError);
        // Continue anyway, show what we have
      }

      setRecentScans(records || []);

      // Calculate stats
      const attended = records?.filter(r => r.confirmation_status === 'confirmed_attended').length || 0;
      const pending = records?.filter(r => r.confirmation_status === 'pending_customer_response').length || 0;

      setScanStats({
        total: records?.length || 0,
        attended,
        pending
      });

    } catch (err) {
      console.error('Attendance data fetch error:', err);
      // Continue anyway, show partial data
    }
  };

  const handleScan = async (scannedData) => {
    try {
      setScanning(true);
      setLastScanResult(null); // Clear previous result

      console.log('📱 Scanning QR data:', scannedData);

      // Try the new API first (with auto-poll creation)
      let response = await fetch('/api/attendance-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scannedData })
      });

      // If new API fails, try the old one
      if (!response.ok) {
        console.log('Trying fallback API endpoint...');
        response = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scannedData })
        });
      }

      const result = await response.json();
      console.log('📊 API Response:', result);

      if (!response.ok) {
        setLastScanResult({
          success: false,
          message: result.error || result.details || 'Failed to record attendance',
          data: null
        });
        return;
      }

      setLastScanResult({
        success: true,
        message: result.message,
        data: result.data
      });

      // Refresh attendance data and poll after a short delay
      setTimeout(async () => {
        try {
          const today = new Date().toISOString().split('T')[0];
          
          // Fetch the poll that was just created/used
          const { data: poll } = await supabase
            .from('polls')
            .select('id, poll_date, title')
            .eq('poll_date', today)
            .single();

          if (poll) {
            setTodaysPoll(poll);
            await fetchAttendanceData(poll.id);
          }
        } catch (refreshErr) {
          console.error('Refresh error:', refreshErr);
          // Don't crash, just log
        }
      }, 500);

      // Auto-close scanner after successful scan
      setTimeout(() => {
        setShowScanner(false);
      }, 2000);

    } catch (err) {
      console.error('❌ Scan error:', err);
      setLastScanResult({
        success: false,
        message: 'Error recording attendance: ' + (err.message || 'Unknown error'),
        data: null
      });
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return <FullPageLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="flex gap-4 items-start">
            <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
              <p className="text-gray-700 mb-4">{error}</p>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                ← Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-2">QR Scanner</h1>
              <p className="text-sm sm:text-base text-gray-600">Scan student QR codes to record attendance</p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white active:bg-gray-100 rounded-lg transition touch-manipulation"
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-xs sm:text-sm font-semibold">Total Present</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1 sm:mt-2">{scanStats.attended}</p>
              </div>
              <CheckCircle size={32} className="text-green-500 sm:w-10 sm:h-10 flex-shrink-0 ml-2" />
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-xs sm:text-sm font-semibold">Pending</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mt-1 sm:mt-2">{scanStats.pending}</p>
              </div>
              <Clock size={32} className="text-yellow-500 sm:w-10 sm:h-10 flex-shrink-0 ml-2" />
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-gray-600 text-xs sm:text-sm font-semibold">Total Responses</p>
                <p className="text-2xl sm:text-3xl font-bold text-indigo-600 mt-1 sm:mt-2">{scanStats.total}</p>
              </div>
              <User size={32} className="text-indigo-500 sm:w-10 sm:h-10 flex-shrink-0 ml-2" />
            </div>
          </div>
        </div>

        {/* Scan Button */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => setShowScanner(true)}
            disabled={scanning}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 sm:py-5 rounded-xl sm:rounded-2xl transition shadow-lg hover:shadow-xl active:shadow-2xl flex items-center justify-center gap-3 touch-manipulation text-base sm:text-lg"
          >
            {scanning ? (
              <>
                <Loader size={24} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Camera size={24} />
                Open QR Scanner
              </>
            )}
          </button>
        </div>

        {/* Last Scan Result */}
        {lastScanResult && (
          <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl ${
            lastScanResult.success 
              ? 'bg-green-50 border-2 border-green-200' 
              : 'bg-red-50 border-2 border-red-200'
          }`}>
            <div className="flex gap-3 sm:gap-4 items-start">
              {lastScanResult.success ? (
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1 sm:w-6 sm:h-6" />
              ) : (
                <XCircle size={20} className="text-red-600 flex-shrink-0 mt-1 sm:w-6 sm:h-6" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm sm:text-base ${lastScanResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {lastScanResult.message}
                </p>
                {lastScanResult.data && (
                  <div className="mt-3 text-xs sm:text-sm space-y-1 text-gray-700">
                    <p className="break-words"><strong>Name:</strong> {lastScanResult.data.userName}</p>
                    <p className="break-all"><strong>Email:</strong> {lastScanResult.data.userEmail}</p>
                    <p><strong>Time:</strong> {new Date(lastScanResult.data.attendedAt).toLocaleTimeString()}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setLastScanResult(null)}
                className="text-gray-400 hover:text-gray-600 active:text-gray-800 p-1 touch-manipulation flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Recent Scans */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h2 className="text-lg sm:text-xl font-bold">Recent Attendance</h2>
          </div>

          {recentScans.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-gray-500">
              <Camera size={32} className="mx-auto mb-4 opacity-50 sm:w-10 sm:h-10" />
              <p className="text-sm sm:text-base">No attendance records yet. Start scanning QR codes.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Dept</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentScans.map((scan, idx) => (
                      <tr key={scan.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                          {scan.profiles_new?.full_name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {scan.profiles_new?.email || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {scan.profiles_new?.dept || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            scan.confirmation_status === 'confirmed_attended'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {scan.confirmation_status === 'confirmed_attended' ? '✓ Present' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(scan.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - Visible only on mobile */}
              <div className="md:hidden divide-y divide-gray-200">
                {recentScans.map((scan) => (
                  <div key={scan.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {scan.profiles_new?.full_name || 'Unknown'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        scan.confirmation_status === 'confirmed_attended'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {scan.confirmation_status === 'confirmed_attended' ? '✓ Present' : 'Pending'}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p className="truncate">{scan.profiles_new?.email || '-'}</p>
                      <div className="flex justify-between items-center">
                        <span>{scan.profiles_new?.dept || '-'}</span>
                        <span className="font-medium">
                          {new Date(scan.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          enabled={showScanner}
        />
      )}
    </div>
  );
}
