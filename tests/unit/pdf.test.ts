import { writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { buildStickerBookPdf } from '../../src/stickers/pdf';
import { layoutStickers } from '../../src/stickers/catalog';

describe('sticker book PDF', () => {
  it('builds a one-page US Letter PDF with the collected stickers', async () => {
    const layout = layoutStickers(['pip', 'waddles', 'prickle', 'mochi'], { pip: 2 });
    const bytes = await buildStickerBookPdf(layout);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
    const { width, height } = doc.getPage(0).getSize();
    expect(width).toBe(612);
    expect(height).toBe(792);
    expect(doc.getTitle()).toBe('My Curious Creature Clinic Sticker Book');
    if (process.env.PDF_OUT) writeFileSync(process.env.PDF_OUT, bytes);
  });

  it('works with a single sticker', async () => {
    const bytes = await buildStickerBookPdf(layoutStickers(['mochi'], {}));
    expect(bytes.length).toBeGreaterThan(1000);
  });
});
