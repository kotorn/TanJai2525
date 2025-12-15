import { test, expect } from '@playwright/test';

test('Capture Hero Screenshots (Debug)', async ({ page }) => {
    console.log('Starting debug screenshot test...');
    try {
        console.log('Navigating to login...');
        await page.goto('/login');
        console.log('Navigated. Title:', await page.title());
        
        // Mock login
        console.log('Clicking login bypass...');
        await page.getByText('[DEV] Simulate Owner Login').click();
        
        // 2. Dashboard
        console.log('Navigating to dashboard...');
        await page.goto('/zaap-e-san/admin/dashboard');
        await expect(page.locator('h1')).toBeVisible();
        await page.screenshot({ path: 'hero-dashboard.png', fullPage: true });
        console.log('Dashboard captured.');

    } catch (e) {
        console.error('Test Failed:', e);
        await page.screenshot({ path: 'debug-error.png' });
        throw e;
    }
});
