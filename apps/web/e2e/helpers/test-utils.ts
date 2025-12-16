import { Page, expect, TestInfo } from '@playwright/test';
import { STRESS_TEST_DATA } from '../../src/lib/mock-data';
import fs from 'fs';
import path from 'path';

export async function addItemToCart(page: Page, itemName: string) {
    // 1. Find the card containing the item name
    // The structure is: div > div(img) + div(content > h3(name) + div(price+btn))
    // We can filter for the card div that has the text.
    const card = page.locator(`div.bg-white.rounded-xl`).filter({ hasText: itemName }).first();
    
    // 2. Ensure card is visible
    await expect(card).toBeVisible();

    // 3. Click the Add to Cart button inside the card
    // The button has aria-label="Add" (in English) or similar.
    // We can just find the button in the bottom right of the card.
    const addBtn = card.locator('button[aria-label]'); // The share button also has aria-label, but it's top right.
    // The Add button is in the flex-justify-between container at the bottom.
    // Let's use the svg icon or just the last button in the card.
    const buttons = card.locator('button');
    const count = await buttons.count();
    const actionBtn = buttons.nth(count - 1); // Last button is Add
    
    await actionBtn.click();
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
    await page.goto('/tanjai/admin/menu');
    await page.locator(`text=${itemName}`).click();
    await page.locator('input[name="stock"]').fill('0');
    await page.locator('button:has-text("Save")').click();
}

export async function navigateToKitchen(page: Page) {
    await page.goto('/tanjai/kds');
    await expect(page.locator('h1:has-text("Kitchen Display System")').or(page.locator('text=Kitchen'))).toBeVisible();
}
