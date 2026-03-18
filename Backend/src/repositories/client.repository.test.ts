/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClientRepository } from "./client.repository.js";
import { db } from "../db.js";
import bcrypt from "bcryptjs";

// Mock the database
vi.mock("../db.js", () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                orderBy: vi.fn(() => []),
                where: vi.fn(() => ({
                    limit: vi.fn(() => []),
                })),
            })),
        })),
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                returning: vi.fn(() => []),
            })),
        })),
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(() => ({
                    returning: vi.fn(() => []),
                })),
            })),
        })),
        delete: vi.fn(() => ({
            where: vi.fn(() => []),
        })),
    },
}));

describe("ClientRepository", () => {
    let repository: ClientRepository;

    beforeEach(() => {
        repository = new ClientRepository();
        vi.clearAllMocks();
    });

    it("should be defined", () => {
        expect(repository).toBeDefined();
    });

    describe("findAll", () => {
        it("should call db select", async () => {
            const mockSelect = vi.mocked(db.select);
            await repository.findAll();
            expect(mockSelect).toHaveBeenCalled();
        });
    });

    describe("create", () => {
        it("should hash the token during creation", async () => {
            const data = { name: "Test", email: "test@example.com" };
            const spyHash = vi.spyOn(bcrypt, "hash");

            // Mock returning an inserted client
            const mockReturning = vi.fn().mockResolvedValue([{ id: 1, ...data }]);
            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: mockReturning
                })
            } as any);

            const result = await repository.create(data);

            expect(spyHash).toHaveBeenCalled();
            expect(result.id).toBe(1);
            expect(result.rawToken).toBeDefined();
        });
    });
});
