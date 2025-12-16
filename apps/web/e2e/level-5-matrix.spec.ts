import { test, expect } from './fixtures/antigravity-test';

test.describe('LEVEL 5: The Matrix Sync (Cross-Platform)', () => {
    test('Sync Latency: LINE Browser (Customer) <-> XP Terminal (Cashier)', async ({ browser }) => {
        // 1. Setup "The Trojan Horse" (Customer on LINE)
        // We manually create a context that MIMICS the profile because we are inside a single test file
        // running under one project. To simulate cross-device, we need two contexts.
        const lineContext = await browser.newContext({
             userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Line/11.19.1',
             viewport: { width: 390, height: 844 },
             hasTouch: true
        });
        const linePage = await lineContext.newPage();

        // 2. Setup "The Legacy Patient" (Cashier on Win XP)
        const xpContext = await browser.newContext({
             userAgent: 'Mozilla/5.0 (Windows NT 5.1; rv:52.0) Gecko/20100101 Firefox/52.0',
             viewport: { width: 1024, height: 768 }
        });
        const xpPage = await xpContext.newPage();

        // 3. Open App on Both
        // Using same table/session ID logic "table=99"
        await Promise.all([
            linePage.goto('/tanjai?table=99'),
            xpPage.goto('/tanjai?table=99') // Or /kds if checking cashier view
        ]);

        // 4. Action: Customer orders on LINE
        await linePage.getByText('Add to Cart').first().click();
        await linePage.getByRole('button', { name: 'Place Order' }).click();
        const startTime = Date.now();

        // 5. Verification: Cashier sees it updates
        // Assuming there is a live feed or notification
        await expect(xpPage.locator('text=New Order')).toBeVisible({ timeout: 5000 });
        
        const latency = Date.now() - startTime;
        console.log(`⏱️ Sync Latency: ${latency}ms`);
        
        expect(latency).toBeLessThan(1000); // 1s Target
    });
});
