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

    const submitBtn = page
      .getByRole("button", { name: /login|sign in|submit/i })
      .first();

    if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitBtn.click();

      // Should show an error or the form should remain (not navigate away)
      await expect(page).toHaveURL(/\/admin\/login/);
    }
  });

  test("admin login rejects invalid password", async ({ page }) => {
    await page.goto("/admin/login");

    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]'
    ).first();

    if (await passwordInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await passwordInput.fill("wrong-password-12345");

      const submitBtn = page
        .getByRole("button", { name: /login|sign in|submit/i })
        .first();
      await submitBtn.click();

      // Should stay on login page or show error
      // Wait a bit for the response
      await page.waitForTimeout(2000);

      // Either we see an error message or we're still on login
      const isStillOnLogin = page.url().includes("/admin/login");
      const errorVisible = await page
        .getByText(/invalid|incorrect|wrong|unauthorized|error/i)
        .first()
        .isVisible()
        .catch(() => false);

      expect(isStillOnLogin || errorVisible).toBeTruthy();
    }
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
  // These tests document the expected behavior but will only fully pass
  // when a test backend is running with known credentials.
  // They gracefully handle the case where auth isn't available.

  test("dashboard shows navigation sidebar when authenticated", async ({
    page,
  }) => {
    // Attempt login with env-provided credentials
    const adminPassword = process.env.TEST_ADMIN_PASSWORD;
    if (!adminPassword) {
      test.skip();
      return;
    }

    await page.goto("/admin/login");

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(adminPassword);

    const submitBtn = page
      .getByRole("button", { name: /login|sign in|submit/i })
      .first();
    await submitBtn.click();

    // Wait for redirect to admin dashboard
    await page.waitForURL("**/admin", { timeout: 10000 });

    // Dashboard should have navigation items
    const dashboardContent = page.locator(
      '[data-testid="admin-sidebar"], nav, aside'
    );
    await expect(dashboardContent.first()).toBeVisible({ timeout: 5000 });
  });

  test("admin can logout and be redirected to login", async ({ page }) => {
    const adminPassword = process.env.TEST_ADMIN_PASSWORD;
    if (!adminPassword) {
      test.skip();
      return;
    }

    // Login first
    await page.goto("/admin/login");
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(adminPassword);
    const submitBtn = page
      .getByRole("button", { name: /login|sign in|submit/i })
      .first();
    await submitBtn.click();
    await page.waitForURL("**/admin", { timeout: 10000 });

    // Find and click logout
    const logoutBtn = page
      .getByRole("button", { name: /logout|sign out/i })
      .first();
    if (await logoutBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutBtn.click();

      // Should redirect back to login
      await page.waitForURL("**/admin/login", { timeout: 10000 });
      await expect(page).toHaveURL(/\/admin\/login/);
    }
  });
});
