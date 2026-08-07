-- Migration V18: Add manager to teams + knowledge_articles table

-- Add manager_id to teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS manager_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

-- Drop partial table if it exists from failed migration
DROP TABLE IF EXISTS knowledge_articles CASCADE;

-- Knowledge base articles table
CREATE TABLE knowledge_articles (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    problem     TEXT NOT NULL,
    cause       TEXT,
    solution    TEXT NOT NULL,
    category    VARCHAR(100),
    department  VARCHAR(150),
    tags        VARCHAR(500),
    status      VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    author_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    views       BIGINT NOT NULL DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ka_status   ON knowledge_articles(status);
CREATE INDEX idx_ka_category ON knowledge_articles(category);
CREATE INDEX idx_ka_author   ON knowledge_articles(author_id);
