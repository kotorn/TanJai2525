import { test, expect } from './fixtures';

test.describe('🛡️ Antigravity Fixture Demonstration', () => {
    
    test('Demo: Chaos & Surgical Instruments', async ({ page, chaosLogic, payloadInjector, humanActions }) => {
        console.log('\n--- STARTING DEMO ---');
        
        // 1. Start with a healthy state
        await page.goto('/');
        console.log('✅ Navigated to Home');

        // 2. Inject Latency (Ischemia)
        console.log('💉 Injecting Latency...');
        await chaosLogic.latencySpike('**/*.js', 500); // Slow down JS loading
        // Trigger a navigation or reload to feel the pain
        await page.reload();
        console.log('✅ Reloaded with 500ms latency on JS files');

        // 3. Inject SQLi (Payload)
        console.log('💉 Testing SQL Injection...');
        const input = page.locator('input').first();
        if (await input.count() > 0) {
            await payloadInjector.injectSQLi(input);
            console.log('✅ SQL Payload injected into first input');
        } else {
            console.log('⚠️ No input found to inject SQLi');
        }

        // 4. Human Actions
        console.log('🧘 Simulating Human Actions...');
        await humanActions.scrollWithInertia(500);
        console.log('✅ Scrolled with inertia');

        // 5. Offline Bomb (Chaos)
        console.log('💣 Planting Offline Bomb...');
        await chaosLogic.simulateOfflineBomb(0);
        // Verify we are offline
        try {
            await page.evaluate(() => fetch('/'));
        } catch (e) {
            console.log('✅ Network request failed as expected (Offline)');
        }
        
        // Restore for cleanup (although context closes anyway)
        await page.context().setOffline(false);
        console.log('--- DEMO COMPLETE ---');
    });

});
