// components/polls/PollResponseTable.js - UPDATED with 2-step confirmation
'use client';

import { useState } from 'react';
import { useSupabaseClient } from '@/lib/supabaseClient';
import { 
  User, 
  ToggleLeft, 
  ToggleRight, 
  Check, 
  Clock, 
  CheckCircle, 
  UserX,
  Users,
  X,
  AlertCircle
} from 'lucide-react';
import Pagination from '@/components/Pagination';
import { SkeletonTable } from '@/components/Skeleton';

export default function PollResponseTable({ data, onPollUpdate, loading, selectedDate }) {
  const [updatingPoll, setUpdatingPoll] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    responseId: null,
    userId: null,
    userName: null,
    action: null,
    notes: ''
  });
  const supabase = useSupabaseClient();

  const handleConfirmationAction = async (responseId, userId, action) => {
    const updateKey = `${responseId}_confirm`;
    setUpdatingPoll(prev => ({ ...prev, [updateKey]: true }));

    try {
      const response = await fetch(`/api/polls/${responseId}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          admin_notes: confirmationModal.notes || null
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to confirm attendance');
      }

      alert('✅ Attendance status updated successfully!');
      onPollUpdate(); // Refresh the poll data
      setConfirmationModal({ isOpen: false, responseId: null, userId: null, userName: null, action: null, notes: '' });
    } catch (error) {
      console.error('Error confirming attendance:', error);
      alert(`Failed: ${error.message}`);
    } finally {
      setUpdatingPoll(prev => ({ ...prev, [updateKey]: false }));
    }
  };

  const getStatusBadge = (confirmationStatus) => {
    const statusConfig = {
      'pending_customer_response': { bg: 'bg-gray-100', text: 'text-gray-800', label: '✏️ Pending Response', icon: Clock },
      'awaiting_admin_confirmation': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ Awaiting Confirmation', icon: Clock },
      'confirmed_attended': { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Confirmed Attended', icon: CheckCircle },
      'no_show': { bg: 'bg-red-100', text: 'text-red-800', label: '❌ No Show', icon: X },
      'rejected': { bg: 'bg-orange-100', text: 'text-orange-800', label: '🚫 Rejected', icon: AlertCircle },
      'cancelled': { bg: 'bg-gray-100', text: 'text-gray-800', label: '📵 Cancelled', icon: X }
    };

    const config = statusConfig[confirmationStatus] || statusConfig['pending_customer_response'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const openConfirmationModal = (responseId, userId, userName, currentStatus) => {
    setConfirmationModal({
      isOpen: true,
      responseId,
      userId,
      userName,
      action: null,
      notes: ''
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      responseId: null,
      userId: null,
      userName: null,
      action: null,
      notes: ''
    });
  };

  const handleAttendanceToggle = async (responseId, currentAttendance) => {
    if (!responseId) {
      console.error('Invalid response ID');
      return;
    }
    
    const updateKey = `${responseId}_attendance`;
    setUpdatingPoll(prev => ({ ...prev, [updateKey]: true }));

    try {
      const { error } = await supabase
        .from('poll_responses')
        .update({ present: !currentAttendance })
        .eq('id', responseId)
        .select();

      if (error) throw new Error(error.message);
      alert('✅ Attendance toggled successfully!');
      onPollUpdate();
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert(`Failed: ${error.message}`);
    } finally {
      setUpdatingPoll(prev => ({ ...prev, [updateKey]: false }));
    }
  };

  const handlePortionToggle = async (responseId, currentPortion) => {
    if (!responseId) {
      console.error('Invalid response ID');
      return;
    }
    
    const updateKey = `${responseId}_portion`;
    setUpdatingPoll(prev => ({ ...prev, [updateKey]: true }));

    const newPortion = currentPortion === 'full' ? 'half' : 'full';

    try {
      const { error } = await supabase
        .from('poll_responses')
        .update({ portion_size: newPortion })
        .eq('id', responseId)
        .select();

      if (error) throw new Error(error.message);
      alert('✅ Portion size updated successfully!');
      onPollUpdate();
    } catch (error) {
      console.error('Error updating portion:', error);
      alert(`Failed: ${error.message}`);
    } finally {
      setUpdatingPoll(prev => ({ ...prev, [updateKey]: false }));
    }
  };


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="h-6 bg-blue-400 rounded w-1/3 animate-pulse" />
          </div>
          <SkeletonTable rows={10} columns={7} />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">No data matches the current filter criteria.</p>
        </div>
      </div>
    );
  }

  // Pagination calculations
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  const handlePageChange = (page, newItemsPerPage) => {
    if (newItemsPerPage && newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(page);
    } else {
      setCurrentPage(page);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portion</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((item, index) => {
                const responseId = item.id;
                const userId = item.user_id;
                const isPresent = item.present || false;
                const portionSize = item.portion_size || 'full';
                const confirmationStatus = item.confirmation_status || 'pending_customer_response';
                const userData = item.profiles_new;

                // Skip rendering if no valid ID
                if (!responseId) {
                  return null;
                }

                const statusColors = {
                  'awaiting_admin_confirmation': 'bg-yellow-50',
                  'confirmed_attended': 'bg-green-50',
                  'no_show': 'bg-red-50',
                  'rejected': 'bg-orange-50'
                };

                return (
                  <tr
                    key={`${responseId}-${index}`}
                    className={`hover:bg-gray-50 transition-colors duration-150 ${statusColors[confirmationStatus] || ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {userData?.full_name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userData?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {userData?.contact_number || 'No phone'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(confirmationStatus)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleAttendanceToggle(responseId, isPresent)}
                        disabled={updatingPoll[`${responseId}_attendance`]}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isPresent 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } ${updatingPoll[`${responseId}_attendance`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isPresent ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        {updatingPoll[`${responseId}_attendance`] 
                          ? 'Updating...' 
                          : isPresent ? 'Present' : 'Absent'
                        }
                      </button>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handlePortionToggle(responseId, portionSize)}
                        disabled={updatingPoll[`${responseId}_portion`]}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          portionSize === 'full' 
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                            : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                        } ${updatingPoll[`${responseId}_portion`] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {updatingPoll[`${responseId}_portion`] 
                          ? 'Updating...' 
                          : portionSize === 'full' ? 'Full Plate' : 'Half Plate'
                        }
                      </button>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {confirmationStatus === 'pending_customer_response' || confirmationStatus === 'awaiting_admin_confirmation' ? (
                        <button
                          onClick={() => openConfirmationModal(responseId, userId, userData?.full_name, confirmationStatus)}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200"
                        >
                          <Check size={16} />
                          Confirm
                        </button>
                      ) : confirmationStatus === 'confirmed_attended' ? (
                        <span className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg">
                          <CheckCircle size={16} />
                          Confirmed
                        </span>
                      ) : confirmationStatus === 'no_show' ? (
                        <span className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-lg">
                          <X size={16} />
                          No Show
                        </span>
                      ) : confirmationStatus === 'rejected' ? (
                        <span className="inline-flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-800 text-sm font-medium rounded-lg">
                          <AlertCircle size={16} />
                          Rejected
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={data.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          itemsName="responses"
        />
      </div>

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Confirm Attendance - {confirmationModal.userName}
            </h2>
            
            <p className="text-gray-600 mb-4">
              Choose an action to confirm or reject this attendance:
            </p>

            {/* Admin Notes Input */}
            <textarea
              value={confirmationModal.notes}
              onChange={(e) => setConfirmationModal(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              placeholder="Optional: Add notes (e.g., 'Took half meal instead', 'Didn't show up with reason')"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
              rows="3"
            />

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => handleConfirmationAction(
                  confirmationModal.responseId,
                  confirmationModal.userId,
                  'confirm_attended'
                )}
                disabled={updatingPoll[`${confirmationModal.responseId}_confirm`]}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 text-sm flex items-center justify-center gap-1"
              >
                {updatingPoll[`${confirmationModal.responseId}_confirm`] ? (
                  <Clock size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                Attended
              </button>

              <button
                onClick={() => handleConfirmationAction(
                  confirmationModal.responseId,
                  confirmationModal.userId,
                  'no_show'
                )}
                disabled={updatingPoll[`${confirmationModal.responseId}_confirm`]}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 text-sm flex items-center justify-center gap-1"
              >
                {updatingPoll[`${confirmationModal.responseId}_confirm`] ? (
                  <Clock size={14} className="animate-spin" />
                ) : (
                  <X size={14} />
                )}
                No Show
              </button>

              <button
                onClick={() => handleConfirmationAction(
                  confirmationModal.responseId,
                  confirmationModal.userId,
                  'reject'
                )}
                disabled={updatingPoll[`${confirmationModal.responseId}_confirm`]}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 text-sm flex items-center justify-center gap-1"
              >
                {updatingPoll[`${confirmationModal.responseId}_confirm`] ? (
                  <Clock size={14} className="animate-spin" />
                ) : (
                  <AlertCircle size={14} />
                )}
                Reject
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={closeConfirmationModal}
              disabled={updatingPoll[`${confirmationModal.responseId}_confirm`]}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
