import { bandageShapes, plushShapes, type BandageStyle, type PlushKind } from '../art/creature';
import { circle, curve, ellipse, heart, poly, rrect, smooth, star, transformShapes, type Point, type Shape } from '../art/shapes';
import { INK, PAPER, toLineArt } from './lineArt';

/** Line-art props for the coloring pages: outlined shapes with white insides, ready to color. */

export const o = (d: string, sw = 3): Shape => ({ d, fill: PAPER, stroke: INK, sw });
export const l = (d: string, sw = 3): Shape => ({ d, stroke: INK, sw });
export const dot = (x: number, y: number, r: number): Shape => ({ d: circle(x, y, r), fill: INK });

const place = (shapes: Shape[], at: Point, scale = 1, rotate = 0) => transformShapes(shapes, { scale, rotate, translate: at });

export function bubble(cx: number, cy: number, r: number): Shape[] {
  return [o(circle(cx, cy, r), 2.6), l(curve([cx - r * 0.6, cy - r * 0.2], [cx - r * 0.55, cy - r * 0.6], [cx - r * 0.2, cy - r * 0.65]), 2)];
}

export function starShape(cx: number, cy: number, r: number, sw = 2.6): Shape {
  return o(star(cx, cy, r, r * 0.5), sw);
}

export function heartShape(cx: number, cy: number, size: number, deg = 0, sw = 2.6): Shape {
  return o(heart(cx, cy, size, deg), sw);
}

export function note(x: number, y: number, s = 1): Shape[] {
  return place([o(ellipse(-4, 8, 7, 5.5, -20), 2.4), l('M2 8 V-14', 3), l(curve([2, -14], [12, -12], [12, -2]), 3)], [x, y], s);
}

/** A stethoscope lying flat, about 90 units wide at scale 1. */
export function stethoscope(at: Point, scale = 1, rotate = 0): Shape[] {
  return place(
    [
      l(curve([-30, -30], [-34, 0], [-10, 6]), 4),
      l(curve([-6, -30], [-2, 0], [-10, 6]), 4),
      l(curve([-10, 6], [-10, 34], [16, 30]), 4),
      l(curve([16, 30], [32, 26], [30, 10]), 4),
      o(circle(-30, -32, 4), 2.4),
      o(circle(-6, -32, 4), 2.4),
      o(circle(30, 6, 11), 3),
      o(circle(30, 6, 5), 2),
    ],
    at,
    scale,
    rotate,
  );
}

export function thermometer(at: Point, scale = 1, rotate = 0): Shape[] {
  return place([o(rrect(-7, -40, 14, 56, 7), 3), o(circle(0, 22, 10), 3), l('M0 -26 V14', 3), l('M7 -30 H2 M7 -20 H2 M7 -10 H2 M7 0 H2', 2)], at, scale, rotate);
}

export function jar(at: Point, scale = 1): Shape[] {
  return place(
    [
      o(rrect(-26, -52, 52, 12, 5), 3),
      o('M-30 -38 C-30 -42 -27 -42 -24 -42 H24 C27 -42 30 -42 30 -38 V30 C30 38 24 42 16 42 H-16 C-24 42 -30 38 -30 30 Z', 3),
      ...bubble(-10, 18, 10),
      ...bubble(12, 4, 8),
      ...bubble(-4, -14, 7),
      l('M-22 -30 V24', 2.4),
    ],
    at,
    scale,
  );
}

export function bandage(style: BandageStyle, at: Point, rotate = 0, scale = 1): Shape[] {
  return toLineArt(bandageShapes(style, at, rotate, scale), { minStroke: 2.2, detailStroke: 1.4 });
}

export function plush(kind: PlushKind, at: Point, scale = 1, rotate = 0): Shape[] {
  return toLineArt(plushShapes(kind, at, scale, false, rotate), { minStroke: 2.4 });
}

export function puff(at: Point, scale = 1): Shape[] {
  return place([o(smooth([[-30, 4], [-24, -16], [-4, -20], [8, -30], [28, -18], [34, 2], [20, 16], [-2, 14], [-20, 18]], true, 0.8), 2.8)], at, scale);
}

export function snowflake(at: Point, scale = 1): Shape[] {
  return place([l('M0 -14 V14 M-12 -7 L12 7 M-12 7 L12 -7', 2.6), l('M-3 -10 L0 -7 L3 -10 M-3 10 L0 7 L3 10', 2)], at, scale);
}

export function scarfFlying(at: Point, scale = 1, rotate = 0): Shape[] {
  return place(
    [
      o('M-46 -6 C-30 -18 -10 4 8 -6 C24 -16 38 -8 46 -4 L46 10 C36 8 26 0 8 8 C-10 18 -30 -4 -46 8 Z', 3),
      l('M-30 -8 L-26 8 M-10 -2 L-6 12 M12 -6 L16 6 M30 -8 L32 4', 2.4),
      l('M46 -2 L54 -4 M46 4 L56 4 M46 10 L54 12', 2.2),
    ],
    at,
    scale,
    rotate,
  );
}

