import { test, expect, BrowserContext, Page } from '@playwright/test';
import { humanClick, humanType, mobileTap, injectCursorVisuals } from './helpers/input-simulator';

test.describe('Tanjai POS: Resilient Rush Hour Simulation (Human Mode)', () => {
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
        await injectCursorVisuals(ownerPage);
    });

    test('Execute Full Resilient Scenario', async ({ browser }) => {

        // ==========================================
        // SCENE 1: OWNER SETUP
        // ==========================================
        await test.step('Admin: Register and Configure Shop', async () => {
            // 1. Login Bypass
            await ownerPage.goto('/login');
            await humanClick(ownerPage, 'button:has-text("[DEV] Simulate Owner Login")');
            await expect(ownerPage).toHaveURL(/\/onboarding/);

            // 2. Onboarding
            await humanType(ownerPage, '[placeholder="Ex. Som Tum Der"]', 'Zaap E-San');
            await humanClick(ownerPage, 'text=Create Shop');

            // Verify Dashboard
            await expect(ownerPage).toHaveURL(new RegExp(`/${tenantSlug}`));
        });

        await test.step('Admin: Menu Management', async () => {
            await ownerPage.goto(`/${tenantSlug}/admin/menu`);

            const addMsg = async (name: string, price: string) => {
                await humanType(ownerPage, '[placeholder="e.g. Som Tum"]', name);
                await humanType(ownerPage, '[placeholder="50"]', price);
                await humanClick(ownerPage, 'button:has-text("Add Item")');
                await expect(ownerPage.getByText('Menu item added')).toBeVisible();
            };

            await addMsg('Som Tum Thai', '50');
            await addMsg('Grilled Chicken', '80');
            await addMsg('Sticky Rice', '10');
        });

        await test.step('Admin: Generate and Export QR Codes', async () => {
            await ownerPage.goto(`/${tenantSlug}/admin/dashboard`);

            await humanType(ownerPage, 'input[type="number"]', '4');
            await humanClick(ownerPage, 'button:has-text("Generate Links")');

            // Wait for generation
            await expect(ownerPage.locator('text=open Table 1')).toBeVisible();

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
                const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
                const page = await context.newPage();
                await injectCursorVisuals(page);
                customers.push({ context, page, id: `Customer-${i + 1}` });
            }

            // Navigate concurrently
            await Promise.all(customers.map((c, i) => c.page.goto(simulationState.tableLinks[i])));

            // Concurrent "Add to Cart" Action
            try {
                const customerActions = customers.map(async (c) => {
                    const p = c.page;
                    // Add Som Tum
                    // Using mobileTap for touch simulation
                    const somTum = p.getByText('Som Tum Thai').first();
                    await expect(somTum).toBeVisible();
                    // Using selector string for our helper - getting selector from locator is tricky without reliable IDs
                    // Fallback to simpler locating for this demo or use locator directly if helper overload supported
                    // Since specific helper takes string 'selector', we use text= strategy
                    
                    await mobileTap(p, 'text=Som Tum Thai');
                    await mobileTap(p, 'button:has-text("+") >> nth=0'); // First plus button? risky selector but standard in test
                    
                    // Add Chicken
                    await mobileTap(p, 'text=Grilled Chicken');
                    await mobileTap(p, 'button:has-text("+") >> nth=0');

                    // Go to Cart
                    await mobileTap(p, 'a[href*="/cart"]');

                    // Select Guest Checkout if visible
                    if (await p.getByText('Guest Checkout').isVisible()) {
                        await mobileTap(p, 'text=Guest Checkout');
                    }
                });

                await Promise.all(customerActions);

                // CRITICAL: Concurrent "Order" Press
                console.log('Executing Concurrent Order...');
                await Promise.all(customers.map(c =>
                    mobileTap(c.page, 'button:has-text("Confirm Order")')
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
                throw error;
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
            // Note: Loops with async await inside for human inputs
            const prepButtonsCount = await ownerPage.locator('button:has-text("Preparing")').count();
            for (let i = 0; i < prepButtonsCount; i++) {
                 // Always click the first one as they disappear/change state? Using nth(0) is safer if list shrinks
                 // Or just grab one
                 await humanClick(ownerPage, 'button:has-text("Preparing") >> nth=0');
            }
            await ownerPage.waitForTimeout(1000);

            const doneButtonsCount = await ownerPage.locator('button:has-text("Done")').count();
            for (let i = 0; i < doneButtonsCount; i++) {
                await humanClick(ownerPage, 'button:has-text("Done") >> nth=0');
            }

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
                await humanClick(ownerPage, 'button:has-text("Cash Payment") >> nth=0');
                await ownerPage.waitForTimeout(500);
            }

            await expect(ownerPage.getByText('All tables are clear!')).toBeVisible();
        });
    });
});
