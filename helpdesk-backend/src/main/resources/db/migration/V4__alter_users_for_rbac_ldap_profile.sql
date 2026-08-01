-- Note: Flyway is currently disabled. This script documents the Hibernate-generated schema 
-- and will NOT run automatically unless Flyway is enabled and ddl-auto: update is removed.

ALTER TABLE users ADD COLUMN role_id BIGINT REFERENCES roles(id),
ADD COLUMN auth_source VARCHAR(20) NOT NULL DEFAULT 'LOCAL' CHECK (auth_source IN ('LOCAL','LDAP')),
ADD COLUMN ldap_dn VARCHAR(255),
ADD COLUMN phone VARCHAR(30),
ADD COLUMN location VARCHAR(150),
ADD COLUMN last_login_at TIMESTAMPTZ;

-- Note: the old `role` enum column should be dropped manually later after confirming no data loss.
-- ALTER TABLE users DROP COLUMN role;
