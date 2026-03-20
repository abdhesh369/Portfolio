import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration - System Stabilized
 */
export default defineConfig({
    testDir: './e2e',
    /* Maximum time one test can run for. */
    timeout: 60000,
    expect: {
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
            command: 'cd ../Backend && npm run test:e2e:server',
            url: 'http://127.0.0.1:5005/ping',
            reuseExistingServer: true,
            timeout: 120 * 1000,
        },
        {
            // Preview the frontend, pointing to the real backend
            // Note: Frontend must be built before running this (handled by builder or manually)
            command: 'npm run preview',
            url: 'http://127.0.0.1:4173',
            reuseExistingServer: true,
            timeout: 120 * 1000,
            env: {
                VITE_API_PROXY_TARGET: 'http://127.0.0.1:5005'
            }
        }
    ],

});
