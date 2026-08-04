-- Migration V7: Create classifications table and seed with realistic data
-- Drop existing classifications if any
DROP TABLE IF EXISTS classifications CASCADE;

-- Create fresh classifications table
CREATE TABLE classifications (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Clear any sequence history
ALTER SEQUENCE classifications_id_seq RESTART WITH 1;

-- Insert realistic service type classifications
INSERT INTO classifications (name, description, active) VALUES
    ('Incident', 'Unexpected problem or service degradation', true),
    ('Service Request', 'Request for new service, access, or information', true),
    ('Change Request', 'Request to modify or upgrade existing service', true),
    ('Problem', 'Underlying cause of one or more incidents', true),
    ('Emergency', 'Critical system outage requiring immediate attention', true),
    ('Maintenance', 'Planned maintenance or system updates', true),
    ('Enhancement', 'Request for feature improvements or enhancements', true),
    ('Bug Report', 'Software defect or malfunction', true),
    ('Documentation', 'Request for documentation or knowledge articles', true),
    ('Other', 'Other types of requests not fitting above categories', true);
