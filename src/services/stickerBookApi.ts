import type { PlacedSticker } from '../stickers/catalog';

/** Talks to the server endpoint that emails the sticker book. Only sticker ids and spots are sent, plus the address. */

export type SendResult =
  | { kind: 'sent'; newsletter: NewsletterStatus }
  | { kind: 'mock'; newsletter: NewsletterStatus }
  | { kind: 'error'; message: string; retry: boolean; newsletter: NewsletterStatus };

export type NewsletterStatus = 'not_requested' | 'received' | 'unavailable';

export const API_PATH = '/api/sticker-book/email';

/** Friendly client-side check. The server does the strict one. */
export function isLikelyEmail(value: string): boolean {
  const email = value.trim();
  return email.length >= 6 && email.length <= 254 && /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[A-Za-z]{2,}$/.test(email);
}

const MESSAGES: Record<string, string> = {
  invalid_email: 'That email address doesn’t look quite right. Please check it and try again.',
  rate_limited: 'That’s a lot of emails in a short time. Please wait a few minutes and try again, or download the sticker book.',
  not_configured: 'Email delivery isn’t set up for this site yet. You can download or print the sticker book instead.',
  delivery_failed: 'Our email service didn’t accept the message just now. Please try again in a moment.',
  offline: 'We couldn’t reach the internet. Check your connection and try again, or download the sticker book instead.',
  timeout: 'This is taking longer than expected. Please try again.',
  default: 'Something went wrong on our side. Please try again, or download the sticker book instead.',
};

function newsletterOf(value: unknown): NewsletterStatus {
  return value === 'received' || value === 'unavailable' ? value : 'not_requested';
}

export async function sendStickerBook(
  input: { email: string; stickers: PlacedSticker[]; newsletter: boolean; requestId: string; website: string },
  fetchImpl: typeof fetch = fetch,
): Promise<SendResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetchImpl(API_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email,
        stickers: input.stickers.map(({ id, slot }) => ({ id, slot })),
        newsletter: input.newsletter,
        requestId: input.requestId,
        website: input.website,
      }),
      signal: controller.signal,
      credentials: 'omit',
    });
    let body: Record<string, unknown> = {};
    try {
      body = (await response.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }
    const newsletter = newsletterOf(body.newsletter);
    if (response.ok && body.ok === true) {
      return { kind: body.delivery === 'mock' ? 'mock' : 'sent', newsletter };
    }
    const code = typeof body.error === 'string' ? body.error : 'default';
    return { kind: 'error', message: MESSAGES[code] ?? MESSAGES.default!, retry: code !== 'invalid_email', newsletter };
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === 'AbortError';
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    return {
      kind: 'error',
      message: aborted ? MESSAGES.timeout! : offline ? MESSAGES.offline! : MESSAGES.default!,
      retry: true,
      newsletter: 'not_requested',
    };
  } finally {
    clearTimeout(timer);
  }
}
