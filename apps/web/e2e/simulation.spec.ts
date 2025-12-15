import { test, expect, BrowserContext, Page } from '@playwright/test';

test.describe('Tanjai POS: Resilient Rush Hour Simulation', () => {
    // Shared State
    let ownerContext: BrowserContext;
    let ownerPage: Page;
    const tenantSlug = 'zaap-e-san';

    // We use a mutable object to store dynamic links for Phase 2 resilience
    const simulationState = {
        tableLinks: [] as string[]
    };

    // Customer Contexts
    const customers: { context: BrowserContext; page: Page; id: string }[] = [];

    test.beforeAll(async ({ browser }) => {
        // --- Scene 1: Owner Setup ---
        console.log('Scene 1: Owner Setup (Admin Context)');
        ownerContext = await browser.newContext();
        ownerPage = await ownerContext.newPage();
    });

    test('Execute Full Resilient Scenario', async ({ browser }) => {

        // ==========================================
        // SCENE 1: OWNER SETUP
        // ==========================================
        await test.step('Admin: Register and Configure Shop', async () => {
            // 1. Login Bypass
            await ownerPage.goto('/login');
            await ownerPage.getByRole('button', { name: '[DEV] Simulate Owner Login' }).click();
            await expect(ownerPage).toHaveURL(/\/onboarding/);

            // 2. Onboarding
            // Using resilient locators matches
            await ownerPage.getByPlaceholder('Ex. Som Tum Der').fill('Zaap E-San');
            // Assuming default radio is selected or we just click Create
            await ownerPage.getByText('Create Shop').click();

            // Verify Dashboard
            await expect(ownerPage).toHaveURL(new RegExp(`/${tenantSlug}`));
        });

        await test.step('Admin: Menu Management', async () => {
            await ownerPage.goto(`/${tenantSlug}/admin/menu`);

            const addMsg = async (name: string, price: string) => {
                await ownerPage.getByPlaceholder('e.g. Som Tum').fill(name);
                await ownerPage.getByPlaceholder('50').fill(price);
                await ownerPage.getByRole('button', { name: 'Add Item' }).click();
                await expect(ownerPage.getByText('Menu item added')).toBeVisible();
            };

            await addMsg('Som Tum Thai', '50');
            await addMsg('Grilled Chicken', '80');
            await addMsg('Sticky Rice', '10');
        });

        await test.step('Admin: Generate and Export QR Codes', async () => {
            await ownerPage.goto(`/${tenantSlug}/admin/dashboard`);

            await ownerPage.locator('input[type="number"]').fill('4');
            await ownerPage.getByRole('button', { name: 'Generate Links' }).click();

            // Wait for generation
            await expect(ownerPage.locator('text=open Table 1')).toBeVisible();

            // Save URLs to state (Simulating "Save to JSON")
            // We reconstruct them based on known logic for robustness, 
            // but in a real scraper we would read the href attributes.
            // Using process.env.BASE_URL is safer if configured, else localhost.
            const baseUrl = 'http://localhost:3000';

            simulationState.tableLinks = [
                `${baseUrl}/${tenantSlug}?tableId=1`,
                `${baseUrl}/${tenantSlug}?tableId=2`,
                `${baseUrl}/${tenantSlug}?tableId=3`,
            ];

            console.log('QR Codes Generated:', simulationState.tableLinks);
        });

        // ==========================================
        // SCENE 2: THE RUSH HOUR (Concurrency)
        // ==========================================
        await test.step('Rush Hour: Concurrent Customer Ordering', async () => {
            console.log('Scene 2: The Rush Hour');

            // Launch 3 iPhone Contexts
            for (let i = 0; i < 3; i++) {
                const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
                const page = await context.newPage();
                customers.push({ context, page, id: `Customer-${i + 1}` });
            }

            // Navigate concurrently
            await Promise.all(customers.map((c, i) => c.page.goto(simulationState.tableLinks[i])));

            // Concurrent "Add to Cart" Action
            // Wrapped in try/catch for Debugger Requirement
            try {
                const customerActions = customers.map(async (c) => {
                    const p = c.page;
                    // Add Som Tum
                    await p.getByText('Som Tum Thai').first().click();
                    await p.getByRole('button', { name: '+' }).first().click();
                    // Add Chicken
                    await p.getByText('Grilled Chicken').first().click();
                    await p.getByRole('button', { name: '+' }).first().click();

                    // Go to Cart
                    await p.locator('a[href*="/cart"]').click();

                    // Select Guest Checkout if visible
                    if (await p.getByText('Guest Checkout').isVisible()) {
                        await p.getByText('Guest Checkout').click();
                    }
                });

                await Promise.all(customerActions);

                // CRITICAL: Concurrent "Order" Press
                console.log('Executing Concurrent Order...');
                await Promise.all(customers.map(c =>
                    c.page.getByRole('button', { name: 'Confirm Order' }).click()
                ));

                // Verify all success
                await Promise.all(customers.map(c =>
                    expect(c.page.getByText('Order Status')).toBeVisible()
                ));

            } catch (error) {
                console.error('Rush Hour Failed! Taking screenshot...');
                // Take specific error screenshots
                for (const c of customers) {
                    await c.page.screenshot({ path: `error-ordering-${c.id}.png` });
                }
                throw error; // Re-throw to trigger Playwright trace
            }
        });

        // ==========================================
        // SCENE 3: KITCHEN & CASHIER
        // ==========================================
        await test.step('Kitchen: Process Orders', async () => {
            await ownerPage.goto(`/${tenantSlug}/kds`);

            // Verify 3 orders
            await expect(ownerPage.locator('.order-ticket')).toHaveCount(3);

            // Mark Done
            const prepButtons = await ownerPage.locator('button:has-text("Preparing")').all();
            for (const btn of prepButtons) await btn.click();
            await ownerPage.waitForTimeout(1000);

            const doneButtons = await ownerPage.locator('button:has-text("Done")').all();
            for (const btn of doneButtons) await btn.click();

            await expect(ownerPage.locator('.order-ticket')).toHaveCount(0);
        });

        await test.step('Cashier: Clear Tables', async () => {
            await ownerPage.goto(`/${tenantSlug}/admin/cashier`);
            await expect(ownerPage.locator('h1')).toHaveText('Cashier / Bill Payment');

            // Wait for 3 bills
            await expect(ownerPage.getByRole('button', { name: /Cash Payment/ })).toHaveCount(3);

            // Pay all
            for (let i = 0; i < 3; i++) {
                // Click the first button repeatedly as the list shrinks
                await ownerPage.getByRole('button', { name: /Cash Payment/ }).first().click();
                await ownerPage.waitForTimeout(500);
            }

            await expect(ownerPage.getByText('All tables are clear!')).toBeVisible();
        });
    });
});