export function rumbleLines(cx: number, cy: number, w: number): Shape[] {
  return [
    l(curve([cx - w, cy - 18], [cx - w - 10, cy], [cx - w, cy + 18]), 3),
    l(curve([cx - w - 14, cy - 26], [cx - w - 28, cy], [cx - w - 14, cy + 26]), 3),
    l(curve([cx + w, cy - 18], [cx + w + 10, cy], [cx + w, cy + 18]), 3),
    l(curve([cx + w + 14, cy - 26], [cx + w + 28, cy], [cx + w + 14, cy + 26]), 3),
  ];
}

export function trumpet(at: Point, scale = 1, rotate = 0): Shape[] {
  return place([o('M-30 -4 H0 L22 -18 V18 L0 4 H-30 Z', 3), o(ellipse(22, 0, 5, 18), 2.6), o(rrect(-34, -6, 6, 12, 2), 2.2), o(rrect(-20, -12, 5, 8, 2), 2), o(rrect(-10, -12, 5, 8, 2), 2)], at, scale, rotate);
}

export function duck(at: Point, scale = 1): Shape[] {
  return place([o(ellipse(0, 10, 24, 14), 3), o(circle(12, -10, 12), 3), o(poly([[23, -12], [34, -8], [23, -4]]), 2.4), dot(15, -13, 2.4), l(curve([-12, 8], [-4, 16], [6, 12]), 2.4)], at, scale);
}

/** The cozy exam table the patient sits on. */
export function examTable(x: number, y: number, w: number): Shape[] {
  return [
    o(rrect(x + 20, y + 18, w - 40, 90, 10), 3.5),
    o(rrect(x + 36, y + 34, (w - 88) / 2, 32, 6), 2.4),
    o(rrect(x + 52 + (w - 88) / 2, y + 34, (w - 88) / 2, 32, 6), 2.4),
    o(rrect(x, y, w, 26, 13), 3.5),
    l(`M${x + 30} ${y + 9} H${x + w - 30}`, 2),
  ];
}

export function windowFrame(x: number, y: number, size: number): Shape[] {
  const c = size / 2;
  return [
    o(rrect(x, y, size, size, 14), 4),
    o(rrect(x + 10, y + 10, size - 20, size - 20, 8), 2.6),
    l(`M${x + c} ${y + 10} V${y + size - 10} M${x + 10} ${y + c} H${x + size - 10}`, 3),
    o(smooth([[x + 22, y + c - 14], [x + 30, y + c - 26], [x + 44, y + c - 24], [x + 52, y + c - 12], [x + 34, y + c - 8]], true, 0.8), 2.2),
    o(circle(x + size - 30, y + 30, 11), 2.4),
  ];
}

/** A friendly hamster helper in a nurse cap (line art), drawn around (0, 0), about 90 units tall. */
export function helper(at: Point, scale = 1): Shape[] {
  return place(
    [
      o(ellipse(0, 36, 30, 28), 3),
      o(circle(-19, -22, 9), 3),
      o(circle(19, -22, 9), 3),
      o(ellipse(0, 0, 28, 25), 3),
      o(ellipse(0, 9, 17, 12), 2),
      o('M-17 -18 C-12 -32 12 -32 17 -18 Z', 2.6),
      l('M-4 -25 H4 M0 -29 V-21', 2.6),
      dot(-9, -3, 3.4),
      dot(9, -3, 3.4),
      { d: circle(-8, -4.4, 1.1), fill: PAPER },
      { d: circle(10, -4.4, 1.1), fill: PAPER },
      o(ellipse(0, 4, 3.6, 2.6), 2),
      l(curve([-6, 9], [0, 14], [6, 9]), 2.4),
      o(heart(0, 40, 18), 2.4),
      o(ellipse(-30, 30, 8, 12, 30), 2.6),
      o(ellipse(30, 30, 8, 12, -30), 2.6),
    ],
    at,
    scale,
  );
}

export function pillow(at: Point, scale = 1): Shape[] {
  return place([o('M-40 0 C-40 -16 -24 -20 0 -20 C24 -20 40 -16 40 0 C40 14 24 18 0 18 C-24 18 -40 14 -40 0 Z', 3), l(curve([-28, -4], [0, -10], [28, -4]), 2)], at, scale);
}

export function musicBox(at: Point, scale = 1): Shape[] {
  return place([o(rrect(-28, -6, 56, 34, 6), 3), l('M-28 4 H28', 2.6), o('M-30 -6 L-20 -22 H20 L30 -6 Z', 3), o(circle(0, 16, 5), 2), l('M28 12 H36 V6', 3)], at, scale);
}
