-- Newsletter & Email Marketing System

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_slug TEXT NOT NULL,
  
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  
  -- Preferences
  preferences JSONB DEFAULT '{"frequency": "weekly", "categories": []}',
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verified_at TIMESTAMPTZ
);

-- Email campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_slug TEXT NOT NULL,
  
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  
  campaign_type TEXT NOT NULL, -- 'newsletter', 'promotional', 'transactional'
  
  -- Scheduling
  status TEXT DEFAULT 'draft', -- draft, scheduled, sending, sent, cancelled
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  
  -- Stats
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email campaign sends (tracking)
CREATE TABLE IF NOT EXISTS email_campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Tracking
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0
);

-- Automated email triggers
CREATE TABLE IF NOT EXISTS email_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_slug TEXT NOT NULL,
  
  trigger_type TEXT NOT NULL, -- 'abandoned_cart', 'order_confirmation', 'new_product'
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Email template
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Timing
  delay_minutes INTEGER DEFAULT 0, -- Send after X minutes
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_tenant ON newsletter_subscribers(tenant_slug);
CREATE INDEX idx_newsletter_subscribers_active ON newsletter_subscribers(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_email_campaigns_tenant ON email_campaigns(tenant_slug);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaign_sends_campaign ON email_campaign_sends(campaign_id);

-- Auto-update triggers
CREATE TRIGGER email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Update campaign stats when email is opened/clicked
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.opened_at IS NOT NULL AND OLD.opened_at IS NULL THEN
    UPDATE email_campaigns
    SET total_opened = total_opened + 1
    WHERE id = NEW.campaign_id;
  END IF;
  
  IF NEW.clicked_at IS NOT NULL AND OLD.clicked_at IS NULL THEN
    UPDATE email_campaigns
    SET total_clicked = total_clicked + 1
    WHERE id = NEW.campaign_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaign_stats_trigger
  AFTER UPDATE ON email_campaign_sends
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_stats();

-- RLS Policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_triggers ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscription
CREATE POLICY "Users can manage own subscription"
  ON newsletter_subscribers FOR ALL
  USING (auth.uid() = user_id OR email = auth.jwt()->>'email');

-- Public can subscribe (for guest signups)
CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Campaign sends are tracked by system
CREATE POLICY "System manages campaign sends"
  ON email_campaign_sends FOR ALL
  USING (FALSE);

-- Comments
COMMENT ON TABLE newsletter_subscribers IS 'Email newsletter subscribers';
COMMENT ON TABLE email_campaigns IS 'Marketing email campaigns';
COMMENT ON TABLE email_campaign_sends IS 'Individual email send tracking';
COMMENT ON TABLE email_triggers IS 'Automated email triggers';
