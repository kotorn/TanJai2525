import { test, expect, BrowserContext, Page } from '@playwright/test';

test.describe('Tanjai POS End-to-End Simulation', () => {
    // Shared State
    let ownerContext: BrowserContext;
    let ownerPage: Page;
    let tenantSlug = 'zaap-e-san';
    let tableLinks: string[] = [];

    // Customer Contexts
    let customerA_Context: BrowserContext;
    let customerA_Page: Page;
    let customerB_Context: BrowserContext;
    let customerB_Page: Page;
    let customerC_Context: BrowserContext;
    let customerC_Page: Page;

    test.beforeAll(async ({ browser }) => {
        // --- Actor 1: Restaurant Owner Setup ---
        ownerContext = await browser.newContext();
        ownerPage = await ownerContext.newPage();
    });

    test('Full Workflow Simulation', async ({ browser }) => {

        // ==========================================
        // 1. Owner: Sign Up & Onboarding (Bypass)
        // ==========================================
        await test.step('Owner: Login & Onboarding', async () => {
            await ownerPage.goto('/login');
            await ownerPage.getByRole('button', { name: '[DEV] Simulate Owner Login' }).click();

            // Wait for redirection to Onboarding or Dashboard
            await expect(ownerPage).toHaveURL(/\/onboarding/);

            // Fill Onboarding
            await ownerPage.getByPlaceholder('Ex. Som Tum Der').fill('Zaap E-San');
            // Select Cuisine (assuming dropdown or radio)
            await ownerPage.getByText('Create Shop').click();

            // Wait for Dashboard (Tenant Home)
            await expect(ownerPage).toHaveURL(new RegExp(`/${tenantSlug}`));
        });

        // ==========================================
        // 2. Owner: Menu Setup
        // ==========================================
        await test.step('Owner: Setup Menu', async () => {
            await ownerPage.goto(`/${tenantSlug}/admin/menu`);

            const addMsg = async (name: string, price: string, cat: string) => {
                await ownerPage.getByPlaceholder('e.g. Som Tum').fill(name);
                await ownerPage.getByPlaceholder('50').fill(price);
                await ownerPage.getByRole('button', { name: 'Add Item' }).click();
                await expect(ownerPage.getByText('Menu item added')).toBeVisible();
            };

            await addMsg('Som Tum Thai', '50', 'Main');
            await addMsg('Grilled Chicken', '80', 'Main');
            await addMsg('Sticky Rice', '10', 'Appetizer');
        });

        // ==========================================
        // 3. Owner: Generate QR Codes
        // ==========================================
        await test.step('Owner: Generate QR Codes', async () => {
            await ownerPage.goto(`/${tenantSlug}/admin/dashboard`);

            // Set 4 Tables
            await ownerPage.locator('input[type="number"]').fill('4');
            await ownerPage.getByRole('button', { name: 'Generate Links' }).click();

            // Extract Links
            await expect(ownerPage.locator('text=open Table 1')).toBeVisible();
            tableLinks = [
                `${process.env.BASE_URL || 'http://localhost:3000'}/${tenantSlug}?tableId=1`,
                `${process.env.BASE_URL || 'http://localhost:3000'}/${tenantSlug}?tableId=2`,
                `${process.env.BASE_URL || 'http://localhost:3000'}/${tenantSlug}?tableId=3`,
            ];
        });

        // ==========================================
        // 4. Customers: Ordering (Concurrency)
        // ==========================================
        await test.step('Customers: Concurrent Ordering', async () => {
            // init contexts
            customerA_Context = await browser.newContext({ viewport: { width: 390, height: 844 } }); // iPhone 12
            customerB_Context = await browser.newContext({ viewport: { width: 390, height: 844 } });
            customerC_Context = await browser.newContext({ viewport: { width: 390, height: 844 } });

            customerA_Page = await customerA_Context.newPage();
            customerB_Page = await customerB_Context.newPage();
            customerC_Page = await customerC_Context.newPage();

            // Navigate
            await Promise.all([
                customerA_Page.goto(tableLinks[0]),
                customerB_Page.goto(tableLinks[1]),
                customerC_Page.goto(tableLinks[2]),
            ]);

            // Add Items (Guest Flow)
            const addItems = async (page: Page, user: string) => {
                await page.getByText('Som Tum Thai').first().click();
                await page.getByRole('button', { name: '+' }).first().click();

                await page.getByText('Grilled Chicken').first().click();
                await page.getByRole('button', { name: '+' }).first().click();

                // Go to Cart
                await page.locator('a[href*="/cart"]').click();

                // Select Guest Checkout
                if (await page.getByText('Guest Checkout').isVisible()) {
                    await page.getByText('Guest Checkout').click();
                }
            };

            await Promise.all([
                addItems(customerA_Page, 'A'),
                addItems(customerB_Page, 'B'),
                addItems(customerC_Page, 'C'),
            ]);

            // CONCURRENT ORDER SUBMISSION
            await Promise.all([
                customerA_Page.getByRole('button', { name: 'Confirm Order' }).click(),
                customerB_Page.getByRole('button', { name: 'Confirm Order' }).click(),
                customerC_Page.getByRole('button', { name: 'Confirm Order' }).click(),
            ]);

            // Verify Success
            await expect(customerA_Page.getByText('Order Status')).toBeVisible();
            await expect(customerB_Page.getByText('Order Status')).toBeVisible();
            await expect(customerC_Page.getByText('Order Status')).toBeVisible();
        });

        // ==========================================
        // 5. Owner: KDS Management
        // ==========================================
        await test.step('Owner: Kitchen Display System', async () => {
            await ownerPage.goto(`/${tenantSlug}/kds`);

            // Should see 3 tickets
            await expect(ownerPage.locator('.order-ticket')).toHaveCount(3);

            // Advance Status: Pending -> Preparing -> Ready
            const buttons = await ownerPage.locator('button:has-text("Preparing")').all();
            for (const btn of buttons) {
                await btn.click(); // Move to Preparing
            }

            await ownerPage.waitForTimeout(1000);

            const doneButtons = await ownerPage.locator('button:has-text("Done")').all();
            for (const btn of doneButtons) {
                await btn.click();
            }

            // Should be empty now
            await expect(ownerPage.locator('.order-ticket')).toHaveCount(0);
        });

        // ==========================================
        // 6. Owner: Payment (Cashier)
        // ==========================================
        await test.step('Owner: Cashier Payment', async () => {
            // Navigate to Cashier
            await ownerPage.goto(`/${tenantSlug}/admin/cashier`);

            // Wait for orders to load (slowMo helps visualization)
            await expect(ownerPage.locator('h1')).toHaveText('Cashier / Bill Payment');

            // Check count. Should match 3 unpaid orders.
            await expect(ownerPage.getByRole('button', { name: /Cash Payment/ })).toHaveCount(3);

            // Pay for Table 1, 2, 3
            // Using locators.first() into loop because the list re-renders/shrinks on update
            for (let i = 0; i < 3; i++) {
                await ownerPage.getByRole('button', { name: /Cash Payment/ }).first().click();
                // Wait toast/update
                await ownerPage.waitForTimeout(500);
            }

            // Verify Empty
            await expect(ownerPage.getByText('All tables are clear!')).toBeVisible();
        });
    });
});
