import { choosePatient, expect, openParentArea, seedStickers, start, tap, tapPatient, test, applyTool } from './helpers';

test.describe('Flow A: a first-time child plays a whole visit without reading', () => {
  test('choose Pip, use tools, comfort, finish, get a sticker, place it, return', async ({ page }) => {
    await start(page);
    await choosePatient(page, 'pip');
    await expect(page.getByRole('button', { name: 'Feeling better!' })).toHaveCount(0);

    await applyTool(page, 'Stethoscope');
    await expect(page.locator('.tool-sprite')).toBeVisible();
    await page.waitForTimeout(400);
    await applyTool(page, 'Ear light');
    await expect(page.locator('.popup--lens')).toBeVisible();
    await tap(page, 'Comfort choices');
    await tap(page, 'Cuddle toy');

    const finish = page.getByRole('button', { name: 'Feeling better!' });
    await expect(finish).toBeVisible();
    await finish.click();
    await expect(page.locator('.complete')).toBeVisible();
    await expect(page.getByRole('img', { name: 'Pip the Dragon sticker' })).toBeVisible({ timeout: 6000 });

    await page.getByRole('button', { name: 'My stickers' }).click();
    await expect(page.getByRole('dialog', { name: 'My sticker book' })).toBeVisible();
    await page.getByRole('button', { name: /Pip the dragon floating inside a shiny bubble\. Tap to pick it up/ }).click();
    await page.getByRole('button', { name: 'Stick it here' }).first().click();
    await expect(page.locator('.book__slot.has-sticker')).toHaveCount(1);

    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('curious-creature-clinic.v1') ?? '{}'));
    expect(saved.stickers).toEqual(['pip']);
    expect(saved.placements.pip).toBe(0);

    await page.getByRole('button', { name: 'Close the sticker book' }).click();
    await expect(page.locator('.waiting')).toBeVisible();
  });
});

test.describe('Every patient', () => {
  for (const name of ['pip', 'waddles', 'prickle', 'mochi'] as const) {
    test(`${name}: all four tools work and the visit can finish`, async ({ page }) => {
      await start(page);
      await choosePatient(page, name);
      await applyTool(page, 'Stethoscope');
      await expect(page.locator('.tool-sprite')).toBeVisible();
      await page.waitForTimeout(300);
      await applyTool(page, 'Thermometer');
      await expect(page.locator('.popup--gauge')).toBeVisible();
      await page.waitForTimeout(300);
      await applyTool(page, 'Ear light');
      await expect(page.locator('.popup--lens')).toBeVisible();
      await tap(page, 'Bandages');
      await tap(page, 'Heart bandage');
      await tapPatient(page, 0.5, 0.55);
      await page.getByRole('button', { name: 'Feeling better!' }).click();
      await expect(page.locator('.complete')).toBeVisible();
    });
  }
});

test('drag and drop also works: drag the thermometer onto Mochi', async ({ page }) => {
  await start(page);
  await choosePatient(page, 'mochi');
  const tool = page.getByRole('button', { name: 'Thermometer', exact: true });
  const from = (await tool.boundingBox())!;
  const to = (await page.locator('.patient-hit').boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2, from.y - 40, { steps: 4 });
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator('.popup--gauge')).toBeVisible();
});

test("Prickle: the pretend shot is optional, and comfort choices help", async ({ page }) => {
  await start(page);
  await choosePatient(page, 'prickle');
  await page.getByRole('button', { name: /Pick up the pretend shot/ }).click();
  await expect(page.getByRole('group', { name: 'Comfort choices' })).toBeVisible();
  await tap(page, 'Show it on the toy first');
  await page.waitForTimeout(3200);
  await tapPatient(page);
  await page.waitForTimeout(3500);
  await expect(page.getByRole('button', { name: /Pick up the pretend shot/ })).toBeVisible();

  // A fresh visit can finish without the shot at all.
  await page.getByRole('button', { name: 'Back to the waiting room' }).click();
  await choosePatient(page, 'prickle');
  await tap(page, 'Comfort choices');
  await tap(page, 'Gentle song');
  await applyTool(page, 'Stethoscope');
  await page.waitForTimeout(300);
  await applyTool(page, 'Ear light');
  await expect(page.getByRole('button', { name: 'Feeling better!' })).toBeVisible();
});

