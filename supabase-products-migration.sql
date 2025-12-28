-- =====================================================
-- PRODUCTS TABLE MIGRATION
-- =====================================================
-- Run this in your Supabase SQL Editor to set up products

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  price_usd DECIMAL(10, 2) NOT NULL,
  price_eur DECIMAL(10, 2),
  rating DECIMAL(3, 1) DEFAULT 4.8,
  image VARCHAR(500),
  image_alt VARCHAR(255),
  sizes INTEGER DEFAULT 1,
  benefits JSONB DEFAULT '[]'::jsonb,
  ingredients JSONB DEFAULT '[]'::jsonb,
  usage TEXT,
  variants JSONB DEFAULT '[]'::jsonb,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read products
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

-- Only authenticated admins can modify products
CREATE POLICY "Only admins can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update products"
  ON products FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete products"
  ON products FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Insert sample products
INSERT INTO products (id, name, description, category, price_usd, price_eur, image, image_alt, sizes, rating, benefits, variants, in_stock) VALUES
('bonomarlot', 'Bonomarlot', 'Bone marrow peptide complex for immune system and hematopoietic support.', 'PEPTIDE BIOREGULATORS', 46.50, 19.00, '/products/Banomarlot.png', 'Bonomarlot bone marrow peptide supplement bottle', 3, 4.8, '["Immune system support", "Blood cell production", "Bone marrow health"]', '[{"id":"20-capsules","name":"20 Capsules","priceUSD":46.50,"priceEUR":19.00,"image":"/products/Banomarlot.png","inStock":true},{"id":"60-capsules","name":"60 Capsules","priceUSD":93.01,"priceEUR":37.99,"inStock":true},{"id":"lingual","name":"Lingual (Sublingual)","priceUSD":104.64,"priceEUR":42.99,"inStock":false}]', true),
('cartalax', 'Cartalax', 'Cartilage peptide bioregulator for joint health and connective tissue support.', 'PEPTIDE BIOREGULATORS', 46.50, 19.00, '/products/cartalax.jpg.webp', 'Cartalax cartilage peptide bioregulator for joint health', 2, 4.8, '["Joint health", "Cartilage support", "Connective tissue"]', '[]', true),
('chelohart', 'Chelohart', 'Heart peptide bioregulator for cardiac muscle and cardiovascular function.', 'PEPTIDE BIOREGULATORS', 46.50, 19.00, '/products/chelohart-a-14-20-capsules__83804.1738112709.jpg', 'Chelohart heart peptide bioregulator capsules', 2, 4.8, '["Heart health", "Cardiac muscle support", "Cardiovascular function"]', '[]', true),
('chelohart-lingual', 'Chelohart Lingual', 'Sublingual heart peptide for enhanced cardiac support and absorption.', 'PEPTIDE BIOREGULATORS', 104.64, 42.99, '/products/chelohart_lingual_natural_peptide_complex__51766.1684187002.jpg', 'Chelohart Lingual sublingual heart peptide complex', 1, 4.8, '["Rapid absorption", "Heart support", "Cardiovascular health"]', '[]', true),
('crystagen', 'Crystagen', 'Immune system peptide bioregulator for enhanced defense and cellular immunity.', 'PEPTIDE BIOREGULATORS', 46.50, 19.00, '/products/Crystagen_peptide_side_2021_vita_stream__36125.1628292022.png', 'Crystagen immune system peptide bioregulator', 2, 4.8, '["Immune defense", "Cellular immunity", "Overall health"]', '[]', true),
('cytogen-aedg', 'Cytogen AEDG', 'Synthetic tetrapeptide for epigenetic regulation and longevity enhancement.', 'ANTI AGING-LONGEVITY', 232.54, 94.99, NULL, NULL, 2, 4.8, '["Epigenetic regulation", "Longevity support", "Anti-aging"]', '[]', true),
('cytogen-khavinson-complex', 'Cytogen Khavinson Complex', 'Multi-peptide complex combining several Khavinson bioregulators for comprehensive support.', 'PEPTIDE BIOREGULATORS', 348.82, 139.99, NULL, NULL, 2, 4.8, '["Comprehensive support", "Multi-system health", "Premium formula"]', '[]', true);

-- Note: Add more products as needed following the same pattern
-- This migration creates the structure and adds sample products from the beginning of the products.ts file
