import { test, expect } from './fixtures';

test.describe('Level 6: The Viral Machine', () => {

  test('Viral Poster Generation works for Menu Items', async ({ page }) => {
    await page.goto('/default');
    
    // 1. Find the menu item container and Hover to reveal Share button
    const menuItem = page.locator('.group').first();
    await menuItem.hover();
    
    // We will look for a share icon or button
    const shareBtns = page.getByRole('button', { name: /share|แบ่งปัน/i });
    
    // Check if feature exists, if not this line fails (TDD)
    await expect(shareBtns.first()).toBeVisible();
    await shareBtns.first().click();

    // 2. Verify Viral Modal Appears
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // 3. Verify Viral Content (The "Hook")
    // Needs to show "Recommended" or the Dish Name
    await expect(modal.getByText(/Recommended|แนะนำ/i)).toBeVisible();
    
    // 4. Verify Call to Action (Share/Download)
    await expect(modal.getByRole('button', { name: /Download|Copy|บันทึก/i })).toBeVisible();
  });

});
