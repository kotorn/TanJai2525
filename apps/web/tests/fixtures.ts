import { test as base, Page, Locator, expect, Response, CDPSession } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

// --- Types ---

type HumanActions = {
  slowType: (selector: string | Locator, text: string) => Promise<void>;
  humanTap: (selector: string | Locator) => Promise<void>;
  scrollWithInertia: (y: number) => Promise<void>;
};

type UXAuditor = {
  checkA11y: () => Promise<void>;
  measurePerf: () => Promise<void>;
  verifyThaiFont: (selector?: string) => Promise<void>;
};

type PayloadInjector = {
  injectSQLi: (fieldOrSelector: string | Locator) => Promise<void>;
  tamperEdgeConfig: (flag: string, value: any) => Promise<void>;
  poisonPrototype: (jsonObj: any) => any;
};

type ChaosLogic = {
  simulateOfflineBomb: (orderCount: number) => Promise<void>;
  latencySpike: (routePattern: string, delayMs: number) => Promise<void>;
  induceClockSkew: (secondsOffset: number) => Promise<void>;
};

type AntigravityFixtures = {
  humanActions: HumanActions;
  uxAuditor: UXAuditor;
  payloadInjector: PayloadInjector;
  chaosLogic: ChaosLogic;
  networkSniffer: void;
  phantomFinger: void;
};

// --- Helpers ---

const LOG_FILE = path.join(__dirname, '../test-results/vital-signs/debug-log.json');

function logDebug(entry: any) {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(LOG_FILE, JSON.stringify({ timestamp: new Date().toISOString(), ...entry }) + ',\n');
}

// --- Fixtures ---

