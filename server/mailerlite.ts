/**
 * Optional newsletter sign-up through the MailerLite API (https://developers.mailerlite.com/).
 * Called only when a grown-up ticked the newsletter box themselves.
 *
 * Rules this follows:
 * - Server-side only; the API key never reaches the browser.
 * - Anyone who previously unsubscribed, bounced, or was marked as junk is left exactly as they are.
 *   We never send `resubscribe`.
 * - New sign-ups are created as "unconfirmed" when double opt-in is on (the default), so MailerLite's
 *   confirmation email decides whether they become active. Turn on "Double opt-in for API and integrations"
 *   in MailerLite for that email to be sent.
 * - Existing active or unconfirmed subscribers are only added to the sticker-book group; their status is untouched.
 * - Only the email address, the group and the opt-in time are sent. Nothing about the child or the game.
 */

export type NewsletterOutcome = 'received' | 'unavailable';

export interface NewsletterService {
  subscribe(email: string, optedInAt: Date): Promise<NewsletterOutcome>;
}

const API = 'https://connect.mailerlite.com/api';
const DO_NOT_TOUCH = new Set(['unsubscribed', 'bounced', 'junk']);

function mailerLiteTimestamp(date: Date): string {
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

export class MailerLiteNewsletter implements NewsletterService {
  constructor(
    private readonly options: {
      apiKey: string;
      groupId: string;
      doubleOptIn: boolean;
      fetchImpl?: typeof fetch;
      timeoutMs?: number;
      log?: (event: string, data: Record<string, unknown>) => void;
    },
  ) {}

  private request(path: string, init: RequestInit): Promise<Response> {
    const fetchImpl = this.options.fetchImpl ?? fetch;
    return fetchImpl(`${API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(this.options.timeoutMs ?? 8000),
    });
  }

  async subscribe(email: string, optedInAt: Date): Promise<NewsletterOutcome> {
    const log = this.options.log ?? (() => undefined);
    try {
      const lookup = await this.request(`/subscribers/${encodeURIComponent(email)}`, { method: 'GET' });
      let existingStatus: string | null = null;
      if (lookup.ok) {
        const data = (await lookup.json()) as { data?: { status?: unknown } };
        existingStatus = typeof data.data?.status === 'string' ? data.data.status : 'unknown';
      } else if (lookup.status !== 404) {
        log('newsletter_lookup_failed', { status: lookup.status });
        return 'unavailable';
      }

      if (existingStatus && DO_NOT_TOUCH.has(existingStatus)) {
        // Honor their earlier choice. We tell the parent the same thing either way.
        log('newsletter_skipped', { reason: 'existing_status' });
        return 'received';
      }

      const body: Record<string, unknown> = {
        email,
        groups: [this.options.groupId],
      };
      if (!existingStatus) {
        body.opted_in_at = mailerLiteTimestamp(optedInAt);
        if (this.options.doubleOptIn) body.status = 'unconfirmed';
      }
      const upsert = await this.request('/subscribers', { method: 'POST', body: JSON.stringify(body) });
      if (upsert.ok) {
        log('newsletter_ok', { created: upsert.status === 201 });
        return 'received';
      }
      log('newsletter_upsert_failed', { status: upsert.status });
      return 'unavailable';
    } catch (error) {
      log('newsletter_error', { kind: error instanceof Error ? error.name : 'unknown' });
      return 'unavailable';
    }
  }
}
