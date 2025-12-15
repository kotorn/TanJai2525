import { Page, Locator, expect } from '@playwright/test';

/**
 * Injects a visual cursor/touch indicator into the page.
 * Useful for verifying interactions in video recordings.
 */
export async function injectCursorVisuals(page: Page) {
    await page.addInitScript(() => {
        // Add CSS
        const style = document.createElement('style');
        style.innerHTML = `
            .human-cursor-dot {
                position: fixed;
                width: 20px;
                height: 20px;
                background: rgba(255, 0, 0, 0.6);
                border: 2px solid white;
                border-radius: 50%;
                pointer-events: none;
                z-index: 2147483647;
                transition: transform 0.1s ease, opacity 0.3s ease;
                transform: translate(-50%, -50%);
                box-shadow: 0 0 10px rgba(255,0,0,0.3);
            }
        `;
        document.head.appendChild(style);

        // Add Cursor Element
        if (!document.getElementById('human-cursor-dot')) {
            const dot = document.createElement('div');
            dot.className = 'human-cursor-dot';
            dot.id = 'human-cursor-dot';
            dot.style.opacity = '0';
            document.body.appendChild(dot);
        }

        // Add Global Helpers
        (window as any).updateCursor = (x: number, y: number, visible: boolean = true) => {
            const el = document.getElementById('human-cursor-dot');
            if (el) {
                el.style.left = x + 'px';
                el.style.top = y + 'px';
                el.style.opacity = visible ? '1' : '0';
            } else {
                 // Re-create if missing (e.g. body wiped)
                 const dot = document.createElement('div');
                 dot.className = 'human-cursor-dot';
                 dot.id = 'human-cursor-dot';
                 dot.style.left = x + 'px';
                 dot.style.top = y + 'px';
                 dot.style.opacity = visible ? '1' : '0';
                 document.body.appendChild(dot);
            }
        };

        (window as any).showTap = (x: number, y: number) => {
             const tap = document.createElement('div');
             tap.className = 'human-cursor-dot';
             tap.style.left = x + 'px';
             tap.style.top = y + 'px';
             document.body.appendChild(tap);
             setTimeout(() => {
                 tap.style.transform = 'translate(-50%, -50%) scale(2)';
                 tap.style.opacity = '0';
             }, 50);
             setTimeout(() => tap.remove(), 500);
        };
    });
}

/**
 * Simulates human-like typing with variable delays and initial hover/click.
 */
export async function humanType(page: Page, selector: string, text: string) {
    const locator = page.locator(selector).first();
    await expect(locator).toBeVisible();

    // Hover
    await humanHover(page, selector);
    
    // Click to focus
    await humanClick(page, selector); // Using humanClick handles the move logic again which is fine

    // Type with random delay
    await locator.pressSequentially(text, { 
        delay: Math.random() * 100 + 50 // 50ms - 150ms
    });
}

/**
 * Simulates human-like mouse movement and clicking.
 */
export async function humanClick(page: Page, selector: string) {
    const locator = page.locator(selector).first();
    const box = await locator.boundingBox();
    if (!box) throw new Error(`Could not find bounding box for ${selector}`);

    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    // Move mouse with steps
    await page.mouse.move(x, y, { steps: 5 });
    
    // Update visual cursor (if injected)
    await page.evaluate(({x, y}) => {
        if ((window as any).updateCursor) (window as any).updateCursor(x, y, true);
    }, {x, y});

    // "Thinking" time (Requirement: 300 + Math.random() * 500)
    await page.waitForTimeout(300 + Math.random() * 500);

    // Click
    await page.mouse.down();
    await page.waitForTimeout(50);
    await page.mouse.up();
}

/**
 * Simulates a mouse hover with movement.
 */
export async function humanHover(page: Page, selector: string) {
    const locator = page.locator(selector).first();
    const box = await locator.boundingBox();
    if (!box) return;

    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    await page.mouse.move(x, y, { steps: 5 });
    
    await page.evaluate(({x, y}) => {
        if ((window as any).updateCursor) (window as any).updateCursor(x, y, true);
    }, {x, y});
    
    await page.waitForTimeout(100);
}

/**
 * Simulates a mobile tap with visual feedback.
 */
export async function mobileTap(page: Page, selector: string) {
    const locator = page.locator(selector).first();
    const box = await locator.boundingBox();
    if (!box) throw new Error(`Could not find bounding box for ${selector}`);

    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    // Visual tap indicator
    await page.evaluate(({x, y}) => {
        if ((window as any).showTap) (window as any).showTap(x, y);
    }, {x, y});

    await locator.tap();
    await page.waitForTimeout(100);
}

/**
 * Simulates natural scrolling (reading behavior).
 */
export async function humanScroll(page: Page) {
    // Scroll a few times with checks
    for (let i = 0; i < 3; i++) {
        await page.mouse.wheel(0, 300); // 300px down
        await page.waitForTimeout(Math.random() * 500 + 500); // Read for 0.5-1s
    }
}
