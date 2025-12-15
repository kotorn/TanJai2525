import { test, expect } from '@playwright/test';
import { injectCursorVisuals } from '../e2e/helpers/input-simulator';

test('Capture Hero Screenshots', async ({ page }) => {
    // 1. Dashboard Helper
    await page.goto('/login');
    // Mock login
    await page.getByText('[DEV] Simulate Owner Login').click();
    
    // 2. Dashboard
    await page.goto('/zaap-e-san/admin/dashboard');
    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({ path: 'hero-dashboard.png', fullPage: true });

    // 3. Menu
    await page.goto('/zaap-e-san/admin/menu');
    await expect(page.getByText('Menu Management')).toBeVisible();
    await page.screenshot({ path: 'hero-menu.png', fullPage: true });

    // 4. KDS
    await page.goto('/zaap-e-san/kds');
    await expect(page.locator('h1')).toHaveText('Kitchen Display System');
    await page.screenshot({ path: 'hero-kds.png', fullPage: true });

    // 5. Ordering (Mobile)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/zaap-e-san?tableId=1');
    await expect(page.getByText('Zaap E-San')).toBeVisible();
    await page.screenshot({ path: 'hero-ordering.png' });
});
