import { BOOK_SLOT_COUNT, STICKER_IDS, isSlotIndex, isStickerId, type PlacedSticker } from '../src/stickers/catalog';

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

export interface StickerBookRequest {
  email: string;
  stickers: PlacedSticker[];
  newsletter: boolean;
  requestId: string | null;
  /** Hidden field that only bots fill in. */
  trap: string;
}

export type ValidationResult = { ok: true; value: StickerBookRequest } | { ok: false; error: 'invalid_email' | 'bad_request' };

/** Validates the JSON body. Only known keys and known sticker ids are accepted. */
export function validateRequestBody(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, error: 'bad_request' };
  const body = raw as Record<string, unknown>;
  const allowed = new Set(['email', 'stickers', 'newsletter', 'requestId', 'website']);
  if (Object.keys(body).some((k) => !allowed.has(k))) return { ok: false, error: 'bad_request' };

  if (!isValidEmail(body.email)) return { ok: false, error: 'invalid_email' };

  if (!Array.isArray(body.stickers) || body.stickers.length < 1 || body.stickers.length > STICKER_IDS.length) {
    return { ok: false, error: 'bad_request' };
  }
  const seenIds = new Set<string>();
  const seenSlots = new Set<number>();
  const stickers: PlacedSticker[] = [];
  for (const item of body.stickers) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return { ok: false, error: 'bad_request' };
    const { id, slot, ...rest } = item as Record<string, unknown>;
    if (Object.keys(rest).length) return { ok: false, error: 'bad_request' };
    if (!isStickerId(id) || !isSlotIndex(slot) || seenIds.has(id) || seenSlots.has(slot)) return { ok: false, error: 'bad_request' };
    seenIds.add(id);
    seenSlots.add(slot);
    stickers.push({ id, slot });
  }
  if (seenSlots.size > BOOK_SLOT_COUNT) return { ok: false, error: 'bad_request' };

  if (body.newsletter !== undefined && typeof body.newsletter !== 'boolean') return { ok: false, error: 'bad_request' };
  if (body.requestId !== undefined && (typeof body.requestId !== 'string' || !REQUEST_ID.test(body.requestId))) {
    return { ok: false, error: 'bad_request' };
  }
  if (body.website !== undefined && typeof body.website !== 'string') return { ok: false, error: 'bad_request' };

  return {
    ok: true,
    value: {
      email: normalizeEmail(body.email),
      stickers,
      newsletter: body.newsletter === true,
      requestId: typeof body.requestId === 'string' ? body.requestId : null,
      trap: typeof body.website === 'string' ? body.website : '',
    },
  };
}
