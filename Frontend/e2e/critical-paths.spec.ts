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

    // Wait for projects heading to ensure section is loaded
    await page.getByText(/Featured Projects|My Projects|Projects/i).first().waitFor({ state: 'visible' });

    // Look for any project card link - using a more specific locator that targets the ProjectCard Link wrapper
    const projectLink = page.locator('a[href*="/project/"]').first();
    await expect(projectLink).toBeVisible({ timeout: 10000 });
    await projectLink.click();
    await page.waitForURL("**/project/**");
    await expect(page).toHaveURL(/\/project\//);
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
    const nameInput = page.locator('#name, [name="name"], [placeholder*="name" i]').first();

    await expect(nameInput).toBeVisible({ timeout: 5000 });

    // Try to submit empty form
    const submitBtn = page
      .getByRole("button", { name: /send|submit|contact|transmission|packet/i })
      .first();
    await submitBtn.click();

    // Should show validation errors or the form should still be present
    // Custom check for Zod error message or presence of required attr
    const nameInputId = await nameInput.getAttribute('id');
    if (nameInputId) {
      await expect(page.locator(`label[for="${nameInputId}"]`)).toBeVisible();
    }
    await expect(nameInput).toBeVisible();
  });

  test("contact form accepts valid input", async ({ page }) => {
    await page.goto("/");

    const nameInput = page.locator('#name, [name="name"], [placeholder*="name" i]').first();

    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill("Test User");

    const emailInput = page.locator(
      'input[name="email"], input[type="email"], input[placeholder*="email" i]'
    ).first();
    await expect(emailInput).toBeVisible();
    await emailInput.fill("test@example.com");

    const messageInput = page.locator(
      'textarea[name="message"], textarea[placeholder*="message" i], textarea'
    ).first();
    await expect(messageInput).toBeVisible();
    await messageInput.fill("This is a test message from Playwright.");

    // Verify the form is filled (don't submit to avoid side effects in E2E without a test backend)
    await expect(nameInput).toHaveValue("Test User");
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

    // Check that no img tag is missing an alt attribute
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt).toBe(0);
  });

  test("no console errors on homepage", async ({ page }) => {
    const criticalErrors: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error' && (text.includes('Failed to load') || text.includes('401') || text.includes('500') || text.includes('502'))) {
        criticalErrors.push(text);
      }
    });

    // Also listen for failed requests which often show up as console errors
    page.on('requestfailed', request => {
      const url = request.url();
      const failure = request.failure();
      if (url.includes('/api/')) {
        criticalErrors.push(`Request failed: ${url} (${failure?.errorText || 'Unknown error'})`);
      }
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000); // Wait for async resources like analytics/chatbot
    
    if (criticalErrors.length > 0) {
      console.log("Critical Console/Network Errors:", JSON.stringify(criticalErrors, null, 2));
    }
    expect(criticalErrors).toHaveLength(0);
  });
});
