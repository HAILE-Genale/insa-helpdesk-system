-- Migration V24: Add image column to knowledge_articles

ALTER TABLE knowledge_articles ADD COLUMN IF NOT EXISTS image TEXT;
