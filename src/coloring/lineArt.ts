import type { CreatureArt } from '../art/creature';
import type { Shape } from '../art/shapes';

/**
 * Turns the game's full-color vector art into coloring-sheet line art:
 * every colorable area becomes white with a bold black outline, small dark details (pupils) stay black,
 * and soft extras (blush, shadows, shine) are dropped. Nothing is gray, so pages print crisply with little ink.
 */

export const INK = '#1d1d1d';
export const PAPER = '#ffffff';

function luminance(color: string): number {
  const h = color.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

const isDark = (color: string) => luminance(color) < 0.12;
const isWhite = (color: string) => luminance(color) > 0.85;

export interface LineArtOptions {
  /** Thinnest outline, in the shapes' own units. */
  minStroke?: number;
  /** Outline for areas that had no outline in color (spots, bellies, masks). */
  detailStroke?: number;
}

export function toLineArt(shapes: readonly Shape[], { minStroke = 2.2, detailStroke = 1.5 }: LineArtOptions = {}): Shape[] {
  const out: Shape[] = [];
  for (const s of shapes) {
    if (s.op !== undefined && s.op < 0.5) continue;
    if (s.fill && s.fill !== 'none') {
      if (isDark(s.fill)) {
        out.push({ d: s.d, fill: INK });
      } else if (!s.stroke && isWhite(s.fill)) {
        // Shine on an eye: keep it white so pupils still sparkle.
        out.push({ d: s.d, fill: PAPER });
      } else if (s.stroke) {
        out.push({ d: s.d, fill: PAPER, stroke: INK, sw: Math.max(minStroke, s.sw ?? minStroke) });
      } else {
        out.push({ d: s.d, fill: PAPER, stroke: INK, sw: detailStroke });
      }
      continue;
    }
    if (s.stroke) {
      const sw = s.sw ?? minStroke;
      // Very thick strokes are drawn as tubes (an outline stroke, then a lighter one on top), like Pip's tail.
      const color = sw >= 8 && luminance(s.stroke) > 0.3 ? PAPER : INK;
      out.push({ d: s.d, stroke: color, sw: color === INK ? Math.max(minStroke * 0.75, sw) : sw });
    }
  }
  return out;
}

/** Line art for a character, without the soft cheek blush and floor shadow. */
export function creatureLineArt(art: CreatureArt, options?: LineArtOptions): Shape[] {
  return toLineArt(
    art.layers.filter((l) => l.part !== 'shadow' && l.part !== 'cheeks').flatMap((l) => l.shapes),
    options,
  );
}
