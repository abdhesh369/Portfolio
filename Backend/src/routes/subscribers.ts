import { Router } from "express";
import { SubscriberService } from "../services/subscriber.service.js";
import { insertSubscriberApiSchema } from "@portfolio/shared/schema";
import { z } from "zod";

const subscribersRouter = Router();
const subscriberService = new SubscriberService();

subscribersRouter.post("/subscribe", async (req, res) => {
    try {
        const data = insertSubscriberApiSchema.parse(req.body);
        const subscriber = await subscriberService.subscribe(data);
        res.status(201).json({
            success: true,
            message: "Subscribed successfully",
            data: subscriber,
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.issues,
            });
        }
        if (error.message === "Already subscribed") {
            return res.status(409).json({
                message: error.message,
            });
        }
        res.status(500).json({
            message: error.message || "Failed to subscribe",
        });
    }
});

subscribersRouter.post("/unsubscribe", async (req, res) => {
    try {
        const { email } = z.object({ email: z.string().email() }).parse(req.body);
        const result = await subscriberService.unsubscribe(email);
        res.status(200).json(result);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.issues,
            });
        }
        if (error.message === "Subscriber not found") {
            return res.status(404).json({
                message: error.message,
            });
        }
        res.status(500).json({
            message: error.message || "Failed to unsubscribe",
        });
    }
});

export default subscribersRouter;
