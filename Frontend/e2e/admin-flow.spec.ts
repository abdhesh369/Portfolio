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

    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    await passwordInput.fill("wrong-password-12345");

    const submitBtn = page
      .getByRole("button", { name: /login|sign in|submit/i })
      .first();
    await submitBtn.click();

    // We should see an error message and still be on the login page
    await expect(page.getByText(/invalid|incorrect|wrong|unauthorized|error/i).first()).toBeVisible({ timeout: 8000 });
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
    const adminPassword = process.env.TEST_ADMIN_PASSWORD;
    if (!adminPassword) {
      throw new Error("TEST_ADMIN_PASSWORD environment variable is required for these tests.");
    }

    await page.goto("/admin/login");
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(adminPassword);
    const submitBtn = page.getByRole("button", { name: /login|sign in|submit/i }).first();
    await submitBtn.click();
    await page.waitForURL("**/admin", { timeout: 10000 });
  });

  test("dashboard shows navigation sidebar when authenticated", async ({ page }) => {
    const sidebar = page.locator('[data-testid="admin-sidebar"], nav, aside').first();
    await expect(sidebar).toBeVisible({ timeout: 5000 });
  });

  test("admin can logout and be redirected to login", async ({ page }) => {
    const logoutBtn = page.getByRole("button", { name: /logout|sign out/i }).first();
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });
    await logoutBtn.click();

    await page.waitForURL("**/admin/login", { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
