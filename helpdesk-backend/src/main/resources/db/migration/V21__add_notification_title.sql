-- V21: Add a short display title for notification list items.
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title VARCHAR(255);

UPDATE notifications
SET title = CASE
    WHEN type = 'ASSIGNED' THEN 'New Ticket Assigned'
    ELSE 'Notification'
END
WHERE title IS NULL;

ALTER TABLE notifications ALTER COLUMN title SET NOT NULL;
