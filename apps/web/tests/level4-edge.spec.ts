import { test, expect } from './fixtures';
import * as fs from 'fs';

test.describe('LEVEL 4: Edge Cases (Transactional Integrity)', () => {
    test.setTimeout(90000);

    test('Case 1: Instant Cancel (Rollback)', async ({ page, humanActions }) => {
        // Login & Setup (Matched to Level 2)
        await page.goto('http://localhost:3000/login');
        const startBtn = page.locator('button:has-text("Simulate Owner Login")');
        await startBtn.waitFor();
        await humanActions.humanTap(startBtn);
        
        // Handle Onboarding if necessary
        await page.waitForLoadState('networkidle');
        if (page.url().includes('/onboarding')) {
            const shopInput = page.getByPlaceholder('e.g. Noodle Master');
            await shopInput.waitFor();
            await humanActions.slowType(shopInput, 'Edge Shop 1');
            const nextBtn = page.locator('button:has-text("Start using Tanjai POS")');
            await humanActions.humanTap(nextBtn);
        }

        // Add Item
        const searchInput = page.locator('input[type="text"], input[type="search"]').first();
        await searchInput.waitFor();
        await humanActions.slowType(searchInput, 'Som Tum');
        const item = page.locator('text=Som Tum').first();
        await item.waitFor();
        await page.locator('button:has-text("Add")').first().click({ force: true });

        // Verify Cart has 1 item
        // NOTE: We assume there's a cart count or sidebar. 
        // For this test, we assume a "Cart" link or Sidebar is visible.
        // Let's look for "1" in the header/cart icon.
        
        // Go to Cart (Click Icon)
        const cartIcon = page.locator('a[href*="/cart"]');
        await cartIcon.waitFor();
        await humanActions.humanTap(cartIcon);
        
        // Verify Item in Cart
        const cartItem = page.locator('text=Som Tum');
        try {
            await expect(cartItem).toBeVisible({ timeout: 10000 }); // Increase timeout
        } catch (e) {
             console.log('Cart Verification Failed: Dumping DOM');
             fs.writeFileSync('dump_cart_fail.html', await page.content());
             throw e;
        }

        // CANCEL / REMOVE
        const removeBtns = page.locator('button:has(.lucide-trash)');
        const count = await removeBtns.count();
        console.log(`Found ${count} remove buttons`);
        
        if (count > 0) {
            await humanActions.humanTap(removeBtns.first());
            await page.waitForTimeout(1000); // Wait for state update
        } else {
            console.log('NO REMOVE BUTTON FOUND!');
            // Dump page since we know we failed to find button
            fs.writeFileSync('dump_no_remove_btn.html', await page.content());
        }

        // Verify Empty
        await expect(page.locator('text=Cart is empty')).toBeVisible({ timeout: 5000 });
    });

    // Case 2: Stockout Race - Skipped (Requires Checkout Implementation)
    // test('Case 2: Stockout Race', async ({ browser }) => { ... });

    test('Case 2b: Sold Out UI', async ({ page, humanActions }) => {
        await page.goto('http://localhost:3000/login');
        const startBtn = page.locator('button:has-text("Simulate Owner Login")');
        await startBtn.waitFor();
        await humanActions.humanTap(startBtn);

        // Onboarding
        await page.waitForLoadState('networkidle');
        if (page.url().includes('/onboarding')) {
            const shopInput = page.getByPlaceholder('e.g. Noodle Master');
            await shopInput.waitFor();
            await humanActions.slowType(shopInput, 'Edge Shop 2');
            const nextBtn = page.locator('button:has-text("Start using Tanjai POS")');
            await humanActions.humanTap(nextBtn);
        }

        const searchInput = page.locator('input[type="text"], input[type="search"]').first();
        await searchInput.waitFor();
        await humanActions.slowType(searchInput, 'Sold Out Item'); 
        
        // We need to seed "Sold Out Item" first!
        // I'll update provisionTenant one more time.
        
        const item = page.locator('text=Sold Out Item').first();
        // Wait for it? If finding fails, test fails.
        // Assuming I add it in next step.
        
        // Expect Button to be disabled or styled gray
        // Button is sibling?
        // locator(..).locator('button')
        // We can look for a button near "Sold Out Item" or strictly "add-to-cart-btn" within the card.
        // The component has `disabled={isOutOfStock}`.
        
        // Find the specific button for this item.
        // Using "near" or layout selectors.
        // For simplicity: The grid renders items in order.
        // If I search specifically for 'Sold Out Item', it should be the only one.
        // So the first button on page (after search) is the one.
        
        await item.waitFor(); // Wait for search result
        const btn = page.locator('button:has(.lucide-plus)').first(); // The Add Button
        
        await expect(btn).toBeDisabled();
    });
});
