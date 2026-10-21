import { C } from '../art/palette';
import { circle, ellipse, fill, heart, line, rrect, smooth, star, type Shape } from '../art/shapes';
import { PAGE_HEIGHT, PAGE_WIDTH } from './catalog';

/** Scrapbook page decorations, shared by the on-screen book and the printable PDF. Page units: 300 x 380. */

function washi(x: number, y: number, deg: number, color: string, stripe: string): Shape[] {
  return [
    fill(rrect(x, y, 70, 20, 3, deg), color, undefined, 0, 0.85),
    ...[10, 26, 42, 58].map((dx) => fill(rrect(x + dx, y, 6, 20, 1, deg), stripe, undefined, 0, 0.6)),
  ];
}

export function pageDecorShapes(): Shape[] {
  const W = PAGE_WIDTH;
  const H = PAGE_HEIGHT;
  return [
    fill(rrect(0, 0, W, H, 18), C.paper, C.creamDeep, 3),
    { d: rrect(10, 10, W - 20, H - 20, 12), stroke: C.sageLight, sw: 2 },
    fill(
      smooth(
        [
          [0, H - 40],
          [60, H - 62],
          [140, H - 50],
          [220, H - 70],
          [300, H - 48],
          [300, H - 18],
          [282, H],
          [18, H],
          [0, H - 18],
        ],
        true,
        0.7,
      ),
      C.sagePale,
    ),
    ...[[30, H - 34], [96, H - 44], [176, H - 40], [252, H - 46]].flatMap(([x, y]) => [
      line(`M${x} ${y! + 10}L${x} ${y! + 2}`, C.sage, 2),
      fill(circle(x!, y!, 4), C.berryLight),
      fill(circle(x!, y!, 1.6), C.gold),
    ]),
    ...washi(-12, 12, -32, C.coral, C.peachLight),
    ...washi(W - 58, 12, 32, C.blue, C.bluePale),
    fill(
      smooth(
        [
          [86, 18],
          [150, 12],
          [214, 18],
          [208, 32],
          [214, 46],
          [150, 40],
          [86, 46],
          [92, 32],
        ],
        true,
        0.4,
      ),
      C.sageLight,
      C.sage,
      2,
    ),
    fill(star(30, 156, 7, 3.4), C.goldLight),
    fill(star(272, 166, 6, 3), C.goldLight),
    fill(star(150, 262, 5, 2.5), C.goldLight),
    fill(heart(272, 236, 12, 10), C.berryLight),
    fill(heart(24, 236, 10, -10), C.peach),
    fill(circle(150, 128, 3), C.lilacLight),
    fill(circle(40, 60, 3), C.blueLight),
    fill(circle(262, 60, 3), C.peach),
    line('M22 100 C30 94 38 102 46 96', C.blueLight, 2.4),
    line('M254 120 C262 114 270 122 278 116', C.peach, 2.4),
    fill(ellipse(150, 6, 10, 3), C.creamDeep, undefined, 0, 0.6),
  ];
}

export const PAGE_TITLE = 'My Stickers';
export const PAGE_TITLE_Y = 34;
