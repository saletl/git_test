import { C } from '../art/palette';
import type { GaugeReading, LensDiscovery, LookTarget, PopupSpec } from '../game/types';

/**
 * The thermometer gauge and the magnified ear view. Both are purely pictures:
 * no numbers, no diagnoses, and every reading ends with a smiling "all good" face.
 */

const GAUGE_LIQUID: Record<GaugeReading, string> = {
  cozy: C.coral,
  chilly: C.blue,
  toasty: C.coral,
  wiggly: C.lilac,
  gentle: C.berry,
};

function GaugeIcon({ reading }: { reading: GaugeReading }) {
  switch (reading) {
    case 'chilly':
      return (
        <g stroke={C.blueDeep} strokeWidth={4} strokeLinecap="round">
          <path d="M0 -16 V16 M-14 -8 L14 8 M-14 8 L14 -8" />
        </g>
      );
    case 'toasty':
      return (
        <g>
          <path d="M0 -20 C12 -6 14 4 9 11 C5 16 -5 16 -9 11 C-14 4 -10 -6 0 -20 Z" fill={C.coral} />
          <path d="M0 -6 C6 1 6 6 3.5 9 C1 11 -2 11 -3.5 9 C-6 6 -5 1 0 -6 Z" fill={C.goldLight} />
        </g>
      );
    case 'gentle':
      return (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={0} cy={-9} rx={6} ry={9} fill={C.berryLight} stroke={C.berry} strokeWidth={1.6} transform={`rotate(${a})`} />
          ))}
          <circle r={6} fill={C.gold} />
        </g>
      );
    default:
      return (
        <g>
          <circle r={14} fill={C.gold} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <path key={a} d="M0 -18 V-23" stroke={C.goldDeep} strokeWidth={3.4} strokeLinecap="round" transform={`rotate(${a})`} />
          ))}
        </g>
      );
  }
}

