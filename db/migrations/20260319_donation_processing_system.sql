-- ============================================================================
-- DONATION PROCESSING & FUND DISTRIBUTION SYSTEM
-- Created: 2026-03-19
-- ============================================================================

-- ============================================================================
-- 1. ENHANCE CAMPAIGNS TABLE
-- ============================================================================
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS subaccount_code VARCHAR(100);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS total_raised BIGINT DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS total_donor_count INT DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS goal_amount BIGINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_campaigns_subaccount ON campaigns(subaccount_code);

-- ============================================================================
-- 2. ENHANCE USERS TABLE FOR PAYSTACK SUBACCOUNT
-- ============================================================================
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS subaccount_code VARCHAR(100);
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS bank_account_verified BOOLEAN DEFAULT FALSE;

-- Create profiles extension for payout details
CREATE TABLE IF NOT EXISTS payout_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subaccount_code VARCHAR(100),
  bank_name VARCHAR(100),
  account_number VARCHAR(20),
  account_holder_name VARCHAR(150),
  bank_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_payout_details_user_id ON payout_details(user_id);

-- ============================================================================
-- 3. DONATIONS TABLE - COMPLETE TRACKING
-- ============================================================================
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  donor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  donor_name VARCHAR(150),
  donor_email VARCHAR(150),
  amount_paid BIGINT NOT NULL, -- Amount in pesewas (₵/100)
  transaction_fee BIGINT NOT NULL, -- Fee in pesewas
  net_amount BIGINT NOT NULL, -- amount_paid - transaction_fee
  reference VARCHAR(255) NOT NULL UNIQUE, -- Paystack reference
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method VARCHAR(50), -- card, bank_transfer, mobile_money
  paystack_reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_reference ON donations(reference);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);

-- ============================================================================
-- 4. TRANSACTION LEDGER - DETAILED FUND TRACKING
-- ============================================================================
CREATE TABLE IF NOT EXISTS transaction_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  fundraiser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- fee, net_amount, refund
  amount BIGINT NOT NULL, -- Amount in pesewas
  description VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, processed, reversed
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transaction_ledger_donation_id ON transaction_ledger(donation_id);
CREATE INDEX IF NOT EXISTS idx_transaction_ledger_fundraiser_id ON transaction_ledger(fundraiser_id);
CREATE INDEX IF NOT EXISTS idx_transaction_ledger_campaign_id ON transaction_ledger(campaign_id);
CREATE INDEX IF NOT EXISTS idx_transaction_ledger_status ON transaction_ledger(status);

-- ============================================================================
-- 5. FUND DISTRIBUTION HISTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS fund_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraiser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  total_amount BIGINT NOT NULL, -- Total net amount sent
  num_donations INT NOT NULL,
  reference VARCHAR(255), -- Paystack reference for this batch
  status VARCHAR(50) DEFAULT 'completed', -- completed, pending, failed
  distributed_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fund_distributions_fundraiser_id ON fund_distributions(fundraiser_id);
CREATE INDEX IF NOT EXISTS idx_fund_distributions_campaign_id ON fund_distributions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_fund_distributions_status ON fund_distributions(status);

-- ============================================================================
-- 6. PAYSTACK WEBHOOK LOG - AUDIT & DEBUGGING
-- ============================================================================
CREATE TABLE IF NOT EXISTS paystack_webhook_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR(255),
  event_type VARCHAR(100),
  payload JSONB,
  status VARCHAR(50), -- success, failed, pending
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_paystack_webhook_log_reference ON paystack_webhook_log(reference);
CREATE INDEX IF NOT EXISTS idx_paystack_webhook_log_event_type ON paystack_webhook_log(event_type);

-- ============================================================================
-- 7. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Donations: Users can only view their own donations or campaign donations
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own donations" ON donations
FOR SELECT USING (donor_id = auth.uid() OR campaign_id IN (
  SELECT id FROM campaigns WHERE user_id = auth.uid()
));

CREATE POLICY IF NOT EXISTS "Only backend can create donations" ON donations
FOR INSERT WITH CHECK (true);

-- Payout Details: Users can only manage their own
ALTER TABLE payout_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage own payout details" ON payout_details
FOR ALL USING (user_id = auth.uid());

-- Transaction Ledger: Fundraisers can view their own
ALTER TABLE transaction_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Fundraisers can view own transaction ledger" ON transaction_ledger
FOR SELECT USING (fundraiser_id = auth.uid());

-- Fund Distributions: Fundraisers can view their own
ALTER TABLE fund_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Fundraisers can view own fund distributions" ON fund_distributions
FOR SELECT USING (fundraiser_id = auth.uid());

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate transaction fee
CREATE OR REPLACE FUNCTION calculate_transaction_fee(amount_pesewas BIGINT)
RETURNS BIGINT AS $$
BEGIN
  -- Fee = 2.9% + GHS 0.50 (50 pesewas)
  -- GHS 0.50 = 50 pesewas
  RETURN ROUND((amount_pesewas * 0.029)::NUMERIC) + 50;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update campaign total raised
CREATE OR REPLACE FUNCTION update_campaign_total_raised()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE campaigns
  SET total_raised = (
    SELECT COALESCE(SUM(amount_paid), 0)
    FROM donations
    WHERE campaign_id = NEW.campaign_id AND status = 'completed'
  ),
  total_donor_count = (
    SELECT COUNT(DISTINCT donor_id)
    FROM donations
    WHERE campaign_id = NEW.campaign_id AND status = 'completed' AND donor_id IS NOT NULL
  ),
  updated_at = now()
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update campaign totals when donation completes
CREATE TRIGGER IF NOT EXISTS trigger_update_campaign_total
AFTER INSERT OR UPDATE ON donations
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION update_campaign_total_raised();

-- ============================================================================
-- 9. GRANT PERMISSIONS
-- ============================================================================
GRANT SELECT ON donations TO authenticated;
GRANT SELECT ON payout_details TO authenticated;
GRANT SELECT ON transaction_ledger TO authenticated;
GRANT SELECT ON fund_distributions TO authenticated;
GRANT SELECT ON paystack_webhook_log TO authenticated;
