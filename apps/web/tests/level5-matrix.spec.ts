import { test, expect } from './fixtures';

test.describe('Level 5: The Matrix Sync (Cross-Device)', () => {

  test('Real-time State Sync between Two Devices', async ({ browser }) => {
    // 1. Create Two Separate Contexts (Simulating two devices)
    const deviceA = await browser.newContext();
    const deviceB = await browser.newContext();

    const pageA = await deviceA.newPage();
    const pageB = await deviceB.newPage();

    // 2. Both Open the Same Tenant
    await pageA.goto('/default');
    await pageB.goto('/default');

    // 3. Device A Adds an Item
    console.log('[Device A] Adding Item...');
    const addBtnA = pageA.getByRole('button', { name: /ใส่ตะกร้า|Add/i }).first();
    await addBtnA.click();
    
    // Verify A sees it locally
    await expect(pageA.getByText(/1 items|1 รายการ/i)).toBeVisible();

    // 4. Device B Should See it (The Matrix Update)
    console.log('[Device B] Waiting for Sync...');
    // Realtime sync should happen within 1 second usually
    // We give it a generous 5s for the test
    const cartBadgeB = pageB.getByText(/1 items|1 รายการ/i);
    
    try {
        await expect(cartBadgeB).toBeVisible({ timeout: 5000 });
    } catch (e) {
        throw new Error('MATRIX ERROR: Device B did not receive the update from Device A.');
    }
    
    // Cleanup
    await deviceA.close();
    await deviceB.close();
  });

});
