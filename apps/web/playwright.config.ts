import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true, // Allow parallel for Level 1
    forbidOnly: !!process.env.CI,
    retries: 2, // Retry twice on failure
    workers: undefined, // Let Playwright limit based on CPU or override in CLI
    reporter: [['list'], ['html', { outputFolder: 'test-report' }]], // HTML Report
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry', // Trace settings
        screenshot: 'only-on-failure',
        viewport: { width: 390, height: 844 }, // Mobile first default
        headless: false,
        launchOptions: {
            slowMo: 100,
        }
    },
    /*
    webServer: {
        command: 'npx next dev -p 3000',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
    */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
