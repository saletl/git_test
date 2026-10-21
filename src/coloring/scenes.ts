import type { CreatureArtist, CreatureProps } from '../art/creature';
import type { Expression } from '../art/face';
import { hamsterArt } from '../art/hamster';
import { mochiArt, sockShapes } from '../art/mochi';
import { pipArt } from '../art/pip';
import { prickleArt } from '../art/prickle';
import { bandageShapes } from '../art/creature';
import { circle, rrect, transformShapes, type Point, type Shape } from '../art/shapes';
import { waddlesArt } from '../art/waddles';
import { stethoscopeShapesLocal } from './localProps';
import { creatureLineArt, toLineArt } from './lineArt';
import {
  bubble,
  duck,
  examTable,
  heartShape,
  helper,
  jar,
  l,
  musicBox,
  note,
  o,
  pillow,
  puff,
  rumbleLines,
  scarfFlying,
  snowflake,
  starShape,
  stethoscope,
  thermometer,
  trumpet,
  windowFrame,
} from './props';
import { PAGES, type PageId } from './catalog';

/**
 * The coloring pages, drawn once as vector line art and used for the in-game preview, the print view and the PDF.
 * Each page is 540 x 720 units: exactly the printable area of a US Letter sheet with half-inch margins, in points.
 */

export const PAGE_W = 540;
export const PAGE_H = 720;

export interface PageText {
  text: string;
  /** Center x and baseline y, in page units (y grows downward). */
  x: number;
  y: number;
  size: number;
  /** Outlined letters are for coloring in; solid letters are small print. */
  style: 'outline' | 'solid';
}

export interface PageArt {
  shapes: Shape[];
  texts: PageText[];
}

const FRAME: Shape[] = [o(rrect(4, 4, PAGE_W - 8, 636, 18), 3)];
const FLOOR: Shape[] = [l('M4 600 H536', 2.4)];

/** Character line art placed on the page; extra shapes in the character's own space move with it. */
function character(artist: CreatureArtist, expression: Expression, props: CreatureProps, at: Point, scale: number, extras: Shape[] = []): Shape[] {
  const art = creatureLineArt(artist.draw(expression, undefined, props));
  return transformShapes([...art, ...extras], { scale, translate: at });
}

function footer(id: PageId): PageText[] {
  return [
    { text: PAGES[id].title, x: PAGE_W / 2, y: 682, size: 30, style: 'outline' },
    { text: `${PAGES[id].name} · The Curious Creature Clinic · The Burrow Parenting`, x: PAGE_W / 2, y: 712, size: 8, style: 'solid' },
  ];
}

const CHAR_AT: Point = [84, 166];
const CHAR_SCALE = 1.55;

function pipPage(): PageArt {
  const shapes: Shape[] = [
    ...FRAME,
    ...windowFrame(28, 36, 118),
    o(rrect(404, 40, 108, 132, 10), 3),
    o(circle(458, 74, 16), 2.4),
    heartShape(432, 128, 26),
    starShape(484, 128, 14),
    ...FLOOR,
    ...examTable(40, 520, 460),
    ...character(pipArt, 'happy', {}, CHAR_AT, CHAR_SCALE),
    // The hiccup bubbles, some with tiny surprises inside
    ...bubble(372, 330, 12),
    ...bubble(404, 286, 18),
    ...bubble(436, 222, 30),
    ...duck([436, 222], 0.55),
    ...bubble(388, 160, 18),
    starShape(388, 160, 9),
    ...bubble(470, 304, 20),
    heartShape(470, 305, 18),
    ...bubble(176, 158, 18),
    ...bubble(132, 212, 12),
    ...bubble(214, 112, 10),
    ...jar([110, 482], 0.9),
    ...stethoscope([430, 498], 0.75, -8),
    ...note(96, 300, 1.2),
    starShape(60, 392, 10),
    starShape(500, 430, 9),
  ];
  return { shapes, texts: footer('pip') };
}

function waddlesPage(): PageArt {
  const shapes: Shape[] = [
    ...FRAME,
    ...windowFrame(28, 36, 118),
    ...FLOOR,
    ...examTable(40, 520, 460),
    ...character(waddlesArt, 'surprised', { scarves: 5 }, [70, 166], CHAR_SCALE),
    ...scarfFlying([410, 120], 1.05, -14),
    ...puff([382, 306], 1),
    ...snowflake([350, 236], 1),
    ...snowflake([470, 220], 1.2),
    ...snowflake([180, 118], 1),
    ...snowflake([90, 260], 1.1),
    ...snowflake([492, 380], 0.9),
    ...thermometer([470, 300], 1, 24),
    // The receptionist hamster, very surprised by that sneeze
    ...character(hamsterArt, 'surprised', {}, [396, 400], 0.5),
  ];
  return { shapes, texts: footer('waddles') };
}

