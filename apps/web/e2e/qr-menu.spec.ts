import { test, expect } from '@playwright/test';

test.describe('Feature: Visual Menu & Smart QR', () => {

  test('Owner can generate Static QR', async ({ page }) => {
    await page.goto('/admin/qr');
    
    // Select Static Tab
    await page.getByRole('tab', { name: 'Static' }).click();
    
    // Input Table Number
    await page.getByPlaceholder('e.g. 12').fill('99');
    
    // Generate
    await page.getByRole('button', { name: 'Generate Static QR' }).click();
    
    // Verify QR appears
    await expect(page.locator('#qr-code-svg')).toBeVisible();
    await expect(page.getByText('static-99')).toBeVisible();
  });

  test('Customer Redirect works for Dynamic Token', async ({ page }) => {
    // Mock the DB response for the token lookup
    await page.route('**/rest/v1/qr_codes*', async route => {
        const json = {
            restaurant_id: 'mock-rest-id',
            table_number: '55',
            token: 'valid-token',
            expires_at: new Date(Date.now() + 100000).toISOString() // Future
        };
        await route.fulfill({ json });
    });

    // Visit the dynamic route
    await page.goto('/order/valid-token');
    
    // Expect redirect
    // Note: The page does a server-side redirect, so Playwright follows it.
    // We expect to end up at the destination URL.
    await expect(page).toHaveURL(/.*\/r\/mock-rest-id\/t\/55.*/);
  });

  test('Customer Transfer to Expired Token Page', async ({ page }) => {
    // Mock Expired
    await page.route('**/rest/v1/qr_codes*', async route => {
        const json = {
            token: 'expired-token',
            expires_at: new Date(Date.now() - 100000).toISOString() // Past
        };
        await route.fulfill({ json });
    });

    await page.goto('/order/expired-token');
    
    await expect(page.getByText('QR Code Expired')).toBeVisible();
  });

  test('Visual Menu Renders Correctly', async ({ page }) => {
    await page.goto('/menu/demo');
    
    // Check for Grid
    await expect(page.getByText('Truffle Mushroom Congee')).toBeVisible();
    await expect(page.getByText('Spicy Miso Tonkotsu')).toBeVisible();
    
    // Check Add Button exists
    // The Hero card has "Get Your Warmth", List items have "add" icon
    await expect(page.getByRole('button', { name: 'Get Your Warmth' })).toBeVisible();
  });

});
