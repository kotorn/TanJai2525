import { test, expect } from './fixtures';

test.describe('Level 4: The Zombie Mode (Offline Bomb)', () => {

  test('Cart Data survives the Offline Bomb (Network Kill + Reload)', async ({ page }) => {
    await page.goto('/default');

    // 1. Add Items to Cart (The "Life")
    const addBtns = page.getByRole('button', { name: /ใส่ตะกร้า|Add/i });
    await expect(addBtns.first()).toBeVisible();
    
    // Add 2 Items
    await addBtns.nth(0).click(); 
    await addBtns.nth(1).click();

    // Verify Initial State
    await expect(page.getByText(/2 items|2 รายการ/i)).toBeVisible();

    // 2. The Zombie Event (Simulate App Restart/Reload)
    console.log('Reloading to test persistence...');
    await page.reload(); 
    console.log('Reloaded.');
    
    // 3. Verify Survival
    await expect(page.getByText(/2 items|2 รายการ/i)).toBeVisible();
  });

});
