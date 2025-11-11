-- MyCanteen Database Schema
-- Run this in your Supabase SQL Editor to create all required tables

-- ============================================================================
-- 1. EXPENSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    vendor TEXT,
    incurred_on DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for date queries
CREATE INDEX IF NOT EXISTS idx_expenses_incurred_on ON public.expenses(incurred_on);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

-- Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can access
CREATE POLICY "Admin only access to expenses"
    ON public.expenses
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles_new
            WHERE profiles_new.id = auth.uid()
            AND profiles_new.role = 'admin'
        )
    );

COMMENT ON TABLE public.expenses IS 'Tracks all business expenses for the canteen';

-- ============================================================================
-- 2. INVENTORY ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT DEFAULT 'pcs',
    unit_price DECIMAL(10,2) DEFAULT 0 CHECK (unit_price >= 0),
    selling_price DECIMAL(10,2) CHECK (selling_price >= 0),
    current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),
    supplier TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_name ON public.inventory_items(name);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON public.inventory_items(category);

-- Enable Row Level Security
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can access
CREATE POLICY "Admin only access to inventory_items"
    ON public.inventory_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles_new
            WHERE profiles_new.id = auth.uid()
            AND profiles_new.role = 'admin'
        )
    );

COMMENT ON TABLE public.inventory_items IS 'Master list of all inventory items available in the canteen';

-- ============================================================================
-- 3. INVENTORY LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('in', 'out')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_amount DECIMAL(10,2),
    note TEXT,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_inventory_logs_item_id ON public.inventory_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_logged_at ON public.inventory_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_type ON public.inventory_logs(type);

-- Enable Row Level Security
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can access
CREATE POLICY "Admin only access to inventory_logs"
    ON public.inventory_logs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles_new
            WHERE profiles_new.id = auth.uid()
            AND profiles_new.role = 'admin'
        )
    );

-- Trigger to update inventory stock
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'in' THEN
        UPDATE public.inventory_items
        SET current_stock = current_stock + NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.item_id;
    ELSIF NEW.type = 'out' THEN
        UPDATE public.inventory_items
        SET current_stock = current_stock - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.item_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_inventory_stock ON public.inventory_logs;
CREATE TRIGGER trigger_update_inventory_stock
    AFTER INSERT ON public.inventory_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_stock();

COMMENT ON TABLE public.inventory_logs IS 'Transaction log for all inventory movements (stock in/out)';

-- ============================================================================
-- 4. REVENUES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.revenues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    sold_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_revenues_item_id ON public.revenues(item_id);
CREATE INDEX IF NOT EXISTS idx_revenues_sold_at ON public.revenues(sold_at);

-- Enable Row Level Security
ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can access
CREATE POLICY "Admin only access to revenues"
    ON public.revenues
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles_new
            WHERE profiles_new.id = auth.uid()
            AND profiles_new.role = 'admin'
        )
    );

COMMENT ON TABLE public.revenues IS 'Records all sales/revenue transactions';

-- ============================================================================
-- 5. REMINDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
    description TEXT,
    recurrence TEXT NOT NULL CHECK (recurrence IN ('daily', 'weekly', 'monthly', 'yearly')),
    next_due_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_reminders_next_due_date ON public.reminders(next_due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_item_id ON public.reminders(item_id);

-- Enable Row Level Security
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can access
CREATE POLICY "Admin only access to reminders"
    ON public.reminders
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles_new
            WHERE profiles_new.id = auth.uid()
            AND profiles_new.role = 'admin'
        )
    );

COMMENT ON TABLE public.reminders IS 'Recurring reminders for inventory management tasks';

-- ============================================================================
-- 6. TRANSACTIONS TABLE (if you use billing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT CHECK (type IN ('debit', 'credit')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own transactions, admins can see all
CREATE POLICY "Users can view own transactions"
    ON public.transactions
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.profiles_new
            WHERE profiles_new.id = auth.uid()
            AND profiles_new.role = 'admin'
        )
    );

-- RLS Policy: Only admins can insert/update/delete transactions
CREATE POLICY "Admin only modify transactions"
    ON public.transactions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles_new
            WHERE profiles_new.id = auth.uid()
            AND profiles_new.role = 'admin'
        )
    );

