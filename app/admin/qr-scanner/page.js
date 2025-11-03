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
      }, 500);

      // Auto-close scanner after successful scan
      setTimeout(() => {
        setShowScanner(false);
      }, 2000);

    } catch (err) {
      console.error('Scan error:', err);
      setLastScanResult({
        success: false,
        message: 'Error recording attendance: ' + err.message,
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
              <p className="text-gray-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">QR Scanner</h1>
          <p className="text-gray-600">Scan student QR codes to record attendance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Present</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{scanStats.attended}</p>
              </div>
              <CheckCircle size={40} className="text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{scanStats.pending}</p>
              </div>
              <Clock size={40} className="text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Responses</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{scanStats.total}</p>
              </div>
              <User size={40} className="text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Scan Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowScanner(true)}
            disabled={scanning}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 rounded-2xl transition shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
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
          <div className={`mb-8 p-6 rounded-2xl ${
            lastScanResult.success 
              ? 'bg-green-50 border-2 border-green-200' 
              : 'bg-red-50 border-2 border-red-200'
          }`}>
            <div className="flex gap-4 items-start">
              {lastScanResult.success ? (
                <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <XCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <p className={`font-bold ${lastScanResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {lastScanResult.message}
                </p>
                {lastScanResult.data && (
                  <div className="mt-3 text-sm space-y-1 text-gray-700">
                    <p><strong>Name:</strong> {lastScanResult.data.userName}</p>
                    <p><strong>Email:</strong> {lastScanResult.data.userEmail}</p>
                    <p><strong>Time:</strong> {new Date(lastScanResult.data.attendedAt).toLocaleTimeString()}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setLastScanResult(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Recent Scans */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h2 className="text-xl font-bold">Recent Attendance</h2>
          </div>

          {recentScans.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Camera size={40} className="mx-auto mb-4 opacity-50" />
              <p>No attendance records yet. Start scanning QR codes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
