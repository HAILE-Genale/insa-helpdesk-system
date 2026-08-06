-- Migration V6: Add hierarchical category support (sub-categories)
-- Add parent_category_id column to support category hierarchy (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'parent_category_id'
    ) THEN
        ALTER TABLE categories ADD COLUMN parent_category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create an index for efficient parent lookups (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_category_id);

-- Add a constraint to prevent self-referencing (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'categories' AND constraint_name = 'ck_no_self_reference'
    ) THEN
        ALTER TABLE categories ADD CONSTRAINT ck_no_self_reference CHECK (id != parent_category_id);
    END IF;
END $$;
