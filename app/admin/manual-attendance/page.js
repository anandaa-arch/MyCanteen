'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabaseClient';
import { Search, CheckCircle, XCircle, Clock, User as UserIcon } from 'lucide-react';

export default function ManualAttendancePage() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkAuthAndLoadUsers();
  }, []);

  const checkAuthAndLoadUsers = async () => {
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

      if (!profile || profile.role !== 'admin') {
        router.push('/login');
        return;
      }

      await fetchUsers();
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles_new')
        .select('id, full_name, email, dept, year, role')
        .eq('role', 'user')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Fetch users error:', error);
      setUsers([]);
    }
  };

  const markAttendance = async (user) => {
    try {
      setSubmitting(user.id);
      setMessage('');

      const today = new Date().toISOString().split('T')[0];
      
      // Get or create today's poll
      let { data: poll } = await supabase
        .from('polls')
        .select('id')
        .eq('poll_date', today)
        .single();

      if (!poll) {
        const { data: newPoll, error: pollError } = await supabase
          .from('polls')
          .insert([{
            poll_date: today,
            title: `Attendance - ${today}`,
            status: 'active'
          }])
          .select('id')
          .single();

        if (pollError) throw pollError;
        poll = newPoll;
      }

      // Check existing attendance
      const { data: existing } = await supabase
        .from('poll_responses')
        .select('id')
        .eq('poll_id', poll.id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('poll_responses')
          .update({
            present: true,
            confirmation_status: 'confirmed_attended',
            attended_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('poll_responses')
          .insert([{
            poll_id: poll.id,
            user_id: user.id,
            present: true,
            confirmation_status: 'confirmed_attended',
            attended_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      setMessage(`✅ Attendance recorded for ${user.full_name}`);
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      console.error('Mark attendance error:', error);
      setMessage(`❌ Failed: ${error.message}`);
    } finally {
      setSubmitting(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.dept?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-blue-600 mb-2">Manual Attendance</h1>
              <p className="text-gray-600">Click on a student to mark them present</p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition"
            >
              ← Dashboard
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-xl ${
            message.includes('✅') ? 'bg-green-50 text-green-800 border-2 border-green-200' : 'bg-red-50 text-red-800 border-2 border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* User List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <UserIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p>No students found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => markAttendance(user)}
                  disabled={submitting === user.id}
                  className="w-full p-6 hover:bg-blue-50 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{user.full_name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.dept && (
                        <p className="text-xs text-gray-500 mt-1">
                          {user.dept} {user.year && `- ${user.year}`}
                        </p>
                      )}
                    </div>
                    <div>
                      {submitting === user.id ? (
                        <Clock size={24} className="text-blue-600 animate-spin" />
                      ) : (
                        <CheckCircle size={24} className="text-green-600" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} students
        </div>
      </div>
    </div>
  );
}
