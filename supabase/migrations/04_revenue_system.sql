-- Migration: Revenue System & Verifications

-- 1. Upgrade `donations` table with revenue tracking fields
ALTER TABLE public.donations
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS paystack_fee NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_received NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS campaign_amount NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS everygiving_revenue NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS donor_tip NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS paystack_reference TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Create `verifications` table
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  verification_tier TEXT NOT NULL DEFAULT 'Basic', -- 'Basic', 'Standard', 'Premium'
  verification_fee NUMERIC(15,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS policies for `verifications`
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verifications"
  ON public.verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verifications"
  ON public.verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
