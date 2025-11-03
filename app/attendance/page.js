'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { FullPageLoader } from '@/components/LoadingSpinner';
import { Calendar, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getFromCache, setInCache, clearCache } from '@/lib/cache';
import { AttendanceErrorBoundary } from '@/components/PageErrorBoundary';
import { AttendanceSkeleton } from '@/components/Skeleton';

function AttendancePageContent() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [stats, setStats] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    attendanceRate: '0%'
  });
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    fetchUserAttendance();
  }, [supabase, router]);
  const fetchUserAttendance = async () => {
    try {
      setLoading(true);

      // Check cache first
      const cacheKey = 'attendance_data';
      const cachedData = getFromCache(cacheKey);
      
      if (cachedData) {
        setUser(cachedData.user);
        setAttendanceHistory(cachedData.attendanceHistory);
        setStats(cachedData.stats);
        setLastRefresh(new Date());
        setLoading(false);
        return;
      }

      // Use API route to fetch attendance data
      const response = await fetch('/api/attendance?action=get-user-attendance');
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      // Cache the data for 5 minutes
      setInCache(cacheKey, {
        user: data.user,
        attendanceHistory: data.attendanceHistory,
        stats: data.stats
      }, 300);

      setUser(data.user);
      setAttendanceHistory(data.attendanceHistory || []);
      setStats(data.stats || {
        totalPresent: 0,
        totalAbsent: 0,
        attendanceRate: '0%'
      });
      setLastRefresh(new Date());

    } catch (err) {
      console.error('Attendance fetch error:', err);
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    clearCache('attendance_data');
    fetchUserAttendance();
  };

  if (loading) {
    return <AttendanceSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Attendance History</h1>
          <p className="text-gray-600">Your meal attendance records</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Present</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalPresent}</p>
              </div>
              <CheckCircle size={40} className="text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Absent</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.totalAbsent}</p>
              </div>
              <AlertCircle size={40} className="text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Attendance Rate</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.attendanceRate}</p>
              </div>
              <Calendar size={40} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h2 className="text-xl font-bold">Recent Attendance Records</h2>
          </div>

          {attendanceHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar size={40} className="mx-auto mb-4 opacity-50" />
              <p>No attendance records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Poll</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.map((record, idx) => {
                    const pollDate = new Date(record.date || record.created_at);
                    const attendedTime = new Date(record.attended_at);
                    
                    return (
                      <tr key={record.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                          {pollDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {record.portion_size ? `${record.portion_size.charAt(0).toUpperCase() + record.portion_size.slice(1)} Plate` : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            record.confirmation_status === 'confirmed_attended'
                              ? 'bg-green-100 text-green-800'
                              : record.present === false
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.confirmation_status === 'confirmed_attended'
                              ? '✓ Present'
                              : record.present === false
                              ? '✗ Absent'
                              : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {record.attended_at ? (
                            <div className="flex items-center gap-2">
                              <Clock size={16} className="text-gray-400" />
                              {attendedTime.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {record.confirmation_status}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
          <h3 className="font-bold text-blue-900 mb-2">📋 Attendance Information</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Present:</strong> You marked yourself as attending and confirmed via QR code</li>
            <li>• <strong>Absent:</strong> You marked yourself as not attending</li>
            <li>• <strong>Pending:</strong> Your attendance is awaiting confirmation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <AttendanceErrorBoundary>
      <AttendancePageContent />
    </AttendanceErrorBoundary>
  );
}
