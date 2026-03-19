import { test, expect } from '@playwright/test';

test.describe('Full-Stack Journey (Layer 3)', () => {
    const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || '1111111111111111';
    const TEST_PROJECT_TITLE = 'E2E Test Project ' + Date.now();

    test('should allow admin to login and create a project that appears publicly', async ({ page }) => {
        test.setTimeout(120000); // Increase timeout for full-stack build/orchestration
        
        // 1. Login as Admin
        console.warn('[E2E] Navigating to login...');
        await page.goto('/admin/login');
        
        const passwordInput = page.locator('input[type="password"]').first();
        await expect(passwordInput).toBeVisible({ timeout: 15000 });
        await passwordInput.fill(ADMIN_PASSWORD);
        
        const loginBtn = page.getByRole('button', { name: /login|sign in|submit/i }).first();
        await loginBtn.click();
        
        console.warn('[E2E] Logged in, waiting for dashboard...');
        await page.waitForURL('**/admin', { timeout: 20000 });
        await expect(page).toHaveURL(/\/admin/);

        // 2. Navigate to Projects tab
        console.warn('[E2E] Navigating to Projects tab...');
        const projectsTab = page.getByRole('button', { name: /Projects|Artifacts/i }).first();
        await projectsTab.click();
        
        // 3. Click "Add Project" (Initialize Repository / Initialize New Artifact)
        console.warn('[E2E] Clicking Add button...');
        const addBtn = page.locator('button').filter({ hasText: /Initialize Repository|Initialize New Artifact/i })
            .or(page.getByTitle('Initialize New Artifact'));
        
        await expect(addBtn.first()).toBeVisible({ timeout: 15000 });
        await addBtn.first().click();

        // 4. Fill Project Form
        console.warn('[E2E] Filling project form...');
        await page.getByPlaceholder(/Enter primary designation/i).fill(TEST_PROJECT_TITLE);
        await page.getByPlaceholder(/Classification/i).fill('E2E Testing');
        
        // Description (Executive Architecture Summary)
        const editor = page.locator('.ProseMirror').first();
        await editor.click(); // Focus first
        await editor.fill('This project was created by an automated E2E test.');
        
        // Submit (Commit Artifact)
        console.warn('[E2E] Committing artifact...');
        const commitBtn = page.getByRole('button', { name: /Commit Artifact/i }).first();
        await commitBtn.scrollIntoViewIfNeeded();
        await commitBtn.click({ force: true });

        
        // Wait for success
        console.warn('[E2E] Project created, verifying in list...');
        await expect(page.getByPlaceholder(/Enter primary designation/i).first()).not.toBeVisible({ timeout: 15000 });
        await page.waitForTimeout(2000); // Give list a moment to refresh
        await expect(page.getByText(TEST_PROJECT_TITLE)).toBeVisible({ timeout: 15000 });


        // 5. Verify on Public Portfolio
        console.warn('[E2E] Verifying project visibility on public site...');
        await page.goto('/projects');
        
        // The project should be visible in the list
        const publicProject = page.getByText(TEST_PROJECT_TITLE).first();
        await expect(publicProject).toBeVisible({ timeout: 15000 });
        
        console.warn('[E2E] \u2705 Full-stack journey successful!');
    });
});
