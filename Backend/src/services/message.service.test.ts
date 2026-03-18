/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock repository (vi.hoisted ensures availability during vi.mock hoisting) ----
const {
    mockFindAll, mockFindById, mockCreate, mockDelete, mockBulkDelete,
} = vi.hoisted(() => ({
    mockFindAll: vi.fn(),
    mockFindById: vi.fn(),
    mockCreate: vi.fn(),
    mockDelete: vi.fn(),
    mockBulkDelete: vi.fn(),
}));

vi.mock("../repositories/message.repository.js", () => ({
    messageRepository: {
        findAll: mockFindAll,
        findById: mockFindById,
        create: mockCreate,
        delete: mockDelete,
        bulkDelete: mockBulkDelete,
    },
}));

// Mock DOMPurify
vi.mock("isomorphic-dompurify", () => ({
    default: {
        sanitize: vi.fn((text: string) => text.replace(/<script>.*<\/script>/g, "")),
    },
}));

import { MessageService } from "../services/message.service.js";

describe("MessageService", () => {
    let service: MessageService;

    beforeEach(() => {
        service = new MessageService();
        vi.clearAllMocks();
    });

    describe("getAll", () => {
        it("delegates to repository", async () => {
            const messages = [{ id: 1, name: "Test", email: "t@t.com", message: "Hi" }];
            mockFindAll.mockResolvedValue(messages);

            const result = await service.getAll();

            expect(result).toEqual(messages);
            expect(mockFindAll).toHaveBeenCalled();
        });
    });

    describe("create", () => {
        it("creates a sanitized message", async () => {
            const input = { name: "User", email: "user@test.com", message: "Hello", subject: "Hi" };
            const created = { id: 1, ...input, createdAt: new Date().toISOString() };
            mockCreate.mockResolvedValue(created);

            const result = await service.create(input);

            expect(result.id).toBe(1);
            expect(mockCreate).toHaveBeenCalled();
        });

        it("rejects honeypot-filled messages", async () => {
            const input = {
                name: "Bot",
                email: "bot@spam.com",
                message: "Buy stuff",
                subject: "Spam",
                _bnt_id: "bot_detection_triggered", // honeypot filled
            } as any;

            await expect(service.create(input)).rejects.toThrow("Message rejected");
            expect(mockCreate).not.toHaveBeenCalled();
        });

        it("sanitizes HTML from input fields", async () => {
            const input = {
                name: "<script>alert(1)</script>User",
                email: "user@test.com",
                message: "Hello <script>xss</script>",
                subject: "Test",
            };
            mockCreate.mockResolvedValue({ id: 1 });

            await service.create(input);

            // Verify sanitize was called on name, email, message
            const DOMPurify = (await import("isomorphic-dompurify")).default;
            expect(DOMPurify.sanitize).toHaveBeenCalledWith(input.name);
            expect(DOMPurify.sanitize).toHaveBeenCalledWith(input.email);
            expect(DOMPurify.sanitize).toHaveBeenCalledWith(input.message);
        });

        it("passes message with empty website (non-bot)", async () => {
            const input = {
                name: "Real User",
                email: "real@test.com",
                message: "Genuine message",
                subject: "Hello",
                website: "", // empty honeypot = legit
            };
            mockCreate.mockResolvedValue({ id: 1, ...input });

            // Empty string is falsy, so it should pass
            const result = await service.create(input);
            expect(result).toBeDefined();
        });
    });

    describe("delete", () => {
        it("returns true when delete succeeds", async () => {
            mockDelete.mockResolvedValue(true);

            const result = await service.delete(1);

            expect(result).toBe(true);
            expect(mockDelete).toHaveBeenCalledWith(1);
        });

        it("returns false when record not found", async () => {
            mockDelete.mockResolvedValue(false);

            const result = await service.delete(999);

            expect(result).toBe(false);
        });
    });

    describe("bulkDelete", () => {
        it("delegates to repository", async () => {
            mockBulkDelete.mockResolvedValue(undefined);

            await service.bulkDelete([1, 2, 3]);

            expect(mockBulkDelete).toHaveBeenCalledWith([1, 2, 3]);
        });
    });
});
