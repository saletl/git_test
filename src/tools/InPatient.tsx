import { C } from '../art/palette';
import type { Point } from '../art/shapes';
import { ToolArt, type SpriteToolId } from '../icons/ToolIcons';

/** Drawn inside the patient's 240 x 240 space: the tool resting on the patient and the glowing target rings. */

const HOLD: Record<SpriteToolId, { hotspot: Point; rotate: number; flip?: boolean; scale: number }> = {
  stethoscope: { hotspot: [50, 36], rotate: 0, scale: 0.95 },
  thermometer: { hotspot: [23, 49], rotate: 79, scale: 0.9 },
  light: { hotspot: [58, 24], rotate: -8, flip: true, scale: 0.95 },
  bandage: { hotspot: [32, 32], rotate: 0, scale: 0.8 },
  toyShot: { hotspot: [50, 53], rotate: 0, scale: 0.9 },
  tongue: { hotspot: [12, 30], rotate: 8, flip: true, scale: 0.85 },
};

export function ToolSprite({ tool, at }: { tool: SpriteToolId; at: Point }) {
  const h = HOLD[tool];
  const sx = h.flip ? -h.scale : h.scale;
  return (
    <g className="tool-sprite" transform={`translate(${at[0]} ${at[1]}) rotate(${h.rotate}) scale(${sx} ${h.scale}) translate(${-h.hotspot[0]} ${-h.hotspot[1]})`}>
      <g className="tool-sprite__inner">
        <ToolArt tool={tool} />
      </g>
    </g>
  );
}

export function TargetRings({ points, pulse, small = false }: { points: readonly Point[]; pulse: boolean; small?: boolean }) {
  const r = small ? 15 : 22;
  return (
    <g className={`target-rings${pulse ? ' is-pulsing' : ''}`} aria-hidden="true">
      {points.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <g className="target-ring">
            <circle r={r} fill={C.white} fillOpacity="0.28" stroke={C.white} strokeWidth="4" strokeDasharray="7 6" />
            <circle r={r} fill="none" stroke={C.coral} strokeWidth="2" strokeDasharray="7 6" opacity="0.8" />
          </g>
        </g>
      ))}
    </g>
  );
}
