import { readFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import { applyTool, bandageSpots, choosePatient, exitNow, expect, openActivity, openParentArea, seedPages, start, tap, tapPatient, test, TOOLS } from './helpers';

const STORAGE = 'curious-creature-clinic.v1';
const saved = (page: import('@playwright/test').Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}'), STORAGE);

test.describe('Pip: the case of the bubble hiccups', () => {
  test('story, listening, bubble catching, hiccup helpers, chart stamp, and a coloring page', async ({ page }) => {
    await start(page);
    await choosePatient(page, 'pip');
    await expect(page.locator('.story-bubble')).toHaveText('Oh no! Pip keeps hiccuping bubbles! Can you help?');
    await expect(page.getByRole('button', { name: 'Feeling better!' })).toHaveCount(0);

    await applyTool(page, 'listen', 0.5, 0.78);
    await expect(page.locator('.tool-sprite')).toBeVisible();

    await openActivity(page, 'Catch bubbles');
    const bubble = page.locator('.float-bubble').first();
    await expect(bubble).toBeVisible({ timeout: 4000 });
    await bubble.click();
    await expect(page.locator('.bubble-burst')).toHaveCount(1);
    // Keyboard and switch users can put bubbles in the jar too.
    await expect(page.locator('.float-bubble').first()).toBeVisible({ timeout: 4000 });
    await page.getByRole('button', { name: /bubble jar, with 0 bubbles/ }).click();
    await expect(page.getByRole('button', { name: /bubble jar, with 1 bubble\./ })).toBeVisible();
    await page.getByRole('button', { name: 'Back to the doctor tools' }).click();

    await openActivity(page, 'Hiccup helpers');
    await page.getByRole('button', { name: 'Pinwheel breaths' }).click();
    await expect(page.locator('.item-sprite--pinwheel')).toBeVisible();
    await page.getByRole('button', { name: 'Back to the doctor tools' }).click();

    await page.locator('.chart-btn').click();
    const chart = page.getByRole('dialog', { name: "Pip's chart" });
    await expect(chart.getByText('Bubble hiccups')).toBeVisible();
    await expect(chart.locator('.chart-slot.is-found')).toHaveCount(3);
    await chart.getByRole('button', { name: 'Stamp the chart' }).click();
    await expect(chart.getByRole('status')).toHaveText('Visit done!');

    await expect(page.locator('.complete')).toBeVisible();
    await expect(page.getByRole('img', { name: /New coloring page: The Case of the Bubble Hiccups/ })).toBeVisible({ timeout: 8000 });
    expect((await saved(page)).pages).toEqual(['pip']);

    await page.locator('.big-choice--book').click();
    const book = page.getByRole('dialog', { name: 'My Creature Clinic Coloring Book' });
    await expect(book.locator('.book__card')).toHaveCount(4);
    await expect(book.locator('.book__thumb')).toHaveCount(1);
    await expect(book.locator('.book__card--waiting')).toHaveCount(3);
    await book.getByRole('button', { name: /The Case of the Bubble Hiccups/ }).click();
    await expect(page.getByRole('img', { name: /Coloring page: Pip the dragon/ })).toBeVisible();
    await page.getByRole('button', { name: 'Back to all the pages' }).click();
    await page.getByRole('button', { name: 'Close the coloring book' }).click();
    await expect(page.locator('.waiting')).toBeVisible();
  });
});

test.describe('Waddles: the great sneezing mystery', () => {
  test('scarves hide surprises, and a tissue tidies up', async ({ page }) => {
    await start(page);
    await choosePatient(page, 'waddles');
    await expect(page.locator('.story-bubble')).toContainText("Waddles can't stop sneezing!");
    await openActivity(page, 'Scarves and hats');
    const off = page.getByRole('button', { name: /Take a scarf off/ });
    while (await off.isEnabled()) {
      await off.click();
      await page.waitForTimeout(150);
    }
    await page.getByRole('button', { name: 'Hat', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Hat', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Back to the doctor tools' }).click();

    await openActivity(page, 'Tissue');
    const sparkles = page.getByRole('button', { name: 'Wipe the sparkly snowflake' });
    await expect(sparkles.first()).toBeVisible({ timeout: 4000 });
    while ((await sparkles.count()) > 0) await sparkles.first().click();
    await expect(page.getByText('All tidy! Waddles says thank you.')).toBeVisible();
    await page.getByRole('button', { name: 'Back to the doctor tools' }).click();

    await page.locator('.chart-btn').click();
    await expect(page.getByRole('listitem', { name: 'Scarf surprise: found' })).toBeVisible();
    await expect(page.getByRole('listitem', { name: 'Tissue tidy-up: found' })).toBeVisible();
  });
});

test.describe('Prickle: the brave little checkup', () => {
  test('check the bunny, make a plan, and practice a gentle pretend shot', async ({ page }) => {
    await start(page);
    await choosePatient(page, 'prickle');
    await expect(page.locator('.story-bubble')).toContainText("Prickle feels nervous about today's checkup.");

    await openActivity(page, 'Check bunny');
    await page.getByRole('button', { name: 'Listen: use it on the bunny' }).click();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'Look: use it on the bunny' }).click();
    await expect(page.locator('.popup--lens')).toBeVisible();
    await page.getByRole('button', { name: 'Back to the doctor tools' }).click();

    await openActivity(page, 'Comfort plan');
    await page.getByRole('button', { name: 'Hold bunny' }).click();
    await page.getByRole('button', { name: 'Ask for help' }).click();
    await expect(page.locator('.plan-card__slot.is-filled')).toHaveCount(2);
    await page.getByRole('button', { name: 'Back to the doctor tools' }).click();

    await openActivity(page, 'Pretend shot');
    await expect(page.locator('.shot-note')).toHaveText('Prickle’s visit has a pretend shot. Shots can pinch for a moment. You can ask for help.');
    await page.getByRole('button', { name: 'Get ready' }).click();
    await page.getByRole('button', { name: 'Listen to music' }).click();
    await page.getByRole('button', { name: 'Rainbows bandage' }).click();
    await expect(page.locator('.shot-helper')).toBeVisible();
    await page.getByRole('button', { name: 'Pretend shot', exact: true }).click();
    await expect(page.getByText('Put the bandage on the glowing spot.')).toBeVisible({ timeout: 8000 });
    await tapPatient(page, 0.66, 0.79);
    await page.getByRole('button', { name: 'Bunny hug' }).click();
    await expect(page.getByText('All done! Pretend shot practice is finished.')).toBeVisible();
    await page.getByRole('button', { name: 'Back to checkup' }).click();

    // The bandage really is on Prickle, near the arm.
    await tap(page, TOOLS.bandages);
    const spots = await bandageSpots(page);
    expect(spots).toHaveLength(1);
    expect(spots[0]![0]).toBeGreaterThan(0.55);
    expect(spots[0]![1]).toBeGreaterThan(0.7);
  });

  test('the pretend shot can be skipped or stopped at any step, and the visit still finishes', async ({ page }) => {
    await start(page);
    await choosePatient(page, 'prickle');
    await openActivity(page, 'Pretend shot');
    await page.getByRole('button', { name: 'Not today. Skip the pretend shot' }).click();
    await expect(page.locator('.activity-panel')).toHaveCount(0);

    await openActivity(page, 'Pretend shot');
    await page.getByRole('button', { name: 'Get ready' }).click();
    await page.getByRole('button', { name: 'Stop the pretend shot' }).click();
    await expect(page.locator('.activity-panel')).toHaveCount(0);

    await applyTool(page, 'listen');
    await page.waitForTimeout(300);
    await tap(page, 'Comfort choices');
    await tap(page, 'Hug bunny');
    await page.getByRole('button', { name: 'Feeling better!' }).click();
    await expect(page.locator('.complete')).toBeVisible();
  });
});

