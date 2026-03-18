import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Logging
app.use((req, res, next) => {
    console.log(`[Mock Backend] ${req.method} ${req.url}`);
    next();
});

// Mock data
const mockData = {
    settings: {
        personalName: "Abdhesh Sah",
        personalTitle: "Full-Stack Engineer",
        personalBio: "Passionate about building digital experiences...",
        logoText: "Abdhesh.Sah",
        heroHeadingLine1: "Start building",
        heroHeadingLine2: "The Future",
        heroTaglines: ["Engineering scalable systems.", "Crafting intuitive interfaces."],
        socialEmail: "admin@example.com",
        socialGithub: "https://github.com/username",
        socialLinkedin: "https://linkedin.com/in/username",
        footerTagline: "Building the future, one line of code at a time.",
        locationText: "Earth",
        isOpenToWork: true,
        sectionOrder: ["hero", "about", "skills", "projects", "experience", "blog", "contact"],
        sectionVisibility: {},
        featureBlog: true,
        featureGuestbook: true,
        navbarLinks: []
    },
    projects: [
        {
            id: '1',
            title: "Portfolio Website",
            slug: "portfolio-website",
            description: "Modern portfolio website...",
            techStack: ["React", "TypeScript", "Express"],
            imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800",
            category: "Web",
            status: "Completed",
            githubUrl: "https://github.com/username/project",
            liveUrl: "https://example.com",
            isHidden: false,
            isFlagship: true,
            displayOrder: 1,
            viewCount: 100,
            createdAt: new Date().toISOString()
        }
    ],
    skills: [
        { name: "React", category: "Frontend", icon: "Code2", status: "Core", x: 70, y: 60, description: "Frontend library", proof: "Portfolio" }
    ],
    experiences: [
        { role: "Developer", organization: "Open Source", period: "2023 - Present", startDate: "2023-01-01", description: "Building things.", type: "Experience" }
    ],
    mindsets: [],
    services: [],
    testimonials: [],
    articles: []
};

// Authentication states
let isAuthenticated = false;

// --- API ROUTES ---

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', mocked: true });
});

// Admin Auth
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

// Site Settings
app.get('/api/v1/settings', (req, res) => {
    res.json(mockData.settings);
});

// Projects
app.get('/api/v1/projects', (req, res) => {
    res.json(mockData.projects);
});

app.get('/api/v1/projects/:idOrSlug', (req, res) => {
    res.json(mockData.projects[0]);
});

// Skills
app.get('/api/v1/skills', (req, res) => {
    res.json(mockData.skills);
});
app.get('/api/v1/skills/connections', (req, res) => res.json([]));

// Other data endpoints to prevent 404s
app.get('/api/v1/experiences', (req, res) => res.json(mockData.experiences));
app.get('/api/v1/mindset', (req, res) => res.json(mockData.mindsets));
app.get('/api/v1/services', (req, res) => res.json(mockData.services));
app.get('/api/v1/testimonials', (req, res) => res.json(mockData.testimonials));
app.get('/api/v1/articles', (req, res) => res.json(mockData.articles));
app.get('/api/v1/seo/:slug', (req, res) => res.json({ title: "Mock Title", description: "Mock Description" }));

// Github activity
app.get(/^\/api\/v1\/github\/.*/, (req, res) => res.json([]));

// Analytics (SSE)
app.get('/api/v1/analytics/live-visitors', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    
    // Send initial count
    res.write('data: {"count": 1}\n\n');
    
    // Keep alive interval
    const interval = setInterval(() => {
        res.write(': keep-alive\n\n');
    }, 15000);
    
    req.on('close', () => {
        clearInterval(interval);
        res.end();
    });
});

// Analytics tracking (204 No Content)
app.post('/api/v1/analytics/track', (req, res) => res.status(204).end());
app.post('/api/v1/analytics/vitals', (req, res) => res.status(204).end());

// Catch-all
app.all(/^\/api\/v1\/.*/, (req, res) => {
    console.log(`[Mock Backend] [CATCH-ALL] ${req.method} ${req.url}`);
    res.json({ success: true, mocked: true });
});

const PORT = 5000;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`[Mock Backend] Server running on http://127.0.0.1:${PORT}`);
});
