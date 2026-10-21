import { memo, type CSSProperties } from 'react';
import { C } from '../art/palette';
import type { EffectKind } from '../game/types';

/** A short-lived particle effect, positioned in a patient's 240 x 240 space. */
export interface ActiveEffect {
  id: number;
  kind: EffectKind;
  x: number;
  y: number;
  count: number;
  size: number;
}

export const EFFECT_LIFETIME: Record<EffectKind, number> = {
  bubble: 2600,
  heartBubble: 3200,
  heart: 1800,
  note: 2000,
  sparkle: 1200,
  star: 1200,
  scarf: 1900,
  snowflake: 2200,
  rumble: 1100,
  pulse: 1400,
  puff: 1000,
  question: 1500,
  zzz: 1800,
  flame: 1100,
  pinch: 700,
};

const NOTE_COLORS = [C.coral, C.blueDeep, C.goldDeep, C.berry];

function particleStyle(i: number, count: number, kind: EffectKind): CSSProperties {
  const spread = count > 1 ? (i / (count - 1) - 0.5) * 2 : 0;
  const wobble = ((i * 37) % 11) / 11 - 0.5;
  const vars: Record<string, string> = {
    '--dx': String(Math.round(spread * (kind === 'bubble' ? 34 : 26) + wobble * 14)),
    '--dy': String(Math.round(-70 - ((i * 23) % 30))),
    '--delay': `${i * (kind === 'bubble' ? 160 : 110)}ms`,
    '--rot': `${Math.round(spread * 30 + wobble * 20)}deg`,
  };
  return vars as CSSProperties;
}