test.describe('Mochi: the mysterious tummy', () => {
  test('different tummy sounds, a sound mystery, and a sock rescue', async ({ page }) => {
    await start(page);
    await choosePatient(page, 'mochi');
    await expect(page.locator('.story-bubble')).toContainText("Mochi's tummy keeps making funny noises!");
    await tap(page, TOOLS.listen);
    await expect(page.locator('.target-rings g g')).toHaveCount(4);
    await tapPatient(page, 0.4, 0.78);

    await openActivity(page, 'Sound mystery');
    for (const toy of ['Tiny trumpet', 'Rubber duck', 'Squeaky toy']) {
      if (await page.locator('.thought-bubble').count()) break;
      await page.getByRole('button', { name: new RegExp(`^${toy}\\.`) }).click();
      await page.waitForTimeout(500);
    }
    await expect(page.locator('.thought-bubble')).toBeVisible();
    await expect(page.getByText('Mystery solved! Want another tummy sound?')).toBeVisible();
    await page.getByRole('button', { name: 'Back to the doctor tools' }).click();

    await openActivity(page, 'Sock and hats');
    await page.getByRole('button', { name: "Take the sock off Mochi's head" }).click();
    await page.getByRole('button', { name: /Pick up the sock/ }).click();
    await tapPatient(page, 0.65, 0.22);
    await expect(page.getByRole('button', { name: /Pick up the sock/ })).toHaveAttribute('aria-pressed', 'false');
    await page.getByRole('button', { name: 'Crown' }).click();
    await page.getByRole('button', { name: 'Back to the doctor tools' }).click();
    await page.locator('.chart-btn').click();
    await expect(page.getByRole('listitem', { name: 'Sound mystery: found' })).toBeVisible();
    await expect(page.getByRole('listitem', { name: 'Sock rescue: found' })).toBeVisible();
  });
});

