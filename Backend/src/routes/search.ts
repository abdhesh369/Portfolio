import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { projectService } from "../services/project.service.js";
import { articleService } from "../services/article.service.js";
import { skillService } from "../services/skill.service.js";
import { cachePublic } from "../middleware/cache.js";

const router = Router();

// GET /api/search?q=... - Global portfolio search
router.get(
    "/",
    cachePublic(300), // Cache search results for 5 minutes
    asyncHandler(async (req, res) => {
        const query = (req.query.q as string || "").trim();
        
        if (!query) {
            return res.json({
                projects: [],
                articles: [],
                skills: []
            });
        }

        // Parallel search across categories
        const [projects, articles, allSkills] = await Promise.all([
            projectService.getAll(), // We don't have a specific project search yet, could add one or filter
            articleService.search(query),
            skillService.getAll()
        ]);

        // Filter projects by title or description if not using full-text search yet
        const filteredProjects = projects.filter(p => 
            p.title.toLowerCase().includes(query.toLowerCase()) || 
            p.description.toLowerCase().includes(query.toLowerCase()) ||
            p.techStack.some(t => t.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 5);

        // Filter skills
        const filteredSkills = allSkills.filter(s => 
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10);

        res.json({
            projects: filteredProjects,
            articles: articles, // articleService.search already limits to 10
            skills: filteredSkills
        });
    })
);

export default router;
