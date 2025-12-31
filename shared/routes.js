import { z } from "zod";
import { projectSchema, skillSchema, experienceSchema, messageSchema, insertProjectApiSchema, insertSkillApiSchema, insertExperienceApiSchema, insertMessageApiSchema, } from "./schema.js";
// ==================== ERROR SCHEMAS ====================
export const errorSchemas = {
    validation: z.object({
        message: z.string(),
        errors: z
            .array(z.object({
            path: z.string(),
            message: z.string(),
        }))
            .optional(),
    }),
    badRequest: z.object({
        message: z.string(),
    }),
    unauthorized: z.object({
        message: z.string(),
    }),
    forbidden: z.object({
        message: z.string(),
    }),
    notFound: z.object({
        message: z.string(),
    }),
    internal: z.object({
        message: z.string(),
    }),
};
// ==================== SHARED RESPONSE SCHEMAS ====================
const createSuccessResponse = (dataSchema) => z.object({
    success: z.boolean(),
    message: z.string(),
    data: dataSchema,
});
// ==================== API DEFINITION ====================
export const api = {
    // ---------- PROJECTS ----------
    projects: {
        list: {
            method: "GET",
            path: "/api/projects",
            description: "List all projects (public)",
            responses: {
                200: z.array(projectSchema),
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET",
            path: "/api/projects/:id",
            description: "Get single project by ID (public)",
            responses: {
                200: projectSchema,
                400: errorSchemas.badRequest,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        create: {
            method: "POST",
            path: "/api/projects",
            description: "Create new project (admin only)",
            input: insertProjectApiSchema,
            requiresAuth: true,
            responses: {
                201: createSuccessResponse(projectSchema),
                400: errorSchemas.validation,
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                500: errorSchemas.internal,
            },
        },
        update: {
            method: "PUT",
            path: "/api/projects/:id",
            description: "Update project by ID (admin only)",
            input: insertProjectApiSchema.partial(),
            requiresAuth: true,
            responses: {
                200: createSuccessResponse(projectSchema),
                400: errorSchemas.validation,
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        delete: {
            method: "DELETE",
            path: "/api/projects/:id",
            description: "Delete project by ID (admin only)",
            requiresAuth: true,
            responses: {
                204: z.void(),
                400: errorSchemas.badRequest,
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
    },
    // ---------- SKILLS ----------
    skills: {
        list: {
            method: "GET",
            path: "/api/skills",
            description: "List all skills (public, cached)",
            responses: {
                200: z.array(skillSchema),
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET",
            path: "/api/skills/:id",
            description: "Get single skill by ID (public)",
            responses: {
                200: skillSchema,
                400: errorSchemas.badRequest,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        create: {
            method: "POST",
            path: "/api/skills",
            description: "Create new skill (admin only)",
            input: insertSkillApiSchema,
            requiresAuth: true,
            responses: {
                201: createSuccessResponse(skillSchema),
                400: errorSchemas.validation,
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                500: errorSchemas.internal,
            },
        },
        update: {
            method: "PUT",
            path: "/api/skills/:id",
            description: "Update skill by ID (admin only)",
            input: insertSkillApiSchema.partial(),
            requiresAuth: true,
            responses: {
                200: createSuccessResponse(skillSchema),
                400: errorSchemas.validation,
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        delete: {
            method: "DELETE",
            path: "/api/skills/:id",
            description: "Delete skill by ID (admin only)",
            requiresAuth: true,
            responses: {
                204: z.void(),
                400: errorSchemas.badRequest,
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
    },
    // ---------- EXPERIENCES ----------
    experiences: {
        list: {
            method: "GET",
            path: "/api/experiences",
            description: "List all experiences (public, cached)",
            responses: {
                200: z.array(experienceSchema),
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET",
            path: "/api/experiences/:id",
            description: "Get single experience by ID (public)",
            responses: {
                200: experienceSchema,
                400: errorSchemas.badRequest,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        create: {
            method: "POST",
            path: "/api/experiences",
            description: "Create new experience (admin only)",
            input: insertExperienceApiSchema,
            requiresAuth: true,
            responses: {
                201: createSuccessResponse(experienceSchema),
                400: errorSchemas.validation,
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                500: errorSchemas.internal,
            },
        },
        update: {
            method: "PUT",
            path: "/api/experiences/:id",
            description: "Update experience by ID (admin only)",
            input: insertExperienceApiSchema.partial(),
            requiresAuth: true,
            responses: {
                200: createSuccessResponse(experienceSchema),
                400: errorSchemas.validation,
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        delete: {
            method: "DELETE",
            path: "/api/experiences/:id",
            description: "Delete experience by ID (admin only)",
            requiresAuth: true,
            responses: {
                204: z.void(),
                400: errorSchemas.badRequest,
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
    },
    // ---------- MESSAGES ----------
    messages: {
        list: {
            method: "GET",
            path: "/api/messages",
            description: "List all messages (admin only)",
            requiresAuth: true,
            responses: {
                200: z.array(messageSchema),
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET",
            path: "/api/messages/:id",
            description: "Get single message by ID (admin only)",
            requiresAuth: true,
            responses: {
                200: messageSchema,
                400: errorSchemas.badRequest,
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        create: {
            method: "POST",
            path: "/api/messages",
            description: "Submit contact form (public, rate-limited)",
            input: insertMessageApiSchema,
            responses: {
                201: createSuccessResponse(messageSchema),
                400: errorSchemas.validation,
                429: z.object({
                    message: z.string(),
                }),
                500: errorSchemas.internal,
            },
        },
        delete: {
            method: "DELETE",
            path: "/api/messages/:id",
            description: "Delete message by ID (admin only)",
            requiresAuth: true,
            responses: {
                204: z.void(),
                400: errorSchemas.badRequest,
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
    },
};
