-- Copy and paste this into your Supabase SQL Editor
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
