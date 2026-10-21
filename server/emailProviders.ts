/**
 * Transactional email providers. The sticker book is sent as a PDF attachment, so nothing has to be
 * stored on a server and there is no download link to expire.
 *
 * - "resend": sends real email through Resend (https://resend.com), which supports attachments.
 * - "mock": for local development and tests only. It never sends anything, and the game says so on screen.
 */

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachment: { filename: string; content: Uint8Array };
  idempotencyKey: string | null;
}

export type DeliveryResult = { status: 'sent' } | { status: 'mock' } | { status: 'failed'; reason: string };

export interface EmailProvider {
  readonly name: string;
  send(email: OutgoingEmail): Promise<DeliveryResult>;
}

export function toBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export class ResendProvider implements EmailProvider {
  readonly name = 'resend';

  constructor(
    private readonly options: { apiKey: string; from: string; replyTo?: string; fetchImpl?: typeof fetch; timeoutMs?: number },
  ) {}

  async send(email: OutgoingEmail): Promise<DeliveryResult> {
    const fetchImpl = this.options.fetchImpl ?? fetch;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.options.apiKey}`,
      'Content-Type': 'application/json',
    };
    if (email.idempotencyKey) headers['Idempotency-Key'] = `sticker-book-${email.idempotencyKey}`;
    const body = {
      from: this.options.from,
      to: [email.to],
      subject: email.subject,
      html: email.html,
      text: email.text,
      attachments: [{ filename: email.attachment.filename, content: toBase64(email.attachment.content) }],
      ...(this.options.replyTo ? { reply_to: this.options.replyTo } : {}),
    };
    try {
      const response = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.options.timeoutMs ?? 12000),
      });
      if (response.ok) return { status: 'sent' };
      return { status: 'failed', reason: `resend_http_${response.status}` };
    } catch (error) {
      return { status: 'failed', reason: error instanceof Error && error.name === 'TimeoutError' ? 'resend_timeout' : 'resend_network' };
    }
  }
}

/** Development stand-in. Hands the message to an optional callback (the dev server saves it to a folder). */
export class MockProvider implements EmailProvider {
  readonly name = 'mock';
  readonly sent: OutgoingEmail[] = [];

  constructor(private readonly onSend?: (email: OutgoingEmail) => void | Promise<void>, private readonly fail = false) {}

  async send(email: OutgoingEmail): Promise<DeliveryResult> {
    if (this.fail) return { status: 'failed', reason: 'mock_failure' };
    this.sent.push(email);
    await this.onSend?.(email);
    return { status: 'mock' };
  }
}
