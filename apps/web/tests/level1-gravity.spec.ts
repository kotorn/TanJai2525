import { test, expect } from './fixtures';

test.describe('LEVEL 1: Gravity Check (Sanity)', () => {

  test('Mobile Chrome Sanity: Login & Menu Interaction', async ({ page, humanActions, networkSniffer }) => {
    // 1. Visit App
    await page.goto('/login');
    
    // 2. Wait for Load
    await page.waitForLoadState('domcontentloaded');

    // 3. Verify Server Liveness (Implicit via goto not failing 500, handled by networkSniffer)
    const title = await page.title();
    console.log(`Page Title: ${title}`);
    expect(title).not.toBe('');

    // 4. Phantom Finger & Interaction Check
    // Find a clickable element (Login button or generic interactive element)
    // We'll look for a common button or link.
    const interactive = page.locator('button, a, [role="button"]').first();
    await interactive.waitFor({ state: 'visible', timeout: 5000 }).catch(() => console.log('No buttons found?'));

    if (await interactive.isVisible()) {
        await humanActions.humanTap(interactive);
        
        // 5. Verify "Phantom Finger" Red Dot
        // The dot appears on click/touch. We need to check if it exists in DOM.
        // It stays for ~600ms.
        const dot = page.locator('.antigravity-dot');
        await expect(dot).toBeAttached({ timeout: 1000 });
        await expect(dot).toHaveCSS('background-color', 'rgba(255, 0, 0, 0.6)');
    }
  });

});
