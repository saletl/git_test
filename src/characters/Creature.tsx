import { memo, useMemo } from 'react';
import type { CreatureArtist, CreatureProps } from '../art/creature';
import type { Expression, Look } from '../art/face';
import type { Shape } from '../art/shapes';

export interface ExtraShapes {
  /** Which named part to attach to, so a nose bandage moves with the head. */
  part: string;
  shapes: Shape[];
}

export interface CreatureViewProps {
  artist: CreatureArtist;
  expression: Expression;
  look?: Look;
  props?: CreatureProps;
  /** CSS animation name, applied as `act-<name>` on the root group. */
  action?: string | null;
  /** Changing this restarts the action animation. */
  actionKey?: number;
  extras?: ExtraShapes[];
  className?: string;
  /** Idle breathing and blinking. Turned off in calm mode via CSS. */
  idle?: boolean;
}

export const ShapeList = memo(function ShapeList({ shapes }: { shapes: readonly Shape[] }) {
  return (
    <>
      {shapes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          fill={s.fill ?? 'none'}
          stroke={s.stroke}
          strokeWidth={s.sw}
          opacity={s.op}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </>
  );
});

const EMPTY: CreatureProps = {};

/** Layers that move together with the head when it tilts or nods. */
const FACE_PARTS = new Set(['cheeks', 'eyes', 'brows', 'mouth', 'whiskers', 'glasses']);

export const Creature = memo(function Creature({
  artist,
  expression,
  look,
  props = EMPTY,
  action,
  actionKey = 0,
  extras,
  className,
  idle = true,
}: CreatureViewProps) {
  const art = useMemo(() => artist.draw(expression, look, props), [artist, expression, look, props]);
  const headPivot = art.layers.find((l) => l.part === 'head')?.pivot ?? [120, 140];
  const style = { '--hx': `${headPivot[0]}px`, '--hy': `${headPivot[1]}px` } as React.CSSProperties;
  return (
    <svg
      viewBox="0 0 240 240"
      className={`creature${idle ? ' creature--idle' : ''}${className ? ` ${className}` : ''}`}
      style={style}
      aria-hidden="true"
      focusable="false"
      overflow="visible"
    >
      <g key={actionKey} className={`ch-root${action ? ` act-${action}` : ''}`}>
        {art.layers.map((layer) => {
          const attached = extras?.filter((e) => e.part === layer.part);
          const face = FACE_PARTS.has(layer.part) ? ' ch-face' : '';
          const content = (
            <>
              <ShapeList shapes={layer.shapes} />
              {attached?.map((e, i) => <ShapeList key={i} shapes={e.shapes} />)}
            </>
          );
          return (
            <g
              key={layer.part}
              className={`ch-${layer.part}${face}`}
              style={layer.pivot ? { transformOrigin: `${layer.pivot[0]}px ${layer.pivot[1]}px` } : undefined}
            >
              {layer.part === 'eyes' && art.eyesOpen ? <g className="ch-blink">{content}</g> : content}
            </g>
          );
        })}
      </g>
    </svg>
  );
});
