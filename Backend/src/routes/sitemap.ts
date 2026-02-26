import { Router } from "express";
import { storage } from "../storage.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const baseUrl = process.env.VITE_PUBLIC_URL || "https://abdheshsah.com.np";
    const seoSettings = await storage.getSeoSettings();
    const projects = await storage.getProjects();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static pages from SEO settings
    seoSettings.forEach((page) => {
      // Don't include noindex pages in sitemap
      if (page.noindex) return;

      const slug = page.pageSlug === "home" ? "" : page.pageSlug;
      const url = `${baseUrl}/${slug}`;
      const lastMod = new Date(page.updatedAt || new Date()).toISOString();
      const priority = page.pageSlug === "home" ? "1.0" : "0.8";

      xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });

    // Dynamic project pages
    projects.forEach((project) => {
      const url = `${baseUrl}/project/${project.id}`;
      const priority = "0.7";

      xml += `
  <url>
    <loc>${url}</loc>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });

    // Dynamic blog articles
    const articles = await storage.getArticles("published");
    articles.forEach((article) => {
      const url = `${baseUrl}/blog/${article.slug}`;
      const lastMod = new Date(article.updatedAt || new Date()).toISOString();
      const priority = "0.6";

      xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