function Particle({ kind, index, size }: { kind: EffectKind; index: number; size: number }) {
  switch (kind) {
    case 'bubble': {
      const r = 9 * size * (1 + (index % 3) * 0.18);
      return (
        <g>
          <circle r={r} fill={C.blueLight} fillOpacity={0.45} stroke={C.blue} strokeWidth={1.6} />
          <ellipse cx={-r * 0.35} cy={-r * 0.38} rx={r * 0.3} ry={r * 0.18} fill={C.white} opacity={0.9} transform={`rotate(-35 ${-r * 0.35} ${-r * 0.38})`} />
        </g>
      );
    }
    case 'heartBubble':
      return (
        <g>
          <path
            d="M0 34 C-30 14 -40 -4 -32 -18 C-24 -32 -6 -32 0 -16 C6 -32 24 -32 32 -18 C40 -4 30 14 0 34 Z"
            fill={C.berryLight}
            fillOpacity={0.5}
            stroke={C.berry}
            strokeWidth={2.4}
          />
          <ellipse cx={-16} cy={-14} rx={8} ry={4} fill={C.white} opacity={0.85} transform="rotate(-35 -16 -14)" />
        </g>
      );
    case 'heart':
      return (
        <path
          d="M0 9 C-8 4 -11 -1 -9 -5 C-7 -9 -2 -9 0 -5 C2 -9 7 -9 9 -5 C11 -1 8 4 0 9 Z"
          fill={index % 2 ? C.coral : C.berry}
          transform={`scale(${size})`}
        />
      );
    case 'note':
      return (
        <g transform={`scale(${size})`} fill={NOTE_COLORS[index % NOTE_COLORS.length]}>
          <ellipse cx={-3} cy={6} rx={5.5} ry={4.2} transform="rotate(-20 -3 6)" />
          <rect x={1.4} y={-12} width={2.6} height={18} rx={1.2} />
          <path d="M2 -12 C8 -10 10 -6 8 -2 C8 -6 5 -7 3 -8 Z" />
        </g>
      );
    case 'sparkle':
      return (
        <path d="M0 -12 C1.5 -3 3 -1.5 12 0 C3 1.5 1.5 3 0 12 C-1.5 3 -3 1.5 -12 0 C-3 -1.5 -1.5 -3 0 -12 Z" fill={C.gold} transform={`scale(${size})`} />
      );
    case 'star':
      return (
        <path
          d="M0 -11 L3.2 -3.6 L11 -3.2 L5 2 L7 10 L0 5.6 L-7 10 L-5 2 L-11 -3.2 L-3.2 -3.6 Z"
          fill={C.gold}
          stroke={C.goldDeep}
          strokeWidth={1.4}
          strokeLinejoin="round"
          transform={`scale(${size})`}
        />
      );
    case 'scarf':
      return (
        <g>
          <path d="M-34 -6 C-20 -14 -6 2 8 -6 C20 -13 30 -6 36 -4 L36 8 C28 6 20 0 8 6 C-6 14 -20 -2 -34 6 Z" fill={C.coral} stroke={C.ink} strokeWidth={2} strokeLinejoin="round" />
          <path d="M-20 -6 L-17 6 M-4 -2 L-1 9 M12 -5 L15 5 M26 -6 L28 4" stroke="#f8b8a6" strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    case 'snowflake':
      return (
        <g stroke={C.blueDeep} strokeWidth={2.2} strokeLinecap="round" transform={`scale(${size})`}>
          <path d="M0 -10 V10 M-8.7 -5 L8.7 5 M-8.7 5 L8.7 -5" />
          <path d="M-2.5 -7.5 L0 -5 L2.5 -7.5 M-2.5 7.5 L0 5 L2.5 7.5" />
        </g>
      );
    case 'rumble':
      return (
        <g fill="none" stroke={C.lilacDeep} strokeWidth={3} strokeLinecap="round">
          <path d="M-58 -14 C-64 -4 -64 6 -58 16" />
          <path d="M-68 -20 C-76 -6 -76 10 -68 22" opacity={0.6} />
          <path d="M58 -14 C64 -4 64 6 58 16" />
          <path d="M68 -20 C76 -6 76 10 68 22" opacity={0.6} />
        </g>
      );
    case 'pulse':
      return (
        <g transform={`scale(${size})`}>
          <circle r={22} fill="none" stroke={C.berry} strokeWidth={3} className="fx-ring" />
          <path d="M0 13 C-12 6 -16 -1 -13 -7 C-10 -13 -3 -13 0 -7 C3 -13 10 -13 13 -7 C16 -1 12 6 0 13 Z" fill={C.berry} stroke={C.white} strokeWidth={2} className="fx-beat" />
        </g>
      );
    case 'puff':
      return (
        <g fill={C.white} stroke={C.blueLight} strokeWidth={1.5}>
          <circle cx={-8} cy={2} r={8} />
          <circle cx={6} cy={-2} r={10} />
          <circle cx={14} cy={6} r={6} />
        </g>
      );
    case 'question':
      return (
        <g>
          <circle r={16} fill={C.white} stroke={C.blueDeep} strokeWidth={2.4} />
          <path d="M-5 -5 C-5 -11 5 -11 5 -5 C5 -1 0 0 0 4" fill="none" stroke={C.blueDeep} strokeWidth={3.4} strokeLinecap="round" />
          <circle cy={9.5} r={2.2} fill={C.blueDeep} />
        </g>
      );
    case 'zzz':
      return (
        <path d="M-6 -6 H6 L-6 6 H6" fill="none" stroke={C.blueDeep} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" transform={`scale(${1 - index * 0.2})`} />
      );
    case 'flame':
      return (
        <g>
          <path d="M0 -18 C10 -6 12 2 8 9 C5 14 -5 14 -8 9 C-12 2 -8 -6 0 -18 Z" fill={C.coral} />
          <path d="M0 -6 C5 0 5 5 3 8 C1 10 -2 10 -3 8 C-5 5 -4 0 0 -6 Z" fill={C.goldLight} />
        </g>
      );
    case 'pinch':
      return (
        <g stroke={C.goldDeep} strokeWidth={3} strokeLinecap="round">
          <path d="M0 -14 V-6 M0 6 V14 M-14 0 H-6 M6 0 H14 M-10 -10 L-5 -5 M5 5 L10 10 M10 -10 L5 -5 M-5 5 L-10 10" />
        </g>
      );
  }
}

export const EffectsLayer = memo(function EffectsLayer({ effects }: { effects: ActiveEffect[] }) {
  return (
    <g className="fx-layer" aria-hidden="true">
      {effects.map((fx) => (
        <g key={fx.id} transform={`translate(${fx.x} ${fx.y})`}>
          {Array.from({ length: fx.count }, (_, i) => (
            <g key={i} className={`fx fx-${fx.kind}`} style={particleStyle(i, fx.count, fx.kind)}>
              <Particle kind={fx.kind} index={i} size={fx.size} />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
});
