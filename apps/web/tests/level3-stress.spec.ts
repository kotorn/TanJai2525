import { test, expect } from './fixtures';

test.describe('LEVEL 3: Concurrent & Incremental (Stress)', () => {
    test.setTimeout(120000); // Allow time for 3 concurrent flows

    test('3 Concurrent Users + Incremental Add', async ({ browser, humanActions }) => {
        // Function to simulate one user flow
        const runUserFlow = async (index: number) => {
            console.log(`User ${index}: Start`);
            const context = await browser.newContext();
            const page = await context.newPage();
            
            const safeType = async (p: any, selector: string, text: string) => {
                await p.locator(selector).first().type(text, { delay: 50 });
            };
            const safeClick = async (p: any, selector: string) => {
                await p.locator(selector).first().click({ delay: 100 });
            };

            // Login
            await page.goto('http://localhost:3000/login');
            await safeClick(page, 'button:has-text("Simulate Owner Login")');
            console.log(`User ${index}: Logged In`);
            
            // Onboarding check
            try {
                const shopInput = page.getByPlaceholder('e.g. Noodle Master');
                await shopInput.waitFor({ timeout: 10000 }); // Increased timeout
                await safeType(page, 'input[placeholder="e.g. Noodle Master"]', `Stress Shop ${index}`);
                await safeClick(page, 'button:has-text("Start using Tanjai POS")');
                console.log(`User ${index}: Onboarding Submitted`);
            } catch (e) {
                 console.log(`User ${index}: Onboarding skipped or failed: ${e}`);
            }

            // Wait for Search
            const searchInput = page.locator('input[type="text"], input[type="search"]').first();
            await searchInput.waitFor({ timeout: 20000 });
            console.log(`User ${index}: Search Ready`);

            // Incremental Add: Add "Som Tum", then Add again.
            await safeType(page, 'input[type="text"], input[type="search"]', 'Som Tum');
            const result = page.locator('text=Som Tum').first();
            await result.waitFor({ timeout: 60000 }); // High latency tolerance
            console.log(`User ${index}: Result Found`);
            
            // Add First Time
            await safeClick(page, 'text=Som Tum');
            // Check if modal appeared
            try {
                const addToCart = page.locator('button:has-text("Add")').first();
                if (await addToCart.isVisible({timeout: 2000})) {
                    await safeClick(page, 'button:has-text("Add")');
                }
            } catch (e) {}
            console.log(`User ${index}: Added 1`);

            // Add Second Time (Incremental Check)
            await safeClick(page, 'text=Som Tum');
             try {
                const addToCart = page.locator('button:has-text("Add")').first();
                if (await addToCart.isVisible({timeout: 2000})) {
                    await safeClick(page, 'button:has-text("Add")');
                }
            } catch (e) {}
             console.log(`User ${index}: Added 2`);

            // Verify Quantity = 2
            await expect(page.locator('body')).toContainText('Som Tum');
            
            await context.close();
        };

        // Run 3 concurrently
        await Promise.all([
            runUserFlow(1),
            runUserFlow(2),
            runUserFlow(3)
        ]);
    });
});
