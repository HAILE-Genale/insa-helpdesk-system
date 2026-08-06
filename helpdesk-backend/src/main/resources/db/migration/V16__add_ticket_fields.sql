-- Migration V16: Add extended ticket fields (ticketNumber, department, location,
-- phone, assetTag, errorMessage, issueStartDate) required by the portal form.

ALTER TABLE tickets
    ADD COLUMN IF NOT EXISTS ticket_number  VARCHAR(20),
    ADD COLUMN IF NOT EXISTS department     VARCHAR(150),
    ADD COLUMN IF NOT EXISTS location       VARCHAR(150),
    ADD COLUMN IF NOT EXISTS phone          VARCHAR(30),
    ADD COLUMN IF NOT EXISTS asset_tag      VARCHAR(100),
    ADD COLUMN IF NOT EXISTS error_message  TEXT,
    ADD COLUMN IF NOT EXISTS issue_start_date DATE;

-- Back-fill ticket numbers for any existing rows.
UPDATE tickets SET ticket_number = CONCAT('TK-', LPAD(id::text, 5, '0')) WHERE ticket_number IS NULL;

-- Unique index for ticket_number lookups.
CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
