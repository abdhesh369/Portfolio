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

import { vi } from "vitest";

// Global Drizzle Mock
vi.mock("../db.js", () => {
    const mockQuery = {
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
        orderBy: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
        set: vi.fn(),
        insert: vi.fn(),
        values: vi.fn(),
        returning: vi.fn(),
        execute: vi.fn(),
        then: vi.fn((onFulfilled) => Promise.resolve([]).then(onFulfilled)),
        catch: vi.fn(),
        finally: vi.fn(),
    };

    mockQuery.from.mockReturnValue(mockQuery);
    mockQuery.where.mockReturnValue(mockQuery);
    mockQuery.limit.mockReturnValue(mockQuery);
    mockQuery.orderBy.mockReturnValue(mockQuery);
    mockQuery.delete.mockReturnValue(mockQuery);
    mockQuery.update.mockReturnValue(mockQuery);
    mockQuery.set.mockReturnValue(mockQuery);
    mockQuery.insert.mockReturnValue(mockQuery);
    mockQuery.values.mockReturnValue(mockQuery);
    mockQuery.returning.mockReturnValue(mockQuery);

    return {
        db: {
            select: vi.fn().mockReturnValue(mockQuery),
            delete: vi.fn().mockReturnValue(mockQuery),
            update: vi.fn().mockReturnValue(mockQuery),
            insert: vi.fn().mockReturnValue(mockQuery),
        },
    };
});
