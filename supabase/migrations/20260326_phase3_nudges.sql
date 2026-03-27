-- Migration: Phase 3 Human Call Triggers
-- Date: 2026-03-26

-- 1. Add flags for high-touch human interventions
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS nudge_large_donation_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nudge_fully_funded_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nudge_silence_low_funding_sent BOOLEAN DEFAULT false;

-- 2. Comments for clarity
COMMENT ON COLUMN public.campaigns.nudge_large_donation_sent IS 'Whether the team has been notified about the first large donation (>= ₵1,000)';
COMMENT ON COLUMN public.campaigns.nudge_fully_funded_sent IS 'Whether the team has been notified that the campaign is fully funded';
COMMENT ON COLUMN public.campaigns.nudge_silence_low_funding_sent IS 'Whether the team has been notified about Day 3 silence + low funding';
