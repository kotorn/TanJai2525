import { expect, test } from '@playwright/test';

test.describe('public deployment smoke', () => {
  test('renders a public page without an application error', async ({ page }) => {
    const baseUrl = process.env.BASE_URL;
    test.skip(!baseUrl, 'BASE_URL is required for deployment smoke tests');

    const response = await page.goto(baseUrl!, { waitUntil: 'domcontentloaded' });
    expect(response).not.toBeNull();
    expect(response!.ok()).toBeTruthy();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/application error|unhandled runtime error/i);
  });

  test('menu route does not return a server error', async ({ request }) => {
    const baseUrl = process.env.BASE_URL;
    test.skip(!baseUrl, 'BASE_URL is required for deployment smoke tests');

    const response = await request.get(new URL('/menu', baseUrl!).toString());
    expect(response.ok()).toBeTruthy();
  });
});
