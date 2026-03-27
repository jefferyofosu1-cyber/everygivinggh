-- Migration: Phase 2 Behavioral Prompts & Diaspora Tracking
-- Date: 2026-03-26

-- 1. Update donations table with currency and country tracking
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'GHS',
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'GH';

-- 2. Add behavioral nudge flags to campaigns table
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS nudge_3d_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nudge_7d_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nudge_milestone_25_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nudge_milestone_50_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nudge_milestone_75_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nudge_diaspora_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nudge_deadline_5d_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nudge_unfunded_sent BOOLEAN DEFAULT false;

-- 3. Update milestone_alerts_sent check constraint if needed
-- (Assuming it might have been restricted to 25, 50, 100)
-- For simplicity, we'll use the boolean flags in the campaigns table for Phase 2
-- as they integrate better with the centralized NudgeService logic.

-- 4. Comments for clarity
COMMENT ON COLUMN public.donations.currency IS 'ISO currency code of the donation';
COMMENT ON COLUMN public.donations.country_code IS 'ISO country code of the bank/card used for donation';
COMMENT ON COLUMN public.campaigns.nudge_3d_sent IS 'Whether the 3-day inactivity nudge has been sent';
COMMENT ON COLUMN public.campaigns.nudge_7d_sent IS 'Whether the 7-day inactivity nudge has been sent';
COMMENT ON COLUMN public.campaigns.nudge_diaspora_sent IS 'Whether the first diaspora donation nudge has been sent';
COMMENT ON COLUMN public.campaigns.nudge_deadline_5d_sent IS 'Whether the 5-day deadline reminder has been sent';
