import { clientRepository } from "../repositories/client.repository.js";
import type { Client, ClientProject, ClientFeedback } from "@portfolio/shared";
import { emailService } from "./email.service.js";

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
        const client = await clientRepository.create(data);
        
        // Send invitation email
        try {
            await emailService.sendClientPortalInvite({
                clientName: client.name,
                clientEmail: client.email,
                rawToken: client.rawToken
            });
        } catch (err) {
            console.error("Failed to send client portal invite:", err);
        }
        
        return client;
    }

    async updateClient(id: number, data: Partial<{ name: string; email: string; company: string; status: "active" | "inactive" }>): Promise<Client> {
        return clientRepository.update(id, data);
    }

    async regenerateClientToken(id: number): Promise<string> {
        const rawToken = await clientRepository.regenerateToken(id);
        
        // Send new token alert email
        try {
            const client = await this.getClientById(id);
            if (client) {
                await emailService.sendClientPortalInvite({
                    clientName: client.name,
                    clientEmail: client.email,
                    rawToken
                });
            }
        } catch (err) {
            console.error("Failed to send client portal token regeneration notice:", err);
        }
        
        return rawToken;
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
        const oldProject = await this.getClientProjectById(id);
        const updated = await clientRepository.updateProject(id, data);
        
        // Notify client if status changed
        if (data.status && oldProject && oldProject.status !== data.status) {
            try {
                const client = await this.getClientById(updated.clientId);
                if (client) {
                    await emailService.sendProjectUpdateAlert({
                        clientName: client.name,
                        clientEmail: client.email,
                        projectTitle: updated.title,
                        newStatus: data.status
                    });
                }
            } catch (err) {
                console.error("Failed to send project status update alert:", err);
            }
        }
        
        return updated;
    }

    async getClientProjectById(id: number): Promise<ClientProject | null> {
        return clientRepository.findProjectById(id);
    }

    // Feedback
    async getProjectFeedback(clientProjectId: number): Promise<ClientFeedback[]> {
        return clientRepository.findFeedbackByProjectId(clientProjectId);
    }

    async submitFeedback(data: { clientProjectId: number; clientId: number; message: string; isAdmin?: boolean }): Promise<ClientFeedback> {
        const feedback = await clientRepository.createFeedback(data);
        
        // Notify admin of new client feedback
        if (!data.isAdmin) {
            try {
                const client = await this.getClientById(data.clientId);
                const project = await this.getClientProjectById(data.clientProjectId);
                if (client && project) {
                    await emailService.sendAdminFeedbackAlert({
                        clientName: client.name,
                        projectTitle: project.title,
                        message: data.message
                    });
                }
            } catch (err) {
                console.error("Failed to send admin feedback alert:", err);
            }
        }
        
        return feedback;
    }

    // Portal dashboard
    async getPortalDashboard(clientId: number) {
        const client = await clientRepository.findById(clientId);
        if (!client) throw new Error("Client not found");
        const projects = await clientRepository.findProjectsByClientId(clientId);
        return { client, projects };
    }

    async requestTestimonial(clientId: number, projectId: number): Promise<void> {
        const client = await this.getClientById(clientId);
        const project = await this.getClientProjectById(projectId);
        
        if (!client || !project) {
            throw new Error("Client or project not found");
        }
        
        await emailService.sendTestimonialRequest({
            clientName: client.name,
            clientEmail: client.email,
            projectTitle: project.title
        });
    }
}

export const clientService = new ClientService();
