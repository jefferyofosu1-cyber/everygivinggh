-- Migration: Standardize Donation Columns & Fix Campaign Totals
-- Date: 2026-03-19

-- 1. Ensure `donor_tip` column exists and is BIGINT (pesewas)
-- If it was NUMERIC(15,2) from 04_revenue_system.sql, we convert it.
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donations' AND column_name = 'donor_tip') THEN
        ALTER TABLE donations ALTER COLUMN donor_tip TYPE BIGINT USING (donor_tip * 100)::BIGINT;
    ELSE
        ALTER TABLE donations ADD COLUMN donor_tip BIGINT DEFAULT 0;
    END IF;
END $$;

-- 2. Ensure other columns are BIGINT for consistency with 20260319_donation_processing_system.sql
ALTER TABLE donations ALTER COLUMN amount_paid TYPE BIGINT;
ALTER TABLE donations ALTER COLUMN transaction_fee TYPE BIGINT;
ALTER TABLE donations ALTER COLUMN net_amount TYPE BIGINT;

-- 3. Update the campaign total_raised trigger to sum the CORRECT amount
-- total_raised should be (amount_paid - donor_tip) = Gross Donation to campaign
CREATE OR REPLACE FUNCTION update_campaign_total_raised()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE campaigns
  SET total_raised = (
    SELECT COALESCE(SUM(amount_paid - donor_tip), 0)
    FROM donations
    WHERE campaign_id = NEW.campaign_id AND status IN ('completed', 'success')
  ),
  total_donor_count = (
    SELECT COUNT(DISTINCT donor_email)
    FROM donations
    WHERE campaign_id = NEW.campaign_id AND status IN ('completed', 'success')
  ),
  updated_at = now()
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Recreate the trigger (if 20260319_donation_processing_system.sql was run)
DROP TRIGGER IF EXISTS trigger_update_campaign_total ON donations;
CREATE TRIGGER trigger_update_campaign_total
AFTER INSERT OR UPDATE ON donations
FOR EACH ROW
WHEN (NEW.status IN ('completed', 'success'))
EXECUTE FUNCTION update_campaign_total_raised();
