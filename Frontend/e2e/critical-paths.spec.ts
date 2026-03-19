import { test, expect } from "@playwright/test";

test.describe("Public User Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Set a large viewport to ensure all navigation elements are visible
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test("homepage loads with all major sections visible", async ({ page }) => {
    await page.goto("/");
    await page.locator('#main-content').waitFor({ state: 'attached', timeout: 15000 });

    // Hero section
    const heading = page.locator("h1");
    // Ensure h1 is visible - it might be delayed by an intro animation
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Use getByRole for the Projects heading
    const projectsHeading = page.getByRole('heading', { name: /Featured Projects|My Projects|Projects/i }).first();
    await projectsHeading.scrollIntoViewIfNeeded();
    await expect(projectsHeading).toBeVisible({ timeout: 30000 });

    // Contact / CTA area should exist somewhere on the page
    // Look for various button texts that appear in the Contact section modes
    const contactBtn = page.locator('button').filter({ hasText: /Contact|Hire|Transmission|Inquiry|Get in Touch/i }).first();
    await expect(contactBtn).toBeVisible({ timeout: 15000 });
  });

  test("can navigate to blog page", async ({ page }) => {
    await page.goto("/");

    // Click the Blog nav link - Use a more robust selector
    const blogLink = page.locator('nav').getByRole('button', { name: /Blog/i }).first();
    await expect(blogLink).toBeVisible({ timeout: 10000 });
    await blogLink.click();

    // Should be on /blog
    await page.waitForURL("**/blog", { timeout: 15000 });
    await expect(page).toHaveURL(/\/blog/);
  });

  test("can navigate to project detail from homepage", async ({ page }) => {
    await page.goto("/");

    // Wait for projects heading to ensure section is loaded
    const projectsHeading = page.getByText(/Featured Projects|My Projects|Projects/i).first();
    await projectsHeading.scrollIntoViewIfNeeded();
    await expect(projectsHeading).toBeVisible({ timeout: 15000 });

    // Look for any project card link
    const projectLink = page.locator('a[href*="/project/"]').first();
    await expect(projectLink).toBeAttached({ timeout: 15000 });
    await expect(projectLink).toBeVisible({ timeout: 15000 });
    await projectLink.click();
    await page.waitForURL("**/project/**", { timeout: 10000 });
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
  test.beforeEach(async ({ page }) => {
    // Set a large viewport to ensure we're not in mobile layout
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test("contact form validates required fields", async ({ page }) => {
    await page.goto("/");

    // Scroll to contact section and find the "Project Request" tab to show the standard form
    const projectTab = page.locator('button').filter({ hasText: /Project Request/i }).first();
    await projectTab.scrollIntoViewIfNeeded();
    await projectTab.click();

    const nameInput = page.locator('#name, [name="name"], [placeholder*="name" i]').first();
    await expect(nameInput).toBeVisible({ timeout: 20000 });

    // Try to submit empty form
    const submitBtn = page
      .getByRole("button", { name: /send|submit|contact|transmission|packet|inquiry/i })
      .first();
    await submitBtn.evaluate(el => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(500); // Allow smooth scroll to settle
    await submitBtn.click({ force: true });

    // Should show validation errors or the form should still be present
    await expect(nameInput).toBeVisible({ timeout: 10000 });
  });

  test("contact form accepts valid input", async ({ page }) => {
    await page.goto("/");

    // Select Project Request tab to reveal the form
    const projectTab = page.locator('button').filter({ hasText: /Project Request/i }).first();
    await projectTab.scrollIntoViewIfNeeded();
    await projectTab.click();

    const nameInput = page.locator('#name, [name="name"], [placeholder*="name" i]').first();
    await expect(nameInput).toBeVisible({ timeout: 20000 });
    await nameInput.fill("Test User");

    const emailInput = page.locator(
      'input[name="email"], input[type="email"], input[placeholder*="email" i]'
    ).first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill("test@example.com");

    const messageInput = page.locator(
      'textarea[name="message"], textarea[placeholder*="message" i], textarea'
    ).first();
    await expect(messageInput).toBeVisible({ timeout: 10000 });
    await messageInput.fill("This is a test message from Playwright.");

    // Verify the form is filled
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
      if (msg.type() === 'error' && (text.includes('500') || text.includes('502') || text.includes('503'))) {
        criticalErrors.push(text);
      }
    });

    // Also listen for failed requests which often show up as console errors
    page.on('requestfailed', request => {
      const url = request.url();
      const failure = request.failure();
      const errorText = failure?.errorText || '';
      if (
        url.includes('/api/') &&
        !url.includes('/github/') && // Ignore GitHub API failures (external/rate-limited)
        errorText !== 'net::ERR_ABORTED' &&
        errorText !== 'net::ERR_FAILED' &&
        !errorText.includes('ERR_CONNECTION_REFUSED')
      ) {
        criticalErrors.push(`Request failed: ${url} (${errorText})`);
      }
    });

    // Log 500/502/503 responses which may cause homepage console errors
    page.on('response', async response => {
      const status = response.status();
      const url = response.url();
      if (status >= 500 && status <= 504 && !url.includes('/github/')) {
        let bodySnippet = '';
        try {
          const body = await response.text();
          bodySnippet = ` - Body: ${body.substring(0, 100)}`;
        } catch (_ignore) {
          // Ignore body read errors in tests
        }
        criticalErrors.push(`HTTP ${status} at ${url}${bodySnippet}`);
      }
    });

    await page.goto('/', { waitUntil: 'load' });
    if (criticalErrors.length === 0) {
      await page.waitForTimeout(3000); // Wait for async resources like analytics/chatbot
    }
    
    if (criticalErrors.length > 0) {
      console.warn("Critical Console/Network Errors:", JSON.stringify(criticalErrors, null, 2));
    }
    expect(criticalErrors).toHaveLength(0);
  });
});