export function GaugePopup({ reading }: { reading: GaugeReading }) {
  return (
    <svg viewBox="0 0 120 300" className={`gauge gauge--${reading}`} aria-hidden="true" focusable="false">
      <rect x="6" y="6" width="108" height="288" rx="30" fill={C.paper} stroke={C.creamDeep} strokeWidth="4" />
      <rect x="44" y="30" width="32" height="200" rx="16" fill={C.white} stroke={C.blueDeep} strokeWidth="5" />
      <g className="gauge-liquid-clip">
        <rect className="gauge-liquid" x="52" y="40" width="16" height="190" rx="8" fill={GAUGE_LIQUID[reading]} />
      </g>
      <circle cx="60" cy="246" r="26" fill={GAUGE_LIQUID[reading]} stroke={C.blueDeep} strokeWidth="5" />
      <circle cx="51" cy="238" r="6" fill={C.white} opacity="0.7" />
      {[70, 100, 130, 160, 190].map((y) => (
        <path key={y} d={`M80 ${y} H90`} stroke={C.blueDeep} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      ))}
      <g className="gauge-icon" transform="translate(60 246)">
        <GaugeIcon reading={reading} />
      </g>
      <g className="gauge-happy" transform="translate(92 34)">
        <circle r="16" fill={C.mint} stroke={C.mintDeep} strokeWidth="3" />
        <circle cx="-5" cy="-3" r="2.2" fill={C.ink} />
        <circle cx="5" cy="-3" r="2.2" fill={C.ink} />
        <path d="M-6 4 C-3 8 3 8 6 4" fill="none" stroke={C.ink} strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Discovery({ kind }: { kind: LensDiscovery }) {
  switch (kind) {
    case 'sparkle':
      return (
        <g className="disc disc-glow">
          <circle r="40" fill={C.goldLight} opacity="0.45" />
          <path d="M0 -34 C4 -8 8 -4 34 0 C8 4 4 8 0 34 C-4 8 -8 4 -34 0 C-8 -4 -4 -8 0 -34 Z" fill={C.gold} />
          <circle r="7" fill={C.white} opacity="0.9" />
        </g>
      );
    case 'heartSparkle':
      return (
        <g className="disc disc-glow">
          <circle r="42" fill={C.berryLight} opacity="0.45" />
          <path d="M0 26 C-22 12 -30 -2 -24 -14 C-18 -26 -4 -26 0 -14 C4 -26 18 -26 24 -14 C30 -2 22 12 0 26 Z" fill={C.berry} stroke={C.white} strokeWidth="3" />
          <path d="M30 -30 L33 -22 L41 -20 L33 -17 L30 -9 L27 -17 L19 -20 L27 -22 Z" fill={C.gold} />
        </g>
      );
    case 'snowman':
      return (
        <g className="disc disc-bob">
          <circle cy="16" r="22" fill={C.white} stroke={C.blueDeep} strokeWidth="3" />
          <circle cy="-18" r="15" fill={C.white} stroke={C.blueDeep} strokeWidth="3" />
          <circle cx="-5" cy="-21" r="2.4" fill={C.ink} />
          <circle cx="5" cy="-21" r="2.4" fill={C.ink} />
          <path d="M0 -16 L12 -13 L0 -12 Z" fill={C.coral} />
          <path d="M-12 -5 C-4 0 4 0 12 -5" stroke={C.berry} strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cy="10" r="2.4" fill={C.blueDeep} />
          <circle cy="20" r="2.4" fill={C.blueDeep} />
          <g className="disc-wave">
            <path d="M20 8 L40 -10 M34 -5 L40 -16" stroke={C.woodDeep} strokeWidth="3.4" strokeLinecap="round" />
          </g>
        </g>
      );
    case 'snowflake':
      return (
        <g className="disc disc-spin" stroke={C.blueDeep} strokeWidth="5" strokeLinecap="round">
          <path d="M0 -34 V34 M-29 -17 L29 17 M-29 17 L29 -17" />
          <path d="M-8 -26 L0 -18 L8 -26 M-8 26 L0 18 L8 26 M-26 -4 L-17 -10 M26 4 L17 10 M-26 4 L-17 10 M26 -4 L17 -10" />
        </g>
      );
    case 'flower':
      return (
        <g className="disc disc-bloom">
          <path d="M0 40 C-2 26 2 14 0 4" stroke={C.forest} strokeWidth="4" fill="none" strokeLinecap="round" />
          <ellipse cx="-12" cy="30" rx="9" ry="5" fill={C.sage} transform="rotate(-30 -12 30)" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-12" rx="9" ry="14" fill={C.berryLight} stroke={C.berry} strokeWidth="2" transform={`translate(0 -6) rotate(${a})`} />
          ))}
          <circle cy="-6" r="9" fill={C.gold} stroke={C.goldDeep} strokeWidth="2" />
        </g>
      );
    case 'note':
      return (
        <g className="disc disc-bob" fill={C.blueDeep}>
          <ellipse cx="-10" cy="22" rx="14" ry="10" transform="rotate(-20 -10 22)" />
          <rect x="1" y="-30" width="6" height="52" rx="3" />
          <path d="M3 -30 C20 -26 26 -14 20 -2 C20 -14 12 -17 5 -19 Z" />
        </g>
      );
    case 'duck':
      return (
        <g className="disc disc-bob">
          <ellipse cy="14" rx="30" ry="18" fill={C.gold} stroke={C.goldDeep} strokeWidth="3" />
          <circle cx="12" cy="-12" r="16" fill={C.gold} stroke={C.goldDeep} strokeWidth="3" />
          <path d="M26 -12 L42 -8 L26 -3 Z" fill={C.coral} stroke={C.coralDeep} strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="16" cy="-16" r="3" fill={C.ink} />
          <path d="M-14 8 C-6 16 6 16 12 10" fill="none" stroke={C.goldDeep} strokeWidth="3" strokeLinecap="round" />
          <path d="M-30 4 C-36 -2 -38 -8 -34 -12" fill="none" stroke={C.goldDeep} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'tinySock':
      return (
        <g className="disc disc-wiggle" transform="rotate(-10)">
          <path d="M-14 -30 H8 V8 C8 14 14 18 22 18 C30 18 32 30 24 34 H-6 C-12 34 -14 28 -14 22 Z" fill={C.paper} stroke={C.coralDeep} strokeWidth="3" strokeLinejoin="round" />
          <rect x="-14" y="-18" width="22" height="7" fill={C.coral} />
          <rect x="-14" y="-6" width="22" height="7" fill={C.gold} />
          <path d="M10 18 C20 18 26 22 24 34 H8 C6 28 6 22 10 18 Z" fill={C.coral} />
          <rect x="-16" y="-34" width="26" height="8" rx="3" fill={C.cream} stroke={C.coralDeep} strokeWidth="3" />
        </g>
      );
    case 'campfire':
      return (
        <g className="disc disc-flicker">
          <circle cy="0" r="44" fill={C.goldLight} opacity="0.35" />
          <path d="M-28 26 L22 12 M-22 12 L28 26" stroke={C.woodDeep} strokeWidth="9" strokeLinecap="round" />
          <path d="M0 -30 C16 -12 18 2 12 12 C7 19 -7 19 -12 12 C-18 2 -14 -12 0 -30 Z" fill={C.coral} stroke={C.coralDeep} strokeWidth="2.4" />
          <path d="M0 -10 C7 -2 7 5 4 9 C2 12 -2 12 -4 9 C-7 5 -6 -2 0 -10 Z" fill={C.goldLight} />
          <circle cx="-20" cy="-24" r="2.4" fill={C.gold} />
          <circle cx="22" cy="-18" r="2" fill={C.gold} />
        </g>
      );
    case 'iceberg':
      return (
        <g className="disc disc-bob">
          <path d="M-46 14 C-30 10 -18 18 0 14 C18 10 30 18 46 14" fill="none" stroke={C.blue} strokeWidth="4" strokeLinecap="round" />
          <path d="M-30 14 L-14 -26 L0 -12 L10 -32 L30 14 Z" fill={C.white} stroke={C.blueDeep} strokeWidth="3" strokeLinejoin="round" />
          <path d="M-14 -26 L-8 -6 L0 -12" fill="none" stroke={C.blueLight} strokeWidth="2.4" />
          <g transform="translate(20 30)">
            <path d="M10 0 L18 -7 L18 7 Z" fill={C.coral} stroke={C.coralDeep} strokeWidth="1.8" strokeLinejoin="round" />
            <ellipse rx="12" ry="7" fill={C.gold} stroke={C.goldDeep} strokeWidth="2" />
            <circle cx="-5" cy="-1.5" r="1.8" fill={C.ink} />
          </g>
        </g>
      );
    case 'disco':
      return (
        <g className="disc disc-spin">
          <path d="M0 -44 V-30" stroke={C.inkSoft} strokeWidth="2.4" />
          <circle r="30" fill={C.lilacLight} stroke={C.lilacDeep} strokeWidth="3" />
          <path d="M-30 0 H30 M0 -30 V30 M-21 -21 L21 21 M-21 21 L21 -21" stroke={C.white} strokeWidth="2" opacity="0.8" />
          <circle cx="-10" cy="-12" r="5" fill={C.white} opacity="0.85" />
          <path d="M36 -30 L39 -22 L47 -20 L39 -17 L36 -9 L33 -17 L25 -20 L33 -22 Z" fill={C.gold} />
          <path d="M-38 18 L-36 23 L-31 24 L-36 26 L-38 31 L-40 26 L-45 24 L-40 23 Z" fill={C.berry} />
        </g>
      );
    case 'carrot':
      return (
        <g className="disc disc-wiggle" transform="rotate(20)">
          <path d="M-6 -26 C-14 -40 -4 -42 0 -30 C4 -42 14 -40 6 -26" fill={C.mint} stroke={C.mintDeep} strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M-12 -26 C-4 -30 4 -30 12 -26 L2 32 C1 36 -1 36 -2 32 Z" fill={C.coral} stroke={C.coralDeep} strokeWidth="3" strokeLinejoin="round" />
          <path d="M-8 -12 L-2 -12 M4 0 L-4 0 M-4 12 L2 12" stroke={C.coralDeep} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      );
  }
}

