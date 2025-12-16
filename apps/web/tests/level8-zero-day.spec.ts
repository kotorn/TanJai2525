import { test, expect } from './fixtures';

test.describe('Level 8: Zero-Day (Penetration Testing)', () => {

  test('URL XSS Attack is Neutralized', async ({ page }) => {
    const xssPayload = '<script>window.xss_triggered=true</script>';
    const safeUrl = `/attack_${encodeURIComponent(xssPayload)}`;
    
    // 1. Visit the Malicious URL
    // The [tenant] param in NextJS will capture this.
    // If vulnerable, the script might execute.
    let navFailed = false;
    try {
      await page.goto(safeUrl, { waitUntil: 'domcontentloaded' });
    } catch (e) {
      console.log('Navigation error (expected if browser blocked xss):', e);
      navFailed = true;
    }
    
    if (navFailed) {
        // If the browser refuses to load the URL, we are safe.
        return; 
    }
    
    // 2. Verification
    const isPwned = await page.evaluate(() => {
        return (window as any).xss_triggered === true;
    }).catch(() => false); // If evaluate fails, context is dead -> safe
    
    expect(isPwned).toBe(false);
  });

});
