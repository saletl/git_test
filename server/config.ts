import { MockProvider, ResendProvider, type EmailProvider, type OutgoingEmail } from './emailProviders';
import { MailerLiteNewsletter, type NewsletterService } from './mailerlite';
import { MemoryRateLimiter } from './rateLimit';
import type { HandlerDeps } from './stickerBookEmail';

/**
 * Reads settings from environment variables (see .env.example). Secrets stay on the server.
 */
export type Env = Record<string, string | undefined>;

function log(event: string, data: Record<string, unknown>) {
  // Event names and status codes only. Never email addresses or IPs.
  console.info(JSON.stringify({ event, ...data }));
}

export function providerFromEnv(env: Env, onMockSend?: (email: OutgoingEmail) => void | Promise<void>): EmailProvider | null {
  const provider = (env.EMAIL_PROVIDER ?? '').trim().toLowerCase();
  if (provider === 'resend') {
    if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
      log('config_warning', { message: 'EMAIL_PROVIDER is resend but RESEND_API_KEY or EMAIL_FROM is missing' });
      return null;
    }
    return new ResendProvider({ apiKey: env.RESEND_API_KEY, from: env.EMAIL_FROM, replyTo: env.EMAIL_REPLY_TO || undefined });
  }
  if (provider === 'mock') return new MockProvider(onMockSend);
  return null;
}

export function newsletterFromEnv(env: Env): NewsletterService | null {
  if (!env.MAILERLITE_API_KEY || !env.MAILERLITE_STICKER_BOOK_GROUP_ID) return null;
  return new MailerLiteNewsletter({
    apiKey: env.MAILERLITE_API_KEY,
    groupId: env.MAILERLITE_STICKER_BOOK_GROUP_ID,
    doubleOptIn: (env.MAILERLITE_DOUBLE_OPT_IN ?? 'true').toLowerCase() !== 'false',
    log,
  });
}

let shared: { limiter: MemoryRateLimiter; completed: HandlerDeps['completed'] } | null = null;

export function depsFromEnv(env: Env, onMockSend?: (email: OutgoingEmail) => void | Promise<void>): HandlerDeps {
  shared ??= { limiter: new MemoryRateLimiter(), completed: new Map() };
  const allowedOrigins = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
  return {
    provider: providerFromEnv(env, onMockSend),
    newsletter: newsletterFromEnv(env),
    allowedOrigins,
    limiter: shared.limiter,
    completed: shared.completed,
    salt: env.RATE_LIMIT_SALT || 'curious-creature-clinic',
    log,
  };
}
