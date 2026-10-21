import { mkdir, writeFile } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import type { Connect } from 'vite';
import { depsFromEnv, type Env } from './config';
import type { OutgoingEmail } from './emailProviders';
import { handleStickerBookEmail } from './stickerBookEmail';

/**
 * Local development only: serves the same API handler from the Vite dev and preview servers.
 * With EMAIL_PROVIDER=mock (the default here), nothing is emailed; the PDF and email are saved to .dev-outbox/.
 */
export function devApiMiddleware(env: Env, root: string): Connect.NextHandleFunction {
  const merged: Env = { EMAIL_PROVIDER: 'mock', ...env };
  const outbox = path.join(root, '.dev-outbox');
  const saveMock = async (email: OutgoingEmail) => {
    await mkdir(outbox, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    await writeFile(path.join(outbox, `${stamp}-sticker-book.pdf`), email.attachment.content);
    await writeFile(path.join(outbox, `${stamp}-email.html`), email.html);
  };

  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url || !req.url.startsWith('/api/sticker-book/email')) return next();
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
      size += (chunk as Buffer).length;
      if (size > 16384) break;
      chunks.push(chunk as Buffer);
    }
    const host = req.headers.host ?? 'localhost';
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') headers.set(key, value);
    }
    const request = new Request(`http://${host}${req.url}`, {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
    });
    const response = await handleStickerBookEmail(request, depsFromEnv(merged, saveMock), req.socket.remoteAddress ?? null);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(Buffer.from(await response.arrayBuffer()));
  };
}
