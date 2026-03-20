import { test, expect } from '@playwright/test';

test.describe('Portfolio Smoke Tests', () => {
    test('has title and renders hero section', async ({ page }) => {
        await page.goto('/');

        // Expect the title to contain the owner's name (fetched from settings)
        await expect(page).toHaveTitle(/Portfolio/, { timeout: 10000 });

        // Expect the hero section to render. Note: "Abdhesh Sah" is in a screen-reader span.
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();

        // Check for the "View My Work" button in the hero
        const viewWorkBtn = page.getByRole('button', { name: /View My Work/i }).first();
        await expect(viewWorkBtn).toBeVisible();
    });

    test('navigation bar works', async ({ page }) => {
        await page.goto('/');

        // Check that navigation items exist
        const navItems = ['Home', 'Skills', 'Projects', 'Experience', 'Blog', 'Contact'];

        for (const item of navItems) {
            const locator = page.getByRole('button', { name: item, exact: true }).or(page.getByRole('link', { name: item, exact: true }));
            await expect(locator.first()).toBeVisible();
        }
    });

    test('chatbot button is visible', async ({ page }) => {
        await page.goto('/');

        // Wait for React hydration
        await page.locator('h1').waitFor({ state: 'visible', timeout: 15000 });
        
        // Chatbot uses DeferredChatbot with useInView({ rootMargin: '200px' })
        // We must scroll down to trigger it
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(2000); // Allow async chunk load & settings fetch

        // The chatbot FAB should be visible in the bottom right
        const chatbotBtn = page.locator('button[aria-label="Initialize AI Assistant"]');
        await expect(chatbotBtn).toBeVisible({ timeout: 20000 });
    });
});
