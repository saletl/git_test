import type { Expression, Look } from './face';
import { C } from './palette';
import { circle, curve, ellipse, fill, line, smooth, star, transformShapes, type Point, type Shape } from './shapes';

/**
 * Named parts let CSS animate pieces of a character: `.ch-armR` waves, `.ch-eyes` blink, and so on.
 * Each layer can name a pivot point (in the character's own 240 x 240 coordinates) for rotation.
 */
export interface ArtLayer {
  part: string;
  shapes: Shape[];
  pivot?: Point;
}

export interface CreatureArt {
  layers: ArtLayer[];
  eyesOpen: boolean;
}

/** Persistent look of a character during a visit (scarf count, sock position, and so on). */
export type CreatureProps = Record<string, string | number | boolean | undefined>;

export interface CreatureArtist {
  draw(expression: Expression, look: Look | undefined, props: CreatureProps): CreatureArt;
}

export const VIEW = 240;

export function flatten(art: CreatureArt): Shape[] {
  return art.layers.flatMap((layer) => layer.shapes);
}

export type PlushKind = 'star' | 'fish' | 'bunny' | 'bear';

/** Comfort toys, drawn around (0, 0) at roughly 60 units tall. */
function plushBase(kind: PlushKind): Shape[] {
  switch (kind) {
    case 'star':
      return [
        fill(star(0, 0, 30, 17), C.gold, C.goldDeep, 3),
        fill(ellipse(-8, -6, 3, 3.6), C.ink),
        fill(ellipse(8, -6, 3, 3.6), C.ink),
        line(curve([-6, 4], [0, 9], [6, 4]), C.ink, 2.4),
        fill(ellipse(-14, 4, 4, 2.6), C.blush, undefined, 0, 0.7),
        fill(ellipse(14, 4, 4, 2.6), C.blush, undefined, 0, 0.7),
        line(curve([-18, -22], [-12, -18], [-8, -16]), C.goldLight, 2, 0.9),
      ];
    case 'fish':
      return [
        fill(
          smooth([
            [22, -2],
            [34, -16],
            [36, 0],
            [34, 16],
            [22, 2],
          ]),
          C.coral,
          C.coralDeep,
          3,
        ),
        fill(ellipse(-2, 0, 27, 18), C.blue, C.blueDeep, 3),
        fill(ellipse(-4, 6, 16, 8), C.bluePale),
        fill(ellipse(-14, -4, 4, 4), C.ink),
        fill(ellipse(-13, -5.4, 1.4, 1.4), C.white),
        line(curve([-22, 6], [-18, 10], [-14, 7]), C.ink, 2.2),
        line(curve([0, -10], [4, 0], [0, 10]), C.blueDeep, 2, 0.7),
        line(curve([8, -9], [12, 0], [8, 9]), C.blueDeep, 2, 0.7),
      ];
    case 'bunny':
      return [
        fill(ellipse(-9, -30, 7, 18, -10), '#fff6ec', '#c9afa0', 3),
        fill(ellipse(9, -30, 7, 18, 10), '#fff6ec', '#c9afa0', 3),
        fill(ellipse(-9, -30, 3.4, 12, -10), C.berryLight),
        fill(ellipse(9, -30, 3.4, 12, 10), C.berryLight),
        fill(ellipse(0, 14, 20, 18), '#fff6ec', '#c9afa0', 3),
        fill(circle(0, -8, 17), '#fff6ec', '#c9afa0', 3),
        fill(circle(-6, -10, 2.6), C.ink),
        fill(circle(6, -10, 2.6), C.ink),
        fill(ellipse(0, -4, 2.6, 1.8), C.berry),
        line(curve([-4, -1], [0, 3], [4, -1]), C.ink, 1.8),
        fill(ellipse(-11, -3, 3.4, 2.2), C.blush, undefined, 0, 0.6),
        fill(ellipse(11, -3, 3.4, 2.2), C.blush, undefined, 0, 0.6),
        fill(smooth([[-6, 6], [-12, 2], [-12, 10]]), C.coral, C.coralDeep, 1.6),
        fill(smooth([[6, 6], [12, 2], [12, 10]]), C.coral, C.coralDeep, 1.6),
        fill(circle(0, 6, 2.6), C.coralDeep),
      ];
    case 'bear':
      return [
        fill(circle(-15, -22, 8), C.wood, C.woodDeep, 3),
        fill(circle(15, -22, 8), C.wood, C.woodDeep, 3),
        fill(circle(-15, -22, 4), C.peachLight),
        fill(circle(15, -22, 4), C.peachLight),
        fill(ellipse(0, 14, 20, 18), C.wood, C.woodDeep, 3),
        fill(ellipse(0, 16, 11, 10), C.peachLight),
        fill(circle(0, -8, 18), C.wood, C.woodDeep, 3),
        fill(ellipse(0, -2, 8, 6), C.peachLight),
        fill(ellipse(0, -4, 3, 2.2), C.ink),
        fill(circle(-7, -12, 2.6), C.ink),
        fill(circle(7, -12, 2.6), C.ink),
        line(curve([-3, 1], [0, 3], [3, 1]), C.ink, 1.6),
        line(curve([-8, 12], [-4, 10], [-2, 14]), C.woodDeep, 1.6),
      ];
  }
}

export function plushShapes(kind: PlushKind, at: Point, scale = 1, upsideDown = false, rotate = 0): Shape[] {
  return transformShapes(plushBase(kind), { scale, flipY: upsideDown, flipX: false, rotate, translate: at });
}

/** A small round bandage, drawn around (0, 0). */
export type BandageStyle = 'stars' | 'hearts' | 'stripes';

export const BANDAGE_STYLES: readonly BandageStyle[] = ['stars', 'hearts', 'stripes'];

const BANDAGE_COLORS: Record<BandageStyle, { base: string; edge: string; dot: string }> = {
  stars: { base: C.blueLight, edge: C.blueDeep, dot: C.gold },
  hearts: { base: C.berryLight, edge: C.berry, dot: C.coralDeep },
  stripes: { base: C.goldLight, edge: C.goldDeep, dot: C.mint },
};

export function bandageShapes(style: BandageStyle, at: Point, rotate = 0, scale = 1): Shape[] {
  const col = BANDAGE_COLORS[style];
  const base: Shape[] = [
    fill('M-22 -8C-26 -8 -28 -5 -28 0C-28 5 -26 8 -22 8L22 8C26 8 28 5 28 0C28 -5 26 -8 22 -8Z', col.base, col.edge, 2.4),
    fill('M-9 -7L9 -7L9 7L-9 7Z', C.paper, undefined, 0, 0.9),
  ];
  if (style === 'stars') {
    base.push(fill(star(-17, 0, 4.4, 2.2), col.dot), fill(star(17, 0, 4.4, 2.2), col.dot), fill(star(0, 0, 4, 2), col.dot));
  } else if (style === 'hearts') {
    base.push(fill(ellipse(-17, 0, 3, 3), col.dot), fill(ellipse(17, 0, 3, 3), col.dot), fill(ellipse(0, 0, 2.6, 2.6), col.dot));
  } else {
    base.push(
      line('M-20 -6L-14 6', col.dot, 2.6),
      line('M14 -6L20 6', col.dot, 2.6),
      line('M-3 -5L3 5', col.dot, 2.2, 0.8),
    );
  }
  return transformShapes(base, { rotate, scale, translate: at });
}
