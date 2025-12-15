import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 2, // Essential for distinguishing flakiness from bugs
  workers: 4, 
  reporter: [
    ['html', { outputFolder: 'test-report' }], 
    ['list'],
    ['json', { outputFile: 'test-results/pathology-reports/summary.json' }] // Structured pathology report
  ],
  outputDir: 'test-results/autopsy', // Detailed crash dumps go here
  
  use: {
    baseURL: 'http://localhost:3000', // CHECK PORT BEFORE RUNNING
    trace: 'retain-on-failure',        // Forensic evidence only when needed
    video: 'on',                       // RECORD EVERYTHING. We need to see the "Red Dot".
    screenshot: 'on',
    actionTimeout: 10000, 
    navigationTimeout: 15000,
  },

  webServer: {
    command: 'npx turbo run dev --filter=web',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    cwd: path.resolve(__dirname, '../../'),
  },

  projects: [
    // 1. 🟢 Healthy Modern (Control Group)
    {
      name: 'Healthy Modern (Chrome)',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },

    // 2. 📱 Standard Mobile (Pixel 5)
    {
      name: 'Mobile Chrome (Pixel 5)',
      use: {
        ...devices['Pixel 5'],
      },
    },

    // 3. 🍎 Standard Mobile (iPhone 12)
    {
      name: 'Mobile Safari (iPhone 12)',
      use: {
        ...devices['iPhone 12'],
      },
    },

    // 4. 🧟 The Legacy Patient (Anonymous OS / XP Embedded)
    // Vulnerable to drive-by downloads, unpatched exploits, and rendering failures.
    {
      name: 'Legacy Patient (XP Embedded)',
      use: {
        browserName: 'firefox', // Closest modern relative to Gecko/52
        userAgent: 'Mozilla/5.0 (Windows NT 5.1; rv:52.9) Gecko/20100101 Firefox/52.9 (Windows XP Embedded)',
        viewport: { width: 1024, height: 768 },
        ignoreHTTPSErrors: true, // Simulate lack of modern TLS
        // Context options to simulate hardened/broken environment
        contextOptions: {
          permissions: [], // No permissions
          javaScriptEnabled: true,
        },
        launchOptions: {
            firefoxUserPrefs: {
                'webgl.disabled': true, // Simulate driver failure
                'security.mixed_content.block_active_content': false, 
            }
        }
      },
    },

    // 5. 🦠 The Infected Mobile (Legacy Android / AOSP)
    // Low-end hardware, race conditions, touch events.
    {
      name: 'Infected Mobile (Legacy Android)',
      use: {
        browserName: 'chromium',
        channel: 'chrome', // Use actual Chrome if available for better mobile emulation
        ...devices['Pixel 5'], // Base hardware profile
        userAgent: 'Mozilla/5.0 (Linux; Android 7.1.2; AOSP) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/59.0.3071.125 Mobile Safari/537.36',
        hasTouch: true,
        isMobile: true,
        // CPU Throttling (4x) is handled in fixtures.ts via CDPSession
      },
    },

    // 6. 🩸 The Ischemic Network (High Latency / Network Arrhythmia)
    // Simulates slow 3G bandwidth cap with 500ms random jitter.
    {
      name: 'The Ischemic Network (Slow 3G)',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Network Jitter is handled in fixtures.ts
      },
    }
  ],
});
