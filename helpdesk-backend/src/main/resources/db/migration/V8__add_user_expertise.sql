-- Migration V8: Agent expertise per category (FR-025)
-- Maps a user (agent) to the ticket categories they are skilled in.
-- Used by assignment routing to prefer the most expert agent for a category.

CREATE TABLE IF NOT EXISTS user_expertise (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expertise VARCHAR(100) NOT NULL,
    PRIMARY KEY (user_id, expertise)
);

CREATE INDEX IF NOT EXISTS idx_user_expertise_user ON user_expertise(user_id);