test('every patient: labeled tools, ear and throat checks, and a finish', async ({ page }) => {
  for (const name of ['pip', 'waddles', 'prickle', 'mochi'] as const) {
    await start(page);
    await choosePatient(page, name);
    await expect(page.locator('.tool-btn__label')).toHaveText(['Listen', 'Temperature', 'Look', 'Bandages', 'Comfort']);
    await applyTool(page, 'temperature');
    await expect(page.locator('.popup--gauge')).toBeVisible();
    await applyTool(page, 'look', 0.85, 0.3);
    await expect(page.locator('.lens--ear')).toBeVisible();
    // Tap near the mouth to look in the throat.
    const mouth = { pip: [0.5, 0.52], waddles: [0.5, 0.42], prickle: [0.5, 0.58], mochi: [0.51, 0.67] }[name];
    await tapPatient(page, mouth[0]!, mouth[1]!);
    await expect(page.locator('.lens--throat')).toBeVisible();
    await page.getByRole('button', { name: 'Feeling better!' }).click();
    await expect(page.locator('.complete')).toBeVisible();
    await page.getByRole('button', { name: 'All done. My doctor is ready!' }).click();
    await page.getByRole('button', { name: 'Finish' }).click();
  }
  expect((await saved(page)).pages).toEqual(['pip', 'waddles', 'prickle', 'mochi']);
});

test('each comfort choice shows a clear result', async ({ page }) => {
  await start(page);
  await choosePatient(page, 'pip');
  const results: Record<string, string> = {
    'Hug star': '.ch-root.act-squeezeHug',
    'Take a break': '.fx-breathe',
    'Play music': '.item-sprite--musicBox',
    'Hold a hand': '.item-sprite--helperHand',
  };
  for (const [label, selector] of Object.entries(results)) {
    await tap(page, 'Comfort choices');
    await page.locator('.comfort-btn', { hasText: label }).click();
    await expect(page.locator(selector).first()).toBeAttached({ timeout: 2500 });
    await page.waitForTimeout(300);
  }
});

