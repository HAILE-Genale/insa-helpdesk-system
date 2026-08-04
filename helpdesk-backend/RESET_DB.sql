-- Reset database - Run this in IntelliJ Database Console
-- This will clear Flyway history so migrations run fresh

-- Drop Flyway schema history to force migrations to re-run
DROP TABLE IF EXISTS flyway_schema_history;

-- Drop both singular and plural forms of category/categories
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Drop classifications to ensure clean recreation
DROP TABLE IF EXISTS classifications CASCADE;

-- Verify all are gone
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('category', 'categories', 'classifications', 'flyway_schema_history')
AND table_schema = 'public';
