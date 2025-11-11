"use client";

import { useState, useEffect } from "react";
import { useSupabaseClient } from '@/lib/supabaseClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pollResponseSchema } from '@/lib/validationSchemas';
import { FormRadioGroup, FormSubmitButton, FormErrorSummary } from '@/components/FormComponents';
import { PollsErrorBoundary } from '@/components/PageErrorBoundary';
import { PollSkeleton } from '@/components/Skeleton';

function PollPageContent() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [existingResponse, setExistingResponse] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

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
    const pollData = {
      user_id: user.id,
      date: today,
      present: formData.attendance === 'yes',
      portion_size: formData.portion,
      confirmation_status: 'pending_customer_response'
    };

    try {
      const { data, error } = await supabase
        .from('poll_responses')
        .upsert(pollData, { 
          onConflict: 'user_id,date',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error submitting poll:', error);
        setMessage("❌ Error submitting response. Please try again.");
      } else {
        const successMsg = existingResponse 
          ? `✅ Response updated!\nAttendance: ${formData.attendance === 'yes' ? 'Present' : 'Absent'}, Portion: ${formData.portion} plate`
          : `✅ Response submitted!\nAttendance: ${formData.attendance === 'yes' ? 'Present' : 'Absent'}, Portion: ${formData.portion} plate`;
        setMessage(successMsg);
        setExistingResponse(pollData); // Update local state
        
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