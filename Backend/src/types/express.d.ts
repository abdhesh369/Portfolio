import { type Request } from "express";

declare global {
    namespace Express {
        interface Request {
            id: string;
            rawBody?: Buffer;
            user?: {
                role: string;
                [key: string]: any;
            };
        }
    }
}
