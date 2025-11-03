-- Quick Fix: Add poll_responses table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.poll_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    present BOOLEAN NOT NULL DEFAULT false,
    portion_size TEXT NOT NULL CHECK (portion_size IN ('full', 'half')),
    
    -- Customer side: tracks when they mark as attended
    attended_at TIMESTAMPTZ,
    
    -- Admin side: tracks confirmation details
    confirmation_status TEXT DEFAULT 'pending_customer_response' CHECK (
        confirmation_status IN (
            'pending_customer_response',    -- Waiting for customer to mark attended/not attending
            'awaiting_admin_confirmation',  -- Customer marked attended, waiting for admin to verify
            'confirmed_attended',           -- Admin confirmed they ate
            'no_show',                      -- Customer said yes but didn't come
            'rejected',                     -- Admin rejected the response
            'cancelled'                     -- Customer cancelled their response
        )
    ),
    
    -- Admin confirmation tracking
    confirmed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    confirmed_at TIMESTAMPTZ,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_poll_responses_user_id ON public.poll_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_responses_date ON public.poll_responses(date);
CREATE INDEX IF NOT EXISTS idx_poll_responses_user_date ON public.poll_responses(user_id, date);

ALTER TABLE public.poll_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own poll responses"
    ON public.poll_responses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own poll responses"
    ON public.poll_responses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own poll responses"
    ON public.poll_responses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all poll responses"
    ON public.poll_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles_new
            WHERE profiles_new.id = auth.uid()
            AND profiles_new.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert poll responses for any user"
    ON public.poll_responses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles_new
            WHERE profiles_new.id = auth.uid()
            AND profiles_new.role = 'admin'
        )
    );

CREATE POLICY "Admins can update all poll responses"
    ON public.poll_responses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles_new
            WHERE profiles_new.id = auth.uid()
            AND profiles_new.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete poll responses"
    ON public.poll_responses FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles_new
            WHERE profiles_new.id = auth.uid()
            AND profiles_new.role = 'admin'
        )
    );