test.describe('Freeform bandages', () => {
  test('stick anywhere, move, undo and remove, and stay put when the screen resizes', async ({ page }) => {
    await start(page);
    await choosePatient(page, 'pip');
    await tap(page, TOOLS.bandages);
    await page.getByRole('button', { name: 'Rainbow bandage' }).click();
    await tapPatient(page, 0.41, 0.77);
    await tapPatient(page, 0.57, 0.68);
    let spots = await bandageSpots(page);
    expect(spots).toHaveLength(2);
    // No snapping: each bandage lands exactly where it was tapped.
    expect(Math.abs(spots[0]![0] - 0.41)).toBeLessThan(0.015);
    expect(Math.abs(spots[0]![1] - 0.77)).toBeLessThan(0.015);
    expect(Math.abs(spots[1]![0] - 0.57)).toBeLessThan(0.015);
    expect(Math.abs(spots[1]![1] - 0.68)).toBeLessThan(0.015);

    // Drag the first one to the tail.
    const handle = (await page.locator('.bandage-handle').first().boundingBox())!;
    const patient = (await page.locator('.patient-hit').boundingBox())!;
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
    await page.mouse.down();
    await page.mouse.move(patient.x + patient.width * 0.86, patient.y + patient.height * 0.66, { steps: 8 });
    await page.mouse.up();
    spots = await bandageSpots(page);
    expect(spots[0]![0]).toBeGreaterThan(0.8);

    // Tap to pick up, then tap somewhere else to move it (no dragging needed).
    await page.locator('.bandage-handle').nth(1).click();
    await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();
    await tapPatient(page, 0.25, 0.4);
    spots = await bandageSpots(page);
    expect(spots[1]![0]).toBeLessThan(0.3);

    await page.getByRole('button', { name: 'Undo' }).click();
    spots = await bandageSpots(page);
    expect(Math.abs(spots[1]![0] - 0.57)).toBeLessThan(0.015);

    await page.locator('.bandage-handle').nth(1).click();
    await page.getByRole('button', { name: 'Remove' }).click();
    expect(await bandageSpots(page)).toHaveLength(1);

    const before = await bandageSpots(page);
    const size = page.viewportSize()!;
    await page.setViewportSize({ width: Math.round(size.width * 0.85), height: Math.round(size.height * 0.8) });
    await page.waitForTimeout(400);
    const after = await bandageSpots(page);
    expect(Math.abs(after[0]![0] - before[0]![0])).toBeLessThan(0.015);
    expect(Math.abs(after[0]![1] - before[0]![1])).toBeLessThan(0.015);
  });

  test('a bandage pattern can be dragged straight onto the patient', async ({ page }) => {
    await start(page);
    await choosePatient(page, 'waddles');
    await tap(page, TOOLS.bandages);
    const chip = (await page.getByRole('button', { name: 'Heart bandage' }).boundingBox())!;
    const to = (await page.locator('.patient-hit').boundingBox())!;
    await page.mouse.move(chip.x + chip.width / 2, chip.y + chip.height / 2);
    await page.mouse.down();
    await page.mouse.move(chip.x + chip.width / 2, chip.y - 40, { steps: 4 });
    await page.mouse.move(to.x + to.width * 0.6, to.y + to.height * 0.7, { steps: 8 });
    await page.mouse.up();
    expect(await bandageSpots(page)).toHaveLength(1);
  });
});

test('drag and drop works for tools too: drag the thermometer onto Mochi', async ({ page }) => {
  await start(page);
  await choosePatient(page, 'mochi');
  const tool = page.getByRole('button', { name: TOOLS.temperature, exact: true });
  const from = (await tool.boundingBox())!;
  const to = (await page.locator('.patient-hit').boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2, from.y - 40, { steps: 4 });
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator('.popup--gauge')).toBeVisible();
});

