import { test as base, expect, type Page } from '@playwright/test';

/** Every test fails if the page logs an error or throws. */
export const test = base.extend<{ watchErrors: void }>({
  watchErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => {
        if (m.type() === 'error' && !/Failed to load resource|net::ERR_INTERNET_DISCONNECTED/.test(m.text())) errors.push(m.text());
      });
      await use();
      expect(errors, errors.join('\n')).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export const NAMES = { pip: 'Pip', waddles: 'Waddles', prickle: 'Prickle', mochi: 'Mochi' } as const;

export async function start(page: Page, path = '/') {
  await page.goto(path);
  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.locator('.waiting')).toBeVisible();
}

export async function choosePatient(page: Page, name: keyof typeof NAMES) {
  await page.getByRole('button', { name: new RegExp(`Tap to see ${NAMES[name]}\\.`) }).click();
  await expect(page.locator('.exam')).toBeVisible({ timeout: 5000 });
}

export async function tap(page: Page, label: string) {
  await page.getByRole('button', { name: label, exact: true }).click();
}

/** Taps the patient at a spot given as fractions of the patient area. */
export async function tapPatient(page: Page, fx = 0.5, fy = 0.5) {
  const box = await page.locator('.patient-hit').boundingBox();
  if (!box) throw new Error('patient not visible');
  await page.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
}

export async function applyTool(page: Page, label: string, fx = 0.5, fy = 0.5) {
  await tap(page, label);
  await tapPatient(page, fx, fy);
}

const WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 };

export async function openParentArea(page: Page) {
  await page.locator('.grownups-btn').first().click();
  const words = await page.locator('.gate__prompt strong').innerText();
  for (const word of words.split(',').map((w) => w.trim())) {
    await page.locator('.gate__key', { hasText: String(WORDS[word]) }).click();
  }
  await expect(page.getByRole('heading', { name: /Keep your little doctor/ })).toBeVisible();
}

export async function seedStickers(page: Page, stickers: string[], placements: Record<string, number> = {}) {
  await page.addInitScript(
    ([s, p]) => localStorage.setItem('curious-creature-clinic.v1', JSON.stringify({ stickers: s, placements: p, muted: false, calm: false })),
    [stickers, placements] as const,
  );
}
