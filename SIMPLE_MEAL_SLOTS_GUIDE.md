# 🚀 SIMPLE MEAL SLOTS IMPLEMENTATION

## ✅ What You Already Did
- SQL migration complete
- Database supports 3 meal slots (breakfast, lunch, dinner)

## 🎯 Quick Implementation Strategy

Since full 3-meal-slot UI is complex, here's a **SIMPLE START**:

### Phase 1: Add Meal Slot Selection to Existing Poll (20 minutes)

Update the poll modal to let users choose which meal they're responding for.

#### File: `/app/user/dashboard/components/PollModal.js`

**Add meal slot selector before attendance selection:**

```javascript
{/* NEW: Meal Slot Selection */}
<div>
  <label className="block text-base font-medium text-gray-700 mb-3">
    Which meal?
  </label>
  <div className="grid grid-cols-3 gap-3">
    <label className="flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition"
           style={{
             borderColor: mealSlot === 'breakfast' ? '#3b82f6' : '#d1d5db',
             backgroundColor: mealSlot === 'breakfast' ? '#eff6ff' : 'white'
           }}>
      <input
        type="radio"
        name="mealSlot"
        value="breakfast"
        checked={mealSlot === 'breakfast'}
        onChange={(e) => setMealSlot(e.target.value)}
        className="w-5 h-5"
      />
      <span className="text-2xl">🌅</span>
      <span className="text-sm font-medium">Breakfast</span>
      <span className="text-xs text-gray-500">8:00 AM</span>
    </label>

    <label className="flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition"
           style={{
             borderColor: mealSlot === 'lunch' ? '#3b82f6' : '#d1d5db',
             backgroundColor: mealSlot === 'lunch' ? '#eff6ff' : 'white'
           }}>
      <input
        type="radio"
        name="mealSlot"
        value="lunch"
        checked={mealSlot === 'lunch'}
        onChange={(e) => setMealSlot(e.target.value)}
        className="w-5 h-5"
      />
      <span className="text-2xl">☀️</span>
      <span className="text-sm font-medium">Lunch</span>
      <span className="text-xs text-gray-500">1:00 PM</span>
    </label>

    <label className="flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition"
           style={{
             borderColor: mealSlot === 'dinner' ? '#3b82f6' : '#d1d5db',
             backgroundColor: mealSlot === 'dinner' ? '#eff6ff' : 'white'
           }}>
      <input
        type="radio"
        name="mealSlot"
        value="dinner"
        checked={mealSlot === 'dinner'}
        onChange={(e) => setMealSlot(e.target.value)}
        className="w-5 h-5"
      />
      <span className="text-2xl">🌙</span>
      <span className="text-sm font-medium">Dinner</span>
      <span className="text-xs text-gray-500">8:00 PM</span>
    </label>
  </div>
</div>
```

**Update component props to include mealSlot:**
```javascript
export default function PollModal({ 
  isOpen, 
  onClose, 
  userStats, 
  attendance, 
  setAttendance, 
  mealType, 
  setMealType,
  mealSlot,        // ADD THIS
  setMealSlot,     // ADD THIS
  pollLoading, 
  pollMessage, 
  onSubmitPoll 
}) {
```

#### File: `/app/user/dashboard/page.js`

**Add mealSlot state:**
```javascript
const [attendance, setAttendance] = useState('yes')
const [mealType, setMealType] = useState('full')
const [mealSlot, setMealSlot] = useState('lunch')  // ADD THIS - default to lunch
```

**Update handleSubmitPoll to include meal_slot:**
```javascript
const payload = {
  user_id: currentUser.id,
  date: today,
  present: attendance === 'yes',
  portion_size: mealType,
  meal_slot: mealSlot,  // ADD THIS
  confirmation_status: 'pending_customer_response'
}

// Update upsert to use new unique constraint
const { data: updatedData, error } = await supabase
  .from('poll_responses')
  .upsert(payload, { 
    onConflict: 'user_id,date,meal_slot',  // CHANGE THIS
    ignoreDuplicates: false 
  })
  .select()
```

