import { describe, expect, it, vi } from 'vitest';
import { MockProvider, ResendProvider, type EmailProvider } from '../../server/emailProviders';
import { MailerLiteNewsletter, type NewsletterService } from '../../server/mailerlite';
import { MemoryRateLimiter } from '../../server/rateLimit';
import { handleStickerBookEmail, type HandlerDeps } from '../../server/stickerBookEmail';
import { stickerBookEmail } from '../../server/emailTemplate';

const ORIGIN = 'https://clinic.example.org';

function deps(overrides: Partial<HandlerDeps> = {}): HandlerDeps & { provider: MockProvider } {
  return {
    provider: new MockProvider(),
    newsletter: null,
    allowedOrigins: [ORIGIN],
    limiter: new MemoryRateLimiter(),
    completed: new Map(),
    salt: 'test',
    ...overrides,
  } as HandlerDeps & { provider: MockProvider };
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${ORIGIN}/api/sticker-book/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN, ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const goodBody = { email: 'parent@example.com', stickers: [{ id: 'pip', slot: 0 }], newsletter: false, requestId: 'req-00000001' };

class SpyNewsletter implements NewsletterService {
  calls: string[] = [];
  constructor(private readonly result: 'received' | 'unavailable' = 'received') {}
  async subscribe(email: string) {
    this.calls.push(email);
    return this.result;
  }
}

describe('sticker book email endpoint', () => {
  it('sends one email with a PDF attachment', async () => {
    const d = deps();
    const res = await handleStickerBookEmail(post(goodBody), d, '1.2.3.4');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, delivery: 'mock', newsletter: 'not_requested' });
    expect(d.provider.sent).toHaveLength(1);
    const sent = d.provider.sent[0]!;
    expect(sent.to).toBe('parent@example.com');
    expect(sent.subject).toBe('Your Curious Creature Clinic sticker book!');
    expect(new TextDecoder().decode(sent.attachment.content.slice(0, 5))).toBe('%PDF-');
    expect(sent.html).not.toContain('parent@example.com');
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });

  it('never contacts the newsletter service for email-only requests', async () => {
    const newsletter = new SpyNewsletter();
    const res = await handleStickerBookEmail(post(goodBody), deps({ newsletter }), '1.2.3.4');
    expect((await res.json()).newsletter).toBe('not_requested');
    expect(newsletter.calls).toEqual([]);
  });

  it('offers the address to the newsletter only when the box was ticked', async () => {
    const newsletter = new SpyNewsletter();
    const res = await handleStickerBookEmail(post({ ...goodBody, newsletter: true }), deps({ newsletter }), '1.2.3.4');
    expect(await res.json()).toEqual({ ok: true, delivery: 'mock', newsletter: 'received' });
    expect(newsletter.calls).toEqual(['parent@example.com']);
  });

  it('still delivers the sticker book if the newsletter service is down', async () => {
    const res = await handleStickerBookEmail(post({ ...goodBody, newsletter: true }), deps({ newsletter: new SpyNewsletter('unavailable') }), '1.2.3.4');
    expect(await res.json()).toEqual({ ok: true, delivery: 'mock', newsletter: 'unavailable' });
  });

  it('reports a friendly failure when delivery fails, without hiding the newsletter result', async () => {
    const res = await handleStickerBookEmail(post({ ...goodBody, newsletter: true }), deps({ provider: new MockProvider(undefined, true), newsletter: new SpyNewsletter() }), '1.2.3.4');
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: 'delivery_failed', newsletter: 'received' });
  });

  it('says so plainly when email is not set up', async () => {
    const res = await handleStickerBookEmail(post(goodBody), deps({ provider: null }), '1.2.3.4');
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe('not_configured');
  });

  it('does not send twice when the same request is retried', async () => {
    const d = deps();
    await handleStickerBookEmail(post(goodBody), d, '1.2.3.4');
    const again = await handleStickerBookEmail(post(goodBody), d, '1.2.3.4');
    expect(again.status).toBe(200);
    expect(d.provider.sent).toHaveLength(1);
  });

  it('retries after a failure do not create duplicate newsletter sign-ups', async () => {
    const newsletter = new SpyNewsletter();
    const failing = deps({ provider: new MockProvider(undefined, true), newsletter });
    await handleStickerBookEmail(post({ ...goodBody, newsletter: true }), failing, '1.2.3.4');
    await handleStickerBookEmail(post({ ...goodBody, newsletter: true }), failing, '1.2.3.4');
    // The upsert is safe to repeat; MailerLite keys subscribers by email, so there is still one subscriber.
    expect(new Set(newsletter.calls).size).toBe(1);
  });

  it('rejects other websites, wrong methods, wrong content types and big bodies', async () => {
    const d = deps();
    expect((await handleStickerBookEmail(post(goodBody, { origin: 'https://evil.example' }), d, null)).status).toBe(403);
    expect((await handleStickerBookEmail(new Request(`${ORIGIN}/api/sticker-book/email`, { method: 'GET', headers: { origin: ORIGIN } }), d, null)).status).toBe(405);
    expect((await handleStickerBookEmail(post(goodBody, { 'content-type': 'text/plain' }), d, null)).status).toBe(415);
    const huge = JSON.stringify({ ...goodBody, website: 'x'.repeat(5000) });
    expect((await handleStickerBookEmail(post(huge), d, null)).status).toBe(413);
    expect((await handleStickerBookEmail(post('{oops'), d, null)).status).toBe(400);
    expect(d.provider.sent).toHaveLength(0);
  });

  it('rejects requests without an Origin header when an allowlist is set', async () => {
    const req = new Request(`${ORIGIN}/api/sticker-book/email`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(goodBody) });
    expect((await handleStickerBookEmail(req, deps(), null)).status).toBe(403);
  });

  it('accepts same-host requests when no allowlist is set', async () => {
    const res = await handleStickerBookEmail(post({ ...goodBody, requestId: 'req-same-host' }), deps({ allowedOrigins: [] }), null);
    expect(res.status).toBe(200);
  });

  it('answers CORS preflight only for allowed origins', async () => {
    const ok = await handleStickerBookEmail(new Request(`${ORIGIN}/api/sticker-book/email`, { method: 'OPTIONS', headers: { origin: ORIGIN } }), deps(), null);
    expect(ok.status).toBe(204);
    const bad = await handleStickerBookEmail(new Request(`${ORIGIN}/api/sticker-book/email`, { method: 'OPTIONS', headers: { origin: 'https://evil.example' } }), deps(), null);
    expect(bad.status).toBe(403);
  });

  it('ignores the hidden bot field without sending anything', async () => {
    const d = deps();
    const res = await handleStickerBookEmail(post({ ...goodBody, website: 'http://spam.example' }), d, null);
    expect(res.status).toBe(400);
    expect(d.provider.sent).toHaveLength(0);
  });

  it('rate-limits repeated sends to the same address', async () => {
    const d = deps();
    const statuses: number[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await handleStickerBookEmail(post({ ...goodBody, requestId: `req-rate-${i}0000` }), d, `10.0.0.${i}`);
      statuses.push(res.status);
    }
    expect(statuses.slice(0, 3)).toEqual([200, 200, 200]);
    expect(statuses[3]).toBe(429);
    expect(d.provider.sent).toHaveLength(3);
  });

  it('rate-limits one device sending to many addresses', async () => {
    const d = deps();
    const statuses: number[] = [];
    for (let i = 0; i < 8; i++) {
      const res = await handleStickerBookEmail(post({ ...goodBody, email: `p${i}@example.com`, requestId: `req-ip-${i}00000` }), d, '9.9.9.9');
      statuses.push(res.status);
    }
    expect(statuses.filter((s) => s === 429).length).toBeGreaterThan(0);
  });

  it('never logs email addresses', async () => {
    const lines: string[] = [];
    await handleStickerBookEmail(post({ ...goodBody, newsletter: true }), deps({ newsletter: new SpyNewsletter(), log: (e, data) => lines.push(JSON.stringify({ e, ...data })) }), '1.2.3.4');
    expect(lines.join('\n')).not.toContain('parent@example.com');
    expect(lines.join('\n')).not.toContain('1.2.3.4');
  });
});

