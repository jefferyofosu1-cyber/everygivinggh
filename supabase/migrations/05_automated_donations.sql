-- Migration: Automated Donation System & Balance Triggers
-- Date: 2026-03-20

-- 1. Ensure `paystack_webhook_log` table exists for idempotency and debugging
CREATE TABLE IF NOT EXISTS public.paystack_webhook_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB,
    status TEXT NOT NULL, -- 'success', 'failed'
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure `transaction_ledger` table exists for detailed fund tracking
CREATE TABLE IF NOT EXISTS public.transaction_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID REFERENCES public.donations(id),
    fundraiser_id UUID REFERENCES auth.users(id),
    campaign_id UUID REFERENCES public.campaigns(id),
    type TEXT NOT NULL, -- 'fee', 'net_amount', 'payout'
    amount BIGINT NOT NULL, -- Amount in pesewas
    description TEXT,
    status TEXT DEFAULT 'processed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trigger Function: Update campaign totals when donation is successful
-- This function is triggered when a donation's status changes to 'completed' or 'success'
CREATE OR REPLACE FUNCTION public.handle_donation_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger if status is changing to 'completed' or 'success'
    IF (NEW.status IN ('completed', 'success') AND (OLD.status IS NULL OR OLD.status != NEW.status)) THEN
        -- Update campaign balance and count
        -- Note: We assume amount_paid and net_received are in pesewas in donations table
        -- but campaigns table uses raised_amount in GHS (numeric).
        
        UPDATE public.campaigns
        SET 
            raised_amount = COALESCE(raised_amount, 0) + (NEW.amount_paid / 100.0),
            donor_count = COALESCE(donor_count, 0) + 1,
            updated_at = NOW()
        WHERE id = NEW.campaign_id;
        
        RAISE NOTICE 'Campaign % updated for donation %', NEW.campaign_id, NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the trigger on the `donations` table
DROP TRIGGER IF EXISTS tr_donation_completion ON public.donations;
CREATE TRIGGER tr_donation_completion
    AFTER UPDATE ON public.donations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_donation_completion();

-- 5. Add RLS for the new tables
ALTER TABLE public.paystack_webhook_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_ledger ENABLE ROW LEVEL SECURITY;

-- Admins can view webhook logs and ledger
CREATE POLICY "Admins can view webhook logs" ON public.paystack_webhook_log
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can view transaction ledger" ON public.transaction_ledger
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Fundraisers can view their own ledger entries" ON public.transaction_ledger
    FOR SELECT USING (auth.uid() = fundraiser_id);
