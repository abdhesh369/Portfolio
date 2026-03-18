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
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnThis(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        execute: vi.fn().mockImplementation(function (this: any) {
            return Promise.resolve(this.__mockValue || []);
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        then: vi.fn(function (this: any, onFulfilled) {
            const p = Promise.resolve(this.__mockValue || []);
            return onFulfilled ? p.then(onFulfilled) : p;
        }),
        catch: vi.fn().mockReturnThis(),
        finally: vi.fn().mockReturnThis(),
    };

    return {
        db: {
            select: vi.fn().mockImplementation(() => {
                // Return a NEW proxy/object for each select() call to allow sequential mocking
                return { ...mockQuery };
            }),
            delete: vi.fn().mockReturnValue({ ...mockQuery }),
            update: vi.fn().mockReturnValue({ ...mockQuery }),
            insert: vi.fn().mockReturnValue({ ...mockQuery }),
            transaction: vi.fn().mockImplementation(async (cb) => cb({ ...mockQuery })),
            execute: vi.fn().mockResolvedValue({ rows: [] }),
        },
    };
});
