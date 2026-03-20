import { test, expect } from "@playwright/test";

test.describe("SEO & Social Metadata", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have correct title and meta description", async ({ page }) => {
    // Title is dynamic (fetched from settings), check for "Portfolio" which is always present
    await expect(page).toHaveTitle(/Portfolio/i, { timeout: 10000 });

    const description = page.locator('meta[name="description"]').first();
    await expect(description).toHaveAttribute("content", /portfolio|engineer|developer/i);
  });

  test("should have OpenGraph metadata for social sharing", async ({ page }) => {
    const ogTitle = page.locator('meta[property="og:title"]').first();
    const ogImage = page.locator('meta[property="og:image"]').first();
    const ogType = page.locator('meta[property="og:type"]').first();

    await expect(ogTitle).toHaveAttribute("content", /Portfolio/i);
    await expect(ogType).toHaveAttribute("content", "website");
    
    // Image should be a valid absolute URL or root-relative
    const imgSrc = await ogImage.getAttribute("content");
    expect(imgSrc).toMatch(/\.(png|jpg|jpeg|webp|svg)/i);
  });

  test("should have Twitter card metadata", async ({ page }) => {
    const twitterCard = page.locator('meta[name="twitter:card"]').first();
    const twitterTitle = page.locator('meta[name="twitter:title"]').first();

    await expect(twitterCard).toHaveAttribute("content", /summary|large_image/i);
    await expect(twitterTitle).toHaveAttribute("content", /Portfolio/i);
  });

  test("should have canonical URL tag", async ({ page }) => {
    const canonical = page.locator('link[rel="canonical"]').first();
    const href = await canonical.getAttribute("href");
    expect(href).toMatch(/^https?:\/\//);
  });

  test("should have JSON-LD structured data", async ({ page }) => {
    // There are multiple scripts (Person and WebSite), we check the first one
    const script = page.locator('script[type="application/ld+json"]').first();
    await expect(script).toBeAttached();
    
    const content = await script.textContent();
    const json = JSON.parse(content || "{}");
    
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toMatch(/Person|Website/i);
  });
});
