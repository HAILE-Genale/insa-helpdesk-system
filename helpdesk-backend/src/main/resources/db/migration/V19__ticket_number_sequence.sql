-- V19: Dedicated sequence for human-readable ticket numbers (TK-XXXXX).
-- Using the row ID caused uq_ticket_number violations when old rows had
-- ticket numbers higher than the current max ID.

CREATE SEQUENCE IF NOT EXISTS ticket_number_seq
    START WITH 1
    INCREMENT BY 1;

-- Advance the sequence past the highest number already in use so the first
-- nextval() call on a fresh DB gives TK-00001, and on an existing DB it
-- continues from where the data left off.
DO $$
DECLARE
    current_max BIGINT;
BEGIN
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(ticket_number FROM 4) AS BIGINT)), 0
    )
    INTO current_max
    FROM tickets
    WHERE ticket_number ~ '^TK-[0-9]+$';

    IF current_max > 0 THEN
        PERFORM setval('ticket_number_seq', current_max);
    END IF;
END;
$$;
