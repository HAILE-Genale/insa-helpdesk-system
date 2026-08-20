CREATE TABLE workflows (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    trigger_condition TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial workflows
INSERT INTO workflows (id, name, status, trigger_condition, action)
VALUES 
('WF-01', 'Auto-Assign Network Tickets to NOC Team', 'ACTIVE', 'Ticket Created in "Network" Category', 'Assign to NOC Team'),
('WF-02', 'Escalate High Priority after 30 mins Inactivity', 'ACTIVE', 'Priority == HIGH && TimeInQueue > 30m', 'Escalate to Manager'),
('WF-03', 'Send CSAT Survey on Ticket Resolution', 'ACTIVE', 'Status Changed to RESOLVED', 'Send CSAT Email');
