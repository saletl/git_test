import { LineCapStyle, PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib';
import { C } from '../art/palette';
import { circle, heart, star, type Shape } from '../art/shapes';
import { stickerShapes } from './art';
import { BOOK_SLOTS, PAGE_HEIGHT, PAGE_WIDTH, STICKERS, STICKER_SIZE, type PlacedSticker } from './catalog';
import { PAGE_TITLE, PAGE_TITLE_Y, pageDecorShapes } from './decor';

/**
 * Builds the printable keepsake: a US Letter, portrait PDF of the scrapbook page.
 * Runs in the browser (download) and on the server (email) from the same trusted template.
 * Input is only sticker ids and spots; nothing about the child goes into the file.
 */

export const PDF_FILENAME = 'curious-creature-clinic-sticker-book.pdf';
export const PDF_TITLE = 'My Curious Creature Clinic Sticker Book';

const LETTER: [number, number] = [612, 792];

function hex(color: string): RGB {
  const h = color.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function drawShapes(page: PDFPage, shapes: readonly Shape[], x: number, y: number, scale: number, rotate = 0) {
  for (const s of shapes) {
    page.drawSvgPath(s.d, {
      x,
      y,
      scale,
      rotate: rotate ? degrees(-rotate) : undefined,
      color: s.fill ? hex(s.fill) : undefined,
      borderColor: s.stroke ? hex(s.stroke) : undefined,
      borderWidth: s.stroke ? (s.sw ?? 1) * scale : 0,
      borderLineCap: LineCapStyle.Round,
      opacity: s.op,
      borderOpacity: s.op,
    });
  }
}

function centered(page: PDFPage, text: string, y: number, size: number, font: PDFFont, color: RGB) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (LETTER[0] - width) / 2, y, size, font, color });
}

export async function buildStickerBookPdf(stickers: readonly PlacedSticker[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(PDF_TITLE);
  doc.setAuthor('The Burrow Parenting');
  doc.setSubject('A keepsake from The Curious Creature Clinic');
  doc.setCreator('The Curious Creature Clinic');
  doc.setProducer('The Curious Creature Clinic');
  doc.setCreationDate(new Date());

  const page = doc.addPage(LETTER);
  const [W, H] = LETTER;
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);

  // Background and border
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: hex(C.cream) });
  drawShapes(page, [{ d: 'M30 24 H582 V768 H30 Z', stroke: C.sage, sw: 4 }], 0, H, 1);
  drawShapes(page, [{ d: 'M40 34 H572 V758 H40 Z', stroke: C.sageLight, sw: 1.5 }], 0, H, 1);
  const corners: Shape[] = [
    { d: star(56, 52, 12, 6), fill: C.gold },
    { d: star(556, 52, 12, 6), fill: C.gold },
    { d: heart(56, 740, 18), fill: C.berry },
    { d: heart(556, 740, 18), fill: C.coral },
    { d: circle(92, 60, 4), fill: C.blue },
    { d: circle(520, 60, 4), fill: C.mint },
  ];
  drawShapes(page, corners, 0, H, 1);

  // Title
  centered(page, 'My Curious Creature Clinic', H - 94, 30, bold, hex(C.forestDeep));
  centered(page, 'Sticker Book', H - 128, 26, bold, hex(C.coralDeep));
  const label = 'This sticker book belongs to:';
  const labelSize = 12;
  const labelWidth = regular.widthOfTextAtSize(label, labelSize);
  const lineWidth = 180;
  const startX = (W - (labelWidth + 8 + lineWidth)) / 2;
  page.drawText(label, { x: startX, y: H - 160, size: labelSize, font: regular, color: hex(C.inkSoft) });
  page.drawLine({
    start: { x: startX + labelWidth + 8, y: H - 162 },
    end: { x: startX + labelWidth + 8 + lineWidth, y: H - 162 },
    thickness: 1,
    color: hex(C.inkSoft),
  });

  // The scrapbook page
  const scale = 1.4;
  const pageW = PAGE_WIDTH * scale;
  const left = (W - pageW) / 2;
  const top = H - 182;
  drawShapes(page, [{ d: `M6 6 H${PAGE_WIDTH + 6} V${PAGE_HEIGHT + 6} H6 Z`, fill: C.shadow, op: 0.08 }], left, top, scale);
  drawShapes(page, pageDecorShapes(), left, top, scale);
  const titleSize = 16 * scale;
  const titleWidth = bold.widthOfTextAtSize(PAGE_TITLE, titleSize);
  page.drawText(PAGE_TITLE, {
    x: left + (PAGE_WIDTH * scale - titleWidth) / 2,
    y: top - PAGE_TITLE_Y * scale - titleSize * 0.35,
    size: titleSize,
    font: bold,
    color: hex(C.forestDeep),
  });

  for (const { id, slot } of stickers) {
    const s = BOOK_SLOTS[slot];
    if (!s) continue;
    const cx = left + s.x * scale;
    const cy = top - s.y * scale;
    drawShapes(page, stickerShapes(id), cx, cy, (STICKER_SIZE * scale) / 200, s.rotate);
  }

  // Who's inside, and the credit
  const names = stickers.map((s) => STICKERS[s.id].name);
  const collected = names.length === 1 ? `Sticker collected: ${names[0]}` : `Stickers collected: ${names.join(', ')}`;
  centered(page, collected, 66, 11, regular, hex(C.inkSoft));
  centered(page, 'Created with care by The Burrow Parenting  ·  theburrowparenting.com', 46, 9, regular, hex(C.inkSoft));

  return doc.save();
}
