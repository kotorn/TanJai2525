import { test, expect } from './fixtures';
import * as fs from 'fs';

test.describe('LEVEL 5: Multi-Device Sync (The Orchestra)', () => {
    test('User A Orders -> User B (KDS) Sees Ticket', async ({ browser, humanActions }) => {
        // 1. User A (Customer) - Mobile Context
        const customerContext = await browser.newContext({
            viewport: { width: 390, height: 844 }, // iPhone 12
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
            hasTouch: true
        });
        const pageA = await customerContext.newPage();
        
        // Login & Setup A
        console.log('User A: Login');
        await pageA.goto('http://localhost:3000/login');
        await pageA.locator('button:has-text("Simulate Owner Login")').click();
        
        // Handle Onboarding A (Explicit)
        console.log('Checking Onboarding...');
        const shopInput = pageA.getByPlaceholder('e.g. Noodle Master');
        // Wait up to 10s for it to appear
        await shopInput.waitFor({ state: 'visible', timeout: 10000 });
        console.log('Onboarding Visible. Filling...');
        await shopInput.fill('Sync Shop');
        await pageA.locator('button:has-text("Start using Tanjai POS")').click();
        console.log('Onboarding Submitted.');

        console.log('Waiting for Tenant URL... Current: ' + pageA.url());
        try {
             await pageA.waitForURL(/http:\/\/localhost:3000\/[a-zA-Z0-9-]+$/, { timeout: 10000 });
        } catch(e) {
             console.log('Timeout waiting for URL. Dumping page.');
             fs.writeFileSync('dump_level5_timeout.html', await pageA.content());
             throw e;
        }
        const urlParts = pageA.url().split('/');
        const tenantSlug = urlParts[urlParts.length - 1];
        console.log(`Tenant Slug detected: ${tenantSlug}`);

        // 2. User B (Kitchen) - Tablet Context
        const kdsContext = await browser.newContext({
            viewport: { width: 1024, height: 768 }, // iPad
            userAgent: 'Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1'
        });
        const pageB = await kdsContext.newPage();

        console.log('User B: Opening KDS');
        await pageB.goto(`http://localhost:3000/${tenantSlug}/kds`);
        await expect(pageB.locator('text=Kitchen Display System')).toBeVisible();

        // 3. User A Places Order
        console.log('User A: Ordering Som Tum');
        const searchInput = pageA.locator('input[type="text"], input[type="search"]').first();
        await searchInput.waitFor();
        await searchInput.fill('Som Tum'); 
        console.log('User A: Search filled');
        
        await pageA.locator('text=Som Tum').first().waitFor();
        await pageA.locator('button:has-text("Add")').first().click({ force: true });
        console.log('User A: Added to Cart');
        
        // A: Go to Cart & Checkout
        const cartIcon = pageA.locator('a[href*="/cart"]');
        await cartIcon.click();
        console.log('User A: Navigated to Cart');
        
        // A: Confirm Order
        const confirmBtn = pageA.locator('button:has-text("Confirm Order")');
        await confirmBtn.waitFor();
        await confirmBtn.click();
        console.log('User A: Clicked Confirm');
        
        // Wait for success toast or redirect
        await expect(pageA.locator('text=Order placed!')).toBeVisible();
        console.log('User A: Order Placed Success');

        // 4. User B Verifies (Sync)
        console.log('User B: Checking for Ticket');
        // Try Auto First (if polling implemented)
        try {
            await expect(pageB.locator('text=Som Tum')).toBeVisible({ timeout: 5000 });
            console.log('User B: Auto-sync success!');
        } catch {
            console.log('Auto-sync missed. manual reload.');
            await pageB.reload();
            await expect(pageB.locator('text=Som Tum')).toBeVisible();
            console.log('User B: Manual reload success!');
        }
        
        // Verify Status/Card
        await expect(pageB.locator('.ticket-card')).toBeVisible();

        // Cleanup
        await customerContext.close();
        await kdsContext.close();
    });
});
