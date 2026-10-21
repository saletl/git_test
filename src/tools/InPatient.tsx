import { plushShapes, type PlushKind } from '../art/creature';
import { C } from '../art/palette';
import type { Point } from '../art/shapes';
import { ShapeList } from '../characters/Creature';
import type { AnyToolId } from '../game/types';
import { ToolArt } from '../icons/ToolIcons';

/** Drawn inside the patient's 240 x 240 space: the tool resting on the patient, the toy demo, and target rings. */

const HOLD: Record<AnyToolId, { hotspot: Point; rotate: number; flip?: boolean; scale: number }> = {
  stethoscope: { hotspot: [50, 36], rotate: 0, scale: 0.95 },
  thermometer: { hotspot: [23, 49], rotate: 79, scale: 0.9 },
  otoscope: { hotspot: [58, 24], rotate: -8, flip: true, scale: 0.95 },
  bandage: { hotspot: [32, 32], rotate: 0, scale: 0.8 },
  pretendShot: { hotspot: [50, 53], rotate: 0, scale: 0.9 },
};

export function ToolSprite({ tool, at }: { tool: AnyToolId; at: Point }) {
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

export function DemoProp({ plush, tool, at }: { plush: PlushKind; tool: AnyToolId; at: Point }) {
  return (
    <g className="demo-prop">
      <ShapeList shapes={plushShapes(plush, [at[0], at[1] - 18], 0.7)} />
      <g className="demo-prop__tool">
        <ToolSprite tool={tool} at={[at[0] + 4, at[1] - 22]} />
      </g>
    </g>
  );
}

export function TargetRings({ points, pulse }: { points: Point[]; pulse: boolean }) {
  return (
    <g className={`target-rings${pulse ? ' is-pulsing' : ''}`} aria-hidden="true">
      {points.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="22" fill={C.white} fillOpacity="0.28" stroke={C.white} strokeWidth="4" strokeDasharray="7 6" />
          <circle r="22" fill="none" stroke={C.coral} strokeWidth="2" strokeDasharray="7 6" opacity="0.8" />
        </g>
      ))}
    </g>
  );
}
