import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock repository (hoisted) ----
const {
    mockFindAll, mockFindById, mockFindByToken, mockCreate,
    mockUpdate, mockDelete, mockFindProjectsByClientId,
    mockCreateProject, mockUpdateProject,
    mockFindFeedbackByProjectId, mockCreateFeedback,
} = vi.hoisted(() => ({
    mockFindAll: vi.fn(),
    mockFindById: vi.fn(),
    mockFindByToken: vi.fn(),
    mockCreate: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
    mockFindProjectsByClientId: vi.fn(),
    mockCreateProject: vi.fn(),
    mockUpdateProject: vi.fn(),
    mockFindFeedbackByProjectId: vi.fn(),
    mockCreateFeedback: vi.fn(),
}));

vi.mock("../repositories/client.repository.js", () => ({
    clientRepository: {
        findAll: mockFindAll,
        findById: mockFindById,
        findByToken: mockFindByToken,
        create: mockCreate,
        update: mockUpdate,
        delete: mockDelete,
        findProjectsByClientId: mockFindProjectsByClientId,
        createProject: mockCreateProject,
        updateProject: mockUpdateProject,
        findFeedbackByProjectId: mockFindFeedbackByProjectId,
        createFeedback: mockCreateFeedback,
    },
}));

import { ClientService } from "./client.service.js";

const MOCK_CLIENT = {
    id: 1,
    name: "Test Client",
    email: "client@example.com",
    company: "TestCo",
    status: "active" as const,
    tokenHash: "hashed",
    createdAt: new Date(),
    updatedAt: new Date(),
};

const MOCK_PROJECT = {
    id: 1,
    clientId: 1,
    title: "Project Alpha",
    status: "in_progress" as const,
    deadline: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const MOCK_FEEDBACK = {
    id: 1,
    clientProjectId: 1,
    clientId: 1,
    message: "Looks great!",
    createdAt: new Date(),
};

describe("ClientService", () => {
    let service: ClientService;

    beforeEach(() => {
        service = new ClientService();
        vi.clearAllMocks();
    });

    describe("getAllClients", () => {
        it("returns all clients from repository", async () => {
            mockFindAll.mockResolvedValue([MOCK_CLIENT]);
            const result = await service.getAllClients();
            expect(mockFindAll).toHaveBeenCalled();
            expect(result).toEqual([MOCK_CLIENT]);
        });
    });

    describe("getClientById", () => {
        it("returns a client by ID", async () => {
            mockFindById.mockResolvedValue(MOCK_CLIENT);
            const result = await service.getClientById(1);
            expect(mockFindById).toHaveBeenCalledWith(1);
            expect(result).toEqual(MOCK_CLIENT);
        });

        it("returns null for non-existent ID", async () => {
            mockFindById.mockResolvedValue(null);
            const result = await service.getClientById(999);
            expect(result).toBeNull();
        });
    });

    describe("getClientByToken", () => {
        it("delegates to repository findByToken", async () => {
            mockFindByToken.mockResolvedValue(MOCK_CLIENT);
            const result = await service.getClientByToken("test-token");
            expect(mockFindByToken).toHaveBeenCalledWith("test-token");
            expect(result).toEqual(MOCK_CLIENT);
        });
    });

    describe("createClient", () => {
        it("creates a client with provided data", async () => {
            const createData = { name: "New Client", email: "new@example.com", company: "NewCo" };
            mockCreate.mockResolvedValue({ ...MOCK_CLIENT, ...createData, rawToken: "raw-token-123" });
            const result = await service.createClient(createData);
            expect(mockCreate).toHaveBeenCalledWith(createData);
            expect(result.rawToken).toBe("raw-token-123");
        });
    });

    describe("updateClient", () => {
        it("updates client with partial data", async () => {
            const updated = { ...MOCK_CLIENT, name: "Updated Name" };
            mockUpdate.mockResolvedValue(updated);
            const result = await service.updateClient(1, { name: "Updated Name" });
            expect(mockUpdate).toHaveBeenCalledWith(1, { name: "Updated Name" });
            expect(result.name).toBe("Updated Name");
        });
    });

    describe("deleteClient", () => {
        it("deletes a client by ID", async () => {
            mockDelete.mockResolvedValue(undefined);
            await service.deleteClient(1);
            expect(mockDelete).toHaveBeenCalledWith(1);
        });
    });

    describe("getClientProjects", () => {
        it("returns projects for a client", async () => {
            mockFindProjectsByClientId.mockResolvedValue([MOCK_PROJECT]);
            const result = await service.getClientProjects(1);
            expect(mockFindProjectsByClientId).toHaveBeenCalledWith(1);
            expect(result).toEqual([MOCK_PROJECT]);
        });
    });

    describe("createClientProject", () => {
        it("creates a project for a client", async () => {
            const data = { clientId: 1, title: "New Project" };
            mockCreateProject.mockResolvedValue({ ...MOCK_PROJECT, title: "New Project" });
            const result = await service.createClientProject(data);
            expect(mockCreateProject).toHaveBeenCalledWith(data);
            expect(result.title).toBe("New Project");
        });
    });

    describe("submitFeedback", () => {
        it("creates feedback for a project", async () => {
            const data = { clientProjectId: 1, clientId: 1, message: "Great work!" };
            mockCreateFeedback.mockResolvedValue({ ...MOCK_FEEDBACK, message: "Great work!" });
            const result = await service.submitFeedback(data);
            expect(mockCreateFeedback).toHaveBeenCalledWith(data);
            expect(result.message).toBe("Great work!");
        });
    });

    describe("getPortalDashboard", () => {
        it("returns client and projects", async () => {
            mockFindById.mockResolvedValue(MOCK_CLIENT);
            mockFindProjectsByClientId.mockResolvedValue([MOCK_PROJECT]);
            const result = await service.getPortalDashboard(1);
            expect(result.client).toEqual(MOCK_CLIENT);
            expect(result.projects).toEqual([MOCK_PROJECT]);
        });

        it("throws if client not found", async () => {
            mockFindById.mockResolvedValue(null);
            await expect(service.getPortalDashboard(999)).rejects.toThrow("Client not found");
        });
    });
});
