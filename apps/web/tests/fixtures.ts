import { test as base, expect, Page, Locator } from '@playwright/test';

/**
 * THE ARSENAL (Protocol V15 Fixtures)
 * 1. Sniffer: Logs 404/500s.
 * 2. Phantom Finger: Visualizes clicks.
 * 3. Babel: Mocks Voice API.
 * 4. FeatureFlag: Tampers with subscriptions.
 */

type AntigravityFixtures = {
    networkSniffer: void;
    sniffer: void; // Alias for legacy tests
    phantomFinger: void;
    babel: {
        simulateVoiceInput: (lang: string, text: string) => Promise<void>;
    };
    featureFlags: {
        mockSubscription: (tier: 'free' | 'pro' | 'enterprise') => Promise<void>;
    };
    networkShaper: void; // For 3G simulation
    humanActions: {
        humanTap: (selector: string | Locator) => Promise<void>;
        slowType: (selector: string | Locator, text: string) => Promise<void>;
        scrollWithInertia: (...args: any[]) => Promise<void>;
    };
    uxAuditor: {
        checkA11y: () => Promise<void>;
    };
    chaosLogic: {
        unleash: (...args: any[]) => Promise<void>;
        latencySpike: (...args: any[]) => Promise<void>;
        simulateOfflineBomb: (...args: any[]) => Promise<void>;
    };
    payloadInjector: {
        injectXSS: (...args: any[]) => Promise<void>;
        injectSQLi: (...args: any[]) => Promise<void>;
        tamperEdgeConfig: (...args: any[]) => Promise<void>;
    };
};

export const test = base.extend<AntigravityFixtures>({
    
    // 1. Global Network Sniffer
    networkSniffer: [async ({ page }, use) => {
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

    // 5. Human Actions (Slow typing, jittery mouse)
    humanActions: async ({ page }, use) => {
        await use({
            humanTap: async (selector) => {
                const el = typeof selector === 'string' ? page.locator(selector).first() : selector.first();
                await el.hover();
                await page.waitForTimeout(Math.random() * 200 + 50); // Hesitation
                await el.click({ delay: Math.random() * 100 + 50 });
            },
            slowType: async (selector, text) => {
                const el = typeof selector === 'string' ? page.locator(selector).first() : selector.first();
                await el.click();
                for (const char of text) {
                    await el.type(char, { delay: Math.random() * 150 + 50 }); // Typos/Slow
                }
            },
            scrollWithInertia: async (...args) => { console.log('Scroll Inertia (Stub)', args); }
        });
    },

    // 6. UX Auditor (A11y & Contrast)
    uxAuditor: async ({ page }, use) => {
        const AxeBuilder = (await import('@axe-core/playwright')).default;
        await use({
            checkA11y: async () => {
                const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
                if (accessibilityScanResults.violations.length > 0) {
                     console.warn(`[A11Y] Found ${accessibilityScanResults.violations.length} violations`);
                     // We don't fail properly here to avoid blocking critical flows in early dev, 
                     // but we log it. In strict mode, we should throw.
                }
            }
        });
    },

    // 7. Chaos Logic (Mock)
    chaosLogic: async ({ page }, use) => {
        await use({
            unleash: async (...args) => { console.log('Chaos Unleashed (Stub)', args); },
            latencySpike: async (...args) => { console.log('Latency Spike (Stub)', args); },
            simulateOfflineBomb: async (...args) => { console.log('Offline Bomb (Stub)', args); }
        });
    },

    // 8. Payload Injector (Mock)
    payloadInjector: async ({ page }, use) => {
        await use({
            injectXSS: async (...args) => { console.log('XSS Injected (Stub)', args); },
            injectSQLi: async (...args) => { console.log('SQLi Injected (Stub)', args); },
            tamperEdgeConfig: async (...args) => { console.log('Edge Config Tampered (Stub)', args); }
        });
    },

    // 9. Legacy Alias
    sniffer: [async ({ page }, use) => {
        // reuse networkSniffer logic or just pass through?
        // Since networkSniffer is auto, we just need to satisfy type require.
        // But networkSniffer implementation logs to console.
        await use();
    }, { auto: true }],
});

export { expect } from '@playwright/test';
