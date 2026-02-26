import { z } from "zod";
import {
    projectSchema,
    skillSchema,
    skillConnectionSchema,
    experienceSchema,
    messageSchema,
    mindsetSchema,
    analyticsSchema,
    articleSchema,
    insertProjectApiSchema,
    insertSkillApiSchema,
    insertExperienceApiSchema,
    insertMessageApiSchema,
    insertAnalyticsSchema,
    insertArticleApiSchema,
} from "./schema.js";

// ==================== ERROR SCHEMAS ====================

export const errorSchemas = {
    validation: z.object({
        message: z.string(),
        errors: z
            .array(
                z.object({
                    path: z.string(),
                    message: z.string(),
                })
            )
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

const createSuccessResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        success: z.boolean(),
        message: z.string(),
        data: dataSchema,
    });

// ==================== API DEFINITION ====================

export const api = {
    // ---------- PROJECTS ----------
    projects: {
        list: {
            method: "GET" as const,
            path: "/api/projects",
            description: "List all projects (public)",
            responses: {
                200: z.array(projectSchema),
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET" as const,
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
            method: "POST" as const,
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
            method: "PUT" as const,
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
            method: "DELETE" as const,
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
            method: "GET" as const,
            path: "/api/skills",
            description: "List all skills (public, cached)",
            responses: {
                200: z.array(skillSchema),
                500: errorSchemas.internal,
            },
        },
        connections: {
            method: "GET" as const,
            path: "/api/skills/connections",
            description: "List all skill connections (public)",
            responses: {
                200: z.array(skillConnectionSchema),
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET" as const,
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
            method: "POST" as const,
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
            method: "PUT" as const,
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
            method: "DELETE" as const,
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

    // ---------- MINDSET ----------
    mindset: {
        list: {
            method: "GET" as const,
            path: "/api/mindset",
            description: "List all engineering mindset principles (public)",
            responses: {
                200: z.array(mindsetSchema),
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET" as const,
            path: "/api/mindset/:id",
            description: "Get single mindset principle by ID (public)",
            responses: {
                200: mindsetSchema,
                400: errorSchemas.badRequest,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
    },

    // ---------- EXPERIENCES ----------
    experiences: {
        list: {
            method: "GET" as const,
            path: "/api/experiences",
            description: "List all experiences (public, cached)",
            responses: {
                200: z.array(experienceSchema),
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET" as const,
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
            method: "POST" as const,
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
            method: "PUT" as const,
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
            method: "DELETE" as const,
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
            method: "GET" as const,
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
            method: "GET" as const,
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
            method: "POST" as const,
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
            method: "DELETE" as const,
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

    // ---------- ANALYTICS ----------
    analytics: {
        track: {
            method: "POST" as const,
            path: "/api/analytics/track",
            description: "Log an analytics event (public)",
            input: insertAnalyticsSchema,
            responses: {
                201: analyticsSchema,
                400: errorSchemas.validation,
                500: errorSchemas.internal,
            },
        },
        summary: {
            method: "GET" as const,
            path: "/api/analytics/summary",
            description: "Get analytics summary (admin only)",
            requiresAuth: true,
            responses: {
                200: z.any(), // Flexibly aggregate summary data
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                500: errorSchemas.internal,
            },
        },
    },

    // ---------- ARTICLES ----------
    articles: {
        list: {
            method: "GET" as const,
            path: "/api/articles",
            description: "List all articles (public/admin)",
            responses: {
                200: z.array(articleSchema as any),
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET" as const,
            path: "/api/articles/:slug",
            description: "Get single article by slug (public)",
            responses: {
                200: articleSchema,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        create: {
            method: "POST" as const,
            path: "/api/articles",
            description: "Create new article (admin only)",
            input: insertArticleApiSchema,
            requiresAuth: true,
            responses: {
                201: articleSchema,
                400: errorSchemas.validation,
                401: errorSchemas.unauthorized,
                500: errorSchemas.internal,
            },
        },
        update: {
            method: "PATCH" as const,
            path: "/api/articles/:id",
            description: "Update article by ID (admin only)",
            input: insertArticleApiSchema.partial(),
            requiresAuth: true,
            responses: {
                200: articleSchema,
                400: errorSchemas.validation,
                401: errorSchemas.unauthorized,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        delete: {
            method: "DELETE" as const,
            path: "/api/articles/:id",
            description: "Delete article by ID (admin only)",
            requiresAuth: true,
            responses: {
                204: z.void(),
                401: errorSchemas.unauthorized,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
    },
};

export type Api = typeof api;
