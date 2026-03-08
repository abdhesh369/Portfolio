import { clientRepository } from "../repositories/client.repository.js";
import type { Client, ClientProject, ClientFeedback } from "@portfolio/shared";

export class ClientService {
    async getAllClients(): Promise<Client[]> {
        return clientRepository.findAll();
    }

    async getClientById(id: number): Promise<Client | null> {
        return clientRepository.findById(id);
    }

    async getClientByToken(token: string): Promise<Client | null> {
        return clientRepository.findByToken(token);
    }

    async createClient(data: { name: string; email: string; company?: string }): Promise<Client & { rawToken: string }> {
        return clientRepository.create(data);
    }

    async updateClient(id: number, data: Partial<{ name: string; email: string; company: string; status: "active" | "inactive" }>): Promise<Client> {
        return clientRepository.update(id, data);
    }

    async deleteClient(id: number): Promise<void> {
        return clientRepository.delete(id);
    }

    // Projects
    async getClientProjects(clientId: number): Promise<ClientProject[]> {
        return clientRepository.findProjectsByClientId(clientId);
    }

    async createClientProject(data: { clientId: number; title: string; status?: "not_started" | "in_progress" | "review" | "completed"; deadline?: Date; notes?: string }): Promise<ClientProject> {
        return clientRepository.createProject(data);
    }

    async updateClientProject(id: number, data: Partial<{ title: string; status: "not_started" | "in_progress" | "review" | "completed"; deadline: Date; notes: string }>): Promise<ClientProject> {
        return clientRepository.updateProject(id, data);
    }

    // Feedback
    async getProjectFeedback(clientProjectId: number): Promise<ClientFeedback[]> {
        return clientRepository.findFeedbackByProjectId(clientProjectId);
    }

    async submitFeedback(data: { clientProjectId: number; clientId: number; message: string }): Promise<ClientFeedback> {
        return clientRepository.createFeedback(data);
    }

    // Portal dashboard
    async getPortalDashboard(clientId: number) {
        const client = await clientRepository.findById(clientId);
        if (!client) throw new Error("Client not found");
        const projects = await clientRepository.findProjectsByClientId(clientId);
        return { client, projects };
    }
}

export const clientService = new ClientService();
