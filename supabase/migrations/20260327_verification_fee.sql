-- Migration: Verification Fee Requirement Tracking
-- Date: 2026-03-27

-- 1. Add verification payment tracking to campaigns
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS verification_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_reference TEXT;

-- 2. Update status check constraint to include 'payment_pending'
-- We have to drop and recreate the constraint because 'status' is already constrained.
DO $$ 
BEGIN
    ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
    ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_status_check 
        CHECK (status IN ('draft', 'payment_pending', 'pending', 'approved', 'active', 'live', 'funded', 'closed', 'rejected'));
EXCEPTION
    WHEN undefined_object THEN
        -- If it wasn't a named constraint, we might need a different approach, 
        -- but usually Supabase uses named constraints.
END $$;

-- 3. Comments for clarity
COMMENT ON COLUMN public.campaigns.verification_paid IS 'Whether the mandatory verification fee (if any) has been paid';
COMMENT ON COLUMN public.campaigns.verification_reference IS 'The Paystack transaction reference for the verification fee payment';
COMMENT ON COLUMN public.campaigns.status IS 'Current lifecycle state of the campaign. payment_pending means waiting for verification fee.';
