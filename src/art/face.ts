import { C } from './palette';
import { curve, ellipse, fill, line, smooth, type Point, type Shape } from './shapes';

export const EXPRESSIONS = [
  'happy',
  'excited',
  'giggle',
  'worried',
  'nervous',
  'brave',
  'surprised',
  'curious',
  'shy',
  'calm',
  'crossEyed',
  'squeeze',
  'proud',
  'silly',
  'sleepy',
] as const;
export type Expression = (typeof EXPRESSIONS)[number];

export type Look = 'center' | 'left' | 'right' | 'up' | 'down' | 'upLeft' | 'upRight' | 'downLeft' | 'downRight';

const LOOK: Record<Look, Point> = {
  center: [0, 0],
  left: [-1, 0],
  right: [1, 0],
  up: [0, -1],
  down: [0, 1],
  upLeft: [-0.75, -0.75],
  upRight: [0.75, -0.75],
  downLeft: [-0.75, 0.75],
  downRight: [0.75, 0.75],
};

type EyeKind = 'open' | 'wide' | 'half' | 'closedHappy' | 'closedDown' | 'squeeze' | 'cross' | 'wink';
type BrowKind = 'soft' | 'worried' | 'raised' | 'curious' | 'silly' | 'flat';
type MouthKind = 'smile' | 'bigSmile' | 'grin' | 'smallSmile' | 'shySmile' | 'wavy' | 'flat' | 'o' | 'bigO' | 'tongue';

interface FaceSpec {
  eyes: EyeKind;
  brows: BrowKind;
  mouth: MouthKind;
  blush: number;
  look?: Look;
}

const SPEC: Record<Expression, FaceSpec> = {
  happy: { eyes: 'open', brows: 'soft', mouth: 'smile', blush: 0.5 },
  excited: { eyes: 'wide', brows: 'raised', mouth: 'grin', blush: 0.6 },
  giggle: { eyes: 'closedHappy', brows: 'raised', mouth: 'grin', blush: 0.65 },
  worried: { eyes: 'open', brows: 'worried', mouth: 'wavy', blush: 0.3, look: 'down' },
  nervous: { eyes: 'open', brows: 'worried', mouth: 'flat', blush: 0.35, look: 'right' },
  brave: { eyes: 'open', brows: 'worried', mouth: 'smallSmile', blush: 0.5 },
  surprised: { eyes: 'wide', brows: 'raised', mouth: 'o', blush: 0.35 },
  curious: { eyes: 'open', brows: 'curious', mouth: 'shySmile', blush: 0.4, look: 'upRight' },
  shy: { eyes: 'open', brows: 'soft', mouth: 'shySmile', blush: 0.9, look: 'downLeft' },
  calm: { eyes: 'half', brows: 'soft', mouth: 'smallSmile', blush: 0.5 },
  crossEyed: { eyes: 'cross', brows: 'raised', mouth: 'o', blush: 0.4 },
  squeeze: { eyes: 'squeeze', brows: 'worried', mouth: 'wavy', blush: 0.55 },
  proud: { eyes: 'closedHappy', brows: 'raised', mouth: 'bigSmile', blush: 0.6 },
  silly: { eyes: 'wink', brows: 'silly', mouth: 'tongue', blush: 0.5 },
  sleepy: { eyes: 'closedDown', brows: 'flat', mouth: 'o', blush: 0.4 },
};

export interface FaceGeometry {
  /** Screen-left eye, then screen-right eye. */
  eyes: readonly [Point, Point];
  eyeR: number;
  /** Optional different size for the right eye (Mochi has mismatched eyes). */
  eyeR2?: number;
  /** Vertical stretch of the eyes. 1 is round. */
  eyeStretch?: number;
  browGap: number;
  browLen: number;
  mouth: Point;
  mouthW: number;
  cheeks?: readonly [Point, Point];
  cheekR?: number;
  skin: string;
  ink?: string;
  /** Skip the mouth for characters who draw their own (like a beak). */
  noMouth?: boolean;
  lashes?: boolean;
}

export interface FaceParts {
  eyes: Shape[];
  brows: Shape[];
  mouth: Shape[];
  cheeks: Shape[];
  /** Whether the eyes are open (blinking only applies to open eyes). */
  eyesOpen: boolean;
  mouthKind: MouthKind;
}

