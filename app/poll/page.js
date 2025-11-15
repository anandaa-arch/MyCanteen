"use client";

import { useState, useEffect } from "react";
import { useSupabaseClient } from '@/lib/supabaseClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pollResponseSchema } from '@/lib/validationSchemas';
import { FormRadioGroup, FormSubmitButton, FormErrorSummary } from '@/components/FormComponents';
import { PollsErrorBoundary } from '@/components/PageErrorBoundary';
import { PollSkeleton } from '@/components/Skeleton';

const getCurrentMealSlot = () => {
  const hours = new Date().getHours();
  if (hours >= 5 && hours < 9) return 'breakfast';
  if (hours >= 9 && hours < 14) return 'lunch';
  if (hours >= 14 && hours < 22) return 'dinner';
  return 'breakfast';
};

const mealSlotMeta = {
  breakfast: {
    icon: '🌅',
    label: 'Breakfast',
    booking: 'Book: 5-9 AM',
    serving: 'Serving: 7:30-9 AM'
  },
  lunch: {
    icon: '☀️',
    label: 'Lunch',
    booking: 'Book: 9 AM-2 PM',
    serving: 'Serving: 12-2 PM'
  },
  dinner: {
    icon: '🌙',
    label: 'Dinner',
    booking: 'Book: 2-10 PM',
    serving: 'Serving: 7:30-10 PM'
  }
};

const isMealSlotOpen = (slot) => {
  const hours = new Date().getHours();
  if (slot === 'breakfast') return hours >= 5 && hours < 9;
  if (slot === 'lunch') return hours >= 9 && hours < 14;
  if (slot === 'dinner') return hours >= 14 && hours < 22;
  return false;
};

function PollPageContent() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [existingResponse, setExistingResponse] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [mealSlot, setMealSlot] = useState(getCurrentMealSlot());

  const supabase = useSupabaseClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(pollResponseSchema),
    defaultValues: {
      attendance: '',
      portion: '',
    },
  });

  useEffect(() => {
    // Get current user and check for existing response
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await checkExistingResponse(user.id);
      }
      setInitialLoading(false);
    };

    getCurrentUser();
  }, []);

  const checkExistingResponse = async (userId) => {
    const today = new Date().toISOString().slice(0, 10);
    
    const { data, error } = await supabase
      .from('poll_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (data && !error) {
      setExistingResponse(data);
      setValue('attendance', data.present ? 'yes' : 'no');
      setValue('portion', data.portion_size);
      setMealSlot(data.meal_slot || getCurrentMealSlot());
      setMessage("You have already submitted your response for today. You can update it below.");
    }
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    setMessage("");

    if (!user) {
      setMessage("⚠️ You must be logged in to submit a poll response.");
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const isAttending = formData.attendance === 'yes';
    const pollData = {
      user_id: user.id,
      date: today,
      present: isAttending,
      portion_size: formData.portion,
      meal_slot: mealSlot,
      confirmation_status: isAttending ? 'pending_customer_response' : 'cancelled'
    };

    try {
      const { data, error } = await supabase
        .rpc('upsert_poll_response', {
          p_user_id: pollData.user_id,
          p_date: pollData.date,
          p_present: pollData.present,
          p_portion_size: pollData.portion_size,
          p_meal_slot: pollData.meal_slot,
          p_confirmation_status: pollData.confirmation_status
        });

      if (error) {
        console.error('Error submitting poll:', error);
        setMessage("❌ Error submitting response. Please try again.");
      } else {
        const successMsg = existingResponse 
          ? `✅ Response updated!\n${mealSlotMeta[mealSlot].label}: ${formData.attendance === 'yes' ? 'Present' : 'Absent'}, Portion: ${formData.portion} plate`
          : `✅ Response submitted!\n${mealSlotMeta[mealSlot].label}: ${formData.attendance === 'yes' ? 'Present' : 'Absent'}, Portion: ${formData.portion} plate`;
        setMessage(successMsg);
        setExistingResponse({ ...pollData }); // Update local state
        
        // Refresh the page data after a short delay
        setTimeout(() => {
          checkExistingResponse(user.id);
        }, 500);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setMessage("❌ Unexpected error occurred. Please try again.");
    }

    setLoading(false);
  };

  if (initialLoading) {
    return <PollSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 px-4 py-10">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Please log in</h1>
        <p className="text-gray-600 text-base mb-6">
          You need to be logged in to submit a poll response.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 px-4 py-10">
      <h1 className="text-3xl font-bold text-blue-700 mb-2">Mess Attendance</h1>
      <p className="text-gray-600 text-base mb-6">
        Kindly confirm your attendance and portion size for today&rsquo;s meal.
      </p>

      <FormErrorSummary errors={errors} />

      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6 mt-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-base font-medium text-gray-800 mb-3">Which meal?</p>
          <div className="grid grid-cols-3 gap-3">
            {Object.keys(mealSlotMeta).map((slot) => {
              const meta = mealSlotMeta[slot];
              const isOpen = isMealSlotOpen(slot);
              const isSelected = mealSlot === slot;
              return (
                <button
                  type="button"
                  key={slot}
                  onClick={() => isOpen && setMealSlot(slot)}
                  disabled={!isOpen}
                  className={`flex flex-col items-center gap-1.5 border-2 rounded-lg px-3 py-3 transition text-sm ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                  } ${isOpen ? 'cursor-pointer hover:border-blue-300 hover:bg-blue-50' : 'cursor-not-allowed opacity-50'}`}
                >
                  <span className="text-2xl">{meta.icon}</span>
                  <span className="font-semibold">{meta.label}</span>
                  <span className="text-xs text-gray-600">{meta.booking}</span>
                  <span className="text-[11px] italic text-gray-500">{meta.serving}</span>
                  <span className={`text-xs font-semibold ${isOpen ? 'text-green-600' : 'text-red-500'}`}>
                    {isOpen ? 'Open' : 'Closed'}
                  </span>
                </button>
              );
            })}
          </div>
          {!isMealSlotOpen(mealSlot) && (
            <p className="text-xs text-red-600 font-medium mt-2">
              Selected slot is closed. Please wait for it to open or choose another slot.
            </p>
          )}
        </div>

        <FormRadioGroup
          label="Will you attend?"
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]}
          error={errors.attendance?.message}
          {...register('attendance')}
        />

        <FormRadioGroup
          label="Portion Size"
          options={[
            { value: 'full', label: 'Full Plate' },
            { value: 'half', label: 'Half Plate' }
          ]}
          error={errors.portion?.message}
          {...register('portion')}
        />

        <FormSubmitButton loading={loading}>
          {loading ? "Submitting..." : existingResponse ? "Update Response" : "Submit Response"}
        </FormSubmitButton>

        {/* Message */}
        {message && (
          <div className={`text-center text-sm font-medium mt-4 whitespace-pre-line ${
            message.includes('❌') || message.includes('⚠️') 
              ? 'text-red-600' 
              : 'text-blue-600'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default function PollPage() {
  return (
    <PollsErrorBoundary>
      <PollPageContent />
    </PollsErrorBoundary>
  );
}