describe('Resend provider', () => {
  it('posts the message with the PDF attached and an idempotency key', async () => {
    const fetchImpl = vi.fn(async () => new Response('{"id":"x"}', { status: 200 }));
    const provider: EmailProvider = new ResendProvider({ apiKey: 're_test', from: 'Clinic <hello@example.org>', fetchImpl: fetchImpl as unknown as typeof fetch });
    const result = await provider.send({ to: 'parent@example.com', subject: 's', html: '<p>h</p>', text: 't', attachment: { filename: 'a.pdf', content: new Uint8Array([37, 80, 68, 70]) }, idempotencyKey: 'abc' });
    expect(result).toEqual({ status: 'sent' });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer re_test');
    expect(headers['Idempotency-Key']).toBe('sticker-book-abc');
    const body = JSON.parse(init.body as string);
    expect(body.to).toEqual(['parent@example.com']);
    expect(body.attachments[0]).toEqual({ filename: 'a.pdf', content: 'JVBERg==' });
  });

  it('turns HTTP errors into a failure result', async () => {
    const provider = new ResendProvider({ apiKey: 'k', from: 'f@example.org', fetchImpl: (async () => new Response('no', { status: 500 })) as unknown as typeof fetch });
    const result = await provider.send({ to: 'a@example.com', subject: '', html: '', text: '', attachment: { filename: 'a', content: new Uint8Array() }, idempotencyKey: null });
    expect(result).toEqual({ status: 'failed', reason: 'resend_http_500' });
  });
});

