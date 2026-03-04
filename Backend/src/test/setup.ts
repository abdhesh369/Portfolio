/**
 * Backend Unit Test Setup
 *
 * Sets mock environment variables so that modules importing env.ts
 * do not crash during testing.
 */

// Must be set BEFORE any import that triggers env.ts validation
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
process.env.JWT_SECRET = "test-jwt-secret-that-is-at-least-64-characters-long-for-validation!!!!!";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-at-least-64-characters-long-for-validation!!!!!";
process.env.ADMIN_PASSWORD = "test-admin-password";
process.env.ADMIN_EMAIL = "admin@test.com";
process.env.CONTACT_EMAIL = "contact@test.com";
