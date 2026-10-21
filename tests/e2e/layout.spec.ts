import type { Page } from '@playwright/test';
import { choosePatient, expect, start, test, applyTool } from './helpers';

async function expectFits(page: Page) {
  const { scrollWidth, innerWidth, scrollHeight, innerHeight } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    scrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  expect(scrollHeight).toBeLessThanOrEqual(innerHeight);
}

async function expectOnScreen(page: Page, selector: string, minSize = 44) {
  const viewport = page.viewportSize()!;
  const boxes = await page.locator(selector).evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()));
  expect(boxes.length).toBeGreaterThan(0);
  for (const b of boxes) {
    expect(b.left).toBeGreaterThanOrEqual(0);
    expect(b.top).toBeGreaterThanOrEqual(0);
    expect(b.right).toBeLessThanOrEqual(viewport.width + 0.5);
    expect(b.bottom).toBeLessThanOrEqual(viewport.height + 0.5);
    expect(Math.min(b.width, b.height)).toBeGreaterThanOrEqual(minSize);
  }
}

test('welcome, waiting room, exam, visit complete and sticker book fit the screen', async ({ page }, info) => {
  const shot = (name: string) => page.screenshot({ path: info.outputPath(`${name}.png`) });
  await page.goto('/');
  await expectFits(page);
  await expectOnScreen(page, '.play-btn', 88);
  await shot('welcome');

  await start(page);
  await expectFits(page);
  await expectOnScreen(page, '.exit-btn');
  await expectOnScreen(page, '.top-bar .icon-btn');
  await shot('waiting-room');

  await choosePatient(page, 'pip');
  await expectFits(page);
  await expectOnScreen(page, '.tool-btn', 48);
  await expectOnScreen(page, '.exit-btn');
  for (const t of ['Stethoscope', 'Thermometer', 'Ear light']) {
    await applyTool(page, t);
    await page.waitForTimeout(250);
  }
  await expectOnScreen(page, '.finish-btn');
  await shot('exam');

  await page.getByRole('button', { name: 'Comfort choices' }).click();
  await expectOnScreen(page, '.choice-btn', 56);
  await shot('comfort');

  await page.getByRole('button', { name: 'Feeling better!' }).click();
  await page.waitForTimeout(3500);
  await expectFits(page);
  await expectOnScreen(page, '.big-choice', 88);
  await shot('complete');

  await page.getByRole('button', { name: 'My stickers' }).click();
  await page.waitForTimeout(400);
  await expectFits(page);
  await expectOnScreen(page, '.book__tray .tray-slot', 56);
  await shot('sticker-book');
});
