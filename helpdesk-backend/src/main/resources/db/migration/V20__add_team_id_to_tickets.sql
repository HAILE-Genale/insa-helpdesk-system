-- V20: Add team_id to tickets so team-scoped queries are stable.
-- Previously the manager view was derived from the assignee's team membership,
-- which broke whenever a ticket was reassigned to an agent in a different team.
-- Now we stamp the routed team directly on the ticket at creation time.

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL;

-- Back-fill existing tickets: infer team from current assignee's team membership.
-- If an agent is in multiple teams, pick the one with the lowest id (deterministic).
UPDATE tickets t
SET team_id = (
    SELECT MIN(tm.team_id)
    FROM team_members tm
    WHERE tm.user_id = t.assignee_id
)
WHERE t.assignee_id IS NOT NULL AND t.team_id IS NULL;
