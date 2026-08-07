-- Migration V17: Add department field to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS department VARCHAR(150);
