import { PAGE_IDS, isPageId, sortPages, type PageId } from '../src/coloring/catalog';

export const MAX_BODY_BYTES = 4096;

/**
 * A deliberately strict check. It rejects anything that could be used for header injection
 * (line breaks, commas, angle brackets, quotes) and keeps to plain ASCII addresses.
 */
const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

export function normalizeEmail(value: string): string {
  return value.trim();
}

export function isValidEmail(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const email = value.trim();
  if (email.length < 6 || email.length > 254) return false;
  if (/[\r\n\t\s,;<>"()[\]\\]/.test(email)) return false;
  if (!EMAIL_PATTERN.test(email)) return false;
  const [local, domain] = email.split('@') as [string, string];
  if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  const tld = domain.split('.').pop() ?? '';
  if (!/^[A-Za-z]{2,63}$/.test(tld) && !/^xn--[A-Za-z0-9-]{2,59}$/.test(tld)) return false;
  return true;
}

const REQUEST_ID = /^[A-Za-z0-9-]{8,64}$/;

export interface ColoringBookRequest {
  email: string;
  pages: PageId[];
  newsletter: boolean;
  requestId: string | null;
  /** Hidden field that only bots fill in. */
  trap: string;
}

export type ValidationResult = { ok: true; value: ColoringBookRequest } | { ok: false; error: 'invalid_email' | 'bad_request' };

/** Validates the JSON body. Only known keys and known page ids are accepted. */
export function validateRequestBody(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, error: 'bad_request' };
  const body = raw as Record<string, unknown>;
  const allowed = new Set(['email', 'pages', 'newsletter', 'requestId', 'website']);
  if (Object.keys(body).some((k) => !allowed.has(k))) return { ok: false, error: 'bad_request' };

  if (!isValidEmail(body.email)) return { ok: false, error: 'invalid_email' };

  if (!Array.isArray(body.pages) || body.pages.length < 1 || body.pages.length > PAGE_IDS.length) {
    return { ok: false, error: 'bad_request' };
  }
  if (!body.pages.every(isPageId) || new Set(body.pages).size !== body.pages.length) return { ok: false, error: 'bad_request' };
  const pages = sortPages(body.pages);

  if (body.newsletter !== undefined && typeof body.newsletter !== 'boolean') return { ok: false, error: 'bad_request' };
  if (body.requestId !== undefined && (typeof body.requestId !== 'string' || !REQUEST_ID.test(body.requestId))) {
    return { ok: false, error: 'bad_request' };
  }
  if (body.website !== undefined && typeof body.website !== 'string') return { ok: false, error: 'bad_request' };

  return {
    ok: true,
    value: {
      email: normalizeEmail(body.email),
      pages,
      newsletter: body.newsletter === true,
      requestId: typeof body.requestId === 'string' ? body.requestId : null,
      trap: typeof body.website === 'string' ? body.website : '',
    },
  };
}
