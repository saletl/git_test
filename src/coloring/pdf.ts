import {
  LineCapStyle,
  PDFDocument,
  StandardFonts,
  TextRenderingMode,
  rgb,
  setLineWidth,
  setStrokingRgbColor,
  setTextRenderingMode,
  type PDFFont,
  type PDFPage,
  type RGB,
} from 'pdf-lib';
import type { Shape } from '../art/shapes';
import { PAGE_IDS, PAGES, type PageId } from './catalog';
import { PAGE_W, pageArt, type PageArt } from './scenes';

/**
 * Builds the printable coloring book: a US Letter PDF with a cover and one page for each page earned.
 * Runs in the browser; the input is only which pages were earned, so nothing about the child goes into the file.
 */

export const PDF_FILENAME = 'my-creature-clinic-coloring-book.pdf';
export const PDF_TITLE = 'My Creature Clinic Coloring Book';

/** US Letter in points, with half-inch margins all around. */
export const LETTER: [number, number] = [612, 792];
export const MARGIN = 36;

function hex(color: string): RGB {
  const h = color.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function drawShapes(page: PDFPage, shapes: readonly Shape[], x: number, y: number, scale: number) {
  for (const s of shapes) {
    page.drawSvgPath(s.d, {
      x,
      y,
      scale,
      color: s.fill ? hex(s.fill) : undefined,
      borderColor: s.stroke ? hex(s.stroke) : undefined,
      borderWidth: s.stroke ? (s.sw ?? 1) * scale : 0,
      borderLineCap: LineCapStyle.Round,
    });
  }
}

function drawArt(page: PDFPage, art: PageArt, bold: PDFFont, regular: PDFFont) {
  // Page art is 540 x 720 with y growing downward; it fills the area inside the margins exactly.
  const left = MARGIN;
  const top = LETTER[1] - MARGIN;
  const scale = (LETTER[0] - MARGIN * 2) / PAGE_W;
  drawShapes(page, art.shapes, left, top, scale);
  for (const t of art.texts) {
    const font = t.style === 'outline' ? bold : regular;
    const size = t.size * scale;
    const width = font.widthOfTextAtSize(t.text, size);
    const x = left + t.x * scale - width / 2;
    const y = top - t.y * scale;
    if (t.style === 'outline') {
      // Hollow letters, so the title can be colored in too.
      page.pushOperators(setTextRenderingMode(TextRenderingMode.Outline), setLineWidth(1.3), setStrokingRgbColor(0.11, 0.11, 0.11));
      page.drawText(t.text, { x, y, size, font, color: rgb(0.11, 0.11, 0.11) });
      page.pushOperators(setTextRenderingMode(TextRenderingMode.Fill));
    } else {
      page.drawText(t.text, { x, y, size, font, color: rgb(0.2, 0.2, 0.2) });
    }
  }
}

/** Only real, earned pages, in book order. */
export function bookPages(pages: readonly PageId[]): PageId[] {
  return PAGE_IDS.filter((id) => pages.includes(id));
}

export async function buildColoringBookPdf(pages: readonly PageId[]): Promise<Uint8Array> {
  const earned = bookPages(pages);
  const doc = await PDFDocument.create();
  doc.setTitle(PDF_TITLE);
  doc.setAuthor('The Burrow Parenting');
  doc.setSubject(`Coloring pages: ${earned.map((id) => PAGES[id].name).join(', ') || 'cover only'}`);
  doc.setCreator('The Curious Creature Clinic');
  doc.setProducer('The Curious Creature Clinic');
  doc.setCreationDate(new Date());
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);

  for (const id of ['cover' as const, ...earned]) {
    const page = doc.addPage(LETTER);
    drawArt(page, pageArt(id), bold, regular);
  }
  return doc.save();
}

