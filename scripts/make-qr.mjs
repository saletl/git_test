#!/usr/bin/env node
/**
 * Makes a QR code and a printable waiting-room poster that point to your live game.
 *
 *   npm run qr -- https://your-game.netlify.app
 *   npm run qr -- "https://your-game.netlify.app/?office=example-pediatrics"
 *
 * Files are written to qr-output/: qr.svg, qr.png (high resolution) and poster.pdf (US Letter).
 * The address must be a real public https address. Local or placeholder addresses are refused,
 * unless you add --test, which stamps "TEST ONLY" on the poster.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const args = process.argv.slice(2);
const test = args.includes('--test');
const raw = args.find((a) => !a.startsWith('--'));

function fail(message) {
  console.error(`\n${message}\n\nUsage: npm run qr -- https://your-game.netlify.app [--test]\n`);
  process.exit(1);
}

if (!raw) fail('Please give the address of your live game.');
let url;
try {
  url = new URL(raw);
} catch {
  fail(`"${raw}" isn't a web address.`);
}

const host = url.hostname.toLowerCase();
const placeholder =
  host === 'localhost' ||
  host.endsWith('.local') ||
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(host) ||
  host === '::1' ||
  /(^|\.)example\.(com|org|net)$/.test(host) ||
  /your-(site|game|domain)/.test(host) ||
  !host.includes('.');
if (!test) {
  if (url.protocol !== 'https:') fail('The address must start with https:// so families get a secure connection.');
  if (placeholder) fail(`"${host}" looks like a local or placeholder address. Use the real address of your published game.`);
}

const office = url.searchParams.get('office');
if (office && !/^[a-z0-9-]{1,40}$/.test(office)) fail('The office code may only use lowercase letters, numbers and dashes.');

const outDir = path.resolve('qr-output');
mkdirSync(outDir, { recursive: true });
const target = url.toString();
const qrOptions = { errorCorrectionLevel: 'H', margin: 4, color: { dark: '#36513fff', light: '#ffffffff' } };

writeFileSync(path.join(outDir, 'qr.svg'), await QRCode.toString(target, { ...qrOptions, type: 'svg' }));
await QRCode.toFile(path.join(outDir, 'qr.png'), target, { ...qrOptions, width: 1600 });

// Poster
const qr = QRCode.create(target, { errorCorrectionLevel: 'H' });
const size = qr.modules.size;
const doc = await PDFDocument.create();
doc.setTitle('The Curious Creature Clinic poster');
const page = doc.addPage([612, 792]);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);
const regular = await doc.embedFont(StandardFonts.Helvetica);
const forest = rgb(0.212, 0.318, 0.247);
const coral = rgb(0.831, 0.412, 0.31);
const ink = rgb(0.42, 0.373, 0.341);
const cream = rgb(0.984, 0.957, 0.902);
const center = (text, y, fontSize, font, color) => {
  const w = font.widthOfTextAtSize(text, fontSize);
  page.drawText(text, { x: (612 - w) / 2, y, size: fontSize, font, color });
};

page.drawRectangle({ x: 0, y: 0, width: 612, height: 792, color: cream });
page.drawRectangle({ x: 28, y: 28, width: 556, height: 736, borderColor: rgb(0.663, 0.765, 0.627), borderWidth: 5 });
const heart = 'M0 14 C-16 4 -20 -4 -16 -10 C-12 -16 -4 -16 0 -9 C4 -16 12 -16 16 -10 C20 -4 16 4 0 14 Z';
const starPath = 'M0 -14 L4 -5 L14 -4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14 -4 L-4 -5 Z';
page.drawSvgPath(heart, { x: 62, y: 742, scale: 1.2, color: rgb(0.898, 0.478, 0.627) });
page.drawSvgPath(heart, { x: 550, y: 742, scale: 1.2, color: rgb(0.933, 0.545, 0.435) });
page.drawSvgPath(starPath, { x: 80, y: 80, scale: 1.4, color: rgb(0.914, 0.745, 0.361) });
page.drawSvgPath(starPath, { x: 532, y: 80, scale: 1.4, color: rgb(0.914, 0.745, 0.361) });

center('The Curious Creature Clinic', 688, 31, bold, forest);
center('Little patients. Big imaginations.', 656, 18, regular, coral);
center('Scan to play while you wait!', 614, 24, bold, forest);

const qrSide = 330;
const cell = qrSide / size;
const qx = (612 - qrSide) / 2;
const qy = 250;
page.drawRectangle({ x: qx - 18, y: qy - 18, width: qrSide + 36, height: qrSide + 36, color: rgb(1, 1, 1), borderColor: rgb(0.812, 0.878, 0.776), borderWidth: 3 });
for (let r = 0; r < size; r++) {
  for (let c = 0; c < size; c++) {
    if (qr.modules.get(r, c)) {
      page.drawRectangle({ x: qx + c * cell, y: qy + (size - 1 - r) * cell, width: cell + 0.2, height: cell + 0.2, color: forest });
    }
  }
}

center('A gentle pretend doctor game for little ones.', 200, 15, regular, ink);
center('Free. No app, no account, no ads.', 178, 15, regular, ink);
center('Grown-ups: look for the "Grown-ups" button for tips, the sticker book and privacy details.', 146, 11, regular, ink);
center('Created with care by The Burrow Parenting', 64, 12, bold, forest);
center(url.host + (office ? `  ·  office: ${office}` : ''), 46, 9, regular, ink);
if (test) {
  const mark = 'TEST ONLY - NOT FOR PRINTING';
  const w = bold.widthOfTextAtSize(mark, 26);
  page.drawText(mark, { x: (612 - w) / 2, y: 405, size: 26, font: bold, color: rgb(0.83, 0.2, 0.2), opacity: 0.7 });
}
writeFileSync(path.join(outDir, 'poster.pdf'), await doc.save());

console.log(`\nQR code points to: ${target}${test ? '   (TEST ONLY)' : ''}`);
console.log(`Saved: ${path.relative(process.cwd(), path.join(outDir, 'qr.svg'))}, qr.png, poster.pdf in ${path.relative(process.cwd(), outDir)}/`);
console.log('Scan the code with a phone to check it opens the game before printing.\n');
