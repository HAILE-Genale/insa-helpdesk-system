-- Migration V5: Create categories table (basic schema without hierarchy)
-- Note: parent_category_id is added in V6, and data is populated in V8
-- Drop BOTH singular and plural forms to avoid conflicts
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create fresh categories table (PLURAL FORM - matches JPA entity)
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN DEFAULT true,
    classification_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint to classifications (if classifications table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'classifications'
    ) THEN
        ALTER TABLE categories ADD CONSTRAINT fk_categories_classification 
        FOREIGN KEY (classification_id) REFERENCES classifications(id) ON DELETE SET NULL;
    END IF;
END $$;
