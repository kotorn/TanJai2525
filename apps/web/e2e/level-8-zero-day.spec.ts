import { test, expect } from './fixtures/antigravity-test';

test.describe('LEVEL 8: The Zero-Day (Security Hardening)', () => {

    test('Attack 1: Stored XSS Injection', async ({ page }) => {
        await page.goto('/tanjai');
        
        // 1. Inject Malicious Script into Input (e.g., Special Request / Note)
        // "<script>alert(1)</script>" or "<img src=x onerror=alert(1)>"
        const payload = '<img src=x onerror=alert("XSS")>';
        
        // Locate a text area (e.g. Kitchen Note)
        const noteInput = page.getByPlaceholder('Special Instructions');
        if (await noteInput.count() > 0) {
            await noteInput.fill(payload);
            await page.getByRole('button', { name: 'Add to Cart' }).click();
            
            // 2. Open Cart/Review
            await page.getByRole('button', { name: /View Cart/ }).click();

            // 3. Verify Payload is NOT executed
            // We search for the raw text being rendered OR ensuring no alert dialog fired.
            // Playwright auto-dismisses dialogs but we can listen for them.
            let alertTriggered = false;
            page.on('dialog', dialog => {
                if (dialog.message().includes('XSS')) {
                    alertTriggered = true;
                    dialog.dismiss();
                }
            });

            // Wait a moment for render
            await page.waitForTimeout(500);
            
            expect(alertTriggered).toBe(false);
            
            // Also verify the text is escaped in DOM
            const body = await page.content();
            expect(body).not.toContain(payload); // Should be escaped like &lt;img...
        } else {
            console.log('⚠️ No text input found for XSS test, skipping payload injection.');
        }
    });

    test('Attack 2: RAM Scraping (PII in Storage)', async ({ page }) => {
        await page.goto('/tanjai');
        
        // 1. Simulate checkout flow logic that might cache data
        // ... (Simplified: assumes user data loaded)

        // 2. Dump Session Storage & Local Storage
        const storageData = await page.evaluate(() => {
            return {
                local: JSON.stringify(localStorage),
                session: JSON.stringify(sessionStorage)
            };
        });

        // 3. Scan for Sensitive Keywords (Mock Credit Card, etc)
        const sensitivePatterns = [
            /4[0-9]{12}(?:[0-9]{3})?/, // Visa-like
            /5[1-5][0-9]{14}/,          // Mastercard-like
            /"password":\s*".+"/,       // Basic password leak
            /"token":\s*"ey/            // JWT leakage (sometimes acceptable, but checking scope)
        ];

        let vulnerable = false;
        sensitivePatterns.forEach(pattern => {
            if (pattern.test(storageData.local) || pattern.test(storageData.session)) {
                console.error(`🚨 PII Leak Detected matching pattern: ${pattern}`);
                vulnerable = true;
            }
        });

        expect(vulnerable).toBe(false);
    });

});
