import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './e2e',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like \`await page.goto('/')\`. */
        baseURL: 'http://localhost:4173',

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
                            origin: 'http://localhost:4173',
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
            command: 'node scripts/mock-backend.js',
            port: 5000,
            reuseExistingServer: !process.env.CI,
        },
        {
            command: 'npm run build && npm run preview',
            url: 'http://localhost:4173',
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
        }
    ],




});
