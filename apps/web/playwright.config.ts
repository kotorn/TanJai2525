import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 2,
    workers: undefined,
    reporter: [['list'], ['html', { outputFolder: 'test-report' }]],
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: {
            mode: 'on', 
            size: { width: 1920, height: 1080 }
        },
        headless: false,
        launchOptions: {
            slowMo: 1000,
        },
    },
    webServer: {
        command: 'npx next dev -p 3000',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
    projects: [
        {
            name: 'Admin Desktop',
            use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
        },
        {
            name: 'Customer Mobile',
            use: { ...devices['iPhone 14'] },
        },
        {
            name: 'Kitchen Tablet',
            use: { ...devices['iPad Pro 11'], viewport: { width: 1194, height: 834 } }, // Using iPad Pro as proxy for kitchen tablet
        },
    ],
});
