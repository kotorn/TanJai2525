import { test, expect } from './fixtures';

test.describe('Level 7: Chaos Endurance (Memory & Stability)', () => {

  test('The App Survives 50 Rapid Interactions (The Chaos Loop)', async ({ page }) => {
    // Increase timeout for this stress test
    test.setTimeout(120000); 

    await page.goto('/default');
    
    // Performance Marker Start
    const startTime = Date.now();
    
    // The Loop
    const ITERATIONS = 50;
    
    for (let i = 0; i < ITERATIONS; i++) {
        // Unstable randomness simulating a frantic user
        
        // 1. Add to Cart (Random Item)
        const addBtns = await page.getByRole('button', { name: /ใส่ตะกร้า|Add/i }).all();
        if (addBtns.length > 0) {
            const randomBtn = addBtns[Math.floor(Math.random() * addBtns.length)];
            await randomBtn.click({ force: true });
        }
        
        // 2. Switch Language (Randomly)
        // If we are on Thai, switch to English, etc.
        // We just toggle randomly
        if (Math.random() > 0.7) {
            const langBtns = page.getByRole('button', { name: /Language/i }); // Or direct text
            // Just clicking one of the language pills if visible
            // For stability, let's just stick to adding items to avoid navigation refresh chaos for now,
            // or perform a safe toggle if we can find it.
            // Let's stick to "Add to Cart" stress for V1.
        }

        // 3. Hover effects (Viral check)
        if (i % 10 === 0) {
             const menuItem = page.locator('.group').first();
             await menuItem.hover();
        }
        
        // Allow a tiny breather to prevent blocking the event loop completely (simulating human-ish speed)
        // await page.waitForTimeout(50); 
    }
    
    // Verify App is still responsive
    const totalDuration = Date.now() - startTime;
    console.log(`[CHAOS] Completed ${ITERATIONS} iterations in ${totalDuration}ms`);
    
    // Final Assertion: Cart count should be high (initial load might add some, plus 50 new ones)
    // We just verify the badge exists and the page didn't crash
    await expect(page.getByText(/items|รายการ/i)).toBeVisible();
    
    // Optional: Heap Snapshot check (Playwright internal) - difficult to assert in standard runner,
    // so we rely on "Did it crash?".
  });

});
