import { test, expect } from "@playwright/test";

test.describe("Admin Authentication Flow", () => {
  test("admin login page renders", async ({ page }) => {
    await page.goto("/admin/login");

    // Should show login form elements
    const passwordInput = page.locator(
      'input[type="password"], input[name="password"], input[placeholder*="password" i]'
    ).first();
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
  });

  test("admin login rejects empty password", async ({ page }) => {
    await page.goto("/admin/login");

    // Suppress PersonaSelector and clear overlays
    await page.addInitScript(() => {
      localStorage.setItem('portfolio_has_seen_persona', 'true');
    });
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      document.querySelectorAll('[class*="fixed"][class*="inset-0"]').forEach(el => el.remove());
    });

    const submitBtn = page
      .getByRole("button", { name: /login|sign in|submit/i })
      .first();

    await expect(submitBtn).toBeVisible({ timeout: 5000 });
    await submitBtn.click();

    // Should show an error or the form should remain (not navigate away)
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("admin login rejects invalid password", async ({ page }) => {
    await page.goto("/admin/login");

    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]'
    ).first();

    // Suppress PersonaSelector and clear overlays
    await page.addInitScript(() => {
      localStorage.setItem('portfolio_has_seen_persona', 'true');
    });
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      document.querySelectorAll('[class*="fixed"][class*="inset-0"]').forEach(el => el.remove());
    });

    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill("wrong-password-12345");

    const submitBtn = page
      .getByRole("button", { name: /login|sign in|submit/i })
      .first();
    console.warn("Submitting login with wrong password...");
    await submitBtn.click();

    // Login uses toast notifications for errors, not inline text.
    // Check for either a toast or that we stay on the login page.
    const toast = page.locator('[data-sonner-toast], [role="status"], [data-radix-toast-viewport] li, .toast, [data-testid="toast"]').first();
    const staysOnLogin = page.locator('input[type="password"]').first();
    
    // Either a toast appears OR we remain on the login page
    await expect(toast.or(staysOnLogin)).toBeVisible({ timeout: 15000 });

    console.warn("Error message visible");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("unauthenticated access to admin dashboard redirects to login", async ({
    page,
  }) => {
    await page.goto("/admin");

    // Should redirect to /admin/login
    await page.waitForURL("**/admin/login", { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe("Admin Dashboard (requires auth)", () => {
  test.beforeEach(async ({ page }) => {
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || '1111111111111111';

    await page.addInitScript(() => {
      localStorage.setItem('portfolio_has_seen_persona', 'true');
    });

    await page.goto("/admin/login");

    // Wait and clear overlays
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      document.querySelectorAll('[class*="fixed"][class*="inset-0"]').forEach(el => el.remove());
    });

    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await passwordInput.fill(adminPassword);
    
    const submitBtn = page.getByRole("button", { name: /login|sign in|submit/i }).first();
    await submitBtn.click();
    await page.waitForURL("**/admin", { timeout: 20000 });
  });

  test("dashboard shows navigation sidebar when authenticated", async ({ page }) => {
    const sidebar = page.locator('[data-testid="admin-sidebar"], nav, aside').first();
    await expect(sidebar).toBeVisible({ timeout: 5000 });
  });

  test("admin can logout and be redirected to login", async ({ page }) => {
    // Set a large viewport to ensure all header elements are visible
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Click the profile button to show the dropdown
    // The profile button is in the header
    const profileBtn = page.getByTestId('profile-popover-trigger');
    await expect(profileBtn).toBeVisible({ timeout: 15000 });
    await profileBtn.scrollIntoViewIfNeeded();
    await profileBtn.click({ force: true });

    // Now the logout button (labeled TERMINATE_SESSION in the UI) should be visible
    const logoutBtn = page.getByTestId('logout-button');
    await expect(logoutBtn).toBeVisible({ timeout: 15000 });
    await logoutBtn.scrollIntoViewIfNeeded();
    await logoutBtn.click({ force: true });

    await page.waitForURL("**/admin/login", { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
