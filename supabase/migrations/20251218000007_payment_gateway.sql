-- Multi-Payment Gateway Support
-- PromptPay, Thai QR, LINE Pay, Cash tracking

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Payment details
  payment_method payment_method NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'THB',
  
  -- Payment gateway info
  gateway_transaction_id TEXT, -- External transaction ID from payment provider
  gateway_response JSONB, -- Full response from gateway
  
  -- PromptPay/QR specific
  qr_code_data TEXT, -- QR code string for Thai QR/PromptPay
  qr_code_image_url TEXT, -- Generated QR code image URL
  promptpay_id TEXT, -- Phone number or National ID
  
  -- Status tracking
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed, cancelled, refunded
  error_message TEXT,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 minutes')
);

-- Payment webhooks (for async payment notifications)
CREATE TABLE IF NOT EXISTS payment_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  
  provider TEXT NOT NULL, -- 'promptpay', 'line_pay', etc.
  event_type TEXT NOT NULL, -- 'payment.success', 'payment.failed', etc.
  payload JSONB NOT NULL,
  
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_gateway_id ON payment_transactions(gateway_transaction_id);
CREATE INDEX idx_payment_webhooks_transaction ON payment_webhooks(payment_transaction_id);
CREATE INDEX idx_payment_webhooks_unprocessed ON payment_webhooks(processed) WHERE processed = FALSE;

-- Auto-update trigger
CREATE TRIGGER payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Function to update order payment status
CREATE OR REPLACE FUNCTION update_order_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE orders
    SET 
      payment_status = 'completed',
      paid_at = NOW(),
      status = CASE 
        WHEN status = 'pending_payment' THEN 'pending'::order_status
        ELSE status
      END
    WHERE id = NEW.order_id;
    
    NEW.completed_at := NOW();
  ELSIF NEW.status = 'failed' THEN
    UPDATE orders
    SET payment_status = 'failed'
    WHERE id = NEW.order_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_payment_trigger
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_order_payment_status();

-- Function to generate Thai QR Payment string (for PromptPay)
CREATE OR REPLACE FUNCTION generate_thai_qr_string(
  p_promptpay_id TEXT,
  p_amount DECIMAL
)
RETURNS TEXT AS $$
DECLARE
  v_qr_string TEXT;
BEGIN
  -- This is a simplified version. In production, use proper Thai QR code generation library
  -- Format: https://www.bot.or.th/Thai/PaymentSystems/StandardPS/Documents/ThaiQRCode_Payment_Standard.pdf
  
  v_qr_string := FORMAT(
    '000201010212%s%s0303764540%s5802TH5913TanJai POS6007Bangkok62070503***63',
    -- Merchant Account Information
    LPAD(LENGTH(p_promptpay_id)::TEXT, 2, '0'),
    p_promptpay_id,
    -- Transaction Amount
    LPAD((LENGTH(p_amount::TEXT) + 2)::TEXT, 2, '0') || p_amount::TEXT
  );
  
  RETURN v_qr_string;
END;
$$ LANGUAGE plpgsql;

-- Function to create payment transaction
CREATE OR REPLACE FUNCTION create_payment_transaction(
  p_order_id UUID,
  p_payment_method payment_method,
  p_amount DECIMAL,
  p_promptpay_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_qr_string TEXT;
BEGIN
  -- Generate QR string for Thai QR/PromptPay
  IF p_payment_method IN ('promptpay', 'thai_qr') THEN
    v_qr_string := generate_thai_qr_string(
      COALESCE(p_promptpay_id, '0000000000000'), -- Default merchant ID
      p_amount
    );
  END IF;
  
  -- Create transaction
  INSERT INTO payment_transactions (
    order_id,
    payment_method,
    amount,
    qr_code_data,
    promptpay_id
  ) VALUES (
    p_order_id,
    p_payment_method,
    p_amount,
    v_qr_string,
    p_promptpay_id
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhooks ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment transactions
CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Users can create payment transactions for their orders
CREATE POLICY "Users can create payment transactions"
  ON payment_transactions FOR INSERT
  WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Webhooks are system-managed (no direct user access)
CREATE POLICY "System manages webhooks"
  ON payment_webhooks FOR ALL
  USING (FALSE);

-- Comments
COMMENT ON TABLE payment_transactions IS 'Payment gateway transactions with QR code support';
COMMENT ON TABLE payment_webhooks IS 'Async payment notification webhooks';
COMMENT ON FUNCTION generate_thai_qr_string IS 'Generates Thai QR payment string for PromptPay';
COMMENT ON FUNCTION create_payment_transaction IS 'Creates payment transaction and generates QR code';
