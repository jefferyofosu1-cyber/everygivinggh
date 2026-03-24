-- Migration for customizable milestone percentages and tracked payout balances

ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS milestone_percentage NUMERIC DEFAULT 100,
ADD COLUMN IF NOT EXISTS available_payout_balance NUMERIC DEFAULT 0;

-- Optionally comment the newly added columns for documentation
COMMENT ON COLUMN campaigns.milestone_percentage IS 'The percentage interval at which funds unlock for payout (e.g. 25, 50, 75, 100).';
COMMENT ON COLUMN campaigns.available_payout_balance IS 'The officially unlocked balance ready for withdrawal based on crossed milestones.';
