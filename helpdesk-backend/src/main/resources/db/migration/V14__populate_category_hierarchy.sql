-- Migration V8: Populate hierarchical categories with sub-categories
-- Clear any existing data first
TRUNCATE TABLE categories CASCADE;

-- Reset the sequence
ALTER SEQUENCE categories_id_seq RESTART WITH 1;

-- Insert parent categories first (10 main categories)
INSERT INTO categories (name, description, active, classification_id, parent_category_id) 
VALUES 
    ('Hardware', 'Computer hardware, peripherals, and devices', true, NULL, NULL),
    ('Software', 'Software applications, installations, and updates', true, NULL, NULL),
    ('Network & Connectivity', 'Network, VPN, internet, and connectivity issues', true, NULL, NULL),
    ('Access & Authentication', 'User accounts, permissions, and authentication', true, NULL, NULL),
    ('Communication Tools', 'Email, messaging, and communication platforms', true, NULL, NULL),
    ('Office Equipment', 'Printers, scanners, copiers, and related devices', true, NULL, NULL),
    ('Database & Systems', 'Database connectivity, performance, and data management', true, NULL, NULL),
    ('Mobile & Remote', 'Mobile devices, remote work tools, and mobile apps', true, NULL, NULL),
    ('Security & Compliance', 'Security issues, access controls, and compliance matters', true, NULL, NULL),
    ('General Support', 'General inquiries, training, and miscellaneous requests', true, NULL, NULL);

-- Sub-categories for Hardware
INSERT INTO categories (name, description, active, classification_id, parent_category_id) 
VALUES 
    ('Laptop/Desktop', 'Desktop and laptop computer issues', true, NULL, 1),
    ('Monitors & Displays', 'Monitor and display problems', true, NULL, 1),
    ('Keyboards & Mouse', 'Input device issues', true, NULL, 1),
    ('USB Devices', 'USB peripheral issues', true, NULL, 1);

-- Sub-categories for Software
INSERT INTO categories (name, description, active, classification_id, parent_category_id) 
VALUES 
    ('Operating System', 'Windows, macOS, Linux issues', true, NULL, 2),
    ('Microsoft Office', 'Word, Excel, PowerPoint, Outlook', true, NULL, 2),
    ('ERP System', 'Enterprise resource planning system issues', true, NULL, 2),
    ('CRM System', 'Customer relationship management system', true, NULL, 2),
    ('Third-party Applications', 'Other software applications', true, NULL, 2);

-- Sub-categories for Network & Connectivity
INSERT INTO categories (name, description, active, classification_id, parent_category_id) 
VALUES 
    ('WiFi Issues', 'Wireless network connectivity problems', true, NULL, 3),
    ('VPN Access', 'VPN connection and configuration issues', true, NULL, 3),
    ('Internet Connectivity', 'Internet access and speed issues', true, NULL, 3),
    ('Network Printing', 'Network printer connectivity', true, NULL, 3);

-- Sub-categories for Access & Authentication
INSERT INTO categories (name, description, active, classification_id, parent_category_id) 
VALUES 
    ('Password Reset', 'Password reset and recovery', true, NULL, 4),
    ('Account Locked', 'Account lockout and unlock requests', true, NULL, 4),
    ('Permission Access', 'File and folder permission requests', true, NULL, 4),
    ('Multi-Factor Auth', 'MFA setup and troubleshooting', true, NULL, 4);

-- Sub-categories for Communication Tools
INSERT INTO categories (name, description, active, classification_id, parent_category_id) 
VALUES 
    ('Email Issues', 'Email account setup and problems', true, NULL, 5),
    ('Collaboration Tools', 'Teams, Slack, and collaboration platforms', true, NULL, 5),
    ('Video Conferencing', 'Zoom, Teams meetings, video call issues', true, NULL, 5);

-- Sub-categories for Office Equipment
INSERT INTO categories (name, description, active, classification_id, parent_category_id) 
VALUES 
    ('Printer Setup', 'Printer installation and configuration', true, NULL, 6),
    ('Print Quality', 'Print quality and document issues', true, NULL, 6),
    ('Scanner Issues', 'Scanner setup and scanning problems', true, NULL, 6),
    ('Copier Issues', 'Copier machine problems', true, NULL, 6);

-- Sub-categories for Database & Systems
INSERT INTO categories (name, description, active, classification_id, parent_category_id) 
VALUES 
    ('Database Access', 'Database connection and access issues', true, NULL, 7),
    ('Data Backup', 'Data backup and recovery requests', true, NULL, 7),
    ('Performance Issues', 'System slowness and performance degradation', true, NULL, 7),
    ('Server Issues', 'Server connectivity and availability', true, NULL, 7);

-- Sub-categories for Mobile & Remote
INSERT INTO categories (name, description, active, classification_id, parent_category_id) 
VALUES 
    ('Mobile Device Setup', 'Smartphone and tablet configuration', true, NULL, 8),
    ('Mobile Apps', 'Mobile application issues', true, NULL, 8),
    ('Remote Work Setup', 'Remote work tools and connectivity', true, NULL, 8);

-- Sub-categories for Security & Compliance
INSERT INTO categories (name, description, active, classification_id, parent_category_id) 
VALUES 
    ('Security Incident', 'Security breaches or suspected incidents', true, NULL, 9),
    ('Access Control', 'Role-based access control issues', true, NULL, 9),
    ('Compliance', 'Compliance and policy-related issues', true, NULL, 9);

-- Sub-categories for General Support
INSERT INTO categories (name, description, active, classification_id, parent_category_id) 
VALUES 
    ('User Training', 'Training requests and onboarding assistance', true, NULL, 10),
    ('License & Asset', 'Software licensing and asset management', true, NULL, 10),
    ('General Inquiry', 'General questions and miscellaneous inquiries', true, NULL, 10);
