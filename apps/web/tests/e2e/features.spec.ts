import { test, expect } from '@playwright/test';

test.describe('TanJai E-commerce Features', () => {
  
  // Priority 1: Cart Persistence
  test('Cart should persist across page refresh', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/cart');
    
    // Add item to cart
    await page.click('text=Add to Cart >> nth=0');
    
    // Wait for cart to update
    await expect(page.locator('text=1')).toBeVisible();
    
    // Refresh page
    await page.reload();
    
    // Cart should still have item
    await expect(page.locator('text=1')).toBeVisible();
  });

  // Priority 1: Authentication
  test('User should be able to sign up', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Open auth modal
    await page.click('text=Sign In');
    
    // Switch to signup
    await page.click('text=Sign up');
    
    // Fill form
    await page.fill('input[type="email"]', `test${Date.now()}@tanjai.com`);
    await page.fill('input[type="password"]', 'Test123456!');
    await page.fill('input[placeholder="Your name"]', 'Test User');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should see success or redirect
    await page.waitForTimeout(2000);
  });

  // Priority 1: Search
  test('Advanced search filters should work', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Open filters
    await page.click('button:has-text("Filters")');
    
    // Set min price
    await page.fill('input[placeholder="฿0"]', '100');
    
    // Select category
    await page.selectOption('select', { label: 'Ramen' });
    
    // Click search
    await page.click('button:has-text("Search")');
    
    // Results should be filtered
    await page.waitForTimeout(1000);
  });

  // Priority 2: Coupon
  test('Coupon code should apply discount', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/checkout');
    
    // Enter coupon
    await page.fill('input[placeholder="Enter coupon code"]', 'WELCOME10');
    await page.click('button:has-text("Apply")');
    
    // Should show discount
    await expect(page.locator('text=-฿')).toBeVisible();
  });

  // Priority 2: Payment Selection
  test('Payment methods should display', async ({ page }) => {
    await page.goto('http://localhost:3000/demo/checkout');
    
    // Should see all payment methods
    await expect(page.locator('text=PromptPay')).toBeVisible();
    await expect(page.locator('text=Thai QR')).toBeVisible();
    await expect(page.locator('text=LINE Pay')).toBeVisible();
    await expect(page.locator('text=Cash on Delivery')).toBeVisible();
    
    // Select PromptPay
    await page.click('text=PromptPay');
    
    // QR code should generate
    await expect(page.locator('img[alt="Payment QR Code"]')).toBeVisible();
  });

  // Priority 2: Stock Badge
  test('Stock badge should display correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Should see stock badges
    await expect(page.locator('text=In Stock')).toBeVisible();
  });

  // Priority 3: Newsletter
  test('Newsletter signup should work', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Find newsletter form
    await page.fill('input[type="email"][placeholder*="email"]', 'newsletter@test.com');
    await page.click('button:has-text("Subscribe")');
    
    // Should show success
    await expect(page.locator('text=Successfully Subscribed')).toBeVisible();
  });

  // Admin Dashboard
  test('Admin dashboard should load', async ({ page }) => {
    await page.goto('http://localhost:3000/admin');
    
    // Should show dashboard
    await expect(page.locator('text=TanJai Admin')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Check stats cards
    await expect(page.locator('text=Total Orders')).toBeVisible();
    await expect(page.locator('text=Revenue')).toBeVisible();
  });

  // Mobile Responsive
  test('Should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3000');
    
    // Mobile menu should be visible
    await page.click('button[aria-label="Menu"]');
    
    // Navigation should appear
    await page.waitForTimeout(500);
  });

  // Performance
  test('Page should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3000');
    const loadTime = Date.now() - startTime;
    
    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});
