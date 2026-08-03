-- Migration V3: Priority matrix (FR-022)
-- Configurable mapping of impact + urgency -> resulting priority (ITIL style).
-- Seeded with the default matrix from the FRD / the admin priority-matrix page.

CREATE TABLE IF NOT EXISTS priority_matrix (
    id BIGSERIAL PRIMARY KEY,
    impact VARCHAR(20) NOT NULL,
    urgency VARCHAR(20) NOT NULL,
    resulting_priority VARCHAR(20) NOT NULL,
    CONSTRAINT uk_priority_matrix_impact_urgency UNIQUE (impact, urgency),
    CONSTRAINT ck_priority_matrix_impact CHECK (impact IN ('LOW', 'MEDIUM', 'HIGH')),
    CONSTRAINT ck_priority_matrix_urgency CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH')),
    CONSTRAINT ck_priority_matrix_priority CHECK (resulting_priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

-- Default matrix (matches the frontend admin/priority-matrix grid):
--   High Impact x High Urgency   -> CRITICAL
--   High Impact x Medium Urgency -> HIGH
--   High Impact x Low Urgency    -> MEDIUM
--   Medium Impact x High Urgency -> HIGH
--   Medium Impact x Medium       -> MEDIUM
--   Medium Impact x Low          -> LOW
--   Low Impact x High Urgency    -> MEDIUM
--   Low Impact x Medium          -> LOW
--   Low Impact x Low             -> LOW
INSERT INTO priority_matrix (impact, urgency, resulting_priority) VALUES
    ('HIGH',   'HIGH',   'CRITICAL'),
    ('HIGH',   'MEDIUM', 'HIGH'),
    ('HIGH',   'LOW',    'MEDIUM'),
    ('MEDIUM', 'HIGH',   'HIGH'),
    ('MEDIUM', 'MEDIUM', 'MEDIUM'),
    ('MEDIUM', 'LOW',    'LOW'),
    ('LOW',    'HIGH',   'MEDIUM'),
    ('LOW',    'MEDIUM', 'LOW'),
    ('LOW',    'LOW',    'LOW');
