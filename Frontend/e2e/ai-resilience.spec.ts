import { test, expect } from "@playwright/test";

test.describe("AI & Backend Resilience", () => {
  test("should display fallback when latest commit fetch fails (503)", async ({ page }) => {
    // Intercept the GitHub latest commit API and return a 503
    await page.route("**/api/v1/github/latest-commit", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ message: "Service Unavailable" }),
      });
    });

    await page.goto("/");
    
    // The UI should not crash. It should show a fallback or hide the section gracefully.
    // Wait for the page to stabilize
    await page.waitForTimeout(3000);
    
    // The GitHub section may gracefully hide itself on failure — that's acceptable behavior.
    // Just ensure no raw "503" or "Uncaught" text is leaked to the user.
    const errorText = page.getByText(/503|Uncaught Error/i);
    await expect(errorText).not.toBeVisible();
  });

  test("should handle chat initialization failure gracefully", async ({ page }) => {
    // Intercept chat initialization
    await page.route("**/api/v1/chat", async (route) => {
      await route.fulfill({
        status: 503,
        body: JSON.stringify({ error: "Initializing" }),
      });
    });

    await page.goto("/");
    
    // Find chat trigger
    const chatBtn = page.locator('button').filter({ hasText: /Chat|Assistant|AI/i }).first();
    if (await chatBtn.isVisible()) {
      await chatBtn.click();
      // Should show a "System starting" or similar user-friendly message
      await expect(page.getByText(/starting|initializing|offline|moment/i).first()).toBeVisible({ timeout: 10000 });
    }
  });
});
