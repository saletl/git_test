import { describe, expect, it, vi } from 'vitest';
import { isValidEmail, validateRequestBody } from '../../server/validation';
import { isLikelyEmail } from '../../src/services/coloringBookDelivery';
import { makeChallenge } from '../../src/parent/ParentGate';

describe('email validation', () => {
  it.each(['parent@example.com', 'a.b+clinic@sub.example.co.uk', 'x_y@domain.io'])('accepts %s', (email) => {
    expect(isValidEmail(email)).toBe(true);
    expect(isLikelyEmail(email)).toBe(true);
  });

  it.each([
    '',
    'not-an-email',
    'a@b',
    'parent@example',
    'parent@@example.com',
    'parent@example.com\r\nBcc: victim@example.com',
    'parent@example.com,other@example.com',
    'Parent <parent@example.com>',
    '.parent@example.com',
    'par..ent@example.com',
    `${'a'.repeat(65)}@example.com`,
    `parent@${'a'.repeat(250)}.com`,
  ])('rejects %j', (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});

describe('request body validation', () => {
  const good = { email: 'parent@example.com', pages: ['pip'], newsletter: false, requestId: 'abc12345-req', website: '' };

  it('accepts a well-formed request', () => {
    const r = validateRequestBody(good);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual({ email: 'parent@example.com', pages: ['pip'], newsletter: false, requestId: 'abc12345-req', trap: '' });
  });

  it('puts pages in book order', () => {
    const r = validateRequestBody({ ...good, pages: ['mochi', 'pip'] });
    expect(r.ok && r.value.pages).toEqual(['pip', 'mochi']);
  });

  it('treats a missing newsletter flag as no', () => {
    const { newsletter: _n, ...rest } = good;
    const r = validateRequestBody(rest);
    expect(r.ok && r.value.newsletter).toBe(false);
  });

  it.each([
    ['unknown field', { ...good, html: '<b>hi</b>' }],
    ['unknown page', { ...good, pages: ['unicorn'] }],
    ['duplicate page', { ...good, pages: ['pip', 'pip'] }],
    ['no pages', { ...good, pages: [] }],
    ['too many pages', { ...good, pages: ['pip', 'waddles', 'prickle', 'mochi', 'pip'] }],
    ['page objects instead of ids', { ...good, pages: [{ id: 'pip', name: 'Ava' }] }],
    ['old sticker field', { email: good.email, stickers: [{ id: 'pip', slot: 0 }] }],
    ['newsletter as string', { ...good, newsletter: 'yes' }],
    ['bad request id', { ...good, requestId: 'x' }],
    ['array body', [good]],
    ['null body', null],
  ])('rejects %s', (_label, body) => {
    expect(validateRequestBody(body).ok).toBe(false);
  });

  it('reports a bad email separately', () => {
    expect(validateRequestBody({ ...good, email: 'nope' })).toEqual({ ok: false, error: 'invalid_email' });
  });
});

describe('grown-up gate', () => {
  it('asks for three different digits from 1 to 9', () => {
    for (let i = 0; i < 50; i++) {
      const c = makeChallenge();
      expect(c).toHaveLength(3);
      expect(new Set(c).size).toBe(3);
      for (const n of c) expect(n >= 1 && n <= 9).toBe(true);
    }
  });
});

describe('disconnected email preview', () => {
  it('never calls the network and never reports a send', async () => {
    const { coloringBookDelivery, disconnectedDelivery, NOT_CONNECTED_MESSAGE } = await import('../../src/services/coloringBookDelivery');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const result = await coloringBookDelivery.send({ email: 'parent@example.com', pages: ['pip'], newsletter: true });
    expect(result).toEqual({ status: 'not_connected' });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(coloringBookDelivery).toBe(disconnectedDelivery);
    expect(coloringBookDelivery.connected).toBe(false);
    expect(NOT_CONNECTED_MESSAGE).toBe("Email delivery isn't connected yet. You can download your coloring book now!");
    fetchSpy.mockRestore();
  });

  it('uses the exact, truthful newsletter wording', async () => {
    const { NEWSLETTER_CONSENT_TEXT } = await import('../../src/parent/EmailForm');
    expect(NEWSLETTER_CONSENT_TEXT).toBe("I'd also like occasional parenting ideas and resources from The Burrow Parenting. I can unsubscribe anytime.");
  });
});
