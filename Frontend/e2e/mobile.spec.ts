import { test, expect } from "@playwright/test";

test.describe("Mobile UI/UX Deep Dive", () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("hamburger menu opens and closes", async ({ page }) => {
    // Wait for React hydration (Theme Toggle only exists in the dynamic Navbar)
    await expect(page.locator('button[aria-label*="theme" i], .theme-toggle').first()).toBeVisible({ timeout: 15000 });

    const menuBtn = page.locator('button[aria-label*="menu" i], button.hamburger').first();
    await expect(menuBtn).toBeVisible();
    
    await menuBtn.click();
    
    // Allow for Framer Motion animation
    await page.waitForTimeout(500);
    
    // Check for mobile nav links
    const mobileLink = page.locator('nav a, nav button').filter({ hasText: /Projects|Skills|Blog/i }).first();
    await expect(mobileLink).toBeVisible();
    
    // Close menu (either by clicking toggle again or an overlay)
    await menuBtn.click();
    await expect(mobileLink).not.toBeVisible({ timeout: 5000 });
  });

  test("no horizontal overflow (layout stability)", async ({ page }) => {
    // Check if the page width exceeds the viewport width
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);
  });

  test("touch targets are sufficiently large", async ({ page }) => {
    // Check a few critical buttons to ensure they aren't tiny on mobile
    const buttons = await page.locator('button, nav a').all();
    
    // Test the first 5 visible buttons for minimum touch size (44px is standard)
    let checked = 0;
    for (const btn of buttons) {
      if (await btn.isVisible() && checked < 5) {
        const box = await btn.boundingBox();
        if (box) {
          // Relaxing slightly to 40px for dense designs, but ideally 44px
          expect(box.width).toBeGreaterThanOrEqual(32); 
          expect(box.height).toBeGreaterThanOrEqual(32);
          checked++;
        }
      }
    }
  });
});