test('the room has things to try: lamp, poster, sink and cabinet', async ({ page }) => {
  await start(page);
  await choosePatient(page, 'pip');
  await page.getByRole('button', { name: /Exam lamp/ }).click();
  await expect(page.locator('.lamp-glow')).toHaveCount(1);
  await expect(page.getByRole('button', { name: /Exam lamp/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /Poster/ }).click();
  await expect(page.locator('.eye-chart.is-wiggling')).toHaveCount(1);
  await page.getByRole('button', { name: /Sink/ }).click();
  await expect(page.locator('.sink-bubbles')).toHaveCount(1);
  await page.getByRole('button', { name: /Cabinet/ }).click();
  await expect(page.getByRole('button', { name: /Cabinet/ })).toHaveAttribute('aria-pressed', 'true');
});

test('talk-together ideas appear now and then and are easy to ignore', async ({ page }) => {
  await page.clock.install();
  await start(page);
  await choosePatient(page, 'pip');
  await page.locator('.story-bubble').click();
  await expect(page.locator('.story-bubble')).toHaveCount(0);
  await page.clock.fastForward(26_000);
  const prompt = page.locator('.story-bubble--prompt');
  await expect(prompt).toHaveText('What do you think Pip needs?');
  // Playing straight on works; the idea never blocks the patient or the tools.
  await applyTool(page, 'listen');
  await expect(page.locator('.tool-sprite')).toBeVisible();
  await prompt.click();
  await expect(prompt).toHaveCount(0);
});

test.describe('"All done" works from every state, immediately', () => {
  const setups: Record<string, (page: import('@playwright/test').Page) => Promise<void>> = {
    'the introduction': async () => {},
    'the bubble game': async (page) => {
      await openActivity(page, 'Catch bubbles');
      await expect(page.locator('.float-bubble').first()).toBeVisible({ timeout: 4000 });
    },
    'decorating with bandages': async (page) => {
      await tap(page, TOOLS.bandages);
      await tapPatient(page, 0.5, 0.7);
    },
    'the chart': async (page) => {
      await page.locator('.chart-btn').click();
    },
    'a comfort choice': async (page) => {
      await tap(page, 'Comfort choices');
    },
  };
  for (const [label, setup] of Object.entries(setups)) {
    test(`from ${label}`, async ({ page }) => {
      await start(page);
      await choosePatient(page, 'pip');
      await setup(page);
      await exitNow(page);
      await expect(page.locator('.float-bubble, .bandage-handle')).toHaveCount(0);
      await page.getByRole('button', { name: 'Finish' }).click();
      await expect(page.locator('.welcome')).toBeVisible();
    });
  }

  test('from the pretend shot, mid-step', async ({ page }) => {
    await start(page);
    await choosePatient(page, 'prickle');
    await openActivity(page, 'Pretend shot');
    await page.getByRole('button', { name: 'Get ready' }).click();
    await page.getByRole('button', { name: 'Hold bunny' }).click();
    await exitNow(page);
    await expect(page.locator('.shot-helper')).toHaveCount(0);
  });

  test('from the sound mystery and the sock rescue', async ({ page }) => {
    await start(page);
    await choosePatient(page, 'mochi');
    await openActivity(page, 'Sound mystery');
    await exitNow(page);
    await page.getByRole('button', { name: 'Finish' }).click();
    await start(page);
    await choosePatient(page, 'mochi');
    await openActivity(page, 'Sock and hats');
    await page.getByRole('button', { name: "Take the sock off Mochi's head" }).click();
    await exitNow(page);
  });

  test('from the waiting room, the coloring book and a page preview', async ({ page }) => {
    await seedPages(page, ['waddles']);
    await start(page);
    await exitNow(page);
    await page.getByRole('button', { name: 'Finish' }).click();
    await page.getByRole('button', { name: 'My coloring book' }).click();
    await page.getByRole('button', { name: /The Great Sneezing Mystery/ }).click();
    await exitNow(page);
  });

  test('leaving after a little play keeps the page, with no warning', async ({ page }) => {
    await start(page);
    await choosePatient(page, 'mochi');
    await applyTool(page, 'listen');
    await page.waitForTimeout(300);
    await applyTool(page, 'temperature');
    await exitNow(page);
    await expect(page.getByRole('img', { name: "Mochi the Monster's coloring page saved" })).toBeVisible();
    expect((await saved(page)).pages).toEqual(['mochi']);
  });
});

test('the coloring book always has exactly four pages, and old sticker saves carry over', async ({ page }) => {
  await page.addInitScript((k) => localStorage.setItem(k, JSON.stringify({ stickers: ['prickle'], placements: { prickle: 3 }, muted: false, calm: false })), STORAGE);
  await page.goto('/');
  await page.getByRole('button', { name: 'My coloring book' }).click();
  await expect(page.locator('.book__card')).toHaveCount(4);
  await expect(page.locator('.book__thumb')).toHaveCount(1);
  await expect(page.getByRole('button', { name: /The Brave Little Checkup/ })).toBeVisible();
  await page.getByRole('button', { name: /Pip's page/ }).click();
  await expect(page.locator('.book__thumb')).toHaveCount(1);
});

test('the waiting room rewards curiosity', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Ring the reception bell' }).click();
  await expect(page.locator('.hamster.is-up')).toHaveCount(1);
  await page.getByRole('button', { name: 'Tickle the plant' }).click();
  await expect(page.locator('.plant.is-dancing')).toHaveCount(1);
  await page.getByRole('button', { name: 'Tap the clock' }).click();
  await expect(page.locator('.clock-bird.is-out')).toHaveCount(1);
  const before = await page.locator('.magazine-flip').innerHTML();
  await page.getByRole('button', { name: 'Flip the magazine' }).click();
  expect(await page.locator('.magazine-flip').innerHTML()).not.toBe(before);
});

test('mute is remembered', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Sound is on/ }).click();
  await expect(page.getByRole('button', { name: /Sound is off/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: /Sound is off/ })).toBeVisible();
});

