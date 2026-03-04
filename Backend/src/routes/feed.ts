import { Router } from "express";
import { articleService } from "../services/article.service.js";
import type { Article } from "../../shared/schema.js";
import { escapeXml } from "../lib/xml-utils.js";

const feedRoutes = Router();

feedRoutes.get("/feed.xml", async (req, res) => {
  try {
    const articles = await articleService.getAll("published");
    const siteUrl = process.env.FRONTEND_URL || "https://abdheshsah.com.np";

    let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Abdhesh Sah - Portfolio &amp; Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Latest articles and projects from Abdhesh Sah.</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/api/v1/feed/feed.xml" rel="self" type="application/rss+xml" />
`;

    articles.forEach((article: Article) => {
      const url = escapeXml(`${siteUrl}/blog/${article.slug}`);
      const date = article.publishedAt ? new Date(article.publishedAt).toUTCString() : new Date(article.createdAt).toUTCString();

      xml += `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${article.excerpt || article.title}]]></description>
      <pubDate>${date}</pubDate>
    </item>`;
    });

    xml += `
  </channel>
</rss>`;

    res.header("Content-Type", "application/rss+xml");
    res.send(xml);
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    res.status(500).send("Error generating feed");
  }
});

export default feedRoutes;
