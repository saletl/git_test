import { buildColoringBookPdf, PDF_FILENAME } from '../src/coloring/pdf';
import type { EmailProvider } from './emailProviders';
import { coloringBookEmail } from './emailTemplate';
import type { NewsletterOutcome, NewsletterService } from './mailerlite';
import { hashKey, MemoryRateLimiter, type RateRule } from './rateLimit';
import { MAX_BODY_BYTES, validateRequestBody } from './validation';

/**
 * FUTURE ENDPOINT, NOT DEPLOYED: POST /api/coloring-book/email
 *
 * Body: { email, pages: ["pip", ...], newsletter?: boolean, requestId?: string, website?: "" }
 *
 * Sends a one-time email with the coloring book PDF. If (and only if) `newsletter` is true, the address
 * is also offered to MailerLite, independently of the email delivery.
 *
 * Nothing calls this today. The game uses services/coloringBookDelivery.ts, which is disconnected.
 * See docs/EMAIL-INTEGRATION.md for the checklist to finish before wiring it up.
 */

export type ApiError = 'bad_request' | 'invalid_email' | 'rate_limited' | 'not_configured' | 'delivery_failed' | 'forbidden' | 'method_not_allowed' | 'too_large';

export interface ApiSuccess {
  ok: true;
  delivery: 'sent' | 'mock';
  newsletter: 'not_requested' | NewsletterOutcome;
}

export interface ApiFailure {
  ok: false;
  error: ApiError;
  newsletter?: 'not_requested' | NewsletterOutcome;
}

export interface HandlerDeps {
  provider: EmailProvider | null;
  newsletter: NewsletterService | null;
  /** Exact origins allowed to call the endpoint, e.g. https://clinic.example.org. Empty means same host only. */
  allowedOrigins: string[];
  limiter: MemoryRateLimiter;
  salt: string;
  now?: () => Date;
  log?: (event: string, data: Record<string, unknown>) => void;
  /** Remembers finished requests so a retry with the same requestId never sends twice. */
  completed?: Map<string, { at: number; body: ApiSuccess }>;
}

export const RATE_RULES: Record<'ip' | 'recipient' | 'global', RateRule> = {
  ip: { limit: 6, windowMs: 10 * 60 * 1000 },
  recipient: { limit: 3, windowMs: 60 * 60 * 1000 },
  global: { limit: 300, windowMs: 60 * 60 * 1000 },
};

const IDEMPOTENCY_WINDOW_MS = 30 * 60 * 1000;

function json(status: number, body: ApiSuccess | ApiFailure, origin: string | null): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers.Vary = 'Origin';
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function originAllowed(request: Request, allowed: string[]): { ok: boolean; origin: string | null } {
  const origin = request.headers.get('origin');
  if (!origin) {
    // Browsers always send Origin on POST. Without it, only accept when no allowlist is set (local tools).
    return { ok: allowed.length === 0, origin: null };
  }
  if (allowed.length) return { ok: allowed.includes(origin), origin: allowed.includes(origin) ? origin : null };
  try {
    const host = new URL(request.url).host;
    return { ok: new URL(origin).host === host, origin };
  } catch {
    return { ok: false, origin: null };
  }
}

async function readLimited(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > MAX_BODY_BYTES) return null;
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(all);
}

export async function handleColoringBookEmail(request: Request, deps: HandlerDeps, clientIp: string | null): Promise<Response> {
  const log = deps.log ?? (() => undefined);
  const now = deps.now ?? (() => new Date());
  const { ok: originOk, origin } = originAllowed(request, deps.allowedOrigins);

  if (request.method === 'OPTIONS') {
    if (!originOk || !origin) return new Response(null, { status: 403 });
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '600',
        Vary: 'Origin',
      },
    });
  }
  if (request.method !== 'POST') return json(405, { ok: false, error: 'method_not_allowed' }, null);
  if (!originOk) {
    log('coloring_email_rejected', { reason: 'origin' });
    return json(403, { ok: false, error: 'forbidden' }, null);
  }
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    return json(415, { ok: false, error: 'bad_request' }, origin);
  }

  const text = await readLimited(request);
  if (text === null) return json(413, { ok: false, error: 'too_large' }, origin);
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return json(400, { ok: false, error: 'bad_request' }, origin);
  }
  const parsed = validateRequestBody(raw);
  if (!parsed.ok) return json(400, { ok: false, error: parsed.error }, origin);
  const input = parsed.value;
  if (input.trap) {
    log('coloring_email_rejected', { reason: 'trap' });
    return json(400, { ok: false, error: 'bad_request' }, origin);
  }

  const recipientKey = await hashKey(input.email, deps.salt);
  const completed = deps.completed;
  if (input.requestId && completed) {
    const key = `${input.requestId}:${recipientKey}`;
    const done = completed.get(key);
    if (done && now().getTime() - done.at < IDEMPOTENCY_WINDOW_MS) {
      log('coloring_email_repeat', {});
      return json(200, done.body, origin);
    }
  }

  const ipKey = clientIp ? await hashKey(clientIp, deps.salt) : 'unknown-ip';
  if (
    !deps.limiter.allow(`ip:${ipKey}`, RATE_RULES.ip) ||
    !deps.limiter.allow(`to:${recipientKey}`, RATE_RULES.recipient) ||
    !deps.limiter.allow('global', RATE_RULES.global)
  ) {
    log('coloring_email_rejected', { reason: 'rate' });
    return json(429, { ok: false, error: 'rate_limited' }, origin);
  }

  const newsletterTask: Promise<'not_requested' | NewsletterOutcome> =
    input.newsletter && deps.newsletter ? deps.newsletter.subscribe(input.email, now()) : Promise.resolve(input.newsletter ? 'unavailable' : 'not_requested');

  const deliveryTask = (async () => {
    if (!deps.provider) return { status: 'not_configured' as const };
    const pdf = await buildColoringBookPdf(input.pages);
    const message = coloringBookEmail({ newsletterRequested: input.newsletter });
    return deps.provider.send({
      to: input.email,
      subject: message.subject,
      html: message.html,
      text: message.text,
      attachment: { filename: PDF_FILENAME, content: pdf },
      idempotencyKey: input.requestId,
    });
  })().catch(() => ({ status: 'failed' as const, reason: 'exception' }));

  const [delivery, newsletter] = await Promise.all([deliveryTask, newsletterTask]);
  log('coloring_email_result', {
    delivery: delivery.status,
    reason: 'reason' in delivery ? delivery.reason : undefined,
    newsletter,
    pages: input.pages.length,
  });

  if (delivery.status === 'not_configured') return json(503, { ok: false, error: 'not_configured', newsletter }, origin);
  if (delivery.status === 'failed') return json(502, { ok: false, error: 'delivery_failed', newsletter }, origin);

  const body: ApiSuccess = { ok: true, delivery: delivery.status, newsletter };
  if (input.requestId && completed) {
    const t = now().getTime();
    for (const [k, v] of completed) if (t - v.at > IDEMPOTENCY_WINDOW_MS) completed.delete(k);
    completed.set(`${input.requestId}:${recipientKey}`, { at: t, body });
  }
  return json(200, body, origin);
}
