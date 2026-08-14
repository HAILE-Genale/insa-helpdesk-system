-- Migration V22: Add SLA tracking columns to tickets
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMP WITH TIME ZONE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_violated BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_breached_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_warning_sent BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill SLA deadlines for existing open/in-progress/on-hold tickets based on priority.
-- CRITICAL -> 4h, HIGH -> 8h, MEDIUM -> 24h, LOW -> 72h
UPDATE tickets
SET sla_deadline = created_at + INTERVAL '4 hours'
WHERE sla_deadline IS NULL AND priority = 'CRITICAL' AND status IN ('OPEN', 'IN_PROGRESS', 'ON_HOLD');

UPDATE tickets
SET sla_deadline = created_at + INTERVAL '8 hours'
WHERE sla_deadline IS NULL AND priority = 'HIGH' AND status IN ('OPEN', 'IN_PROGRESS', 'ON_HOLD');

UPDATE tickets
SET sla_deadline = created_at + INTERVAL '24 hours'
WHERE sla_deadline IS NULL AND priority = 'MEDIUM' AND status IN ('OPEN', 'IN_PROGRESS', 'ON_HOLD');

UPDATE tickets
SET sla_deadline = created_at + INTERVAL '72 hours'
WHERE sla_deadline IS NULL AND priority = 'LOW' AND status IN ('OPEN', 'IN_PROGRESS', 'ON_HOLD');

-- Any remaining tickets without a deadline get the default 24h.
UPDATE tickets
SET sla_deadline = created_at + INTERVAL '24 hours'
WHERE sla_deadline IS NULL AND status IN ('OPEN', 'IN_PROGRESS', 'ON_HOLD');