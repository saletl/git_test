/**
 * A tiny vector-art toolkit. Every character, sticker and decoration is a list of `Shape`s,
 * so the same artwork renders in the browser (as SVG) and in the printable PDF (with pdf-lib).
 * Only cubic Bezier paths are produced, which both renderers draw identically.
 */

export interface Shape {
  d: string;
  fill?: string;
  stroke?: string;
  /** Stroke width. */
  sw?: number;
  /** Opacity from 0 to 1. */
  op?: number;
}

export type Point = readonly [number, number];

const KAPPA = 0.5522847498;

const r2 = (n: number) => Math.round(n * 100) / 100;

function rotate([x, y]: Point, [cx, cy]: Point, deg: number): [number, number] {
  if (!deg) return [x, y];
  const a = (deg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const dx = x - cx;
  const dy = y - cy;
  return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
}

/** An ellipse drawn with four Bezier curves, optionally rotated (degrees, clockwise). */
export function ellipse(cx: number, cy: number, rx: number, ry: number, deg = 0): string {
  const c: Point = [cx, cy];
  const kx = rx * KAPPA;
  const ky = ry * KAPPA;
  const p = (x: number, y: number) => rotate([cx + x, cy + y], c, deg).map(r2).join(' ');
  return (
    `M${p(rx, 0)}` +
    `C${p(rx, ky)} ${p(kx, ry)} ${p(0, ry)}` +
    `C${p(-kx, ry)} ${p(-rx, ky)} ${p(-rx, 0)}` +
    `C${p(-rx, -ky)} ${p(-kx, -ry)} ${p(0, -ry)}` +
    `C${p(kx, -ry)} ${p(rx, -ky)} ${p(rx, 0)}Z`
  );
}

export function circle(cx: number, cy: number, r: number): string {
  return ellipse(cx, cy, r, r);
}

/** Rounded rectangle, optionally rotated around its center. */
export function rrect(x: number, y: number, w: number, h: number, r: number, deg = 0): string {
  const rr = Math.min(r, w / 2, h / 2);
  const k = rr * (1 - KAPPA);
  const c: Point = [x + w / 2, y + h / 2];
  const p = (px: number, py: number) => rotate([px, py], c, deg).map(r2).join(' ');
  return (
    `M${p(x + rr, y)}` +
    `L${p(x + w - rr, y)}` +
    `C${p(x + w - k, y)} ${p(x + w, y + k)} ${p(x + w, y + rr)}` +
    `L${p(x + w, y + h - rr)}` +
    `C${p(x + w, y + h - k)} ${p(x + w - k, y + h)} ${p(x + w - rr, y + h)}` +
    `L${p(x + rr, y + h)}` +
    `C${p(x + k, y + h)} ${p(x, y + h - k)} ${p(x, y + h - rr)}` +
    `L${p(x, y + rr)}` +
    `C${p(x, y + k)} ${p(x + k, y)} ${p(x + rr, y)}Z`
  );
}

/**
 * A smooth curve through the given points (Catmull-Rom converted to Bezier).
 * `tension` of 1 is the classic curve; lower values are tighter.
 */
export function smooth(points: readonly Point[], closed = true, tension = 1): string {
  const n = points.length;
  if (n < 2) return '';
  const get = (i: number): Point => {
    if (closed) return points[((i % n) + n) % n]!;
    return points[Math.max(0, Math.min(n - 1, i))]!;
  };
  const t = tension / 6;
  let d = `M${r2(points[0]![0])} ${r2(points[0]![1])}`;
  const segments = closed ? n : n - 1;
  for (let i = 0; i < segments; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) * t;
    const c1y = p1[1] + (p2[1] - p0[1]) * t;
    const c2x = p2[0] - (p3[0] - p1[0]) * t;
    const c2y = p2[1] - (p3[1] - p1[1]) * t;
    d += `C${r2(c1x)} ${r2(c1y)} ${r2(c2x)} ${r2(c2y)} ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return closed ? `${d}Z` : d;
}

/** A simple open stroke from point to point through one control point. */
export function curve(from: Point, ctrl: Point, to: Point): string {
  const c1: Point = [from[0] + ((ctrl[0] - from[0]) * 2) / 3, from[1] + ((ctrl[1] - from[1]) * 2) / 3];
  const c2: Point = [to[0] + ((ctrl[0] - to[0]) * 2) / 3, to[1] + ((ctrl[1] - to[1]) * 2) / 3];
  return `M${r2(from[0])} ${r2(from[1])}C${r2(c1[0])} ${r2(c1[1])} ${r2(c2[0])} ${r2(c2[1])} ${r2(to[0])} ${r2(to[1])}`;
}

/** Polygon with straight edges. */
export function poly(points: readonly Point[], closed = true): string {
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${r2(x)} ${r2(y)}`).join('') + (closed ? 'Z' : '');
}