**Pass mealSlot to PollModal:**
```javascript
<PollModal 
  isOpen={pollOpen}
  onClose={() => {
    setPollOpen(false)
    setPollMessage('')
  }}
  userStats={userStats}
  attendance={attendance}
  setAttendance={setAttendance}
  mealType={mealType}
  setMealType={setMealType}
  mealSlot={mealSlot}          // ADD THIS
  setMealSlot={setMealSlot}    // ADD THIS
  pollLoading={pollLoading}
  pollMessage={pollMessage}
  onSubmitPoll={handleSubmitPoll}
/>
```

### Phase 2: Update Today's Poll Status (10 minutes)

#### File: `/app/user/dashboard/components/TodaysPollStatus.js`

**Show which meal slot the response is for:**
```javascript
<p className="text-sm text-gray-600 mt-1">
  {pollResponse.present ? 'Attending' : 'Not Attending'} • 
  {pollResponse.meal_slot && ` ${pollResponse.meal_slot.charAt(0).toUpperCase() + pollResponse.meal_slot.slice(1)} • `}
  {pollResponse.present && ` ${pollResponse.portion_size} portion`}
</p>
```

### Phase 3: Update Dashboard to Show All 3 Meal Responses (30 minutes)

#### File: `/app/user/dashboard/page.js`

**Change loadUserStats to fetch all 3 meal slots:**

```javascript
const loadUserStats = async (userId, profileId) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // Fetch all 3 meal slot responses for today
    const { data: todaysResponses, error: pollError } = await supabase
      .from('poll_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .in('meal_slot', ['breakfast', 'lunch', 'dinner']);

    if (pollError) {
      console.error('Error fetching today\'s polls:', pollError);
    }

    // Create an object with responses for each meal slot
    const mealResponses = {
      breakfast: todaysResponses?.find(r => r.meal_slot === 'breakfast') || null,
      lunch: todaysResponses?.find(r => r.meal_slot === 'lunch') || null,
      dinner: todaysResponses?.find(r => r.meal_slot === 'dinner') || null
    };

    // ... rest of stats calculation ...

    setUserStats({
      totalBill,
      thisMonthMeals,
      allTimeMeals,
      todaysPollResponse: mealResponses.lunch, // Default to lunch for now
      mealResponses: mealResponses,  // ADD THIS - all 3 meal responses
      confirmationStatus
    });
  } catch (err) {
    console.error('Error loading user stats:', err);
  }
};
```

**Add 3 meal slot buttons to dashboard:**

```javascript
{/* Show 3 meal slot response buttons */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  {['breakfast', 'lunch', 'dinner'].map((slot) => {
    const response = userStats.mealResponses?.[slot];
    const icon = slot === 'breakfast' ? '🌅' : slot === 'lunch' ? '☀️' : '🌙';
    const time = slot === 'breakfast' ? '8:00 AM' : slot === 'lunch' ? '1:00 PM' : '8:00 PM';
    
    return (
      <button
        key={slot}
        onClick={() => {
          setMealSlot(slot);
          setPollOpen(true);
        }}
        className="p-4 bg-white rounded-lg shadow border-2 border-gray-200 hover:border-blue-400 transition"
      >
        <div className="text-3xl mb-2">{icon}</div>
        <div className="font-semibold capitalize">{slot}</div>
        <div className="text-sm text-gray-500">{time}</div>
        {response ? (
          <div className="mt-2 text-sm">
            {response.present ? (
              <span className="text-green-600">✓ Attending ({response.portion_size})</span>
            ) : (
              <span className="text-red-600">✗ Not attending</span>
            )}
          </div>
        ) : (
          <div className="mt-2 text-sm text-gray-400">No response</div>
        )}
      </button>
    );
  })}
</div>
```

---

## 🎯 Result After Phase 1-3

Users can now:
- ✅ Choose which meal (breakfast/lunch/dinner)
- ✅ Respond to all 3 meals separately
- ✅ See their responses for each meal slot
- ✅ Update each meal response independently

---

## 🚀 Want Me To Implement This?

Tell me **"implement phases 1-3"** and I'll make these exact changes to your code now!

Or if you want to do it yourself, follow the code snippets above.

---

## ⏭️ Next Phases (Future)

- **Phase 4**: Update QR scanner to ask "Which meal are you scanning for?"
- **Phase 5**: Update billing to show meals grouped by slot
- **Phase 6**: Update admin attendance page to show meal slot breakdown

Let me know if you want me to implement Phases 1-3 now! 🎯
