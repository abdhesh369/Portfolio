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
            reuseExistingServer: true,
            timeout: 120 * 1000,
            env: {
                GITHUB_USERNAME: 'abdhesh369',
                ADMIN_PASSWORD: 'ci_test_admin_password_unbreakable_long_string_12345',
                ADMIN_EMAIL: 'admin@ci-test.local',
                CONTACT_EMAIL: 'contact@ci-test.local',
                DATABASE_URL: 'postgresql://postgres:password@localhost:5432/portfolio_test',
                REDIS_URL: 'redis://localhost:6379',
                NODE_ENV: 'test',
                JWT_SECRET: 'test_secret_key_at_least_64_characters_long_for_proper_security_in_ci_runs',
                JWT_REFRESH_SECRET: 'test_refresh_secret_key_at_least_64_chars_long_for_security_in_ci_runs_'
            }
        },
        {
            // Preview the frontend, pointing to the real backend
            // Note: Frontend must be built before running this (handled by CI or manually)
            command: 'npm run preview',
            url: 'http://127.0.0.1:4173',
            reuseExistingServer: true,
            timeout: 120 * 1000,
        }
    ],





});
