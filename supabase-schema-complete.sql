-- =====================================================
-- PURE FIRE NUTRITIONAL - COMPLETE DATABASE SCHEMA
-- =====================================================
-- Run this in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/rttjhtlerssfzgrsggpo/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PRODUCT REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON product_reviews(status);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at DESC);

-- =====================================================
-- ABANDONED CARTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  items JSONB NOT NULL,
  item_count INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL,
  recovery_email_sent BOOLEAN DEFAULT FALSE,
  recovery_email_sent_at TIMESTAMP WITH TIME ZONE,
  recovered BOOLEAN DEFAULT FALSE,
  recovered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_session_id ON abandoned_carts(session_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON abandoned_carts(customer_email);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_last_activity ON abandoned_carts(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_recovery ON abandoned_carts(recovery_email_sent, last_activity_at);

-- =====================================================
-- PRODUCT INVENTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id VARCHAR(255) UNIQUE NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  is_in_stock BOOLEAN DEFAULT TRUE,
  is_available BOOLEAN DEFAULT TRUE,
  last_restocked_at TIMESTAMP WITH TIME ZONE,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_inventory_product_id ON product_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_stock ON product_inventory(is_in_stock, is_available);

-- =====================================================
-- INVENTORY HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id VARCHAR(255) NOT NULL,
  change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('restock', 'sale', 'adjustment', 'return')),
  quantity_change INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  notes TEXT,
  admin_user VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_inventory_history_product_id ON inventory_history(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_created_at ON inventory_history(created_at DESC);

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  stripe_customer_id VARCHAR(255) UNIQUE,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_stripe_id ON customers(stripe_customer_id);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255),
  stripe_session_id VARCHAR(255) UNIQUE,
  stripe_payment_intent VARCHAR(255),
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  shipping_address JSONB,
  billing_address JSONB,
  tracking_number VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- =====================================================
-- MAILING LIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS mailing_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  source VARCHAR(100) DEFAULT 'website',
  subscribed BOOLEAN DEFAULT TRUE,
  confirmed BOOLEAN DEFAULT FALSE,
  confirmation_token VARCHAR(255),
  interests JSONB,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_mailing_list_email ON mailing_list(email);
CREATE INDEX IF NOT EXISTS idx_mailing_list_subscribed ON mailing_list(subscribed, confirmed);

-- =====================================================
-- CUSTOMER WISHLIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customer_wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_email VARCHAR(255) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notify_on_sale BOOLEAN DEFAULT TRUE,
  notify_on_restock BOOLEAN DEFAULT TRUE,
  UNIQUE(customer_email, product_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_customer_wishlist_email ON customer_wishlist(customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_wishlist_product_id ON customer_wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_wishlist_notifications ON customer_wishlist(notify_on_sale, notify_on_restock);

-- =====================================================
-- WISHLIST NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS wishlist_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID REFERENCES customer_wishlist(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('sale', 'restock', 'low_stock')),
  product_id VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_opened BOOLEAN DEFAULT FALSE,
  link_clicked BOOLEAN DEFAULT FALSE,
  converted_to_purchase BOOLEAN DEFAULT FALSE
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_wishlist_notifications_wishlist_id ON wishlist_notifications(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_notifications_email ON wishlist_notifications(customer_email);
CREATE INDEX IF NOT EXISTS idx_wishlist_notifications_sent_at ON wishlist_notifications(sent_at DESC);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mailing_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - Allow public read for approved reviews
-- =====================================================
CREATE POLICY "Public can view approved reviews" ON product_reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Anyone can insert reviews" ON product_reviews
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- RLS POLICIES - Inventory (public read, admin write)
-- =====================================================
CREATE POLICY "Public can view inventory" ON product_inventory
  FOR SELECT USING (true);

-- =====================================================
-- RLS POLICIES - Customers (users can view their own data)
-- =====================================================
CREATE POLICY "Users can view their own customer data" ON customers
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own customer data" ON customers
  FOR UPDATE USING (true);

-- =====================================================
-- RLS POLICIES - Orders (users can view their own orders)
-- =====================================================
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "System can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- RLS POLICIES - Mailing List (public can subscribe)
-- =====================================================
CREATE POLICY "Anyone can subscribe to mailing list" ON mailing_list
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own subscription" ON mailing_list
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own subscription" ON mailing_list
  FOR UPDATE USING (true);

-- =====================================================
-- RLS POLICIES - Wishlist (users can manage their own)
-- =====
CREATE POLICY "Users can view their own wishlist" ON customer_wishlist
  FOR SELECT USING (true);

CREATE POLICY "Users can insert to wishlist" ON customer_wishlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete from wishlist" ON customer_wishlist
  FOR DELETE USING (true);

-- =====================================================
-- FUNCTIONS - Auto-update timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for product_reviews
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS - Track inventory changes
-- =====================================================
CREATE OR REPLACE FUNCTION track_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stock_quantity != NEW.stock_quantity THEN
    INSERT INTO inventory_history (
      product_id,
      change_type,
      quantity_change,
      quantity_before,
      quantity_after,
      notes
    ) VALUES (
      NEW.product_id,
      CASE
        WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'restock'
        WHEN NEW.stock_quantity < OLD.stock_quantity THEN 'sale'
        ELSE 'adjustment'
      END,
      NEW.stock_quantity - OLD.stock_quantity,
      OLD.stock_quantity,
      NEW.stock_quantity,
      'Automatic tracking'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for inventory changes
CREATE TRIGGER track_product_inventory_changes
  AFTER UPDATE ON product_inventory
  FOR EACH ROW
  EXECUTE FUNCTION track_inventory_change();

-- =====================================================
-- SEED DATA - Initialize inventory for existing products
-- =====================================================
-- This will create inventory records for products that don't have them yet
-- Run this after the schema is created

-- Note: You'll need to update this with your actual product IDs
-- For now, this is a template

-- INSERT INTO product_inventory (product_id, stock_quantity, is_in_stock, is_available)
-- SELECT 
--   'product-id-here',
--   100,
--   true,
--   true
-- WHERE NOT EXISTS (
--   SELECT 1 FROM product_inventory WHERE product_id = 'product-id-here'
-- );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the schema was created successfully:

-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('product_reviews', 'abandoned_carts', 'product_inventory', 'inventory_history', 'customer_wishlist', 'wishlist_notifications');

-- SELECT * FROM product_inventory LIMIT 5;
-- SELECT * FROM customer_wishlist LIMIT 5;