test.describe('Flow D: the doctor calls, and the child leaves happily from anywhere', () => {
  test('mid-interaction in the exam room', async ({ page }) => {
    await start(page);
    await choosePatient(page, 'waddles');
    await applyTool(page, 'Thermometer');
    await expect(page.locator('.popup--gauge')).toBeVisible();
    await page.getByRole('button', { name: 'All done. My doctor is ready!' }).click();
    await expect(page.locator('.goodbye')).toBeVisible();
    await expect(page.locator('.popup')).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.getByRole('button', { name: 'Finish' }).click();
    await expect(page.locator('.welcome')).toBeVisible();
  });

  test('from the waiting room, the sticker book and the visit-complete screen', async ({ page }) => {
    await start(page);
    await page.getByRole('button', { name: 'All done. My doctor is ready!' }).click();
    await expect(page.locator('.goodbye')).toBeVisible();
    await page.getByRole('button', { name: 'Finish' }).click();

    await start(page, '/');
    await page.getByRole('button', { name: 'My sticker book' }).click();
    await page.getByRole('button', { name: 'All done. My doctor is ready!' }).click();
    await expect(page.locator('.goodbye')).toBeVisible();
    await page.getByRole('button', { name: 'Finish' }).click();

    await start(page, '/');
    await choosePatient(page, 'pip');
    for (const t of ['Stethoscope', 'Thermometer', 'Ear light']) {
      await applyTool(page, t);
      await page.waitForTimeout(250);
    }
    await page.getByRole('button', { name: 'Feeling better!' }).click();
    await page.getByRole('button', { name: 'All done. My doctor is ready!' }).click();
    await expect(page.locator('.goodbye')).toBeVisible();
  });

  test('leaving after enough play keeps the sticker', async ({ page }) => {
    await start(page);
    await choosePatient(page, 'mochi');
    for (const t of ['Stethoscope', 'Thermometer', 'Ear light']) {
      await applyTool(page, t);
      await page.waitForTimeout(250);
    }
    await page.getByRole('button', { name: 'All done. My doctor is ready!' }).click();
    await expect(page.getByRole('img', { name: 'Mochi the Monster sticker saved' })).toBeVisible();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('curious-creature-clinic.v1') ?? '{}'));
    expect(saved.stickers).toEqual(['mochi']);
  });
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
  const tank = (await page.getByRole('button', { name: /fish tank/ }).boundingBox())!;
  await page.mouse.move(tank.x + 10, tank.y + tank.height / 2);
  await page.mouse.down();
  await page.mouse.move(tank.x + tank.width - 10, tank.y + tank.height / 2, { steps: 5 });
  const transform = await page.locator('.fish').first().evaluate((el) => (el as SVGElement).style.transform);
  await page.mouse.up();
  expect(transform).toMatch(/translate\(2\d\d/);
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
  for (const t of ['Stethoscope', 'Thermometer', 'Ear light']) {
    await applyTool(page, t);
    await page.waitForTimeout(250);
  }
  await page.getByRole('button', { name: 'Feeling better!' }).click();
  await expect(page.locator('.complete')).toBeVisible();
});

