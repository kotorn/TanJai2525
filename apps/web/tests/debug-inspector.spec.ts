import { test } from './fixtures';
import * as fs from 'fs';

test('Debug Inspector', async ({ page, humanActions }) => {
  await page.goto('/login');
  const startBtn = page.locator('button, a, [role="button"]').first();
  await startBtn.waitFor();
  await humanActions.humanTap(startBtn);
  
  await page.waitForTimeout(2000); // Wait for transition
  
  // Dump Body
  const html = await page.content();
  fs.writeFileSync('dump.html', html);
  console.log('--- DUMP SAVED to dump.html ---');
});