function eyeShapes(kind: EyeKind, [cx, cy]: Point, r: number, stretch: number, look: Point, side: -1 | 1, g: FaceGeometry): Shape[] {
  const ink = g.ink ?? C.ink;
  const ry = r * stretch;
  if (kind === 'closedHappy' || (kind === 'wink' && side === 1)) {
    return [line(curve([cx - r * 0.85, cy + r * 0.25], [cx, cy - r * 1.05], [cx + r * 0.85, cy + r * 0.25]), ink, Math.max(3, r * 0.3))];
  }
  if (kind === 'closedDown') {
    return [line(curve([cx - r * 0.8, cy], [cx, cy + r * 0.75], [cx + r * 0.8, cy]), ink, Math.max(3, r * 0.28))];
  }
  if (kind === 'squeeze') {
    const s = side === -1 ? 1 : -1;
    return [
      line(
        smooth(
          [
            [cx - s * r * 0.7, cy - r * 0.55],
            [cx + s * r * 0.45, cy],
            [cx - s * r * 0.7, cy + r * 0.55],
          ],
          false,
          0.2,
        ),
        ink,
        Math.max(3, r * 0.3),
      ),
    ];
  }
  const wide = kind === 'wide';
  const er = wide ? r * 1.12 : r;
  const ery = wide ? ry * 1.12 : ry;
  let [lx, ly] = look;
  if (kind === 'cross') {
    lx = side === -1 ? 1 : -1;
    ly = 0.1;
  }
  const pr = wide ? er * 0.46 : er * 0.62;
  const travel = er - pr - er * 0.08;
  const px = cx + lx * travel;
  const py = cy + ly * travel * stretch;
  const shapes: Shape[] = [
    fill(ellipse(cx, cy, er, ery), C.white, ink, Math.max(2.2, r * 0.18)),
    fill(ellipse(px, py, pr, pr * Math.min(1.15, stretch)), ink),
    fill(ellipse(px + pr * 0.32, py - pr * 0.36, pr * 0.34, pr * 0.34), C.white),
    fill(ellipse(px - pr * 0.34, py + pr * 0.38, pr * 0.14, pr * 0.14), C.white, undefined, 0, 0.8),
  ];
  if (kind === 'half') {
    const k = 0.5523;
    const top = cy - ery - 1.5;
    const cut = cy - ery * 0.05;
    const d =
      `M${cx - er - 1.5} ${cut}` +
      `C${cx - er - 1.5} ${cut - (cut - top) * k} ${cx - er * k} ${top} ${cx} ${top}` +
      `C${cx + er * k} ${top} ${cx + er + 1.5} ${cut - (cut - top) * k} ${cx + er + 1.5} ${cut}Z`;
    shapes.push(fill(d, g.skin));
    shapes.push(line(curve([cx - er, cut], [cx, cut + er * 0.18], [cx + er, cut]), ink, Math.max(2.4, r * 0.2)));
  }
  if (g.lashes && kind !== 'half') {
    const ox = side * er * 0.75;
    shapes.push(line(curve([cx + ox, cy - ery * 0.62], [cx + ox * 1.2, cy - ery * 0.85], [cx + ox * 1.45, cy - ery * 0.9]), ink, 2.2));
  }
  return shapes;
}

function browShapes(kind: BrowKind, [ex, ey]: Point, r: number, side: -1 | 1, g: FaceGeometry): Shape[] {
  const ink = g.ink ?? C.ink;
  const len = g.browLen;
  const by = ey - g.browGap;
  const inner = -side; // the end of the brow nearest the middle of the face
  let lift = 0;
  let innerUp = 0;
  let arch = -2;
  switch (kind) {
    case 'worried':
      innerUp = 5;
      arch = -1;
      break;
    case 'raised':
      lift = 5;
      arch = -4;
      break;
    case 'curious':
      lift = side === 1 ? 7 : 0;
      arch = side === 1 ? -4 : -1;
      break;
    case 'silly':
      lift = side === -1 ? 6 : -1;
      innerUp = side === 1 ? -4 : 0;
      arch = -3;
      break;
    case 'flat':
      arch = 0;
      lift = -1;
      break;
    case 'soft':
      break;
  }
  const y = by - lift;
  const innerX = ex + inner * len * 0.5;
  const outerX = ex - inner * len * 0.5;
  const innerY = y - innerUp;
  const outerY = y + innerUp * 0.35;
  return [
    line(
      curve([outerX, outerY], [ex, (innerY + outerY) / 2 + arch], [innerX, innerY]),
      ink,
      Math.max(2.6, r * 0.24),
    ),
  ];
}

