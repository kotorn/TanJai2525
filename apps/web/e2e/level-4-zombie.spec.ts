import { test, expect } from './fixtures/antigravity-test';

test.describe('LEVEL 4: The Zombie Mode (Offline & Resilience)', () => {
  
  test('Attack 1: Queue Flooding in Offline Mode', async ({ page, context }) => {
    await page.goto('/tanjai');
    
    // 1. Enter Offline Mode
    await context.setOffline(true);
    console.log('🔌 Went Offline');

    // 2. Queue 5 Orders
    for (let i = 1; i <= 5; i++) {
        // Assuming optimistic UI updates
        // We might need to mock the "Add to Cart" to not fail immediately if it hits an API
        // But Antigravity expects TanStack Query/Offline logic to handle this.
        await page.getByText('Add to Cart').first().click(); // Simplified selector
        console.log(`🛒 Added Item ${i} (Offline)`);
        // Simulate minor delay
        await page.waitForTimeout(100);
    }

    // 3. Verify Queue visual indicator (if any)
    const cartBadge = page.locator('.cart-badge');
    if (await cartBadge.isVisible()) {
        await expect(cartBadge).toHaveText('5');
    }

    // 4. Resurrection (Go Online)
    await context.setOffline(false);
    console.log('⚡ Went Online');

    // 5. Verify Synchronization
    // We expect the app to flush the queue.
    // Wait for network idle or specific success state
    await expect(page.locator('text=Synced successfully').or(page.locator('text=Order Placed'))).toBeVisible({ timeout: 10000 });
  });

  test('Attack 2: The Kill Switch (Tab Crash & Restore)', async ({ page }) => {
    await page.goto('/tanjai');
    
    // 1. Add item to cart
    await page.getByText('Add to Cart').first().click();
    await expect(page.locator('text=1 item')).toBeVisible();

    // 2. Simulating "Crash" isn't fully possible in Playwright without closing page.
    // So we Reload the page (F5) to test persistence.
    // or we can use page.close() and re-open context, but reload is standard for "User refreshed due to lag".
    await page.reload();

    // 3. Verify Cart Persistence
    await expect(page.locator('text=1 item')).toBeVisible();
    console.log('🧟 Cart resurrected after reload');
  });

});
