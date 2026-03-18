import { Router } from "express";

const router = Router();

export const getSitemap = async (_req: any, res: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    const baseUrl = process.env.PUBLIC_URL || process.env.FRONTEND_URL || "https://abdheshsah.com.np";
    if (!process.env.PUBLIC_URL && !process.env.FRONTEND_URL) {
      console.warn("Sitemap: Neither PUBLIC_URL nor FRONTEND_URL found, defaulting to https://abdheshsah.com.np");
    }

    const { projectService } = await import("../services/project.service.js");
    const { articleService } = await import("../services/article.service.js");

    const projects = await projectService.getAll();
    const articles = await articleService.getAll();

    const staticPages = [
      "",
      "/projects",
      "/articles",
      "/about",
      "/contact"
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static pages
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page}</loc>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    // Projects
    projects.forEach(p => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/projects/${p.slug}</loc>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });

    // Articles
    articles.forEach(a => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/articles/${a.slug}</loc>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error("Sitemap error:", error);
    res.status(500).send("Error generating sitemap");
  }
};

router.get("/", getSitemap);

export { router as sitemapRoutes };
