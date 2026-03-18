-- Add financial tracking columns to donations table
-- These columns store the breakdown of payment calculations

ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS amount_paid numeric(12, 2),
ADD COLUMN IF NOT EXISTS platform_fee numeric(12, 2),
ADD COLUMN IF NOT EXISTS paystack_fee numeric(12, 2),
ADD COLUMN IF NOT EXISTS net_received numeric(12, 2),
ADD COLUMN IF NOT EXISTS campaign_amount numeric(12, 2),
ADD COLUMN IF NOT EXISTS everygiving_revenue numeric(12, 2);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);

-- Create index on campaign_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
