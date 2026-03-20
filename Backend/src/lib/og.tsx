import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { logger } from "./logger.js";

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

export async function generateOgImageBuffer(title: string, description: string, type: string): Promise<Buffer> {
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
    return pngData.asPng();
}

export function sanitizeOgText(raw: string | undefined, maxLen: number): string {
    return (raw ?? "").replace(/[\x00-\x1F\x7F]/g, "").slice(0, maxLen);
}