function EarBackdrop() {
  return (
    <>
      <circle r="100" fill="#f3c3a6" />
      <circle r="78" fill="#f6cfb6" />
      <circle r="56" fill="#f9dccb" />
      <circle r="34" fill="#fbe8dc" />
    </>
  );
}

/** A cartoon open mouth: clearly pretend, nothing realistic. */
function ThroatBackdrop() {
  return (
    <>
      <circle r="100" fill="#f7c9c0" />
      <ellipse cy="4" rx="80" ry="70" fill="#b8525f" />
      <ellipse cy="-6" rx="62" ry="50" fill="#9e4352" />
      <path d="M-70 -34 C-40 -62 40 -62 70 -34 L70 -48 C40 -78 -40 -78 -70 -48 Z" fill={C.white} opacity="0.9" />
      <path d="M-62 46 C-30 22 30 22 62 46 C40 70 -40 70 -62 46 Z" fill="#f08a8a" stroke="#d86f74" strokeWidth="3" />
      <path d="M0 34 V58" stroke="#d86f74" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

export function LensPopup({ discovery, view = 'ear' }: { discovery: LensDiscovery; view?: LookTarget }) {
  return (
    <svg viewBox="-110 -110 220 220" className={`lens lens--${view}`} aria-hidden="true" focusable="false">
      {view === 'throat' ? <ThroatBackdrop /> : <EarBackdrop />}
      <path d="M-60 -50 C-30 -70 30 -70 60 -40" stroke={C.white} strokeWidth="6" opacity="0.25" fill="none" strokeLinecap="round" />
      <g className="lens-discovery">
        <Discovery kind={discovery} />
      </g>
      <circle r="100" fill="none" stroke={C.blueDeep} strokeWidth="12" />
      <circle r="106" fill="none" stroke="#3f5f78" strokeWidth="3" />
      <path d="M-72 -46 C-60 -70 -36 -84 -10 -88" stroke={C.white} strokeWidth="7" opacity="0.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Popup({ spec }: { spec: PopupSpec }) {
  return spec.kind === 'gauge' ? <GaugePopup reading={spec.reading} /> : <LensPopup discovery={spec.discovery} view={spec.view} />;
}
