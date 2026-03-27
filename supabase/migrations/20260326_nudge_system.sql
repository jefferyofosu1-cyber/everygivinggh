-- Migration: Fundraiser Nudge Sequence & View Tracking
-- Date: 2026-03-26

-- 1. Add columns to campaigns table for tracking nudges and views
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS nudge_6h_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nudge_24h_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nudge_48h_sent BOOLEAN DEFAULT false;

-- 2. Create RPC function to safely increment campaign views
CREATE OR REPLACE FUNCTION public.increment_campaign_view(c_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.campaigns
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = c_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure the function is accessible to everyone (including anonymous visitors)
GRANT EXECUTE ON FUNCTION public.increment_campaign_view(UUID) TO anon, authenticated, service_role;

-- 4. Comment on columns for clarity
COMMENT ON COLUMN public.campaigns.activated_at IS 'When the campaign was officially approved and went live';
COMMENT ON COLUMN public.campaigns.views_count IS 'Total number of times the public campaign page has been viewed';
COMMENT ON COLUMN public.campaigns.nudge_6h_sent IS 'Whether the 6-hour "no donation" nudge has been sent';
COMMENT ON COLUMN public.campaigns.nudge_24h_sent IS 'Whether the 24-hour "no update" nudge has been sent';
COMMENT ON COLUMN public.campaigns.nudge_48h_sent IS 'Whether the 48-hour "milestone check" nudge has been sent';
