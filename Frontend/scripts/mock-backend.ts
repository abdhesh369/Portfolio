import express from 'express';
import cors from 'cors';
import { 
    siteSettingsSchema, 
    projectSchema, 
    skillSchema, 
    experienceSchema, 
    seoSettingsSchema
} from '../../packages/shared/src/schema.js';
import { api } from '../../packages/shared/src/routes.js';
// Use Zod v3 from root node_modules (matching @portfolio/shared) to avoid v3/v4 mismatch
import { z } from '../../node_modules/zod/index.js';

const app = express();
app.use(cors());
app.use(express.json());

const CHAOS_MODE = process.env.CHAOS_MODE === 'true';

// Mock data
const mockData = {
    settings: {
        id: 1,
        personalName: "Abdhesh Sah",
        personalTitle: "Full-Stack Engineer",
        personalBio: "Passionate about building digital experiences...",
        personalAvatar: null,
        resumeUrl: null,
        whyHireMeData: null,
        aboutAvailability: "Open to Work",
        aboutDescription: "Building scalable web systems...",
        aboutTechStack: ["React", "Node.js", "TypeScript"],
        aboutTimeline: [],
        aboutInfoCards: [],
        socialEmail: "admin@example.com",
        socialGithub: "https://github.com/username",
        socialLinkedin: "https://linkedin.com/in/username",
        socialTwitter: null,
        socialInstagram: null,
        socialFacebook: null,
        socialYoutube: null,
        socialDiscord: null,
        socialStackoverflow: null,
        socialDevto: null,
        socialMedium: null,
        locationText: "Earth",
        isOpenToWork: true,
        availabilityStatus: "Available",
        logoText: "Abdhesh.Sah",
        heroGreeting: "Hey, I am",
        heroBadgeText: "Available for work",
        heroTaglines: ["Engineering scalable systems.", "Crafting intuitive interfaces."],
        heroHeadingLine1: "Start building",
        heroHeadingLine2: "The Future",
        heroCtaPrimary: "View My Work",
        heroCtaPrimaryUrl: "#projects",
        heroCtaSecondary: "Get In Touch",
        heroCtaSecondaryUrl: "#contact",
        navbarLinks: [],
        footerCopyright: "© 2024 Abdhesh Sah",
        footerTagline: "Building the future, one line of code at a time.",
        sectionOrder: ["hero", "about", "skills", "projects", "experience", "blog", "contact"],
        sectionVisibility: {
            hero: true, about: true, projects: true, skills: true,
            experience: true, contact: true
        },
        availabilitySlots: [],
        featureBlog: true,
        featureGuestbook: true,
        featureTestimonials: true,
        featureServices: true,
        featurePlayground: false,
        chatbotGreeting: "Hi! How can I help?",
        updatedAt: new Date().toISOString()
    },
    projects: [
        {
            id: 1,
            title: "Portfolio Website",
            slug: "portfolio-website",
            description: "Modern portfolio website...",
            longDescription: null,
            techStack: ["React", "TypeScript", "Express"],
            imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800",
            githubUrl: "https://github.com/username/project",
            liveUrl: "https://example.com",
            category: "Web",
            displayOrder: 1,
            status: "Completed",
            problemStatement: null,
            motivation: null,
            systemDesign: null,
            challenges: null,
            learnings: null,
            isFlagship: true,
            isHidden: false,
            impact: null,
            role: null,
            imageAlt: "Portfolio",
            viewCount: 100,
            summary: "A modern build.",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ],
    skills: [
        { 
            id: 1,
            name: "React", 
            category: "Frontend", 
            icon: "Code2", 
            status: "Core", 
            x: 70, 
            y: 60, 
            description: "Frontend library", 
            proof: "Portfolio",
            mastery: 90
        }
    ],
    experiences: [
        { 
            id: 1,
            role: "Developer", 
            organization: "Open Source", 
            period: "2023 - Present", 
            startDate: "2023-01-01", 
            endDate: null,
            description: "Building things.", 
            type: "Experience" 
        }
    ],
    mindsets: [],
    services: [],
    testimonials: [],
    articles: [],
    seo: {
        id: 1,
        pageSlug: "home",
        metaTitle: "Abdhesh Sah | Portfolio",
        metaDescription: "Full-Stack Engineer Portfolio",
        ogTitle: null,
        ogDescription: null,
        ogImage: null,
        keywords: null,
        canonicalUrl: null,
        noindex: false,
        twitterCard: "summary_large_image",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
};

// --- STARTUP VALIDATION ---
console.log("[Mock Backend] Validating mock data against shared schemas...");
try {
    siteSettingsSchema.parse(mockData.settings);
    mockData.projects.forEach(p => projectSchema.parse(p));
    mockData.skills.forEach(s => skillSchema.parse(s));
    mockData.experiences.forEach(e => experienceSchema.parse(e));
    seoSettingsSchema.parse(mockData.seo);
    console.log("[Mock Backend] \u2705 Mock data is valid.");
} catch (err: unknown) {
    console.error("[Mock Backend] \u274C Mock data validation failed!");
    if (err instanceof z.ZodError) {
        console.error(JSON.stringify(err.errors, null, 2));
    } else {
        console.error(err);
    }
    process.exit(1);
}

// --- MIDDLEWARE ---

// Logging
app.use((req, res, next) => {
    console.log(`[Mock Backend] ${req.method} ${req.url}`);
    next();
});

// Chaos Middleware
app.use((req, res, next) => {
    if (CHAOS_MODE && Math.random() < 0.1) {
        const dice = Math.random();
        if (dice < 0.33) {
            console.warn(`[CHAOS] Injecting 500 error for ${req.url}`);
            return res.status(500).json({ error: "Internal Server Error (CHAOS)" });
        } else if (dice < 0.66) {
            console.warn(`[CHAOS] Injecting 3s delay for ${req.url}`);
            return setTimeout(next, 3000);
        } else {
            console.warn(`[CHAOS] Injecting schema violation for ${req.url}`);
            (res as any)._injectSchemaViolation = true;
            next();
        }
    } else {
        next();
    }
});

// Response Validation Middleware
const originalJson = app.response.json;
app.response.json = function(data) {
    const req = this.req;
    const res = this;
    
    // Find matching route in shared api definition
    let matchingRoute: any = null;
    
    // Simple path matching logic
    const purePath = req.url.split('?')[0];
    
    if (purePath === '/api/v1/settings') matchingRoute = api.settings.get;
    else if (purePath === '/api/v1/projects' && req.method === 'GET') matchingRoute = api.projects.list;
    else if (purePath.startsWith('/api/v1/projects/') && req.method === 'GET') matchingRoute = api.projects.get;
    else if (purePath === '/api/v1/skills' && req.method === 'GET') matchingRoute = api.skills.list;
    else if (purePath === '/api/v1/experiences' && req.method === 'GET') matchingRoute = api.experiences.list;
    
    if (matchingRoute && matchingRoute.responses && matchingRoute.responses[200]) {
        try {
            let dataToValidate = data;
            if ((res as any)._injectSchemaViolation) {
                dataToValidate = { ...data, unexpectedChaosField: "BOOM", id: "not-a-number" };
            }
            
            matchingRoute.responses[200].parse(dataToValidate);
            if ((res as any)._injectSchemaViolation) {
                 return originalJson.call(res, dataToValidate);
            }
        } catch (err: unknown) {
            if ((res as any)._injectSchemaViolation) {
                console.warn(`[Mock Backend] [CHAOS] Schema violation injected correctly: ${req.url}`);
            } else {
                console.error(`[Mock Backend] [CONTRACT VIOLATION] Response for ${req.url} does not match schema!`);
                if (err instanceof z.ZodError) {
                    console.error(JSON.stringify(err.errors, null, 2));
                }
            }
        }
    }
    
    return originalJson.call(this, data);
};

// --- API ROUTES ---

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', mocked: true });
});

