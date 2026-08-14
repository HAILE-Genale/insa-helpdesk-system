-- Migration V23: Ticket feedback table
-- Allows end-users to submit feedback (rating + comment) on resolved/closed tickets.
-- Feedback is notified to both the assigned agent and the team's manager.

CREATE TABLE IF NOT EXISTS ticket_feedback (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    agent_id BIGINT NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedback_ticket ON ticket_feedback(ticket_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON ticket_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_agent ON ticket_feedback(agent_id);
