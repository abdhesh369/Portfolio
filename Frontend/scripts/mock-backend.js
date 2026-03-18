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

// Settings Mock
const mockSettings = {
    siteName: "Abdhesh Sah | Test",
    siteDescription: "Mocked for E2E",
    heroTitle: "Start building The Future",
    heroSubtitle: "I'm Abdhesh Sah, a Full-Stack Engineer...",
    sectionOrder: ["hero", "about", "skills", "projects", "experience", "blog", "contact"],
    socialLinks: {
        github: "https://github.com/abdhesh369",
        linkedin: "https://linkedin.com/in/abdhesh369"
    }
};

// --- ROUTES ---

app.get('/health', (req, res) => res.json({ status: 'healthy', database: 'connected', redis: 'connected' }));
app.get('/ping', (req, res) => res.json({ status: 'ok' }));

app.get('/api/v1/settings', (req, res) => res.json(mockSettings));
app.get('/api/v1/auth/status', (req, res) => res.json({ success: true, authenticated: false, csrfToken: 'mock-csrf' }));

app.get('/api/v1/projects', (req, res) => res.json([
    { id: 1, title: 'Test Project', slug: 'test-project', description: 'Test Description', image: 'test.png', tags: ['React'], githubUrl: '#', liveUrl: '#' }
]));
app.get('/api/v1/skills', (req, res) => res.json([
    { id: 1, name: 'React', icon: 'react', category: 'frontend', level: 90 }
]));
app.get('/api/v1/skills/connections', (req, res) => res.json([]));
app.get('/api/v1/articles', (req, res) => res.json([
    { id: 1, title: 'Test Article', slug: 'test-article', summary: 'Test Summary', content: 'Test Content', status: 'published', publishedAt: new Date().toISOString() }
]));

app.get('/api/v1/experiences', (req, res) => res.json([]));
app.get('/api/v1/services', (req, res) => res.json([]));
app.get('/api/v1/testimonials', (req, res) => res.json([]));
app.get('/api/v1/mindset', (req, res) => res.json([]));
app.get('/api/v1/seo/home', (req, res) => res.json({ title: "Home", description: "Home Description" }));
app.get('/api/v1/seo/blog', (req, res) => res.json({ title: "Blog", description: "Blog Description" }));

app.get('/api/v1/github/latest-commit', (req, res) => res.json({ sha: 'mock-sha', message: 'mock message' }));
app.get('/api/v1/github/activity/latest', (req, res) => res.json([]));
app.get('/api/v1/github/contributions', (req, res) => res.json({ totalContributions: 1000, weeks: [] }));
app.get('/api/v1/github/activity', (req, res) => res.json([]));

app.get('/api/v1/analytics/vitals', (req, res) => res.json({ success: true }));
app.get('/api/v1/analytics/live-visitors', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write('data: {"count": 1}\n\n');
});

// Admin Login
app.post('/api/v1/auth/login', (req, res) => {
    const { password } = req.body;
    console.log(`[Mock Backend] Login attempt with password: ${password}`);
    
    // In e2e/admin-flow.spec.ts, we use 'mock-password' or 'wrong-password-12345'
    if (password === 'mock-password') {
        res.json({ success: true, message: 'Login successful', csrfToken: 'mock-csrf' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid or incorrect password' });
    }
});


app.post('/api/v1/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

// Catch-all for other API routes to prevent 404s breaking the UI
app.all(/^\/api\/v1\/.*/, (req, res) => {
    console.log(`[Mock Backend] [CATCH-ALL] ${req.method} ${req.url}`);
    res.json({ success: true, mocked: true });
});


const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Mock Backend] Running on http://localhost:${PORT}`);
});

