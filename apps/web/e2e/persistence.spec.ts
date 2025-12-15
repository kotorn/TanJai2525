import { test, expect } from './fixtures/antigravity-test';
import { humanClick, humanType, mobileTap } from './helpers/input-simulator';

test.describe('Antigravity: Cart Persistence & Chaos', () => {

    test('Scenario: The Indecisive Customer (Reload Persistence)', async ({ page }) => {
        // 1. Visit Menu
        await page.goto('/');
        
        // 2. Add Items
        await test.step('Customer Adds Items', async () => {
             // Assuming mobile/responsive layout or desktop
             // Use our human inputs
             await humanClick(page, 'text=Som Tum Thai');
             // Add to cart
             await humanClick(page, 'button:has-text("+") >> nth=0'); 
             
             await humanClick(page, 'text=Grilled Chicken');
             await humanClick(page, 'button:has-text("+") >> nth=0');
        });

        // 3. Verify Cart Count before reload
        await expect(page.locator('.cart-count, .badge, [aria-label="Cart item count"]')).toContainText('2'); // Adjust selector as needed

        // 4. ⚡ CHAOS: Reload Page
        console.log('⚡ Triggering Page Reload (Chaos Check)...');
        await page.reload();

        // 5. Verify Persistence
        await test.step('Verify Cart Persistence', async () => {
            // Wait for hydration
            await page.waitForTimeout(1000); 
            
            // Assert items still exist
            const cartCount = page.locator('.cart-count, .badge, [aria-label="Cart item count"]');
            await expect(cartCount).toBeVisible();
            await expect(cartCount).toContainText('2');
            
            // Go to cart and check item names
            await humanClick(page, 'a[href*="/cart"]');
            await expect(page.locator('text=Som Tum Thai')).toBeVisible();
            await expect(page.locator('text=Grilled Chicken')).toBeVisible();
        });
    });
});
