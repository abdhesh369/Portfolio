import { Router, Response } from "express";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { asyncHandler } from "../lib/async-handler.js";
import { logger } from "../lib/logger.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Cache for the font buffer
let fontBuffer: ArrayBuffer | null = null;

async function getFont() {
    if (fontBuffer) return fontBuffer;
    
    try {
        const fontUrl = "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff";
        const response = await fetch(fontUrl);
        if (!response.ok) throw new Error("Failed to fetch font");
        fontBuffer = await response.arrayBuffer();
        return fontBuffer;
    } catch (error) {
        logger.error({ error }, "Failed to load font for OG images");
        throw error;
    }
}

async function generateOgImage(res: Response, title: string, description: string, type: string) {
    try {
        const fontData = await getFont();

        const svg = await satori(
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    backgroundImage: 'linear-gradient(to bottom right, #0f172a, #1eccd1)',
                    padding: '80px',
                    fontFamily: 'Inter',
                    color: 'white',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '20px',
                        color: '#38bdf8',
                    }}
                >
                    {type.toUpperCase()}
                </div>
                <div
                    style={{
                        fontSize: '72px',
                        fontWeight: 'bold',
                        lineHeight: 1.1,
                        marginBottom: '30px',
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        fontSize: '32px',
                        opacity: 0.8,
                        maxWidth: '800px',
                    }}
                >
                    {description}
                </div>
                <div
                    style={{
                        position: 'absolute',
                        bottom: '80px',
                        right: '80px',
                        fontSize: '24px',
                        fontWeight: 'bold',
                    }}
                >
                    abdheshsah.com.np
                </div>
            </div>,
            {
                width: 1200,
                height: 630,
                fonts: [
                    {
                        name: 'Inter',
                        data: fontData,
                        weight: 700,
                        style: 'normal',
                    },
                ],
            }
        );

        const resvg = new Resvg(svg, {
            fitTo: {
                mode: 'width',
                value: 1200,
            },
        });

        const pngData = resvg.render();
        const pngBuffer = pngData.asPng();

        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.send(pngBuffer);
    } catch (error) {
        logger.error({ error }, "OG Image generation failed");
        res.status(500).send("Internal Server Error");
    }
}

function sanitizeOgText(raw: string | undefined, maxLen: number): string {
    return (raw ?? "").replace(/[\x00-\x1F\x7F]/g, "").slice(0, maxLen);
}

// Default OG generation via query params
router.get("/", asyncHandler(async (req, res) => {
    const title = sanitizeOgText(req.query.title as string, 80) || "Portfolio";
    const description = sanitizeOgText(req.query.description as string, 160) || "Full Stack Developer & Software Engineer";
    const type = sanitizeOgText(req.query.type as string, 40) || "portfolio";
    await generateOgImage(res, title, description, type);
}));

import { projectService } from "../services/project.service.js";
import { articleService } from "../services/article.service.js";

// GET /og/project/:slug
router.get("/project/:slug", asyncHandler(async (req, res) => {
    const project = await projectService.getBySlug(req.params.slug);
    if (!project) return res.status(404).send("Project not found");
    await generateOgImage(res, project.title, project.summary || project.description, "Project Case Study");
}));

// GET /og/article/:slug
router.get("/article/:slug", asyncHandler(async (req, res) => {
    const article = await articleService.getBySlug(req.params.slug);
    if (!article) return res.status(404).send("Article not found");
    await generateOgImage(res, article.title, article.excerpt || "Read more on my blog", "Tech Article");
}));

export default router;
