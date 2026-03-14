import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClientService } from "./client.service.js";
import { clientRepository } from "../repositories/client.repository.js";

vi.mock("../repositories/client.repository.js", () => ({
    clientRepository: {
        findAll: vi.fn(),
        findById: vi.fn(),
        findByToken: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findProjectsByClientId: vi.fn(),
        createProject: vi.fn(),
        updateProject: vi.fn(),
        findFeedbackByProjectId: vi.fn(),
        createFeedback: vi.fn(),
        regenerateToken: vi.fn(),
    },
}));

vi.mock("./email.service.js", () => ({
    emailService: {
        sendClientPortalInvite: vi.fn().mockResolvedValue(undefined),
        sendProjectUpdateAlert: vi.fn().mockResolvedValue(undefined),
        sendAdminFeedbackAlert: vi.fn().mockResolvedValue(undefined),
        sendTestimonialRequest: vi.fn().mockResolvedValue(undefined),
    },
}));

describe("ClientService", () => {
    let service: ClientService;

    beforeEach(() => {
        service = new ClientService();
        vi.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("getAllClients", () => {
        it("should call repository.findAll", async () => {
            const mockFindAll = vi.mocked(clientRepository.findAll);
            mockFindAll.mockResolvedValue([]);
            await service.getAllClients();
            expect(mockFindAll).toHaveBeenCalled();
        });
    });

    describe("createClient", () => {
        it("should call repository.create", async () => {
            const mockCreate = vi.mocked(clientRepository.create);
            const data = { name: "Test", email: "test@example.com" };
            mockCreate.mockResolvedValue({ ...data, id: 1, rawToken: "tok" } as any);
            await service.createClient(data);
            expect(mockCreate).toHaveBeenCalledWith(data);
        });
    });

    describe("getPortalDashboard", () => {
        it("should throw if client not found", async () => {
            vi.mocked(clientRepository.findById).mockResolvedValue(null);
            await expect(service.getPortalDashboard(1)).rejects.toThrow("Client not found");
        });

        it("should return client and projects", async () => {
            const mockClient = { id: 1, name: "Test" } as any;
            const mockProjects = [{ id: 1, title: "Proj" }] as any;
            vi.mocked(clientRepository.findById).mockResolvedValue(mockClient);
            vi.mocked(clientRepository.findProjectsByClientId).mockResolvedValue(mockProjects);

            const result = await service.getPortalDashboard(1);
            expect(result.client).toEqual(mockClient);
            expect(result.projects).toEqual(mockProjects);
        });
    });
});
