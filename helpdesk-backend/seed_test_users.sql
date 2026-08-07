-- Seed test users directly into DB
-- Passwords are BCrypt hashes:
--   agent.test   → Agent@1234
--   manager.test → Manager@1234

-- Ensure departments exist
INSERT INTO departments (name) SELECT 'IT & Infrastructure' WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'IT & Infrastructure');
INSERT INTO departments (name) SELECT 'Network Operations'  WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Network Operations');

-- agent.test (HELPDESK_AGENT)
INSERT INTO users (username, email, password_hash, role_id, department_id, active, auth_source)
SELECT 
  'agent.test',
  'agent.test@insa.gov.et',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
  (SELECT id FROM roles WHERE name = 'HELPDESK_AGENT'),
  (SELECT id FROM departments WHERE name = 'Network Operations'),
  true,
  'LOCAL'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'agent.test');

-- manager.test (HELPDESK_MANAGER)
INSERT INTO users (username, email, password_hash, role_id, department_id, active, auth_source)
SELECT
  'manager.test',
  'manager.test@insa.gov.et',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
  (SELECT id FROM roles WHERE name = 'HELPDESK_MANAGER'),
  (SELECT id FROM departments WHERE name = 'IT & Infrastructure'),
  true,
  'LOCAL'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'manager.test');

SELECT username, email, active, (SELECT name FROM roles WHERE id = role_id) as role,
       (SELECT name FROM departments WHERE id = department_id) as department
FROM users WHERE username IN ('agent.test','manager.test');
