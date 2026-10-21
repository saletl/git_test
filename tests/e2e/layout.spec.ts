import type { Page } from '@playwright/test';
import { applyTool, choosePatient, expect, openActivity, seedPages, start, tap, test, TOOLS } from './helpers';

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
  expect(boxes.length, selector).toBeGreaterThan(0);
  for (const b of boxes) {
    expect(b.left, selector).toBeGreaterThanOrEqual(0);
    expect(b.top, selector).toBeGreaterThanOrEqual(0);
    expect(b.right, selector).toBeLessThanOrEqual(viewport.width + 0.5);
    expect(b.bottom, selector).toBeLessThanOrEqual(viewport.height + 0.5);
    expect(Math.min(b.width, b.height), selector).toBeGreaterThanOrEqual(minSize);
  }
}

test('every screen and activity fits, with finger-sized controls', async ({ page }, info) => {
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
  await expectOnScreen(page, '.adventure-btn', 60);
  await expectOnScreen(page, '.chart-btn', 56);
  await expectOnScreen(page, '.exit-btn');
  await shot('exam-intro');

  await applyTool(page, 'listen');
  await page.waitForTimeout(300);
  await applyTool(page, 'temperature');
  await page.waitForTimeout(700);
  await expectOnScreen(page, '.finish-btn');

  await tap(page, 'Comfort choices');
  await expectOnScreen(page, '.comfort-btn', 56);
  await shot('comfort');
  await tap(page, 'Comfort choices');

  await tap(page, TOOLS.bandages);
  await expectOnScreen(page, '.choice-btn--bandage', 44);
  await expectOnScreen(page, '.tray-action', 44);
  await shot('bandages');
  await tap(page, TOOLS.bandages);

  await openActivity(page, 'Hiccup helpers');
  await expectFits(page);
  await expectOnScreen(page, '.pick-btn', 56);
  await expectOnScreen(page, '.activity-panel__close', 44);
  await shot('activity');
  await page.getByRole('button', { name: 'Back to the doctor tools' }).click();

  await page.locator('.chart-btn').click();
  await expectFits(page);
  await expectOnScreen(page, '.stamp-btn', 56);
  await expectOnScreen(page, '.chart-paper__close', 44);
  await shot('chart');
  await page.getByRole('button', { name: 'Close the chart' }).click();

  await page.getByRole('button', { name: 'Feeling better!' }).click();
  await page.waitForTimeout(4200);
  await expectFits(page);
  await expectOnScreen(page, '.big-choice', 88);
  await shot('complete');

  await page.locator('.big-choice--book').click();
  await page.waitForTimeout(400);
  await expectFits(page);
  await expectOnScreen(page, '.book__card', 88);
  await shot('coloring-book');
});

test('the pretend shot steps fit on every screen', async ({ page }, info) => {
  await start(page);
  await choosePatient(page, 'prickle');
  await openActivity(page, 'Pretend shot');
  await expectFits(page);
  await expectOnScreen(page, '.pick-btn', 56);
  await page.getByRole('button', { name: 'Get ready' }).click();
  await expectOnScreen(page, '.pick-btn', 56);
  await page.screenshot({ path: info.outputPath('pretend-shot.png') });
});

test('the coloring page preview fits', async ({ page }, info) => {
  await seedPages(page, ['mochi']);
  await page.goto('/');
  await page.getByRole('button', { name: 'My coloring book' }).click();
  await page.getByRole('button', { name: /The Mysterious Tummy/ }).click();
  await page.waitForTimeout(500);
  await expectFits(page);
  await expectOnScreen(page, '.book__preview-page', 200);
  await page.screenshot({ path: info.outputPath('page-preview.png') });
});
