import { flatten } from '../art/creature';
import { mochiArt } from '../art/mochi';
import { C } from '../art/palette';
import { pipArt } from '../art/pip';
import { prickleArt } from '../art/prickle';
import { circle, ellipse, fill, heart, line, star, transformShapes, type Shape } from '../art/shapes';
import { waddlesArt } from '../art/waddles';
import type { StickerId } from './catalog';

/**
 * Sticker artwork as plain shapes, centered on (0, 0) in a 200 x 200 box.
 * The same shapes are drawn on screen and in the printable PDF.
 */

function creature(shapes: Shape[], scale: number, dx = 0, dy = 0): Shape[] {
  return transformShapes(shapes, { origin: [120, 120], scale, translate: [dx - 120, dy - 120] });
}

function dieCut(bg: string, ring: string): Shape[] {
  return [
    fill(circle(3, 5, 96), C.shadow, undefined, 0, 0.16),
    fill(circle(0, 0, 96), C.white, '#e9e1d2', 2),
    fill(circle(0, 0, 84), bg, ring, 3),
  ];
}

const builders: Record<StickerId, () => Shape[]> = {
  pip: () => [
    ...dieCut(C.sagePale, C.sage),
    fill(circle(0, 2, 74), C.blueLight, C.blue, 3, 0.55),
    ...creature(flatten(pipArt.draw('giggle', undefined, {})), 0.56, 0, 6),
    { d: circle(0, 2, 74), stroke: C.blue, sw: 3 },
    fill(ellipse(-38, -40, 16, 8, -40), C.white, undefined, 0, 0.85),
    fill(ellipse(-52, -22, 5, 3, -40), C.white, undefined, 0, 0.85),
    fill(circle(58, -58, 9), C.blueLight, C.blue, 2, 0.8),
    fill(circle(70, -36, 5), C.blueLight, C.blue, 2, 0.8),
    fill(heart(-62, 56, 16, -12), C.berry),
  ],
  waddles: () => [
    ...dieCut(C.bluePale, C.blue),
    ...creature(flatten(waddlesArt.draw('excited', undefined, { scarves: 7, scarfHat: true })), 0.7, 0, 4),
    fill(star(-60, -50, 10, 5), C.gold),
    fill(star(62, -40, 7, 3.5), C.gold),
    line('M-66 34 V46 M-72 40 H-60', C.white, 3),
  ],
  prickle: () => [
    ...dieCut(C.peachLight, C.peach),
    ...creature(flatten(prickleArt.draw('happy', undefined, { bunny: 'hug', bunnyBandage: true })), 0.7, 0, 6),
    fill(heart(-58, -54, 20, -14), C.berry),
    fill(heart(62, -48, 14, 12), C.coral),
    fill(heart(66, 50, 10, 8), C.berry),
  ],
  mochi: () => [
    ...dieCut(C.lilacLight, C.lilac),
    ...creature(flatten(mochiArt.draw('giggle', undefined, { sock: 'giant' })), 0.66, 0, 14),
    fill(star(-62, 46, 9, 4.5), C.gold),
    fill(star(64, 52, 7, 3.5), C.gold),
    fill(circle(-66, -10, 4), C.coral),
  ],
};

const cache = new Map<StickerId, Shape[]>();

export function stickerShapes(id: StickerId): Shape[] {
  let shapes = cache.get(id);
  if (!shapes) {
    shapes = builders[id]();
    cache.set(id, shapes);
  }
  return shapes;
}

/** A soft outline used for stickers not collected yet. */
export function emptySlotShapes(): Shape[] {
  return [{ d: circle(0, 0, 88), stroke: C.creamDeep, sw: 4, fill: C.paper }];
}
