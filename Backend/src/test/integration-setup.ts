import { vi } from "vitest";

// Set test environment variables before any module imports
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.JWT_SECRET = "integration-test-jwt-secret-key-32chars";
process.env.ADMIN_PASSWORD = "test-admin-password";
process.env.ADMIN_EMAIL = "admin@test.com";
process.env.CONTACT_EMAIL = "contact@test.com";
process.env.PORT = "0"; // Random port for tests
