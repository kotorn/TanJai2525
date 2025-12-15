import { test as base, Page, expect } from '@playwright/test';

// Extend the base test type to include any custom fixtures if needed
// For now, we just override 'page' to add our Antigravity Logic
export const test = base.extend<{ page: Page }>({
    page: async ({ page }, use, testInfo) => {
        // 1. 🕵️ Global Network Sniffer (The Lie Detector)
        const failedRequests: string[] = [];

        page.on('response', response => {
            const status = response.status();
            const url = response.url();

            // RULE: If ANY API response status code is 404, 500, 502, 503, or 504 → FAIL THE TEST IMMEDIATELY.
            // We focus on API calls or critical assets, but the prompt says "ANY". 
            // We exclude common innocuous things if needed, but for "Antigravity" we obey strictly.
            if (status === 404 || (status >= 500 && status <= 504)) {
                const msg = `🚨 ANTIGRAVITY SNIFFER DETECTED FAILURE: ${status} on ${url}`;
                console.error(msg);
                failedRequests.push(msg);
                
                // Attach details to the report
                testInfo.attachments.push({
                    name: `failed-response-${Date.now()}`,
                    body: Buffer.from(`Status: ${status}\nURL: ${url}`),
                    contentType: 'text/plain'
                });

                // Fail immediately if possible. 
                // Note: Throwing here might be caught by Playwright's event loop handling, 
                // but usually it fails the test eventually. 
                // To be safe and "Immediate" for the loop, we check failedRequests after every step or use expect.
                // But creating a hard failure in an event listener:
                throw new Error(msg);
            }
        });

        // 2. 🎥 Mobile Touch/Click Visualization (The "Red Dot" Script)
        await page.addInitScript(() => {
          document.addEventListener('click', (e) => {
            const dot = document.createElement('div');
            dot.style.position = 'absolute';
            dot.style.width = '20px';
            dot.style.height = '20px';
            dot.style.background = 'rgba(255, 0, 0, 0.7)';
            dot.style.borderRadius = '50%';
            dot.style.left = `${e.pageX - 10}px`;
            dot.style.top = `${e.pageY - 10}px`;
            dot.style.zIndex = '999999';
            dot.style.pointerEvents = 'none'; // Don't block clicks
            document.body.appendChild(dot);
            setTimeout(() => dot.remove(), 500); // Remove after 0.5s
          });
        });

        await use(page);

        // Final safety check in case the throw was swallowed
        if (failedRequests.length > 0) {
            expect(failedRequests).toEqual([]);
        }
    },
});

export { expect };

// Helper imports for convenience if sticking to this file structure
// (The user has strictly requested the fixture changes above)
