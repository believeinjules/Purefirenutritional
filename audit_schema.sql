-- SCHEMA AUDIT FOR PURE FIRE NUTRITIONAL
-- Run this in your Supabase SQL Editor to verify your schema

-- Get all tables in public schema
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = 'public' AND information_schema.columns.table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected tables and their critical columns
-- Run individually to check each table

-- 1. PRODUCT_REVIEWS
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'product_reviews'
ORDER BY ordinal_position;

-- 2. ABANDONED_CARTS
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'abandoned_carts'
ORDER BY ordinal_position;

-- 3. PRODUCT_INVENTORY
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'product_inventory'
ORDER BY ordinal_position;

-- 4. INVENTORY_HISTORY
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'inventory_history'
ORDER BY ordinal_position;

-- 5. CUSTOMERS
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'customers'
ORDER BY ordinal_position;

-- 6. ORDERS
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'orders'
ORDER BY ordinal_position;

-- 7. MAILING_LIST
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'mailing_list'
ORDER BY ordinal_position;

-- 8. CUSTOMER_WISHLIST
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'customer_wishlist'
ORDER BY ordinal_position;

-- 9. WISHLIST_NOTIFICATIONS
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'wishlist_notifications'
ORDER BY ordinal_position;

-- 10. CHAT_HISTORY
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'chat_history'
ORDER BY ordinal_position;

-- 11. USER_PROFILES
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Get all RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Get all triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Get all functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
