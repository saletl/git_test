import type { Config, Context } from '@netlify/functions';
import { depsFromEnv } from '../../server/config';
import { handleStickerBookEmail } from '../../server/stickerBookEmail';

/** Netlify Function: emails the printable sticker book and handles optional newsletter sign-up. */
export default async (request: Request, context: Context) => handleStickerBookEmail(request, depsFromEnv(process.env), context.ip ?? null);

export const config: Config = {
  path: '/api/sticker-book/email',
  method: ['POST', 'OPTIONS'],
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
};
