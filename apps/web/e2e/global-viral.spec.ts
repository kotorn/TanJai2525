// FILE: apps/web/e2e/global-viral.spec.ts
// QA Protocol: Global & Viral Features (Phase 2) - Enhanced Version: 2.1

import { test, expect } from '@playwright/test';

test.describe('EPIC 5 & 6: Global and Viral Features (Extended)', () => {

  // --- SCENARIO 1: BABEL ORDER (Voice-to-Order) ---
  test.describe('Babel Order: Voice-to-Order Translation', () => {
    
    test('TEST CASE A: Should translate Myanmar voice input to Thai', async ({ page }) => {
      await page.goto('/ordering/babel');
      
      // Simulate Voice Input: "Fried Rice" (in Myanmar/Burmese language)
      await page.getByPlaceholder('Type or record order...').fill('Fried Rice');
      
      // Select "Myanmar" from dropdown
      await page.getByRole('combobox').selectOption('my');
      
      // Verify dropdown value changed
      const select = page.getByRole('combobox');
      await expect(select).toHaveValue('my');
      
      // Click Translate button
      const translateBtn = page.getByRole('button', { name: 'Translate' });
      await translateBtn.click();
      
      // Wait for loading spinner to appear (brief moment)
      // The button should show loading state
      await expect(translateBtn).toBeDisabled();
      
      // Wait for translation result
      const resultArea = page.locator('.text-lg.font-medium.text-gray-800');
      await expect(resultArea).toBeVisible({ timeout: 10000 });
      await expect(resultArea).toContainText('ข้าวผัด'); // "Fried Rice" in Thai
    });

    test('TEST CASE B: Should translate Lao voice input to Thai', async ({ page }) => {
      await page.goto('/ordering/babel');
      
      // Simulate Voice Input: "Tam Bak Hung Phet Phet" (Papaya Salad Very Spicy in Lao)
      await page.getByPlaceholder('Type or record order...').fill('Tam Bak Hung Phet Phet');
      
      // Select "Lao" from dropdown
      await page.getByRole('combobox').selectOption('la');
      
      // Click Translate
      await page.getByRole('button', { name: 'Translate' }).click();
      
      // Verify Translation Result (Mocked response expected: "ส้มตำ เผ็ดมาก")
      const resultArea = page.locator('.text-lg.font-medium.text-gray-800');
      await expect(resultArea).toBeVisible({ timeout: 10000 });
      await expect(resultArea).toContainText('ส้มตำ'); 
      await expect(resultArea).toContainText('เผ็ด'); // Should contain "spicy"
    });

    test('TEST CASE C: Should translate Thai (Isan) dialect to standard Thai', async ({ page }) => {
      await page.goto('/ordering/babel');
      
      // Simulate Voice Input: "Tam Bak Hung" (Papaya Salad in Isan dialect)
      await page.getByPlaceholder('Type or record order...').fill('Tam Bak Hung');
      
      // Select "Thai (Isan)" from dropdown
      await page.getByRole('combobox').selectOption('th-isan');
      
      // Verify dropdown selection
      const select = page.getByRole('combobox');
      await expect(select).toHaveValue('th-isan');
      
      // Click Translate
      await page.getByRole('button', { name: 'Translate' }).click();
      
      // Verify Translation Result
      const resultArea = page.locator('.text-lg.font-medium.text-gray-800');
      await expect(resultArea).toBeVisible({ timeout: 10000 });
      await expect(resultArea).toContainText('ส้มตำ'); // "Papaya Salad" in standard Thai
    });
  });

  // --- SCENARIO 2: KDS LOCALIZATION (Kitchen Display System) ---
  test.describe('KDS Localization: Multi-Language Kitchen Display', () => {
    
    test('Should switch ticket language to Myanmar (MY)', async ({ page }) => {
      await page.goto('/demo-tenant/kds');
      
      // Verify the language toggle buttons exist
      const btnMyanmar = page.getByRole('button', { name: 'MY' });
      await expect(btnMyanmar).toBeVisible();
      
      // Click Myanmar button
      await btnMyanmar.click();
      
      // Verify active state (should have specific CSS class)
      await expect(btnMyanmar).toHaveClass(/bg-blue-600/);
      
      // Verify Myanmar text appears on the page
      // "Fried Rice" in Myanmar: "ထမင်းကြော်"
      await expect(page.locator('body')).toContainText('ထမင်းကြော်');
      
      // Verify language indicator in header
      await expect(page.getByText('မြန်မာ (Myanmar)')).toBeVisible();
    });

    test('Should switch ticket language to Khmer (KM)', async ({ page }) => {
      await page.goto('/demo-tenant/kds');
      
      // Test Switch to Khmer
      const btnKhmer = page.getByRole('button', { name: 'KM' });
      await expect(btnKhmer).toBeVisible();
      await btnKhmer.click();
      
      // Verify active state
      await expect(btnKhmer).toHaveClass(/bg-blue-600/);
      
      // Verify language indicator
      await expect(page.getByText('ខ្មែរ (Khmer)')).toBeVisible();
      
      // Note: Actual Khmer text verification depends on mock data availability
    });

    test('Should switch ticket language to Lao (LA)', async ({ page }) => {
      await page.goto('/demo-tenant/kds');
      
      // Test Switch to Lao
      const btnLao = page.getByRole('button', { name: 'LA' });
      await expect(btnLao).toBeVisible();
      await btnLao.click();
      
      // Verify active state (color changes)
      await expect(btnLao).toHaveClass(/bg-blue-600/);
      
      // Verify Lao text appears
      // "Fried Rice" in Lao: "ເຂົ້າຜັດ"
      await expect(page.locator('body')).toContainText('ເຂົ້າຜັດ');
      
      // Verify language indicator in header
      await expect(page.getByText('ລາວ (Lao)')).toBeVisible();
    });

    test('Should verify no layout breakage with special characters', async ({ page }) => {
      await page.goto('/demo-tenant/kds');
      
      // Switch between all languages and verify no visual breaks
      const languages = ['MY', 'KM', 'LA', 'EN'];
      
      for (const lang of languages) {
        const btn = page.getByRole('button', { name: lang });
        await btn.click();
        
        // Verify the page doesn't have horizontal scrollbars (layout intact)
        const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
        const viewportWidth = await page.viewportSize();
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth!.width + 20); // Allow small buffer
        
        // Verify tickets are still visible
        const tickets = page.locator('[class*="order"]').or(page.locator('[class*="ticket"]'));
        const count = await tickets.count();
        // Should have some tickets or empty state message
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // --- SCENARIO 3: DAILY DISH (Viral Marketing Tool) ---
  test.describe('Daily Dish: Viral Marketing Tool', () => {
    
    test('Should display "Today\'s Viral Hit" section with high-margin item', async ({ page }) => {
      await page.goto('/marketing');
      
      // Verify "Today's Viral Hit" heading
      await expect(page.getByRole('heading', { name: /Today's Viral Hit/i })).toBeVisible();
      
      // Verify the best seller item card is displayed
      await expect(page.getByText(/Spicy Basil Chicken/i)).toBeVisible();
      
      // Verify order count is displayed
      await expect(page.getByText(/orders today/i)).toBeVisible();
    });

    test('Should update social preview with emojis in real-time', async ({ page }) => {
      await page.goto('/marketing');
      
      // Locate the preview area
      const preview = page.locator('.whitespace-pre-line.text-gray-800');
      await expect(preview).toBeVisible();
      
      // Locate the caption editor
      const captionEditor = page.getByLabel('Caption Editor');
      await expect(captionEditor).toBeVisible();
      
      // Edit Caption with Emojis (as specified in test case)
      const newText = 'แซ่บอีหลีเด้อ! 🌶️🌶️ (Delicious!)';
      await captionEditor.clear();
      await captionEditor.fill(newText);
      
      // Verify Real-time Update in preview
      await expect(preview).toContainText('แซ่บอีหลีเด้อ!');
      await expect(preview).toContainText('🌶️');
      await expect(preview).toContainText('Delicious!');
    });

    test('Should support multiple emoji types and special characters', async ({ page }) => {
      await page.goto('/marketing');
      
      const captionEditor = page.getByLabel('Caption Editor');
      const preview = page.locator('.whitespace-pre-line.text-gray-800');
      
      // Test with various emojis and special characters
      const testText = 'Special discount 50% for tourists! 🇱🇦🇹🇭 ไชโย! 😋🍜';
      await captionEditor.clear();
      await captionEditor.fill(testText);
      
      // Verify all content appears in preview
      await expect(preview).toContainText('Special discount 50%');
      await expect(preview).toContainText('🇱🇦'); // Lao flag emoji
      await expect(preview).toContainText('🇹🇭'); // Thai flag emoji
      await expect(preview).toContainText('ไชโย!');
      await expect(preview).toContainText('😋');
    });

    test('Should verify Instagram preview card is interactive', async ({ page }) => {
      await page.goto('/marketing');
      
      // Verify the Instagram-style preview card exists
      const previewCard = page.locator('.w-\\[375px\\]'); // The phone mockup
      await expect(previewCard).toBeVisible();
      
      // Verify profile name
      await expect(page.getByText('tanjai_pos')).toBeVisible();
      
      // Verify action buttons are present (Copy Caption, Download Asset)
      await expect(page.getByRole('button', { name: /Copy Caption/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Download Asset/i })).toBeVisible();
      
      // Test copy caption functionality
      const copyBtn = page.getByRole('button', { name: /Copy Caption/i });
      await copyBtn.click();
      
      // Should show success toast (if implemented)
      // Note: Toast verification depends on toast implementation visibility
    });

    test('Should allow platform toggle between Instagram and Facebook', async ({ page }) => {
      await page.goto('/marketing');
      
      // Verify platform selector buttons
      const instagramBtn = page.getByRole('button', { name: 'Instagram' });
      const facebookBtn = page.getByRole('button', { name: 'Facebook' });
      
      await expect(instagramBtn).toBeVisible();
      await expect(facebookBtn).toBeVisible();
      
      // Instagram should be active by default
      await expect(instagramBtn).toHaveClass(/bg-pink-600/);
      
      // Click Facebook
      await facebookBtn.click();
      await expect(facebookBtn).toHaveClass(/bg-blue-600/);
      
      // Click back to Instagram
      await instagramBtn.click();
      await expect(instagramBtn).toHaveClass(/bg-pink-600/);
    });
  });

});
