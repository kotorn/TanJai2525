import { test, expect } from '@playwright/test';

// Constants for the test
const RESTAURANT_ID = '11111111-1111-1111-1111-111111111111';
const TABLE_ID = '1';

test.describe('Antigravity Level 2: Customer Ordering Chaos', () => {
  
  test('Attack 1: Spam Submit Order (Race Condition Check)', async ({ page }) => {
    // 1. Go to page
    // Note: We expect the app to handle non-existent restaurant gracefully or we need to seed it.
    // For this test, we are more interested in the UI resilience.
    await page.goto(`/r/${RESTAURANT_ID}/t/${TABLE_ID}`);

    // Mock the Menu Response to ensure we have data to render
    // Use Playwright route interception
    await page.route(`**/menu_categories*`, async route => {
        const json = [{
            id: 'cat_1',
            name: 'Chaos Specials',
            sort_order: 1,
            menu_items: [
                { id: 'item_1', name: 'Spicy Bug', price: 99, is_available: true, image_url: null, description: 'Contains randomness' }
            ]
        }];
        await route.fulfill({ json });
    });

    // 2. Add Item to Cart
    await page.getByText('Spicy Bug').click();
    await page.getByRole('button', { name: 'Add to Cart' }).click();

    // 3. Open Cart
    await page.getByRole('button', { name: /View Cart/ }).click();

    // 4. Attack: Click "Confirm Order" 50 times rapidly
    const confirmBtn = page.getByRole('button', { name: 'Confirm Order' });
    
    let clickCount = 0;
    // Helper to spam clicks
    const spamClicks = async () => {
        for (let i = 0; i < 20; i++) {
            // We use dispatchEvent click to bypass 'disabled' attribute if relying on UI state only
            // But here we want to test if the button disables FAST enough.
            await confirmBtn.click().catch(() => {}); 
            clickCount++;
        }
    };

    const [response] = await Promise.all([
        page.waitForResponse(resp => resp.url().includes('submitOrder') || resp.status() === 200), // Server Action POST usually
        spamClicks()
    ]);

    // 5. Verify Reslience
    // Should verify that we didn't get multiple orders or errors.
    // Ideally check toast message.
    await expect(page.getByText('Order placed successfully')).toBeVisible();
    // Wait a bit to ensure no duplicate toasts
    await page.waitForTimeout(1000);
    const toasts = page.locator('.sonner-toast'); // Check Sonner toast count
    const count = await toasts.count();
    console.log(`Toasts triggered: ${count}`);
    expect(count).toBeLessThanOrEqual(1); // Should only succeed once
  });
});
