/**
 * Backend Unit Test Setup
 *
 * Sets mock environment variables so that modules importing env.ts
 * do not crash during testing.
 */

// Must be set BEFORE any import that triggers env.ts validation
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
process.env.JWT_SECRET = "test-jwt-secret-that-is-at-least-32-chars-long!!";
process.env.ADMIN_PASSWORD = "test-admin-password";
process.env.ADMIN_EMAIL = "admin@test.com";
process.env.CONTACT_EMAIL = "contact@test.com";
