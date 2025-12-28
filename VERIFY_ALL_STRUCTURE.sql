-- COMPREHENSIVE TABLE STRUCTURE VERIFICATION
-- Paste this into your Supabase SQL Editor

-- 1. CUSTOMERS TABLE
SELECT 'CUSTOMERS TABLE' as check_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'customers'
ORDER BY ordinal_position;

-- 2. ORDERS TABLE
SELECT 'ORDERS TABLE' as check_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders'
ORDER BY ordinal_position;

-- 3. MAILING_LIST TABLE
SELECT 'MAILING_LIST TABLE' as check_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'mailing_list'
ORDER BY ordinal_position;

-- 4. CUSTOMER_WISHLIST TABLE
SELECT 'CUSTOMER_WISHLIST TABLE' as check_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'customer_wishlist'
ORDER BY ordinal_position;

-- 5. PRODUCT_INVENTORY TABLE
SELECT 'PRODUCT_INVENTORY TABLE' as check_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'product_inventory'
ORDER BY ordinal_position;

-- 6. INVENTORY_HISTORY TABLE
SELECT 'INVENTORY_HISTORY TABLE' as check_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'inventory_history'
ORDER BY ordinal_position;

-- 7. PRODUCT_REVIEWS TABLE
SELECT 'PRODUCT_REVIEWS TABLE' as check_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'product_reviews'
ORDER BY ordinal_position;

-- 8. Check for 'products' table (used in code)
SELECT 'PRODUCTS TABLE' as check_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'products'
ORDER BY ordinal_position;

-- 9. All triggers
SELECT 'TRIGGERS' as check_name;
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 10. All functions
SELECT 'FUNCTIONS' as check_name;
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