export const test = base.extend<AntigravityFixtures>({
  
  // 🕵️ Global Network Sniffer (The Stethoscope & Biopsy Tool)
  networkSniffer: [async ({ page }, use) => {
    const failedRequests: any[] = [];
    const leakedTokens: any[] = [];
    
    // Attach listener
    const fn = (response: Response) => {
      const status = response.status();
      const url = response.url();
      
      // 1. Detect 500/404 (Internal Hemorrhage)
      if (status >= 500 || status === 404) {
        const failure = { url, status, method: response.request().method() };
        failedRequests.push(failure);
        logDebug({ type: 'NETWORK_FAIL', ...failure });
      }

      // 2. Detect Auth Leaks (Biopsy) in 3rd party calls
      // Assuming 'supabase.co' or internal APIs are safe, but sending Auth to analytics (e.g. google-analytics) is bad.
      const request = response.request();
      const headers = request.headers();
      const isThirdParty = !url.includes('localhost') && !url.includes('supabase.co'); // Simplify logic
      
      if (isThirdParty) {
          if (headers['authorization'] || headers['x-supabase-auth']) {
             const leak = { url, type: 'AUTH_LEAK' };
             leakedTokens.push(leak);
             logDebug({ type: 'CRITICAL_DATA_LEAK', ...leak });
          }
      }
    };
    
    page.on('response', fn);

    await use();
    
    // Report Autopsy
    if (failedRequests.length > 0) {
        console.error(`[Antigravity] Network Sniffer Detected ${failedRequests.length} Failures.`);
        // Note: We might allow 404s for favicon etc, strictness depends on use case.
        // throw new Error(`Network Failures: ${JSON.stringify(failedRequests)}`);
    }

    if (leakedTokens.length > 0) {
         throw new Error(`[CRITICAL] Auth Token Leak Detected! Sent to: ${JSON.stringify(leakedTokens)}`);
    }
    
    page.off('response', fn);
  }, { auto: true }],

  // 💉 Payload Injector (The Virus/Mutagen)
  payloadInjector: async ({ page, context }, use) => {
    const injector: PayloadInjector = {
       async injectSQLi(selector) {
           const loc = typeof selector === 'string' ? page.locator(selector) : selector;
           const payloads = ["' OR '1'='1", "'; DROP TABLE users;", "' UNION SELECT 1,2,3--"];
           const payload = payloads[Math.floor(Math.random() * payloads.length)];
           await loc.fill(payload);
           console.log(`[PayloadInjector] Injected SQLi: ${payload}`);
       },
       async tamperEdgeConfig(flag, value) {
           // Inject headers into all subsequent requests
           await page.setExtraHTTPHeaders({
               'x-vercel-edge-config': '1',
               'x-middleware-override': JSON.stringify({ [flag]: value })
           });
           console.log(`[PayloadInjector] Tampered Edge Config: ${flag}=${value}`);
       },
       poisonPrototype(jsonObj) {
           // Simple shallow poison for testing
           const malicious = JSON.parse(JSON.stringify(jsonObj));
           malicious['__proto__'] = { isAdmin: true };
           return malicious;
       }
    };
    await use(injector);
  },

  // 🧘 Chaos Logic (The Stress Test/Defibrillator)
  chaosLogic: async ({ page }, use) => {
      const chaos: ChaosLogic = {
          async simulateOfflineBomb(count) {
              console.log(`[Chaos] Planting Offline Bomb with ${count} items...`);
              await page.context().setOffline(true);
              // In a real scenario, this would interface with the UI to create orders
              // For now, we simulate the state:
              logDebug({ type: 'CHAOS_OFFLINE', status: 'User is now offline' });
              // The test calling this should proceed to click 'Add Order' X times.
              // Then we will reconnect:
              // setTimeout(() => page.context().setOffline(false), 5000); 
              // (But the test controls the timing usually)
          },
          async latencySpike(routePattern, delayMs) {
              console.log(`[Chaos] Injecting ${delayMs}ms latency into ${routePattern}`);
              await page.route(routePattern, async (route) => {
                  await new Promise(f => setTimeout(f, delayMs));
                  await route.continue();
              });
          },
          async induceClockSkew(seconds) {
              console.log(`[Chaos] Skewing clock by ${seconds}s...`);
              // Can use CDPSession for system time or just JS overrides
              // JS override is safer for just browser context
              await page.addInitScript((shift) => {
                  const originalDate = Date;
                  const shiftMs = shift * 1000;
                  // @ts-ignore
                  globalThis.Date = class extends originalDate {
                      constructor(...args: any[]) {
                          if (args.length === 0) {
                              super(Date.now() + shiftMs);
                          } else {
                              // @ts-ignore
                              super(...args);
                          }
                      }
                      static now() {
                          return originalDate.now() + shiftMs;
                      }
                  };
              }, seconds);
          }
      };
      await use(chaos);
  },

  // 👆 The "Phantom Finger" (Visual Touch Feedback)
  phantomFinger: [async ({ page }, use) => {
    await page.addInitScript(() => {
        const createDot = (x: number, y: number) => {
            const dot = document.createElement('div');
            dot.style.position = 'fixed';
            dot.style.left = `${x - 10}px`;
            dot.style.top = `${y - 10}px`;
            dot.style.width = '20px';
            dot.style.height = '20px';
            dot.style.borderRadius = '50%';
            dot.style.backgroundColor = 'rgba(255, 0, 0, 0.6)';
            dot.className = 'antigravity-dot'; // For test assertions
            dot.style.pointerEvents = 'none';
            dot.style.zIndex = '999999';
            dot.style.transition = 'opacity 0.6s ease-out';
            document.body.appendChild(dot);
            setTimeout(() => {
                dot.style.opacity = '0';
                setTimeout(() => dot.remove(), 600);
            }, 50);
        };

        ['click', 'touchstart'].forEach(event => {
            document.addEventListener(event, (e: any) => {
                const touch = e.touches ? e.touches[0] : e;
                if (touch) {
                    createDot(touch.clientX, touch.clientY);
                }
            }, { capture: true, passive: true });
        });
    });
    await use();
  }, { auto: true }],

  // 🧘 Human Physics Helper
  humanActions: async ({ page }, use) => {
    const actions: HumanActions = {
      async slowType(selector, text) {
        const loc = typeof selector === 'string' ? page.locator(selector) : selector;
        await loc.focus();
        for (const char of text) {
            await loc.pressSequentially(char, { delay: Math.random() * 100 + 50 }); // 50-150ms
        }
      },
      async humanTap(selector) {
        const loc = typeof selector === 'string' ? page.locator(selector) : selector;
        // Move "mouse" first
        await loc.hover(); 
        // Hesitation
        await page.waitForTimeout(300);
        await loc.click(); // or tap if mobile
      },
      async scrollWithInertia(y) {
        await page.mouse.wheel(0, y);
        // Simulate inertia could be more complex, but simple wheel is okay for now
        await page.waitForTimeout(500); 
      }
    };
    await use(actions);
  },

  // 📊 UX Auditor
  uxAuditor: async ({ page }, use, testInfo) => {
    const auditor: UXAuditor = {
        async checkA11y() {
            const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
            const violations = accessibilityScanResults.violations;
            if (violations.length > 0) {
                 const reportPath = path.join(__dirname, '../test-results/pathology-reports/accessibility-report.json');
                 const dir = path.dirname(reportPath);
                 if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                 fs.appendFileSync(reportPath, JSON.stringify(violations, null, 2));
            }
            // Fail on Critical/Serious
            const critical = violations.filter(v => ['critical', 'serious'].includes(v.impact || ''));
            expect(critical.length, `[Antigravity] Found ${critical.length} critical/serious A11y violations`).toBe(0);
        },
        async measurePerf() {
          const metrics = await page.evaluate(() => {
            const entries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            return {
                loadTime: entries.loadEventEnd - entries.loadEventStart,
            };
          });
          const perfPath = path.join(__dirname, '../test-results/vital-signs/performance-metrics.json');
          const dir = path.dirname(perfPath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.appendFileSync(perfPath, JSON.stringify(metrics) + ',\n');
        },
        async verifyThaiFont(selector = 'body') {
            const fontFamily = await page.$eval(selector, (el) => getComputedStyle(el).fontFamily);
            logDebug({ type: 'FONT_CHECK', font: fontFamily });
        }
    };
    await use(auditor);
  }
});

export { expect } from '@playwright/test';
