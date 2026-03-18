import { SubscriberRepository } from "../repositories/subscriber.repository.js";

export class SubscriberService {
    private subscriberRepository: SubscriberRepository;

    constructor() {
        this.subscriberRepository = new SubscriberRepository();
    }

    async subscribe(data: { email: string; source?: string }) {
        const existing = await this.subscriberRepository.findByEmail(data.email);
        
        if (existing) {
            if (existing.status === "active") {
                throw new Error("Already subscribed");
            }
            // Re-activate if was unsubscribed
            await this.subscriberRepository.updateStatus(data.email, "active");
            return { ...existing, status: "active" as const };
        }

        return await this.subscriberRepository.create({
            email: data.email.toLowerCase(),
            source: data.source,
            status: "active",
        });
    }

    async unsubscribe(email: string) {
        const existing = await this.subscriberRepository.findByEmail(email);
        if (!existing) {
            throw new Error("Subscriber not found");
        }
        await this.subscriberRepository.updateStatus(email, "unsubscribed");
        return { success: true, message: "Unsubscribed successfully" };
    }

    async listSubscribers() {
        return await this.subscriberRepository.list();
    }

    async getActiveSubscribers() {
        return await this.subscriberRepository.findActive();
    }
}
