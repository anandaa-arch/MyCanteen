import { useState } from 'react';
import { Clock, Check, X, AlertCircle } from 'lucide-react';

const getStatusBadge = (status) => {
  if (!status) return null;

  const statusConfig = {
    pending_customer_response: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: '✏️ Pending Your Response' },
    awaiting_admin_confirmation: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: '⏳ Awaiting Admin Confirmation' },
    confirmed_attended: { color: 'bg-green-100 text-green-800', icon: Check, label: '✅ Confirmed' },
    no_show: { color: 'bg-red-100 text-red-800', icon: X, label: '❌ No Show' },
    rejected: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: '🚫 Rejected' },
    cancelled: { color: 'bg-gray-100 text-gray-800', icon: X, label: '📵 Cancelled' }
  };

  const config = statusConfig[status] || statusConfig.pending_customer_response;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

export default function TodaysPollStatus({ userStats, onUpdateResponse }) {
  const [marking, setMarking] = useState(false);
  const [cancellingRequest, setCancellingRequest] = useState(false);

  if (!userStats.todaysPollResponse) {
    return null;
  }

  const pollResponse = userStats.todaysPollResponse;
  const status = pollResponse.confirmation_status || 'pending_customer_response';
  const isAttended = pollResponse.attended_at;

  const handleMarkAsAttended = async () => {
    if (!pollResponse.id) {
      alert('Poll response ID not found');
      return;
    }

    setMarking(true);
    try {
      const response = await fetch(`/api/polls/${pollResponse.id}/mark-attended`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_attended' })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to mark attendance');
      }

      // Refresh the data
      onUpdateResponse();
      alert('Marked as attending! Waiting for admin confirmation.');
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert(`Failed: ${error.message}`);
    } finally {
      setMarking(false);
    }
  };

  const handleCancelResponse = async () => {
    if (!pollResponse.id) {
      alert('Poll response ID not found');
      return;
    }

    if (!window.confirm('Are you sure you want to cancel your response?')) {
      return;
    }

    setCancellingRequest(true);
    try {
      const response = await fetch(`/api/polls/${pollResponse.id}/mark-attended`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel response');
      }

      // Refresh the data
      onUpdateResponse();
      alert('Response cancelled successfully.');
    } catch (error) {
      console.error('Error cancelling response:', error);
      alert(`Failed: ${error.message}`);
    } finally {
      setCancellingRequest(false);
    }
  };
  if (!userStats.todaysPollResponse) {
    return null
  }

  return (
    <div className="mb-8 bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Poll Response</h3>
          <p className="text-sm text-gray-600 mt-1">
            {pollResponse.present ? 'Attending' : 'Not Attending'} • 
            {pollResponse.present && ` ${pollResponse.portion_size} portion`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(status)}
        </div>
      </div>

      {/* Action Buttons Based on Status */}
      <div className="mt-4 flex gap-3 flex-wrap">
        {/* Show "Mark as Attended" button only if pending and they said yes */}
        {status === 'pending_customer_response' && pollResponse.present && !isAttended && (
          <button
            onClick={handleMarkAsAttended}
            disabled={marking}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm font-medium flex items-center gap-2"
          >
            <Check size={16} />
            {marking ? 'Marking...' : 'Mark as Attending Now'}
          </button>
        )}

        {/* Show "Awaiting Confirmation" info message */}
        {status === 'awaiting_admin_confirmation' && (
          <div className="px-4 py-2 bg-yellow-100 border border-yellow-400 rounded-lg text-sm font-medium text-yellow-800">
            ⏳ You marked as attending. Admin will confirm soon.
          </div>
        )}

        {/* Show "Confirmed" message */}
        {status === 'confirmed_attended' && (
          <div className="px-4 py-2 bg-green-100 border border-green-400 rounded-lg text-sm font-medium text-green-800">
            ✅ Your attendance has been confirmed!
          </div>
        )}

        {/* Show "No Show" message */}
        {status === 'no_show' && (
          <div className="px-4 py-2 bg-red-100 border border-red-400 rounded-lg text-sm font-medium text-red-800">
            ❌ Marked as no show - you didn&apos;t attend.
          </div>
        )}

        {/* Show "Rejected" message */}
        {status === 'rejected' && (
          <div className="px-4 py-2 bg-orange-100 border border-orange-400 rounded-lg text-sm font-medium text-orange-800">
            🚫 Your response was rejected by admin.
          </div>
        )}

        {/* Always show "Update Response" button */}
        <button
          onClick={onUpdateResponse}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          Update Response
        </button>

        {/* Show "Cancel" button if not yet confirmed */}
        {status !== 'confirmed_attended' && status !== 'cancelled' && (
          <button
            onClick={handleCancelResponse}
            disabled={cancellingRequest}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition disabled:opacity-50 text-sm font-medium"
          >
            {cancellingRequest ? 'Cancelling...' : 'Cancel Response'}
          </button>
        )}
      </div>
    </div>
  );
}