describe('MailerLite newsletter', () => {
  function fakeFetch(lookup: { status: number; body?: unknown }, upsertStatus = 201) {
    const calls: { url: string; init: RequestInit }[] = [];
    const impl = async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      if (init.method === 'GET') return new Response(JSON.stringify(lookup.body ?? {}), { status: lookup.status });
      return new Response('{}', { status: upsertStatus });
    };
    return { calls, impl: impl as unknown as typeof fetch };
  }
  const when = new Date('2026-05-01T12:30:00Z');

  it('creates new sign-ups as unconfirmed, in the sticker-book group, with the opt-in time', async () => {
    const f = fakeFetch({ status: 404 });
    const ml = new MailerLiteNewsletter({ apiKey: 'k', groupId: '123', doubleOptIn: true, fetchImpl: f.impl });
    expect(await ml.subscribe('parent@example.com', when)).toBe('received');
    expect(f.calls).toHaveLength(2);
    expect(f.calls[0]!.url).toBe('https://connect.mailerlite.com/api/subscribers/parent%40example.com');
    const body = JSON.parse(f.calls[1]!.init.body as string);
    expect(body).toEqual({ email: 'parent@example.com', groups: ['123'], opted_in_at: '2026-05-01 12:30:00', status: 'unconfirmed' });
    expect(JSON.stringify(body)).not.toMatch(/resubscribe/);
  });

  it('never resubscribes someone who unsubscribed', async () => {
    for (const status of ['unsubscribed', 'bounced', 'junk']) {
      const f = fakeFetch({ status: 200, body: { data: { status } } });
      const ml = new MailerLiteNewsletter({ apiKey: 'k', groupId: '123', doubleOptIn: true, fetchImpl: f.impl });
      expect(await ml.subscribe('parent@example.com', when)).toBe('received');
      expect(f.calls).toHaveLength(1);
    }
  });

  it('adds existing subscribers to the group without changing their status', async () => {
    const f = fakeFetch({ status: 200, body: { data: { status: 'active' } } }, 200);
    const ml = new MailerLiteNewsletter({ apiKey: 'k', groupId: '123', doubleOptIn: true, fetchImpl: f.impl });
    await ml.subscribe('parent@example.com', when);
    const body = JSON.parse(f.calls[1]!.init.body as string);
    expect(body).toEqual({ email: 'parent@example.com', groups: ['123'] });
  });

  it('reports unavailable when MailerLite errors', async () => {
    const f = fakeFetch({ status: 500 });
    const ml = new MailerLiteNewsletter({ apiKey: 'k', groupId: '123', doubleOptIn: true, fetchImpl: f.impl });
    expect(await ml.subscribe('parent@example.com', when)).toBe('unavailable');
    const throwing = new MailerLiteNewsletter({ apiKey: 'k', groupId: '1', doubleOptIn: true, fetchImpl: (async () => { throw new Error('down'); }) as unknown as typeof fetch });
    expect(await throwing.subscribe('parent@example.com', when)).toBe('unavailable');
  });
});

describe('email template', () => {
  it('uses the agreed copy and tells email-only recipients they were not added to a list', () => {
    const plain = stickerBookEmail({ newsletterRequested: false });
    expect(plain.text).toContain('Your little doctor did some important work today!');
    expect(plain.text).toContain("You haven't been added to any mailing list.");
    const opted = stickerBookEmail({ newsletterRequested: true });
    expect(opted.text).toContain('confirm');
  });
});

describe('rate limiter memory', () => {
  it('forgets keys after their window passes', () => {
    let t = 0;
    const limiter = new MemoryRateLimiter(() => t);
    limiter.allow('a', { limit: 1, windowMs: 60_000 });
    limiter.allow('b', { limit: 1, windowMs: 60 * 60_000 });
    expect(limiter.size).toBe(2);
    t = 10 * 60_000;
    limiter.allow('c', { limit: 1, windowMs: 60_000 });
    expect(limiter.size).toBe(2);
    t = 2 * 60 * 60_000;
    limiter.allow('d', { limit: 1, windowMs: 60_000 });
    expect(limiter.size).toBe(1);
  });
});