function pricklePage(): PageArt {
  // The bandage sits on Prickle's arm, in Prickle's own space, so it lines up exactly.
  const armBandage = toLineArt(bandageShapes('hearts', [146, 198], 55, 0.62), { minStroke: 2, detailStroke: 1.2 });
  const shapes: Shape[] = [
    ...FRAME,
    ...windowFrame(28, 36, 118),
    o(rrect(404, 40, 108, 132, 10), 3),
    heartShape(458, 98, 40),
    ...FLOOR,
    ...examTable(40, 520, 460),
    ...character(prickleArt, 'happy', { bunny: 'hug', curl: false }, [96, 160], CHAR_SCALE, armBandage),
    ...helper([62, 440], 1.15),
    ...pillow([460, 500], 0.9),
    ...musicBox([462, 300], 1),
    ...note(440, 240, 1.3),
    ...note(490, 210, 1.1),
    heartShape(200, 120, 24, -12),
    heartShape(360, 110, 18, 10),
    starShape(150, 210, 10),
  ];
  return { shapes, texts: footer('prickle') };
}

function mochiPage(): PageArt {
  const extras: Shape[] = [
    ...stethoscopeShapesLocal(),
    ...rumbleLines(120, 192, 70),
    // The sock flies off the top of Mochi's head
    ...toLineArt(transformShapes(sockShapes('head'), { origin: [120, 60], rotate: -16, translate: [4, -62] }), { minStroke: 2 }),
    l('M70 -6 C64 -14 62 -22 64 -30', 2),
    l('M86 -16 C82 -24 82 -30 84 -38', 2),
  ];
  const shapes: Shape[] = [
    ...FRAME,
    ...windowFrame(410, 36, 108),
    ...FLOOR,
    ...examTable(40, 520, 460),
    ...character(mochiArt, 'surprised', { sock: 'off', hat: 'none' }, [84, 172], CHAR_SCALE, extras),
    ...trumpet([70, 300], 0.9, -14),
    ...duck([476, 330], 0.9),
    ...note(60, 220, 1.2),
    ...note(470, 250, 1.1),
    starShape(50, 420, 10),
    starShape(500, 440, 10),
  ];
  return { shapes, texts: footer('mochi') };
}

export function coverArt(): PageArt {
  const SIZE = 0.68;
  const peek = (artist: CreatureArtist, props: CreatureProps, cx: number, top: number): Shape[] => character(artist, 'happy', props, [cx - 120 * SIZE, top], SIZE);
  const shapes: Shape[] = [
    o(rrect(4, 4, PAGE_W - 8, PAGE_H - 8, 22), 3.5),
    o(rrect(16, 16, PAGE_W - 32, PAGE_H - 32, 16), 1.6),
    starShape(64, 70, 20),
    starShape(476, 70, 20),
    heartShape(52, 330, 30, -10),
    heartShape(488, 330, 30, 10),
    starShape(270, 400, 14),
    ...bubble(60, 470, 14),
    ...bubble(486, 460, 18),
    ...bubble(470, 420, 9),
    // The clinic's four patients
    ...peek(pipArt, {}, 166, 226),
    ...peek(waddlesArt, { scarves: 3 }, 374, 226),
    ...peek(prickleArt, { bunny: 'hug' }, 166, 388),
    ...peek(mochiArt, { sock: 'head' }, 374, 388),
    l('M30 556 H510', 2.4),
    l('M196 620 H470', 1.6),
  ];
  return {
    shapes,
    texts: [
      { text: 'My Creature Clinic', x: PAGE_W / 2, y: 150, size: 46, style: 'outline' },
      { text: 'Coloring Book', x: PAGE_W / 2, y: 214, size: 50, style: 'outline' },
      { text: 'This book belongs to:', x: 112, y: 618, size: 13, style: 'solid' },
      { text: 'The Curious Creature Clinic', x: PAGE_W / 2, y: 664, size: 12, style: 'solid' },
      { text: 'Made with care by The Burrow Parenting', x: PAGE_W / 2, y: 684, size: 9, style: 'solid' },
    ],
  };
}

const BUILDERS: Record<PageId, () => PageArt> = { pip: pipPage, waddles: waddlesPage, prickle: pricklePage, mochi: mochiPage };

const cache = new Map<string, PageArt>();

export function pageArt(id: PageId | 'cover'): PageArt {
  let art = cache.get(id);
  if (!art) {
    art = id === 'cover' ? coverArt() : BUILDERS[id]();
    cache.set(id, art);
  }
  return art;
}