test.describe('Grown-up area', () => {
  test('the gate keeps the area closed until the numbers are right', async ({ page }) => {
    await page.goto('/');
    await page.locator('.grownups-btn').click();
    for (const n of ['1', '1', '1']) await page.locator('.gate__key', { hasText: n }).click();
    // 1,1,1 can never be right: challenges always use three different numbers.
    await expect(page.getByText('Not quite. Here are new numbers to try.')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Keep your little doctor/ })).toHaveCount(0);
    await page.getByRole('button', { name: 'Back to the game' }).first().click();
    await expect(page.locator('.adult-overlay')).toHaveCount(0);
  });

  test('Flow E: download a real PDF without giving an email', async ({ page }) => {
    await seedStickers(page, ['pip', 'waddles'], { pip: 1 });
    await page.goto('/');
    await openParentArea(page);
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download sticker book' }).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe('curious-creature-clinic-sticker-book.pdf');
    const path = await file.path();
    const { readFileSync } = await import('node:fs');
    const bytes = readFileSync(path!);
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
    expect(bytes.length).toBeGreaterThan(8_000);
    await expect(page.getByText('Your sticker book is ready.')).toBeVisible();
  });

  test('download and email wait until there is a sticker', async ({ page }) => {
    await page.goto('/');
    await openParentArea(page);
    await expect(page.getByRole('button', { name: 'Download sticker book' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Email sticker book' })).toBeDisabled();
  });

  test('Flow F: email without the newsletter', async ({ page }) => {
    await seedStickers(page, ['mochi']);
    await page.goto('/');
    await openParentArea(page);
    await page.getByRole('button', { name: 'Email sticker book' }).click();
    const box = page.getByRole('checkbox', { name: /occasional parenting ideas/ });
    await expect(box).not.toBeChecked();
    await page.getByRole('button', { name: 'Send sticker book' }).click();
    await expect(page.getByText(/Please check the email address/)).toBeVisible();
    await page.getByLabel('Your email address').fill('parent@example.com');
    const request = page.waitForRequest('**/api/sticker-book/email');
    await page.getByRole('button', { name: 'Send sticker book' }).click();
    const body = (await request).postDataJSON();
    expect(body.newsletter).toBe(false);
    expect(body.stickers).toEqual([{ id: 'mochi', slot: 0 }]);
    expect(Object.keys(body).sort()).toEqual(['email', 'newsletter', 'requestId', 'stickers', 'website']);
    await expect(page.getByText('Test mode: no email was sent')).toBeVisible();
  });

  test('Flow G: email with the newsletter ticked by the grown-up', async ({ page }) => {
    await seedStickers(page, ['prickle']);
    await page.route('**/api/sticker-book/email', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, delivery: 'sent', newsletter: 'received' }) }),
    );
    await page.goto('/');
    await openParentArea(page);
    await page.getByRole('button', { name: 'Email sticker book' }).click();
    await page.getByLabel('Your email address').fill('parent@example.com');
    await page.getByRole('checkbox', { name: /occasional parenting ideas/ }).check();
    const request = page.waitForRequest('**/api/sticker-book/email');
    await page.getByRole('button', { name: 'Send sticker book' }).click();
    expect((await request).postDataJSON().newsletter).toBe(true);
    await expect(page.getByText('Sent!')).toBeVisible();
    await expect(page.getByText(/look for an email asking you to confirm/)).toBeVisible();
  });

  test('Flow H: when email is down, a friendly error offers retry and download, and the game keeps working', async ({ page }) => {
    await seedStickers(page, ['pip']);
    let calls = 0;
    const ids = new Set<string>();
    await page.route('**/api/sticker-book/email', (route) => {
      calls++;
      ids.add(route.request().postDataJSON().requestId);
      return calls === 1 ? route.abort('internetdisconnected') : route.fulfill({ status: 502, contentType: 'application/json', body: '{"ok":false,"error":"delivery_failed"}' });
    });
    await page.goto('/');
    await openParentArea(page);
    await page.getByRole('button', { name: 'Email sticker book' }).click();
    await page.getByLabel('Your email address').fill('parent@example.com');
    await page.getByRole('button', { name: 'Send sticker book' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByText(/didn.t accept the message/)).toBeVisible();
    expect(ids.size).toBe(1);
    await page.getByRole('button', { name: 'Download it instead' }).click();
    await expect(page.getByRole('button', { name: 'Download sticker book' })).toBeVisible();
    await page.getByRole('button', { name: 'Back to the game' }).last().click();
    await page.getByRole('button', { name: 'Play' }).click();
    await expect(page.locator('.waiting')).toBeVisible();
  });

  test('the newsletter, doctor tips, Burrow link and privacy notice are only in the grown-up area', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/newsletter/i)).toHaveCount(0);
    await expect(page.locator('a[href*="theburrowparenting.com"]')).toHaveCount(0);
    await openParentArea(page);
    await expect(page.getByRole('heading', { name: 'Helping your child feel more comfortable at the doctor' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'About The Burrow Parenting' })).toBeVisible();
    await expect(page.locator('a[href="https://theburrowparenting.com"]')).toBeVisible();
    await expect(page.locator('a[href="/privacy.html"]')).toBeVisible();
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
  for (const tool of ['Stethoscope', 'Thermometer', 'Ear light']) {
    await page.getByRole('button', { name: tool, exact: true }).focus();
    await page.keyboard.press('Enter');
    await page.locator('.patient-hit').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
  }
  await expect(page.locator('.popup--lens')).toBeVisible();
  await page.getByRole('button', { name: 'Feeling better!' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.complete')).toBeVisible();
  await page.getByRole('button', { name: 'All done. My doctor is ready!' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.goodbye')).toBeVisible();
});

test('the print version shows every collected sticker inside the page', async ({ page }) => {
  await seedStickers(page, ['pip', 'waddles', 'mochi'], { pip: 2 });
  await page.goto('/');
  await openParentArea(page);
  await page.emulateMedia({ media: 'print' });
  const page_ = await page.locator('.print-sheet__page > svg').boundingBox();
  const stickers = page.locator('.print-sheet__page > svg > g[transform]');
  await expect(stickers).toHaveCount(3);
  for (const box of await stickers.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()))) {
    expect(box.left).toBeGreaterThanOrEqual(page_!.x - 1);
    expect(box.right).toBeLessThanOrEqual(page_!.x + page_!.width + 1);
    expect(box.bottom).toBeLessThanOrEqual(page_!.y + page_!.height + 1);
  }
});
