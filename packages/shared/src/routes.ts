import { z } from "zod";
import {
    projectSchema,
    skillSchema,
    skillConnectionSchema,
    experienceSchema,
    messageSchema,
    analyticsSchema,
    serviceSchema,
    insertProjectApiSchema,
    insertSkillApiSchema,
    insertExperienceApiSchema,
    insertMessageApiSchema,
    insertAnalyticsSchema,
    insertServiceApiSchema,
    testimonialSchema,
    insertTestimonialApiSchema,
    articleSchema,
    articleWithRelatedSchema,
    insertArticleApiSchema,
    seoSettingsSchema,
    insertSeoSettingsApiSchema,
    mindsetSchema,
    insertMindsetApiSchema,
    auditLogSchema,
    emailTemplateSchema,
    insertEmailTemplateApiSchema,
    guestbookSchema,
    insertGuestbookApiSchema,
    siteSettingsSchema,
    insertSiteSettingsApiSchema,
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
            path: "/api/v1/projects",
            description: "List all projects (public)",
            responses: {
                200: z.array(projectSchema),
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET" as const,
            path: "/api/v1/projects/:id",
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
            path: "/api/v1/projects",
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
            path: "/api/v1/projects/:id",
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
            path: "/api/v1/projects/:id",
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
        reorder: {
            method: "PUT" as const,
            path: "/api/v1/projects/reorder",
            description: "Reorder projects (admin only)",
            requiresAuth: true,
            input: z.object({ orderedIds: z.array(z.number()) }),
            responses: {
                204: z.void(),
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                500: errorSchemas.internal,
            },
        },
        bulkDelete: {
            method: "POST" as const,
            path: "/api/v1/projects/bulk-delete",
            description: "Bulk delete projects (admin only)",
            requiresAuth: true,
            input: z.object({ ids: z.array(z.number()) }),
            responses: {
                204: z.void(),
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                500: errorSchemas.internal,
            },
        },
        bulkStatus: {
            method: "POST" as const,
            path: "/api/v1/projects/bulk-status",
            description: "Bulk update project status (admin only)",
            requiresAuth: true,
            input: z.object({
                ids: z.array(z.number()),
                status: z.enum(["In Progress", "Completed", "Archived"]),
            }),
            responses: {
                204: z.void(),
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                500: errorSchemas.internal,
            },
        },
    },

    // ---------- SKILLS ----------
    skills: {
        list: {
            method: "GET" as const,
            path: "/api/v1/skills",
            description: "List all skills (public, cached)",
            responses: {
                200: z.array(skillSchema),
                500: errorSchemas.internal,
            },
        },
        connections: {
            method: "GET" as const,
            path: "/api/v1/skills/connections",
            description: "List all skill connections (public)",
            responses: {
                200: z.array(skillConnectionSchema),
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET" as const,
            path: "/api/v1/skills/:id",
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
            path: "/api/v1/skills",
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
            path: "/api/v1/skills/:id",
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
            path: "/api/v1/skills/:id",
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
        bulkDelete: {
            method: "POST" as const,
            path: "/api/v1/skills/bulk-delete",
            description: "Bulk delete skills (admin only)",
            requiresAuth: true,
            input: z.object({ ids: z.array(z.number()) }),
            responses: {
                204: z.void(),
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                500: errorSchemas.internal,
            },
        },
    },

    // ---------- MINDSET ----------
    mindset: {
        list: {
            method: "GET" as const,
            path: "/api/v1/mindset",
            description: "List all engineering mindset principles (public)",
            responses: {
                200: z.array(mindsetSchema),
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET" as const,
            path: "/api/v1/mindset/:id",
            description: "Get single mindset principle",
            responses: {
                200: mindsetSchema,
                400: errorSchemas.badRequest,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        create: {
            method: "POST" as const,
            path: "/api/v1/mindset",
            description: "Create new mindset principle (admin only)",
            input: insertMindsetApiSchema,
            requiresAuth: true,
            responses: {
                201: createSuccessResponse(mindsetSchema),
                400: errorSchemas.validation,
                401: errorSchemas.unauthorized,
                500: errorSchemas.internal,
            },
        },
        update: {
            method: "PATCH" as const,
            path: "/api/v1/mindset/:id",
            description: "Update mindset principle by ID (admin only)",
            input: insertMindsetApiSchema.partial(),
            requiresAuth: true,
            responses: {
                200: createSuccessResponse(mindsetSchema),
                400: errorSchemas.validation,
                401: errorSchemas.unauthorized,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        delete: {
            method: "DELETE" as const,
            path: "/api/v1/mindset/:id",
            description: "Delete mindset principle by ID (admin only)",
            requiresAuth: true,
            responses: {
                204: z.void(),
                401: errorSchemas.unauthorized,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
    },

    // ---------- EXPERIENCES ----------
    experiences: {
        list: {
            method: "GET" as const,
            path: "/api/v1/experiences",
            description: "List all experiences (public, cached)",
            responses: {
                200: z.array(experienceSchema),
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET" as const,
            path: "/api/v1/experiences/:id",
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
            path: "/api/v1/experiences",
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
            path: "/api/v1/experiences/:id",
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
            path: "/api/v1/experiences/:id",
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

    // ---------- SERVICES ----------
    services: {
        list: {
            method: "GET" as const,
            path: "/api/v1/services",
            description: "List all services (public, cached)",
            responses: {
                200: z.array(serviceSchema),
                500: errorSchemas.internal,
            },
        },
        get: {
            method: "GET" as const,
            path: "/api/v1/services/:id",
            description: "Get single service by ID (public)",
            responses: {
                200: serviceSchema,
                400: errorSchemas.badRequest,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        create: {
            method: "POST" as const,
            path: "/api/v1/services",
            description: "Create new service (admin only)",
            input: insertServiceApiSchema,
            requiresAuth: true,
            responses: {
                201: createSuccessResponse(serviceSchema),
                400: errorSchemas.validation,
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                500: errorSchemas.internal,
            },
        },
        update: {
            method: "PATCH" as const,
            path: "/api/v1/services/:id",
            description: "Update service by ID (admin only)",
            input: insertServiceApiSchema.partial(),
            requiresAuth: true,
            responses: {
                200: createSuccessResponse(serviceSchema),
                400: errorSchemas.validation,
                401: errorSchemas.unauthorized,
                403: errorSchemas.forbidden,
                404: errorSchemas.notFound,
                500: errorSchemas.internal,
            },
        },
        delete: {
            method: "DELETE" as const,
            path: "/api/v1/services/:id",
            description: "Delete service by ID (admin only)",
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
            path: "/api/v1/messages",
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
            path: "/api/v1/messages/:id",
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
            path: "/api/v1/messages",
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
            path: "/api/v1/messages/:id",
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
            path: "/api/v1/analytics/track",
            description: "Log an analytics event (public)",
            input: insertAnalyticsSchema,
            responses: {
                201: createSuccessResponse(analyticsSchema),
                400: errorSchemas.validation,
                500: errorSchemas.internal,
            },
        },
        summary: {
            method: "GET" as const,
            path: "/api/v1/analytics/summary",
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
    liveVisitorCount: {
        method: "GET" as const,
        path: "/api/v1/analytics/live-visitors/count",
        description: "Get live visitor count for polling fallback",
        responses: {
            200: z.object({ count: z.number() }),
            500: errorSchemas.internal,
        },
    },
},

    // ---------- TESTIMONIALS ----------
    [...lines 557 - 811 ...]
// ---------- GUESTBOOK ----------
guestbook: {
    list: {
        method: "GET" as const,
            path: "/api/v1/guestbook",
                description: "List all approved guestbook entries (public)",
                    responses: {
            200: z.array(guestbookSchema),
                500: errorSchemas.internal,
            },
    },
    create: {
        method: "POST" as const,
            path: "/api/v1/guestbook",
                description: "Submit guestbook entry (public, rate-limited)",
                    input: insertGuestbookApiSchema,
                        responses: {
            201: createSuccessResponse(guestbookSchema),
                400: errorSchemas.validation,
                    500: errorSchemas.internal,
            },
    },
    react: {
        method: "POST" as const,
            path: "/api/v1/guestbook/:id/react",
                description: "React to guestbook entry",
                    input: z.object({ emoji: z.string() }),
                        responses: {
            200: createSuccessResponse(guestbookSchema),
                400: errorSchemas.validation,
                    404: errorSchemas.notFound,
                        500: errorSchemas.internal,
            },
    },
    adminList: {
        method: "GET" as const,
            path: "/api/v1/guestbook/admin",
                description: "List all guestbook entries (admin only)",
                    requiresAuth: true,
                        responses: {
            200: z.array(guestbookSchema),
                401: errorSchemas.unauthorized,
                    403: errorSchemas.forbidden,
                        500: errorSchemas.internal,
            },
    },
    approve: {
        method: "PATCH" as const,
            path: "/api/v1/admin/guestbook/:id/approve",
                description: "Approve guestbook entry (admin only)",
                    requiresAuth: true,
                        responses: {
            200: createSuccessResponse(guestbookSchema),
                401: errorSchemas.unauthorized,
                    403: errorSchemas.forbidden,
                        404: errorSchemas.notFound,
                            500: errorSchemas.internal,
            },
    },
    delete: {
        method: "DELETE" as const,
            path: "/api/v1/admin/guestbook/:id",
                description: "Delete guestbook entry (admin only)",
                    requiresAuth: true,
                        responses: {
            204: z.void(),
                401: errorSchemas.unauthorized,
                    403: errorSchemas.forbidden,
                        404: errorSchemas.notFound,
                            500: errorSchemas.internal,
            },
    },
},

// ---------- CHAT ----------
chat: {
    send: {
        method: "POST" as const,
            path: "/api/v1/chat",
                description: "Send message to AI assistant (public, rate limited)",
                    input: z.object({
                        messages: z.array(z.object({
                            role: z.enum(["user", "model"]),
                            parts: z.array(z.object({
                                text: z.string()
                            }))
                        }))
                    }),
                        responses: {
            200: createSuccessResponse(z.object({ message: z.string() })),
                400: errorSchemas.validation,
                    429: z.object({ success: z.literal(false), message: z.string(), details: z.string().optional() }),
                        500: errorSchemas.internal,
            },
    },
},
// ---------- AUDIT LOG ----------
auditLog: {
    list: {
        method: "GET" as const,
            path: "/api/v1/admin/audit-log",
                description: "List audit log entries (admin only)",
                    requiresAuth: true,
                        responses: {
            200: z.object({
                entries: z.array(auditLogSchema),
                total: z.number(),
            }),
                401: errorSchemas.unauthorized,
                    403: errorSchemas.forbidden,
                        500: errorSchemas.internal,
            },
    },
},
// ---------- SETTINGS ----------
settings: {
    get: {
        method: "GET" as const,
            path: "/api/v1/settings",
                description: "Get site settings (public)",
                    responses: {
            200: siteSettingsSchema,
                500: errorSchemas.internal,
            },
    },
    update: {
        method: "PATCH" as const,
            path: "/api/v1/settings",
                description: "Update site settings (admin only)",
                    requiresAuth: true,
                        input: insertSiteSettingsApiSchema,
                            responses: {
            200: createSuccessResponse(siteSettingsSchema),
                400: errorSchemas.validation,
                    401: errorSchemas.unauthorized,
                        403: errorSchemas.forbidden,
                            500: errorSchemas.internal,
            },
    }
}
};

export type Api = typeof api;
