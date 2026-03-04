import { messageRepository } from "../repositories/message.repository.js";
import DOMPurify from "isomorphic-dompurify";
import type { Message, InsertMessage } from "../../shared/schema.js";
import { logger } from "../lib/logger.js";

export class MessageService {
    private sanitize(text: string): string {
        return DOMPurify.sanitize(text);
    }

    async getAll(): Promise<Message[]> {
        return await messageRepository.findAll();
    }

    async getById(id: number): Promise<Message | null> {
        return await messageRepository.findById(id);
    }

    async create(data: InsertMessage & { website?: string }): Promise<Message> {
        // Honeypot check
        if (data.website) {
            logger.warn({ context: "security", service: "message", email: data.email }, "Spam detected via honeypot field");
            throw new Error("Message rejected");
        }

        const { website, ...insertData } = data;

        const sanitizedData: InsertMessage = {
            name: this.sanitize(insertData.name),
            email: this.sanitize(insertData.email),
            message: this.sanitize(insertData.message),
            subject: insertData.subject ? this.sanitize(insertData.subject) : ""
        };
        return await messageRepository.create(sanitizedData);
    }

    async delete(id: number): Promise<boolean> {
        return await messageRepository.delete(id);
    }

    async bulkDelete(ids: number[]): Promise<void> {
        await messageRepository.bulkDelete(ids);
    }
}

export const messageService = new MessageService();
