-- Milestone alerts tracking
CREATE TABLE milestone_alerts_sent (
  id BIGSERIAL PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  milestone INTEGER NOT NULL CHECK (milestone IN (25, 50, 100)),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, milestone)
);

-- Thank you messages tracking
CREATE TABLE thank_you_messages (
  id BIGSERIAL PRIMARY KEY,
  donation_id BIGSERIAL NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign updates tracking
CREATE TABLE campaign_updates (
  id BIGSERIAL PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_to_donors INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_milestone_alerts_campaign ON milestone_alerts_sent(campaign_id);
CREATE INDEX idx_milestone_alerts_sent_at ON milestone_alerts_sent(sent_at);
CREATE INDEX idx_thank_you_campaign ON thank_you_messages(campaign_id);
CREATE INDEX idx_thank_you_created_at ON thank_you_messages(created_at);
CREATE INDEX idx_campaign_updates_campaign ON campaign_updates(campaign_id);
CREATE INDEX idx_campaign_updates_created_at ON campaign_updates(created_at);

-- RLS policies
ALTER TABLE milestone_alerts_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE thank_you_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;

-- Milestone alerts: admins can read
CREATE POLICY "Admins can view milestone alerts" ON milestone_alerts_sent
  FOR SELECT USING (true);

-- Thank you messages: donors and fundraisers can read
CREATE POLICY "Users can view thank you messages for their campaigns" ON thank_you_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id = campaign_id AND c.user_id = auth.uid()
    )
  );

-- Campaign updates: public can view
CREATE POLICY "Anyone can view campaign updates" ON campaign_updates
  FOR SELECT USING (true);

CREATE POLICY "Fundraisers can create updates" ON campaign_updates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id = campaign_id AND c.user_id = auth.uid()
    )
  );
