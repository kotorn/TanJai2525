import { defineConfig, devices } from '@playwright/test';

/**
 * THE HOSTILE MATRIX (Protocol V15)
 * Simulating the fragmented reality of Southeast Asia.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  
  // Mandatory Output Structure
  outputDir: 'test-results',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    video: 'on',
    screenshot: 'on',
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },

  projects: [
    /* 1. Modern Core (Baseline) */
    {
      name: 'Modern Core',
      use: { ...devices['Desktop Chrome'] },
    },

    /* 2. The Legacy Patient (Windows XP / Old Firefox) */
    {
      name: 'The Legacy Patient',
      use: { 
        browserName: 'firefox',
        userAgent: 'Mozilla/5.0 (Windows NT 5.1; rv:52.0) Gecko/20100101 Firefox/52.0', // XP User Agent
        viewport: { width: 1024, height: 768 },
        javaScriptEnabled: true, // Checking if app breaks on old engines (simulated)
      },
    },

    /* 3. The Infected Mobile (Low-end Android, Throttled) */
    {
      name: 'The Infected Mobile',
      use: { 
        ...devices['Pixel 5'],
        isMobile: true,
        hasTouch: true,
        // CPU Throttling is applied in fixtures/antigravity-test.ts
      },
    },

    /* 4. The Trojan Horse (LINE In-App Browser) */
    {
      name: 'The Trojan Horse',
      use: { 
        ...devices['iPhone 12'],
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Line/11.19.1', // LINE UA
        hasTouch: true,
      },
      // Goal: Ensure OAuth flows and Session persistence work within the walled garden of the LINE app.
    },

    /* 5. The Ischemic Network (Slow 3G + Jitter) */
    {
      name: 'The Ischemic Network',
      use: {
        ...devices['Desktop Chrome'],
        // Network throttling logic typically goes here if simple, or fixture for advanced jitter.
        // We will stick to the default fixture-based approach or Playwright's network conditions if applicable later.
      },
    },
  ],
});
