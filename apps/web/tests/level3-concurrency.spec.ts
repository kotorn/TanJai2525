import { test, expect } from './fixtures';

test.describe('Level 3: Concurrency & The Rush', () => {

  // 1. The Double Tap (React State Integrity)
  test('Double Tap "Add" accurately increments Quantity', async ({ page, phantomFinger }) => {
    await page.goto('/default');

    // Find the first "Add to Cart" button (orange button with plus icon or cart)
    // Based on page.tsx: aria-label={t.addToCart} -> "ใส่ตะกร้า" (th)
    // We'll use the button inside the first menu item.
    const addBtns = page.getByRole('button', { name: /ใส่ตะกร้า|Add/i });
    const firstAddBtn = addBtns.first();
    await expect(firstAddBtn).toBeVisible();

    // Tap Twice Rapidly
    await firstAddBtn.click();
    await firstAddBtn.click();

    // Validation: Check Cart Badge
    // Cart bar: "2 รายการ" or "2 items"
    const cartBadge = page.getByText(/2 items|2 รายการ/i);
    await expect(cartBadge).toBeVisible();
  });

  // 2. The Calculation Check (Math Integrity)
  test('Cart Totals are accurate after multiple additions', async ({ page }) => {
     await page.goto('/default');
     
     // Price of first item (A01 Som Tum) = 50
     // Price of second item (A02 Kai Yang) = 80
     
     const addBtns = page.getByRole('button', { name: /ใส่ตะกร้า|Add/i });
     
     // Add Item 1 (50)
     await addBtns.nth(0).click();
     
     // Add Item 2 (80)
     await addBtns.nth(1).click();
     
     // Total should be 130
     const totalText = page.getByText(/130 ฿|130 THB/i);
     await expect(totalText).toBeVisible();
  });

});
