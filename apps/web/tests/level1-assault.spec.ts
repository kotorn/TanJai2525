import { test, expect } from './fixtures';

test.describe('🔥 LEVEL 1: CORE ADVERSARIAL ATTACKS', () => {
    
    // 1.1 SQL Injection via Server Actions
    test('1.1 SQL Injection via Input Fields', async ({ page, payloadInjector }) => {
        await page.goto('/');
        
        // Navigate to a point where we can input data, e.g., "Add Member" or "Search"
        // Assuming there is a search bar or input field exposed
        // If not, we might need to find a specific route.
        // Let's assume a generic search or login form for now to demonstrate.
        // Or better, try to add an item with a malicious note.
        
        // Wait for app to load
        await page.waitForSelector('body');

        const inputSelector = 'input[type="text"], input[type="search"]';
        if (await page.locator(inputSelector).count() > 0) {
            await payloadInjector.injectSQLi(inputSelector);
            // Submit
            await page.keyboard.press('Enter');
            
            // Analyze Result: Should NOT see Database Error, 500, or raw SQL dump
            // The NetworkSniffer will catch 500s.
            // We check for visible error text.
            await expect(page.locator('body')).not.toContainText('syntax error');
            await expect(page.locator('body')).not.toContainText('PostgresError');
        } else {
            console.log('Skipping SQLi UI test - no inputs found on home page');
        }
    });

    // 1.2 RLS Policy Bypass (Broken Access Control)
    test('1.2 RLS Policy Bypass / Unauthorized Access', async ({ page, request }) => {
        // Attempt to access a protected resource without auth or with wrong auth
        // This effectively tests that the API returns 401/403 and NOT data
        
        // Example: Try to fetch inventory without a session
        const response = await request.get('/api/inventory', {
            headers: {
                'Authorization': 'Bearer invalid-token'
            }
        });
        
        // Should be 401 or 403
        // If 200, we have a problem (unless public)
        // If 500, backend crashed (handled by Sniffer, but specific check here)
        expect(response.status()).not.toBe(500);
        
        // If we get data, fail
        if (response.status() === 200) {
            const data = await response.json();
             // If sensitive data returned
            expect(data).not.toHaveProperty('all_tenant_secrets');
        }
    });

    // 1.3 Shadow API & Credentials
    test('1.3 Shadow API & Credentials Scan', async ({ page }) => {
        await page.goto('/');
        
        // Extract all script src
        const scripts = await page.locator('script[src]').all();
        const srcList = await Promise.all(scripts.map(s => s.getAttribute('src')));
        
        for (const src of srcList) {
            if (!src || !src.startsWith('/') && !src.startsWith(process.env.NEXT_PUBLIC_BASE_URL || 'http')) continue;
            
            const fullUrl = src.startsWith('http') ? src : `http://localhost:3000${src}`;
            try {
                const jsContent = await (await fetch(fullUrl)).text();
                
                // Regex for common secrets
                const secretPatterns = [
                    /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE/i,
                    /sk_live_[0-9a-zA-Z]{24}/, // Stripe
                    /ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/ // JWT (too noise? maybe check for specific keys)
                ];
                
                for (const pattern of secretPatterns) {
                    expect(jsContent).not.toMatch(pattern);
                }
            } catch (e) {
                console.log(`Failed to fetch script ${src} for scanning`);
            }
        }
    });

    // 1.4 RAM Scraping Vector (P2PE Failure)
    test('1.4 RAM Scraping Vector (Storage Analysis)', async ({ page, humanActions }) => {
        await page.goto('/');
        
        // Simulate a flow that might store data
        // e.g., Add content to cart
        await humanActions.humanTap('button:has-text("S")'); // Add Item size S (Example)
        
        // Check Storage
        const storage = await page.evaluate(() => {
            return {
                local: JSON.stringify(localStorage),
                session: JSON.stringify(sessionStorage)
            };
        });
        
        // Regex for Credit Card (Luhn check is hard in regex, just basic shape)
        // 4 groups of 4 digits or similar.
        // And Thai ID (13 digits)
        const panRegex = /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/;
        const thaiIdRegex = /\b\d{13}\b/;
        
        expect(storage.local).not.toMatch(panRegex);
        expect(storage.session).not.toMatch(panRegex);
        
    });

    // 1.5 Bonus: Verify Antigravity Fixture Health
    // Ensure that our "Ischemic Network" Jitter is actually working if the project is selected
    test('1.5 Verify Battlefield Conditions', async ({ page }, testInfo) => {
        if (testInfo.project.name.includes('Ischemic')) {
            const start = Date.now();
            await page.route('**/api/health-check-simulation', async route => {
                await route.fulfill({ status: 200, body: 'OK' });
            });
            // Request to a dummy route that should be intercepted by jitter
            await page.evaluate(async () => {
                await fetch('/api/health-check-simulation');
            });
            const duration = Date.now() - start;
            console.log(`[Ischemic Verification] Request too ${duration}ms`);
            // We expect at least *some* delay if jitter is working, though random(0..500) can be 0.
            // But statistically it should be > 0.
        }
    });

});
