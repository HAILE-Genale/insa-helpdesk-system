CREATE TABLE IF NOT EXISTS knowledge_article_votes (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('UP', 'DOWN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_kb_vote_article_user UNIQUE (article_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_kav_article ON knowledge_article_votes(article_id);
CREATE INDEX IF NOT EXISTS idx_kav_user ON knowledge_article_votes(user_id);