test('calm mode follows the device reduced-motion setting and the grown-up switch', async ({ browser }) => {
  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const p1 = await reduced.newPage();
  await p1.goto('/');
  await expect(p1.locator('html')).toHaveAttribute('data-calm', 'true');
  await reduced.close();

  const normal = await browser.newContext();
  const p2 = await normal.newPage();
  await p2.goto('/');
  await expect(p2.locator('html')).toHaveAttribute('data-calm', 'false');
  await openParentArea(p2);
  await p2.getByLabel(/Calm mode/).check();
  await expect(p2.locator('html')).toHaveAttribute('data-calm', 'true');
  await normal.close();
});

test('the game still works when browser storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('blocked');
      },
    });
  });
  await start(page);
  await choosePatient(page, 'pip');
  await applyTool(page, 'listen');
  await page.waitForTimeout(250);
  await applyTool(page, 'temperature');
  await page.getByRole('button', { name: 'Feeling better!' }).click();
  await expect(page.locator('.complete')).toBeVisible();
});

test.describe('Grown-up area', () => {
  test('the gate keeps the area closed until the numbers are right', async ({ page }) => {
    await page.goto('/');
    await page.locator('.grownups-btn').click();
    for (const n of ['1', '1', '1']) await page.locator('.gate__key', { hasText: n }).click();
    await expect(page.getByText('Not quite. Here are new numbers to try.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Send your coloring book home!' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Back to the game' }).first().click();
    await expect(page.locator('.adult-overlay')).toHaveCount(0);
  });

  test('downloads a real multipage US Letter PDF without an email address', async ({ page }) => {
    await seedPages(page, ['mochi', 'pip']);
    await page.goto('/');
    await openParentArea(page);
    await expect(page.getByText('Your little doctor has been busy! Save your coloring pages to print at home.')).toBeVisible();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download coloring book' }).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe('my-creature-clinic-coloring-book.pdf');
    const bytes = readFileSync((await file.path())!);
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(3);
    for (const p of doc.getPages()) expect(p.getSize()).toEqual({ width: 612, height: 792 });
    await expect(page.getByText('Your coloring book is ready.')).toBeVisible();
  });

  test('download waits until there is a page', async ({ page }) => {
    await page.goto('/');
    await openParentArea(page);
    await expect(page.getByRole('button', { name: 'Download coloring book' })).toBeDisabled();
  });

  test('the email preview checks the address on the device and sends or saves nothing', async ({ page }) => {
    await seedPages(page, ['prickle']);
    await page.goto('/');
    await openParentArea(page);
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));
    await page.getByRole('button', { name: /Email coloring book/ }).click();
    await expect(page.getByText('Preview only: email isn’t connected yet')).toBeVisible();
    const box = page.getByRole('checkbox', { name: /occasional parenting ideas and resources from The Burrow Parenting/ });
    await expect(box).not.toBeChecked();
    await page.getByRole('button', { name: 'Email coloring book', exact: true }).click();
    await expect(page.getByText(/Please check the email address/)).toBeVisible();
    await page.getByLabel('Parent’s email address').fill('parent@example.com');
    await box.check();
    await page.getByRole('button', { name: 'Email coloring book', exact: true }).click();
    await expect(page.locator('.email-done')).toContainText("Email delivery isn't connected yet. You can download your coloring book now!");
    expect(requests).toEqual([]);
    expect(JSON.stringify(await page.evaluate(() => ({ ...localStorage, ...sessionStorage })))).not.toContain('parent@example.com');
    expect(await page.evaluate(() => document.cookie)).toBe('');
    const download = page.waitForEvent('download');
    await page.locator('.email-done').getByRole('button', { name: 'Download coloring book' }).click();
    expect((await download).suggestedFilename()).toBe('my-creature-clinic-coloring-book.pdf');
  });

  test('the newsletter, doctor tips, Burrow link and privacy notice are only in the grown-up area', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/newsletter|unsubscribe/i)).toHaveCount(0);
    await expect(page.locator('a[href*="theburrowparenting.com"]')).toHaveCount(0);
    await openParentArea(page);
    await expect(page.getByRole('heading', { name: 'Helping your child feel more comfortable at the doctor' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'About The Burrow Parenting' })).toBeVisible();
    await expect(page.locator('a[href="https://theburrowparenting.com"]')).toBeVisible();
    await expect(page.locator('a[href="/privacy.html"]')).toBeVisible();
  });

  test('the print version has the cover and one sheet per earned page', async ({ page }) => {
    await seedPages(page, ['pip', 'waddles', 'mochi']);
    await page.goto('/');
    await openParentArea(page);
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.print-sheet__page')).toHaveCount(4);
    await expect(page.locator('.print-sheet__page > svg').first()).toBeVisible();
  });
});