/** A soft rounded heart centered on (cx, cy). */
export function heart(cx: number, cy: number, size: number, deg = 0): string {
  const s = size / 2;
  const pts: Point[] = [
    [cx, cy + s * 0.95],
    [cx - s * 0.55, cy + s * 0.45],
    [cx - s * 0.98, cy - s * 0.05],
    [cx - s * 0.85, cy - s * 0.62],
    [cx - s * 0.42, cy - s * 0.8],
    [cx, cy - s * 0.42],
    [cx + s * 0.42, cy - s * 0.8],
    [cx + s * 0.85, cy - s * 0.62],
    [cx + s * 0.98, cy - s * 0.05],
    [cx + s * 0.55, cy + s * 0.45],
  ];
  return smooth(pts.map((p) => rotate(p, [cx, cy], deg)), true, 0.9);
}

/** A chubby five-point star. */
export function star(cx: number, cy: number, outer: number, inner = outer * 0.5, deg = 0): string {
  const pts: Point[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = ((-90 + i * 36 + deg) * Math.PI) / 180;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return smooth(pts, true, 0.35);
}

/**
 * Maps every point of a path built by these helpers (they only use absolute M, L and C commands,
 * so numbers always come in x,y pairs).
 */
export function mapPath(d: string, fn: (x: number, y: number) => readonly [number, number]): string {
  const nums = d.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  const mapped: string[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const [x, y] = fn(parseFloat(nums[i]!), parseFloat(nums[i + 1]!));
    mapped.push(String(r2(x)), String(r2(y)));
  }
  let k = 0;
  return d.replace(/-?\d*\.?\d+(?:e-?\d+)?/g, () => mapped[k++] ?? '0');
}

/** Moves every point of a path. */
export function shift(d: string, dx: number, dy: number): string {
  return mapPath(d, (x, y) => [x + dx, y + dy]);
}

export interface ShapeTransform {
  /** Point the scale and rotation happen around. Defaults to (0, 0). */
  origin?: Point;
  scale?: number;
  /** Degrees, clockwise. */
  rotate?: number;
  /** Applied last. */
  translate?: Point;
  flipX?: boolean;
  flipY?: boolean;
}

/** Applies a group transform to a list of shapes, scaling stroke widths to match. */
export function transformShapes(shapes: readonly Shape[], t: ShapeTransform): Shape[] {
  const [ox, oy] = t.origin ?? [0, 0];
  const s = t.scale ?? 1;
  const a = ((t.rotate ?? 0) * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const [tx, ty] = t.translate ?? [0, 0];
  const fn = (x: number, y: number): [number, number] => {
    let dx = (x - ox) * (t.flipX ? -1 : 1) * s;
    let dy = (y - oy) * (t.flipY ? -1 : 1) * s;
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    dx = rx;
    dy = ry;
    return [ox + dx + tx, oy + dy + ty];
  };
  return shapes.map((shape) => ({ ...shape, d: mapPath(shape.d, fn), sw: shape.sw !== undefined ? shape.sw * s : undefined }));
}

/** Mirrors a point list across a vertical line (for symmetric parts). */
export function mirror(points: readonly Point[], axisX: number): Point[] {
  return points.map(([x, y]) => [axisX * 2 - x, y] as const);
}

export const fill = (d: string, color: string, outline?: string, sw = 3, op?: number): Shape => ({
  d,
  fill: color,
  stroke: outline,
  sw: outline ? sw : undefined,
  op,
});

export const line = (d: string, color: string, sw = 3, op?: number): Shape => ({ d, stroke: color, sw, op });