function mouthShapes(kind: MouthKind, [mx, my]: Point, w: number, g: FaceGeometry): Shape[] {
  const ink = g.ink ?? C.ink;
  const sw = Math.max(2.8, w * 0.11);
  switch (kind) {
    case 'smile':
      return [line(curve([mx - w / 2, my - 2], [mx, my + w * 0.45], [mx + w / 2, my - 2]), ink, sw)];
    case 'bigSmile':
      return [line(curve([mx - w * 0.6, my - 4], [mx, my + w * 0.6], [mx + w * 0.6, my - 4]), ink, sw)];
    case 'smallSmile':
      return [line(curve([mx - w * 0.3, my - 1], [mx, my + w * 0.25], [mx + w * 0.3, my - 1]), ink, sw)];
    case 'shySmile':
      return [line(curve([mx - w * 0.2, my], [mx + w * 0.05, my + w * 0.22], [mx + w * 0.32, my - 3]), ink, sw)];
    case 'grin': {
      const top = my - w * 0.08;
      const d = `M${mx - w / 2} ${top}C${mx - w * 0.42} ${my + w * 0.62} ${mx + w * 0.42} ${my + w * 0.62} ${mx + w / 2} ${top}C${mx + w * 0.2} ${top + 3} ${mx - w * 0.2} ${top + 3} ${mx - w / 2} ${top}Z`;
      return [
        fill(d, C.mouth, ink, sw * 0.9),
        fill(ellipse(mx, my + w * 0.3, w * 0.22, w * 0.1), C.tongue),
      ];
    }
    case 'wavy':
      return [
        line(
          smooth(
            [
              [mx - w * 0.34, my + 1],
              [mx - w * 0.12, my - 2],
              [mx + w * 0.1, my + 2],
              [mx + w * 0.34, my - 1],
            ],
            false,
          ),
          ink,
          sw * 0.9,
        ),
      ];
    case 'flat':
      return [line(curve([mx - w * 0.22, my], [mx, my + 1], [mx + w * 0.22, my - 1]), ink, sw * 0.9)];
    case 'o':
      return [fill(ellipse(mx, my + 2, w * 0.14, w * 0.18), C.mouth, ink, sw * 0.8)];
    case 'bigO':
      return [fill(ellipse(mx, my + 3, w * 0.22, w * 0.28), C.mouth, ink, sw * 0.8)];
    case 'tongue':
      return [
        fill(ellipse(mx + w * 0.16, my + w * 0.18, w * 0.14, w * 0.17), C.tongue, ink, sw * 0.7),
        line(curve([mx - w / 2, my - 2], [mx, my + w * 0.4], [mx + w / 2, my - 2]), ink, sw),
      ];
  }
}

export function faceParts(g: FaceGeometry, expression: Expression, lookOverride?: Look): FaceParts {
  const spec = SPEC[expression];
  const look = LOOK[lookOverride ?? spec.look ?? 'center'];
  const stretch = g.eyeStretch ?? 1;
  const [le, re] = g.eyes;
  const eyes = [
    ...eyeShapes(spec.eyes, le, g.eyeR, stretch, look, -1, g),
    ...eyeShapes(spec.eyes, re, g.eyeR2 ?? g.eyeR, stretch, look, 1, g),
  ];
  const brows = [...browShapes(spec.brows, le, g.eyeR, -1, g), ...browShapes(spec.brows, re, g.eyeR2 ?? g.eyeR, 1, g)];
  const mouth = g.noMouth ? [] : mouthShapes(spec.mouth, g.mouth, g.mouthW, g);
  const cheeks: Shape[] = g.cheeks
    ? g.cheeks.map(([x, y]) => fill(ellipse(x, y, (g.cheekR ?? 9) * 1.25, g.cheekR ?? 9), C.blush, undefined, 0, spec.blush))
    : [];
  const eyesOpen = spec.eyes === 'open' || spec.eyes === 'wide' || spec.eyes === 'cross' || spec.eyes === 'half';
  return { eyes, brows, mouth, cheeks, eyesOpen, mouthKind: spec.mouth };
}

/** Whether an expression shows an open mouth (used by beaks and snouts). */
export function isMouthOpen(expression: Expression): boolean {
  const m = SPEC[expression].mouth;
  return m === 'grin' || m === 'o' || m === 'bigO';
}
