import { Page, expect, TestInfo } from '@playwright/test';
import { STRESS_TEST_DATA } from '../../src/lib/mock-data';
import fs from 'fs';
import path from 'path';

export async function addItemToCart(page: Page, itemName: string) {
    // Determine selector: simplified for now, assuming standard layout
    // In a real app, we'd use data-testid
    const itemLocator = page.locator(`text=${itemName}`).first();
    await expect(itemLocator).toBeVisible();
    
    // Click to open modal or add directly
    // Assuming clicking the item card opens a modal or adds to cart
    await itemLocator.click();

    // Check if a modal opened (Add to Cart button)
    const addToCartBtn = page.locator('button:has-text("Add to Cart")');
    if (await addToCartBtn.isVisible()) {
        await addToCartBtn.click();
    }
}

export async function submitOrder(page: Page) {
    const cartBtn = page.locator('button:has-text("Process Order")'); // Or cart icon
    if (await cartBtn.isVisible()) {
        await cartBtn.click();
    }
    
    // Confirm order
    const confirmBtn = page.locator('button:has-text("Confirm")');
    if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
    }

    // Wait for success message
    await expect(page.locator('text=Order Placed')).toBeVisible({ timeout: 5000 });
}

export async function captureUIState(page: Page, stateName: string) {
    const dir = 'ux-snapshots';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    await page.screenshot({ path: `${dir}/${stateName}.png`, fullPage: true });
    console.log(`📸 UI State Captured: ${stateName}`);
}

export async function recordJourney(page: Page, name: string, callback: () => Promise<void>) {
    console.log(`🎥 Starting Journey: ${name}`);
    await callback();
    console.log(`🏁 Completed Journey: ${name}`);
    // Video is saved automatically by context, we just ensure the test finishes
}

export async function injectMockData(page: Page) {
    // Helper to ensure mock data is loaded if we needed to inject it via console
    // Currently relying on backend or static mock-data file usage
}

export async function markItemOutOfStock(page: Page, itemName: string) {
    // Navigate to admin/menu
    await page.goto('/admin/menu');
    await page.locator(`text=${itemName}`).click();
    await page.locator('input[name="stock"]').fill('0');
    await page.locator('button:has-text("Save")').click();
}

export async function navigateToKitchen(page: Page) {
    await page.goto('/kitchen');
    await expect(page.locator('h1:has-text("Kitchen Display System")').or(page.locator('text=Kitchen'))).toBeVisible();
}
