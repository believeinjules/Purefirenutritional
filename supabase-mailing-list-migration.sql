-- =====================================================
-- MAILING LIST TABLE MIGRATION
-- =====================================================
-- Run this in your Supabase SQL Editor to set up mailing list

-- Create mailing_list table
CREATE TABLE IF NOT EXISTS mailing_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  source VARCHAR(100) DEFAULT 'website',
  subscribed BOOLEAN DEFAULT true,
  confirmed BOOLEAN DEFAULT false,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mailing_list_email ON mailing_list(email);
CREATE INDEX IF NOT EXISTS idx_mailing_list_subscribed ON mailing_list(subscribed);
CREATE INDEX IF NOT EXISTS idx_mailing_list_source ON mailing_list(source);

-- Enable Row Level Security
ALTER TABLE mailing_list ENABLE ROW LEVEL SECURITY;

-- Allow public to read their own subscription status (optional)
CREATE POLICY "Anyone can view their subscription"
  ON mailing_list FOR SELECT
  USING (true);

-- Only backend can insert
CREATE POLICY "Only backend can insert"
  ON mailing_list FOR INSERT
  WITH CHECK (true);

-- Only backend/admins can update
CREATE POLICY "Only admins can update"
  ON mailing_list FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Only admins can delete
CREATE POLICY "Only admins can delete"
  ON mailing_list FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');
