import { describe, expect, it } from 'vitest';
import { isValidEmail, validateRequestBody } from '../../server/validation';
import { isLikelyEmail } from '../../src/services/stickerBookApi';
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
  const good = { email: 'parent@example.com', stickers: [{ id: 'pip', slot: 0 }], newsletter: false, requestId: 'abc12345-req', website: '' };

  it('accepts a well-formed request', () => {
    const r = validateRequestBody(good);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual({ email: 'parent@example.com', stickers: [{ id: 'pip', slot: 0 }], newsletter: false, requestId: 'abc12345-req', trap: '' });
  });

  it('treats a missing newsletter flag as no', () => {
    const { newsletter: _n, ...rest } = good;
    const r = validateRequestBody(rest);
    expect(r.ok && r.value.newsletter).toBe(false);
  });

  it.each([
    ['unknown field', { ...good, html: '<b>hi</b>' }],
    ['unknown sticker', { ...good, stickers: [{ id: 'unicorn', slot: 0 }] }],
    ['bad slot', { ...good, stickers: [{ id: 'pip', slot: 6 }] }],
    ['duplicate sticker', { ...good, stickers: [{ id: 'pip', slot: 0 }, { id: 'pip', slot: 1 }] }],
    ['duplicate slot', { ...good, stickers: [{ id: 'pip', slot: 0 }, { id: 'mochi', slot: 0 }] }],
    ['no stickers', { ...good, stickers: [] }],
    ['too many stickers', { ...good, stickers: [0, 1, 2, 3, 4].map((slot) => ({ id: 'pip', slot })) }],
    ['extra sticker keys', { ...good, stickers: [{ id: 'pip', slot: 0, name: 'Ava' }] }],
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