test('office links show only registered offices', async ({ page }) => {
  await page.goto('/?office=example-pediatrics');
  await expect(page.getByText('Welcome from Example Pediatrics')).toBeVisible();
  await page.goto('/?office=Free%20iPads%20at%20the%20desk');
  await expect(page.getByText(/Welcome from/)).toHaveCount(0);
});

test('the privacy notice page loads', async ({ page }) => {
  await page.goto('/privacy.html');
  await expect(page.getByRole('heading', { name: 'Privacy notice' })).toBeVisible();
});

test('landscape phones see a friendly "turn your phone" picture', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('.rotate-hint')).toBeVisible();
  await ctx.close();
});

test('the essential path works with a keyboard alone', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Play' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.waiting')).toBeVisible();
  await page.getByRole('button', { name: /Tap to see Waddles\./ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.exam')).toBeVisible({ timeout: 5000 });
  for (const tool of [TOOLS.listen, TOOLS.look]) {
    await page.getByRole('button', { name: tool, exact: true }).focus();
    await page.keyboard.press('Enter');
    await page.locator('.patient-hit').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
  }
  await expect(page.locator('.popup--lens')).toBeVisible();
  await page.locator('.adventure-btn', { hasText: 'Scarves and hats' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: /Take a scarf off/ }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Back to the doctor tools' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Feeling better!' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.complete')).toBeVisible();
  await page.getByRole('button', { name: 'All done. My doctor is ready!' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.goodbye')).toBeVisible();
});
