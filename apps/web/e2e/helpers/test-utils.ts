import { Page, expect } from '@playwright/test';

export async function loginAndSetup(ownerPage: Page, tenantSlug: string) {
    // Login Bypass
    await ownerPage.goto('/login');
    await ownerPage.getByRole('button', { name: '[DEV] Simulate Owner Login' }).click();
    await expect(ownerPage).toHaveURL(/\/onboarding/);

    // Onboarding
    await ownerPage.getByPlaceholder('Ex. Som Tum Der').fill('Zaap Nua E-San');
    if (await ownerPage.getByRole('button', { name: 'Thai' }).isVisible()) {
        await ownerPage.getByRole('button', { name: 'Thai' }).click();
    }
    await ownerPage.getByText('Create Shop').click();
    await expect(ownerPage).toHaveURL(new RegExp(`/${tenantSlug}`));
}

export async function addMenuItem(ownerPage: Page, slug: string, name: string, price: string) {
    await ownerPage.goto(`/${slug}/admin/menu`);
    // Check if exists first to avoid duplicates in restart
    if (await ownerPage.getByText(name).count() === 0) {
        await ownerPage.getByPlaceholder('e.g. Som Tum').fill(name);
        await ownerPage.getByPlaceholder('50').fill(price);
        await ownerPage.getByRole('button', { name: 'Add Item' }).click();
        await expect(ownerPage.getByText('Menu item added')).toBeVisible();
    }
}

export async function generateQRCodes(ownerPage: Page, slug: string, count: number) {
    await ownerPage.goto(`/${slug}/admin/dashboard`);
    await ownerPage.locator('input[type="number"]').fill(count.toString());
    await ownerPage.getByRole('button', { name: 'Generate Links' }).click();
    await expect(ownerPage.locator('text=open Table 1')).toBeVisible();
}

export async function addItemToCart(page: Page, itemName: string) {
    // Retry logic for locating items in a chaotic list
    await expect(page.getByText(itemName).first()).toBeVisible({ timeout: 5000 });
    await page.getByText(itemName).first().click();
    await page.getByRole('button', { name: '+' }).first().click();
    // Close modal if it stays open (optional, depends on UI)
    // await page.keyboard.press('Escape'); 
}

export async function submitOrder(page: Page) {
    await page.locator('a[href*="/cart"]').click();
    if (await page.getByText('Guest Checkout').isVisible()) {
        await page.getByText('Guest Checkout').click();
    }
    await page.getByRole('button', { name: /Confirm|Submit/i }).click();
    await expect(page.getByText(/Order Status|Order Confirmed/i)).toBeVisible();
}