COMMENT ON TABLE public.transactions IS 'Financial transactions for user billing';

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS set_updated_at ON public.expenses;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.inventory_items;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON public.reminders;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample inventory items
INSERT INTO public.inventory_items (name, category, unit, unit_price, selling_price, current_stock, supplier)
VALUES 
    ('Rice', 'Grains', 'kg', 40.00, 50.00, 100, 'Local Supplier'),
    ('Dal', 'Pulses', 'kg', 80.00, 100.00, 50, 'Local Supplier'),
    ('Oil', 'Cooking', 'liter', 150.00, 180.00, 20, 'Oil Company'),
    ('Onions', 'Vegetables', 'kg', 30.00, 40.00, 25, 'Vegetable Market'),
    ('Potatoes', 'Vegetables', 'kg', 25.00, 35.00, 30, 'Vegetable Market')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- ============================================================================
-- 7. POLL RESPONSES TABLE
-- ============================================================================
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

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_poll_responses_user_id ON public.poll_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_responses_date ON public.poll_responses(date);
CREATE INDEX IF NOT EXISTS idx_poll_responses_confirmation_status ON public.poll_responses(confirmation_status);
CREATE INDEX IF NOT EXISTS idx_poll_responses_user_date ON public.poll_responses(user_id, date);

-- Enable Row Level Security
ALTER TABLE public.poll_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view and manage their own responses
CREATE POLICY "Users can view their own poll responses"
    ON public.poll_responses
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own poll responses"
    ON public.poll_responses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own poll responses"
    ON public.poll_responses
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Admins can view and manage all responses
CREATE POLICY "Admins can view all poll responses"
    ON public.poll_responses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles_new
            WHERE profiles_new.id = auth.uid()
            AND profiles_new.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert poll responses for any user"
    ON public.poll_responses
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles_new
            WHERE profiles_new.id = auth.uid()
            AND profiles_new.role = 'admin'
        )
    );

CREATE POLICY "Admins can update all poll responses"
    ON public.poll_responses
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles_new
            WHERE profiles_new.id = auth.uid()
            AND profiles_new.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete poll responses"
    ON public.poll_responses
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles_new
            WHERE profiles_new.id = auth.uid()
            AND profiles_new.role = 'admin'
        )
    );

-- Foreign key constraint with profiles_new (for proper joins)
CREATE INDEX IF NOT EXISTS idx_poll_responses_profiles_fk ON public.poll_responses(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_poll_responses_updated_at
    BEFORE UPDATE ON public.poll_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.poll_responses IS 'Daily meal attendance poll responses from users';

-- Run these to verify tables were created successfully:

-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('expenses', 'inventory_items', 'inventory_logs', 'revenues', 'reminders', 'transactions', 'poll_responses');

-- SELECT * FROM public.inventory_items;
-- SELECT * FROM public.poll_responses;

-- ============================================================================
-- NOTES
-- ============================================================================

-- 1. All tables have Row Level Security (RLS) enabled
-- 2. Admin-only tables: expenses, inventory_items, inventory_logs, revenues, reminders, transactions
-- 3. User-accessible table: poll_responses (users can manage their own, admins can manage all)
-- 4. Inventory logs automatically update stock levels via trigger
-- 5. All timestamp fields use TIMESTAMPTZ for timezone support
-- 6. Foreign keys use CASCADE or SET NULL for referential integrity
-- 7. Indexes added for common query patterns
-- 8. poll_responses has unique constraint on (user_id, date) to prevent duplicate daily responses

-- ============================================================================
-- DEPLOYMENT INSTRUCTIONS
-- ============================================================================

-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this entire file
-- 5. Click "Run" to execute
-- 6. Verify tables were created:
--    - Go to Table Editor
--    - Check that all 7 tables appear (expenses, inventory_items, inventory_logs, revenues, reminders, transactions, poll_responses)
-- 7. Restart your Next.js app: npm run dev
-- 8. Test the endpoints again

-- ============================================================================
