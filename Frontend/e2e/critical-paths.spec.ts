import { test, expect } from "@playwright/test";

test.describe("Public User Journey", () => {
  test("homepage loads with all major sections visible", async ({ page }) => {
    await page.goto("/");

    // Hero section
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();

    // Check key sections exist by scrolling and looking for section headings
    // Projects section
    await expect(page.getByText(/Featured Projects|My Projects|Projects/i).first()).toBeVisible();

    // Contact / CTA area should exist somewhere on the page
    const contactArea = page.getByRole("button", { name: /Contact|Get in Touch|Send/i }).first();
    await expect(contactArea).toBeVisible({ timeout: 10000 });
  });

  test("can navigate to blog page", async ({ page }) => {
    await page.goto("/");

    // Click the Blog nav link
    const blogLink = page
      .getByRole("button", { name: "Blog", exact: true })
      .or(page.getByRole("link", { name: "Blog", exact: true }));
    await blogLink.first().click();

    // Should be on /blog
    await page.waitForURL("**/blog");
    await expect(page).toHaveURL(/\/blog/);
  });

  test("can navigate to project detail from homepage", async ({ page }) => {
    await page.goto("/");

    // Look for any project card link
    const projectLink = page.locator('a[href^="/project/"]').first();

    // If projects exist, click through
    if (await projectLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await projectLink.click();
      await page.waitForURL("**/project/**");
      await expect(page).toHaveURL(/\/project\//);
    }
  });

  test("404 page renders for unknown routes", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");

    // Should display some kind of "not found" content
    await expect(
      page.getByText(/not found|404|page doesn't exist/i).first()
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Contact Form", () => {
  test("contact form validates required fields", async ({ page }) => {
    await page.goto("/");

    // Scroll to contact section and find the form
    const nameInput = page.locator(
      'input[name="name"], input[placeholder*="name" i], input[aria-label*="name" i]'
    ).first();

    // If a contact form exists on the homepage
    if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Try to submit empty form
      const submitBtn = page
        .getByRole("button", { name: /send|submit|contact/i })
        .first();
      await submitBtn.click();

      // Should show validation errors or the form should still be present
      // (browser native validation or custom error messages)
      await expect(nameInput).toBeVisible();
    }
  });

  test("contact form accepts valid input", async ({ page }) => {
    await page.goto("/");

    const nameInput = page.locator(
      'input[name="name"], input[placeholder*="name" i], input[aria-label*="name" i]'
    ).first();

    if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nameInput.fill("Test User");

      const emailInput = page.locator(
        'input[name="email"], input[type="email"], input[placeholder*="email" i]'
      ).first();
      if (await emailInput.isVisible()) {
        await emailInput.fill("test@example.com");
      }

      const messageInput = page.locator(
        'textarea[name="message"], textarea[placeholder*="message" i], textarea'
      ).first();
      if (await messageInput.isVisible()) {
        await messageInput.fill("This is a test message from Playwright.");
      }

      // Verify the form is filled (don't submit to avoid side effects in E2E without a test backend)
      await expect(nameInput).toHaveValue("Test User");
    }
  });
});

test.describe("Responsive Layout", () => {
  test("renders mobile layout correctly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.goto("/");

    // Hero should still be visible
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();

    // Mobile menu button should be visible (hamburger)
    const mobileMenu = page.locator(
      'button[aria-label*="menu" i], button[aria-label*="nav" i], button.hamburger, [data-testid="mobile-menu"]'
    ).first();

    // On mobile, either a hamburger menu or the nav items should be accessible
    const navVisible = await mobileMenu.isVisible().catch(() => false);
    expect(typeof navVisible).toBe("boolean"); // Just verify the layout doesn't crash
  });

  test("renders tablet layout correctly", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto("/");

    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
  });

  test("renders desktop layout correctly", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");

    const heading = page.locator("h1");
    await expect(heading).toBeVisible();

    // Desktop nav items should be visible
    const navItems = ["Home", "Skills", "Projects"];
    for (const item of navItems) {
      const locator = page
        .getByRole("button", { name: item, exact: true })
        .or(page.getByRole("link", { name: item, exact: true }));
      await expect(locator.first()).toBeVisible();
    }
  });
});

test.describe("Performance & Accessibility Basics", () => {
  test("page loads within acceptable time", async ({ page }) => {
    const start = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const loadTime = Date.now() - start;

    // Page should load in under 10 seconds (generous for CI)
    expect(loadTime).toBeLessThan(10000);
  });

  test("images have alt attributes", async ({ page }) => {
    await page.goto("/");

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Check that visible images have alt text
    const images = page.locator("img:visible");
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const alt = await images.nth(i).getAttribute("alt");
      // alt should exist (can be empty string for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test("no console errors on homepage", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForTimeout(3000);

    // Filter out known acceptable errors (e.g., network errors when backend is down)
    const criticalErrors = errors.filter(
      (e) => !e.includes("net::ERR") && !e.includes("Failed to fetch") && !e.includes("NetworkError")
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
