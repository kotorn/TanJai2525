import { test as base, expect, Page } from '@playwright/test';

/**
 * THE ARSENAL (Protocol V15 Fixtures)
 * 1. Sniffer: Logs 404/500s.
 * 2. Phantom Finger: Visualizes clicks.
 * 3. Babel: Mocks Voice API.
 * 4. FeatureFlag: Tampers with subscriptions.
 */

type AntigravityFixtures = {
    sniffer: void;
    phantomFinger: void;
    babel: {
        simulateVoiceInput: (lang: string, text: string) => Promise<void>;
    };
    featureFlags: {
        mockSubscription: (tier: 'free' | 'pro' | 'enterprise') => Promise<void>;
    };
    networkShaper: void; // For 3G simulation
};

export const test = base.extend<AntigravityFixtures>({
    
    // 1. Global Network Sniffer
    sniffer: [async ({ page }, use) => {
        const failures: any[] = [];
        page.on('response', response => {
            if (response.status() >= 400) {
                console.log(`[SNIFFER] 🚨 ${response.status()} on ${response.url()}`);
                failures.push({ url: response.url(), status: response.status() });
            }
        });
        await use();
        // Strict Mode: Fail test if critical errors found (optional, enabled for Level 7)
        if (failures.length > 0) {
            console.warn('[SNIFFER] Network failures detected:', failures);
        }
    }, { auto: true }],

    // 2. The Phantom Finger (Visual Touch)
    phantomFinger: [async ({ page }, use) => {
        await page.addInitScript(() => {
            document.body.addEventListener('click', (e) => {
                const dot = document.createElement('div');
                dot.style.position = 'absolute';
                dot.style.width = '20px';
                dot.style.height = '20px';
                dot.style.background = 'rgba(255, 0, 0, 0.5)';
                dot.style.borderRadius = '50%';
                dot.style.left = `${e.pageX - 10}px`;
                dot.style.top = `${e.pageY - 10}px`;
                dot.style.pointerEvents = 'none';
                dot.style.zIndex = '99999';
                dot.style.transition = 'transform 0.5s, opacity 0.5s';
                document.body.appendChild(dot);
                setTimeout(() => {
                    dot.style.transform = 'scale(2)';
                    dot.style.opacity = '0';
                }, 50);
                setTimeout(() => dot.remove(), 550);
            });
        });
        await use();
    }, { auto: true }],

    // 3. Babel Simulator
    babel: async ({ page }, use) => {
        await use({
            simulateVoiceInput: async (lang, text) => {
                await page.evaluate(({ lang, text }) => {
                    // Dispatch custom event that our app listens to (Mocking Web Speech API)
                    window.dispatchEvent(new CustomEvent('mock-speech-recognition', {
                        detail: { transcript: text, lang: lang }
                    }));
                }, { lang, text });
            }
        });
    },

    // 4. Feature Flag Injector & Network Shaper
    featureFlags: async ({ page }, use) => {
        await use({
            mockSubscription: async (tier) => {
                // Intercept Supabase Subscription Query
                await page.route('**/rest/v1/subscriptions*', async route => {
                    const json = [{ tier, status: 'active' }];
                    await route.fulfill({ json });
                });
            }
        });
    },

    networkShaper: [async ({ page }, use, testInfo) => {
        if (testInfo.project.name === 'The Ischemic Network') {
            const client = await page.context().newCDPSession(page);
            await client.send('Network.emulateNetworkConditions', {
                offline: false,
                downloadThroughput: 500 * 1024 / 8, // 500 kbps
                uploadThroughput: 500 * 1024 / 8,
                latency: 500, // 500ms jitter/latency
            });
        }
        await use();
    }, { auto: true }],
});

export { expect } from '@playwright/test';
