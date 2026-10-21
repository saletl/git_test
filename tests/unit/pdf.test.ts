import { writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { PAGE_IDS } from '../../src/coloring/catalog';
import { INK, PAPER, toLineArt } from '../../src/coloring/lineArt';
import { buildColoringBookPdf, PDF_TITLE } from '../../src/coloring/pdf';
import { PAGE_H, PAGE_W, pageArt } from '../../src/coloring/scenes';
import { pipArt } from '../../src/art/pip';
import { flatten } from '../../src/art/creature';

describe('coloring book PDF', () => {
  it('builds a US Letter book: a cover plus one page for each page earned', async () => {
    const bytes = await buildColoringBookPdf(['mochi', 'pip', 'waddles', 'prickle']);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(5);
    for (const page of doc.getPages()) expect(page.getSize()).toEqual({ width: 612, height: 792 });
    expect(doc.getTitle()).toBe(PDF_TITLE);
    if (process.env.PDF_OUT) writeFileSync(process.env.PDF_OUT, bytes);
  });

  it('includes only earned pages, never placeholders for missing ones', async () => {
    const doc = await PDFDocument.load(await buildColoringBookPdf(['waddles']));
    expect(doc.getPageCount()).toBe(2);
    expect(doc.getSubject()).toContain('Waddles');
    expect(doc.getSubject()).not.toContain('Pip');
  });
});

describe('coloring pages', () => {
  const allPoints = (d: string) => (d.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);

  it('has exactly four collectible pages', () => {
    expect(PAGE_IDS).toEqual(['pip', 'waddles', 'prickle', 'mochi']);
  });

  it.each([...PAGE_IDS, 'cover' as const])('%s is true line art: only black ink on white, inside print-safe bounds', (id) => {
    const art = pageArt(id);
    expect(art.shapes.length).toBeGreaterThan(60);
    for (const s of art.shapes) {
      if (s.fill) expect([INK, PAPER]).toContain(s.fill);
      if (s.stroke) expect([INK, PAPER]).toContain(s.stroke);
      expect(s.op).toBeUndefined();
      const nums = allPoints(s.d);
      for (let i = 0; i + 1 < nums.length; i += 2) {
        expect(nums[i]!).toBeGreaterThanOrEqual(-1);
        expect(nums[i]!).toBeLessThanOrEqual(PAGE_W + 1);
        expect(nums[i + 1]!).toBeGreaterThanOrEqual(-1);
        expect(nums[i + 1]!).toBeLessThanOrEqual(PAGE_H + 1);
      }
    }
  });

  it('turns colored character art into outlines rather than grays', () => {
    const color = flatten(pipArt.draw('happy', undefined, {}));
    const line = toLineArt(color);
    expect(color.some((s) => s.fill && s.fill !== INK && s.fill !== PAPER)).toBe(true);
    expect(line.every((s) => !s.fill || s.fill === INK || s.fill === PAPER)).toBe(true);
    // Soft extras like the floor shadow and shine are dropped.
    expect(line.length).toBeLessThan(color.length);
  });
});
