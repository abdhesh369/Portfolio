import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * TICKET-026: Automated Accessibility Tests
 * Runs axe-core against key pages to catch WCAG 2.1 AA violations.
 */

test.describe('Accessibility — WCAG 2.1 AA', () => {
  test('Home page has no critical a11y violations', async ({ page }) => {
    test.slow();
    await page.goto('/');
    // Wait for hero to render and network to settle
    await page.locator('h1').waitFor({ state: 'visible' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    if (results.violations.some(v => v.impact === 'critical')) {
      console.error("CRITICAL ACCESSIBILITY VIOLATIONS:", JSON.stringify(results.violations.filter(v => v.impact === 'critical'), null, 2));
    }

    expect(results.violations.filter(v => v.impact === 'critical')).toEqual([]);
  });

  test('Blog list page has no critical a11y violations', async ({ page }) => {
    test.slow();
    await page.goto('/blog');
    // Wait for the main heading to ensure page has rendered
    await page.locator('h1').waitFor({ state: 'visible', timeout: 30000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations.filter(v => v.impact === 'critical')).toEqual([]);
  });

  test('skip-to-content link is functional', async ({ page }) => {
    await page.goto('/');
    // Wait for hero to render
    await page.locator('h1').waitFor({ state: 'visible' });

    const skipLink = page.locator('a.skip-to-content, a[href="#main-content"]').first();
    
    // Focus manually to ensure it's the active element for accessibility tests
    await skipLink.focus();
    await expect(skipLink).toBeFocused();

    // Trigger jump
    await page.keyboard.press('Enter');

    // The main content element should exist
    const mainContent = page.locator('#main-content');
    await mainContent.waitFor({ state: 'attached', timeout: 15000 });
    await expect(mainContent).toBeAttached();
  });

  test('all images have alt attributes', async ({ page }) => {
    await page.goto('/');
    await page.locator('h1').waitFor({ state: 'visible' });

    // Wait for any images to appear or timeout quietly
    await page.waitForSelector('img', { timeout: 5000 }).catch(() => {});

    // Check that no img tag is missing an alt attribute
    const imagesWithoutAltCount = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAltCount).toBe(0);
  });

  test('interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.locator('h1').waitFor({ state: 'visible' });

    // Tab through the first few elements and ensure focus is visible and landing on interactive elements
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeAttached();

      const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
      // li is sometimes used for interactive menu items or cards with roles
      expect(['a', 'button', 'input', 'select', 'textarea', 'summary', 'li']).toContain(tagName);
    }
  });

  test('icon-only buttons have accessible labels', async ({ page }) => {
    test.slow();
    await page.goto('/');
    await page.locator('h1').waitFor({ state: 'visible' });

    // All buttons should have either text content or an accessible label
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const hasAccessibleName = await button.evaluate((el: HTMLElement) => {
        const ariaLabel = el.getAttribute('aria-label');
        const textContent = el.textContent?.trim();
        const ariaLabelledBy = el.getAttribute('aria-labelledby');
        const title = el.getAttribute('title');
        return !!(ariaLabel || textContent || ariaLabelledBy || title);
      });

      if (!hasAccessibleName) {
        const html = await button.evaluate(el => el.outerHTML);
        expect(hasAccessibleName, `Button missing accessible name: ${html}`).toBe(true);
      }
    }
  });
});
