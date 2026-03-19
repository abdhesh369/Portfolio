import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './e2e',
    /* Maximum time one test can run for. */
    timeout: 60000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toBeVisible();`
         */
        timeout: 10000,
    },
    /* Run tests in files in parallel */
    fullyParallel: false,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 1,
    /* Opt out of parallel tests for stability. */
    workers: 1,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    /* Global setup for database/cache reset */
    globalSetup: './e2e/global-setup.ts',

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://127.0.0.1:4173',

        /* Global script to bypass modal */
        launchOptions: {
            args: ['--disable-web-security']
        },

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { 
                ...devices['Desktop Chrome'],
                /* Injected before any script runs */
                storageState: {
                    cookies: [],
                    origins: [
                        {
                            origin: 'http://127.0.0.1:4173',
                            localStorage: [
                                { name: 'portfolio_has_seen_persona', value: 'true' }
                            ]
                        }
                    ]
                }
            },
        },
    ],

    /* Run your local dev server before starting the tests */
    webServer: [
        {
            // Start the REAL backend server in test mode
            command: 'npm run test:e2e:server --prefix ../Backend',
            url: 'http://127.0.0.1:5005/ping',
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
        },
        {
            // Build and preview the frontend, pointing to the real backend
            command: 'cross-env VITE_API_URL=http://127.0.0.1:5005 npm run build && npm run preview -- --host 127.0.0.1',
            url: 'http://127.0.0.1:4173',
            reuseExistingServer: !process.env.CI,
            timeout: 300 * 1000,
        }
    ],





});
