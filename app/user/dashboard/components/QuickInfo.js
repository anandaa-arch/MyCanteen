export default function QuickInfo({ userStats }) {
  const getStatusMessage = () => {
    const responses = userStats.todaysPollResponses || []
    if (!responses.length) {
      return 'Submit your response to participate in today\'s meals'
    }

    if (responses.some((resp) => resp.confirmation_status === 'confirmed_attended')) {
      return 'At least one of your meals is confirmed for today'
    }

    if (responses.some((resp) => resp.confirmation_status === 'awaiting_admin_confirmation')) {
      return 'Waiting for admin confirmation for one or more meals'
    }

    return 'You can still update your responses until they are confirmed'
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
      <div className="space-y-2 text-sm text-gray-600">
        <p>• Poll responses are for today&apos;s meals</p>
        <p>• You can update your response until the admin confirms it</p>
        <p>• Full meal: ₹60 | Half meal: ₹45</p>
        <p>• Confirmed responses will be used for billing</p>
        <p>• {getStatusMessage()}</p>
      </div>
    </div>
  )
}