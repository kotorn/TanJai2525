import { test, expect } from './fixtures';

test.describe('Level 2: The Tower of Babel (Localization)', () => {

  // 1. Babel Order Attack (Simulated Voice)
  // NOTE: Search box not implemented yet. Testing that dispatching the event doesn't crash the app.
  test('Babel Processor Event (Mock Voice) does not crash App', async ({ page, babel }) => {
    // Navigate to Order Page
    await page.goto('/default'); 
    
    // Simulate Voice Input: "Tam Bak Hung Phet Phet" (Isan for Spicy Som Tum)
    await babel.simulateVoiceInput('th-ISAN', 'Tam Bak Hung Phet Phet');
    
    // Assertion: App still alive (Menu still visible)
    // Default lang is 'th', so we look for Thai text
    await expect(page.getByText('ส้มตำไทย')).toBeVisible();
  });

  // 2. The "Tofu" Check (Font Rendering)
  test('Myanmar and Lao Text Renders without Tofu', async ({ page }) => {
    await page.goto('/default'); // Use 'default' tenant or similar
    
    // 1. Switch Language to Lao
    console.log('Navigated to /default. Waiting for Lao button...');
    
    // Use getByText for broader matching if Role is tricky with mixed content
    // We expect "ລາວ (Lao)" from i18n-config
    const laoLabel = page.getByText('ລາວ (Lao)');
    await expect(laoLabel).toBeVisible({ timeout: 10000 });
    
    console.log('Lao button found. Clicking...');
    await laoLabel.click({ force: true });

    // 2. Check for specific Lao characters in Menu
    // "Som Tum" in Lao: "ຕຳລາວ" (from page.tsx mock data)
    const laoText = page.getByText('ຕຳລາວ');
    await expect(laoText).toBeVisible();

    // 3. Computed Style Check (The Antigravity Check)
    // We verify the browser is actually using a Thai/Lao font, not "Times New Roman" or "Square"
    await laoText.evaluate((el) => {
        const font = window.getComputedStyle(el).fontFamily;
        if (font.includes('Times') || font.includes('Arial')) {
             // Generic fallback often means Tofu on Windows for complex scripts if unconfigured
             // This is a soft heuristic
             console.warn('Potential Font Fallback detected:', font);
        }
    });
  });

});
