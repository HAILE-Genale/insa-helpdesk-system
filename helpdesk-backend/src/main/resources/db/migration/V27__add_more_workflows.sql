INSERT INTO workflows (id, name, status, trigger_condition, action)
VALUES 
('WF-04', 'Auto-Assign Hardware Tickets to Desktop Support', 'ACTIVE', 'Ticket Category == "Hardware"', 'Assign to Desktop Support Team'),
('WF-05', 'Escalate CRITICAL Priority SLA Breach', 'ACTIVE', 'Priority == CRITICAL && TimeInQueue > 15m', 'Immediate SMS & Email Alert to NOC Lead'),
('WF-06', 'Re-assign High Priority SLA Breach', 'ACTIVE', 'Priority == HIGH && TimeInQueue > 1h', 'Auto-reassign to Backup Agent'),
('WF-07', 'Auto-Close Stale Waiting on User Tickets', 'ACTIVE', 'Status == "WAITING_ON_USER" && LastUpdate > 7d', 'Status = RESOLVED, Add Comment "Auto-closed due to inactivity"'),
('WF-08', 'Alert Manager on Multi-Reassign', 'ACTIVE', 'Ticket Reassign Count > 3', 'Send Notification to Helpdesk Manager'),
('WF-09', 'VIP User Priority Bump', 'ACTIVE', 'Reporter Department == "Executive"', 'Set Priority = HIGH');
