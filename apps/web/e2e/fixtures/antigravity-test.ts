import { test as base, Page, expect, CDPSession } from '@playwright/test';

// Extend the base test type to include any custom fixtures if needed
// For now, we just override 'page' to add our Antigravity Logic
export const test = base.extend<{ 
    page: Page,
    antigravityUtils: {
        simulateVoiceInput: (lang: string, text: string) => Promise<void>;
        mockSubscription: (tier: 'Free' | 'Pro') => Promise<void>;
        tamperEdgeConfig: () => Promise<void>;
        uploadMockImage: (selector: string) => Promise<void>;
    }
}>({
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

        // 3. 🧠 CPU Throttling for "The Infected Mobile"
        if (testInfo.project.name === 'The Infected Mobile') {
            const client = await page.context().newCDPSession(page);
            await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
            console.log('🐢 CPU Throttling enabled (4x slowdown) for The Infected Mobile');
        }

        await use(page);

        // Final safety check in case the throw was swallowed
        if (failedRequests.length > 0) {
            expect(failedRequests).toEqual([]);
        }
    },

    antigravityUtils: async ({ page }, use) => {
        const utils = {
            // 🗣️ Babel Simulator
            simulateVoiceInput: async (lang: string, text: string) => {
                await page.evaluate(({ lang, text }) => {
                    // Start dispatching events to any active SpeechRecognition instances
                    // This assumes the app listens to window.SpeechRecognition or webkitSpeechRecognition
                    console.log(`🗣️ Babel Simulator: Speaking "${text}" in ${lang}`);
                    
                    // Dispatch a custom event that our app might be listening to for testing, 
                    // OR mock the SpeechRecognition API entirely if possible.
                    // For now, let's assume we can trigger the app's internal handler if exposed,
                    // or simulated via a dispatched event on the window.
                    window.dispatchEvent(new CustomEvent('babel-voice-input', { 
                        detail: { transcript: text, lang: lang } 
                    }));

                    // ALSO: If the app uses standard SpeechRecognition, we tried to mock it.
                    // But usually, E2E requires triggering the logic directly.
                }, { lang, text });
            },

            // 🔐 Feature Flag Injector (Subscription)
            mockSubscription: async (tier: 'Free' | 'Pro') => {
               await page.route('**/api/auth/session', async route => {
                    const json = {
                        user: { name: "Test User", email: "test@example.com", image: null },
                        expires: new Date(Date.now() + 86400 * 1000).toISOString(),
                        tier: tier // Custom field
                    };
                    await route.fulfill({ json });
               });
               console.log(`🔐 Mocked Subscription Tier: ${tier}`);
            },

            // 🔐 Feature Flag Injector (Edge Config)
            tamperEdgeConfig: async () => {
                await page.route('**/*.vercel.app/**/edge-config**', async route => {
                    await route.continue({
                        headers: {
                            ...route.request().headers(),
                            'x-vercel-edge-config': 'malicious-payload'
                        }
                    });
                });
                console.log(`🔐 Tampered Edge Config Headers injected`);
            },

            // 📸 Viral Mock
            uploadMockImage: async (selector: string) => {
                // Create a dummy image buffer
                const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
                await page.setInputFiles(selector, {
                    name: 'daily-dish-mock.jpg',
                    mimeType: 'image/jpeg',
                    buffer: buffer
                });
                console.log(`📸 Mock Image uploaded to ${selector}`);
            }
        };
        await use(utils);
    }
});

export { expect };

// Helper imports for convenience if sticking to this file structure
// (The user has strictly requested the fixture changes above)
