import { Router } from "express";
import { SubscriberService } from "../services/subscriber.service.js";
import { insertSubscriberApiSchema } from "@portfolio/shared/schema";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler.js";
import { recordAudit } from "../lib/audit.js";

const subscribersRouter = Router();
const subscriberService = new SubscriberService();

subscribersRouter.post("/subscribe", asyncHandler(async (req, res) => {
    const data = insertSubscriberApiSchema.parse(req.body);
    const subscriber = await subscriberService.subscribe(data);
    
    // Audit logging (A1)
    recordAudit("CREATE", "subscriber", subscriber.id, null, { email: data.email });

    res.status(201).json({
        success: true,
        message: "Subscribed successfully",
        data: subscriber,
    });
}));

subscribersRouter.post("/unsubscribe", asyncHandler(async (req, res) => {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const result = await subscriberService.unsubscribe(email);
    
    // Audit logging (A1) - using email as identifier since unsubscribe often doesn't return full object
    recordAudit("DELETE", "subscriber", undefined, null, { email });

    res.status(200).json(result);
}));

export default subscribersRouter;