let isAuthenticated = false;
app.post('/api/v1/auth/login', (req, res) => {
    const { password } = req.body;
    if (password === 'mock-password') {
        isAuthenticated = true;
        res.json({ success: true, user: { role: 'admin' }, csrfToken: 'mock-csrf' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
    }
});

app.post('/api/v1/auth/logout', (req, res) => {
    isAuthenticated = false;
    res.json({ success: true });
});

app.get('/api/v1/auth/status', (req, res) => {
    res.json({ authenticated: isAuthenticated, user: isAuthenticated ? { role: 'admin' } : null, success: true });
});

app.get('/api/v1/settings', (req, res) => {
    res.json(mockData.settings);
});

app.get('/api/v1/projects', (req, res) => {
    res.json(mockData.projects);
});

app.get('/api/v1/projects/:idOrSlug', (req, res) => {
    res.json(mockData.projects[0]);
});

app.get('/api/v1/skills', (req, res) => {
    res.json(mockData.skills);
});
app.get('/api/v1/skills/connections', (req, res) => res.json([]));

app.get('/api/v1/experiences', (req, res) => res.json(mockData.experiences));
app.get('/api/v1/mindset', (req, res) => res.json(mockData.mindsets));
app.get('/api/v1/services', (req, res) => res.json(mockData.services));
app.get('/api/v1/testimonials', (req, res) => res.json(mockData.testimonials));
app.get('/api/v1/articles', (req, res) => res.json(mockData.articles));
app.get('/api/v1/seo/:slug', (req, res) => res.json(mockData.seo));

app.get('/api/v1/analytics/live-visitors', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write('data: {"count": 1}\n\n');
    const interval = setInterval(() => { res.write(': keep-alive\n\n'); }, 15000);
    req.on('close', () => { clearInterval(interval); res.end(); });
});

app.post('/api/v1/analytics/track', (req, res) => res.status(204).end());
app.post('/api/v1/analytics/vitals', (req, res) => res.status(204).end());

app.all(/^\/api\/v1\/.*/, (req, res) => {
    res.json({ success: true, mocked: true });
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Mock Backend] Server running on http://0.0.0.0:${PORT}`);
});
