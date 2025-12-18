-- Supabase Database Schema for Pure Fire Nutritional
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for product_reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON product_reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON product_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_email_product ON product_reviews(customer_email, product_id);

-- Abandoned Carts Table
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  cart_data JSONB NOT NULL,
  total_amount DECIMAL(10, 2),
  item_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recovery_email_sent BOOLEAN DEFAULT FALSE,
  recovery_email_sent_at TIMESTAMP WITH TIME ZONE,
  recovered BOOLEAN DEFAULT FALSE,
  recovered_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for abandoned_carts
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_session_id ON abandoned_carts(session_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_last_activity ON abandoned_carts(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_recovery_status ON abandoned_carts(recovered, recovery_email_sent);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on product_reviews
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on product_reviews
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read approved reviews
CREATE POLICY "Anyone can read approved reviews"
  ON product_reviews FOR SELECT
  USING (status = 'approved');

-- Allow anyone to insert reviews (they start as approved for demo)
CREATE POLICY "Anyone can insert reviews"
  ON product_reviews FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update helpful_count
CREATE POLICY "Anyone can update helpful count"
  ON product_reviews FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Enable RLS on abandoned_carts
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert/update their own cart
CREATE POLICY "Anyone can manage carts"
  ON abandoned_carts FOR ALL
  USING (true)
  WITH CHECK (true);

-- View for cart recovery analytics (optional)
CREATE OR REPLACE VIEW cart_recovery_stats AS
SELECT
  COUNT(*) FILTER (WHERE NOT recovered) AS total_abandoned,
  COUNT(*) FILTER (WHERE recovered) AS total_recovered,
  COUNT(*) FILTER (WHERE recovery_email_sent) AS emails_sent,
  SUM(total_amount) FILTER (WHERE NOT recovered) AS abandoned_value,
  SUM(total_amount) FILTER (WHERE recovered) AS recovered_value,
  CASE
    WHEN COUNT(*) > 0 THEN
      ROUND((COUNT(*) FILTER (WHERE recovered)::DECIMAL / COUNT(*)) * 100, 2)
    ELSE 0
  END AS recovery_rate_percent
FROM abandoned_carts;

-- Grant access to the view
GRANT SELECT ON cart_recovery_stats TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE product_reviews IS 'Stores customer product reviews with ratings and moderation status';
COMMENT ON TABLE abandoned_carts IS 'Tracks abandoned shopping carts for recovery campaigns';
COMMENT ON VIEW cart_recovery_stats IS 'Analytics view for abandoned cart recovery metrics';
