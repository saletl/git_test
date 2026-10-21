import { plushShapes } from '../art/creature';
import { C } from '../art/palette';
import type { ActivityId } from '../game/types';
import { ShapeList } from '../characters/Creature';
import { CupArt, PinwheelArt, SillyGlassesArt } from '../tools/Items';
import { PretendShotArt, StethoscopeArt } from './ToolIcons';

/** Pictures for each patient's mini-adventures and the choices inside them. All drawn in a 64 x 64 box. */

type PicProps = { className?: string };

function Svg({ children, className, box = '0 0 64 64' }: { children: React.ReactNode; className?: string; box?: string }) {
  return (
    <svg viewBox={box} className={className} aria-hidden="true" focusable="false" overflow="visible">
      <g strokeLinecap="round" strokeLinejoin="round">{children}</g>
    </svg>
  );
}

export function JarArt({ fill = 0 }: { fill?: number }) {
  const shown = Math.min(fill, 6);
  const spots: [number, number][] = [
    [24, 48],
    [38, 50],
    [31, 40],
    [42, 38],
    [22, 36],
    [33, 29],
  ];
  return (
    <g>
      <rect x="18" y="8" width="28" height="7" rx="3" fill={C.coral} stroke={C.coralDeep} strokeWidth="2.4" />
      <path d="M16 18 C16 15 18 14 20 14 H44 C46 14 48 15 48 18 V52 C48 57 44 59 40 59 H24 C20 59 16 57 16 52 Z" fill={C.bluePale} fillOpacity="0.8" stroke={C.blueDeep} strokeWidth="2.6" />
      {spots.slice(0, shown).map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="6" fill={C.blueLight} fillOpacity="0.6" stroke={C.blue} strokeWidth="1.6" />
          <circle cx={x - 2} cy={y - 2} r="1.6" fill={C.white} />
        </g>
      ))}
      <path d="M21 22 V48" stroke={C.white} strokeWidth="3" opacity="0.7" />
    </g>
  );
}

function Bubble({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={C.blueLight} fillOpacity="0.45" stroke={C.blue} strokeWidth="1.8" />
      <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.22} fill={C.white} />
    </g>
  );
}

export function ScarfArt({ color = C.coral }: { color?: string }) {
  return (
    <g>
      <path d="M8 26 C20 20 44 20 56 26 L56 36 C44 30 20 30 8 36 Z" fill={color} stroke={C.ink} strokeWidth="2.2" />
      <path d="M40 30 L44 56 L52 54 L50 30 Z" fill={color} stroke={C.ink} strokeWidth="2.2" />
      <path d="M18 25 L20 33 M30 23 L31 31 M42 24 L42 32" stroke={C.white} strokeWidth="2.6" opacity="0.7" />
      <path d="M44 56 L45 61 M48 55 L49 60 M51 54 L53 59" stroke={C.ink} strokeWidth="1.8" />
    </g>
  );
}

export function BeanieArt() {
  return (
    <g>
      <path d="M12 44 C12 24 22 14 32 14 C42 14 52 24 52 44 Z" fill={C.berry} stroke={C.ink} strokeWidth="2.4" />
      <path d="M20 26 C28 22 36 22 44 26" fill="none" stroke={C.berryLight} strokeWidth="3" />
      <rect x="9" y="40" width="46" height="12" rx="6" fill={C.gold} stroke={C.ink} strokeWidth="2.4" />
      <circle cx="32" cy="11" r="7" fill={C.paper} stroke={C.ink} strokeWidth="2.4" />
    </g>
  );
}

export function EarmuffsArt() {
  return (
    <g>
      <path d="M14 38 C14 14 50 14 50 38" fill="none" stroke={C.blueDeep} strokeWidth="5" />
      <ellipse cx="14" cy="42" rx="9" ry="11" fill={C.berryLight} stroke={C.berry} strokeWidth="2.6" />
      <ellipse cx="50" cy="42" rx="9" ry="11" fill={C.berryLight} stroke={C.berry} strokeWidth="2.6" />
    </g>
  );
}

export function BlanketArt() {
  return (
    <g>
      <path d="M8 18 H56 V50 C46 56 18 56 8 50 Z" fill={C.mintLight} stroke={C.mintDeep} strokeWidth="2.6" />
      <path d="M8 30 H56 M8 42 H56 M24 18 V54 M40 18 V54" stroke={C.mint} strokeWidth="3" opacity="0.8" />
      <path d="M8 50 L6 56 M16 53 L15 59 M48 53 L49 59 M56 50 L58 56" stroke={C.mintDeep} strokeWidth="2" />
    </g>
  );
}

export function TissueBoxArt() {
  return (
    <g>
      <rect x="10" y="28" width="44" height="28" rx="5" fill={C.blueLight} stroke={C.blueDeep} strokeWidth="2.6" />
      <path d="M18 42 C24 38 28 46 34 42 C40 38 44 46 48 42" fill="none" stroke={C.white} strokeWidth="2.6" />
      <path d="M22 28 C22 18 28 10 32 8 C36 12 42 18 42 28 Z" fill={C.white} stroke={C.blueDeep} strokeWidth="2.4" />
    </g>
  );
}

export function TrumpetArt() {
  return (
    <g>
      <path d="M8 30 H34 L52 18 V46 L34 34 H8 Z" fill={C.gold} stroke={C.goldDeep} strokeWidth="2.6" />
      <rect x="16" y="22" width="5" height="8" rx="2" fill={C.goldDeep} />
      <rect x="24" y="22" width="5" height="8" rx="2" fill={C.goldDeep} />
      <ellipse cx="52" cy="32" rx="4" ry="14" fill={C.goldLight} stroke={C.goldDeep} strokeWidth="2.4" />
      <rect x="4" y="28" width="6" height="8" rx="2" fill={C.goldDeep} />
    </g>
  );
}

export function DuckArt() {
  return (
    <g>
      <ellipse cx="30" cy="42" rx="22" ry="13" fill={C.gold} stroke={C.goldDeep} strokeWidth="2.6" />
      <circle cx="40" cy="24" r="11" fill={C.gold} stroke={C.goldDeep} strokeWidth="2.6" />
      <path d="M50 24 L60 27 L50 30 Z" fill={C.coral} stroke={C.coralDeep} strokeWidth="2" />
      <circle cx="43" cy="21" r="2.2" fill={C.ink} />
      <path d="M16 40 C22 46 30 46 34 42" fill="none" stroke={C.goldDeep} strokeWidth="2.4" />
    </g>
  );
}

export function SqueakyArt() {
  return (
    <g>
      <path d="M32 8 C40 8 44 16 42 22 C50 22 56 28 54 36 C52 44 42 44 40 40 C40 50 34 56 28 54 C20 52 20 44 22 40 C14 44 6 40 8 32 C10 24 18 22 22 24 C20 16 24 8 32 8 Z" fill={C.berryLight} stroke={C.berry} strokeWidth="2.6" />
      <circle cx="26" cy="28" r="2.6" fill={C.ink} />
      <circle cx="38" cy="28" r="2.6" fill={C.ink} />
      <path d="M27 36 C30 40 34 40 37 36" fill="none" stroke={C.ink} strokeWidth="2.4" />
    </g>
  );
}

export function SockArt() {
  return (
    <g transform="rotate(-20 32 32)">
      <path d="M20 6 H38 V34 C38 40 44 42 50 42 C58 42 60 54 52 58 H26 C20 58 20 50 20 46 Z" fill={C.paper} stroke={C.coralDeep} strokeWidth="2.6" />
      <rect x="20" y="16" width="18" height="6" fill={C.coral} />
      <rect x="20" y="26" width="18" height="6" fill={C.gold} />
      <path d="M40 42 C48 42 52 46 52 58 H38 C36 52 36 46 40 42 Z" fill={C.coral} />
      <rect x="18" y="3" width="22" height="7" rx="3" fill={C.cream} stroke={C.coralDeep} strokeWidth="2.4" />
    </g>
  );
}

export function PartyHatArt() {
  return (
    <g>
      <path d="M16 54 L32 8 L48 54 Z" fill={C.blueLight} stroke={C.blueDeep} strokeWidth="2.6" />
      <path d="M22 40 C30 37 36 37 43 40" fill="none" stroke={C.coral} strokeWidth="3.4" />
      <path d="M26 26 C30 24 34 24 38 26" fill="none" stroke={C.gold} strokeWidth="3.4" />
      <circle cx="32" cy="8" r="6" fill={C.berry} stroke={C.ink} strokeWidth="2" />
    </g>
  );
}

export function CrownArt() {
  return (
    <g>
      <path d="M10 50 L8 18 L22 32 L32 12 L42 32 L56 18 L54 50 Z" fill={C.gold} stroke={C.goldDeep} strokeWidth="2.6" />
      <circle cx="32" cy="40" r="5" fill={C.berry} />
      <circle cx="18" cy="42" r="3.4" fill={C.blue} />
      <circle cx="46" cy="42" r="3.4" fill={C.mint} />
    </g>
  );
}

export function BowArt() {
  return (
    <g>
      <path d="M32 32 L8 16 L8 48 Z" fill={C.coral} stroke={C.coralDeep} strokeWidth="2.6" />
      <path d="M32 32 L56 16 L56 48 Z" fill={C.coral} stroke={C.coralDeep} strokeWidth="2.6" />
      <ellipse cx="32" cy="32" rx="7" ry="8" fill={C.berry} stroke={C.coralDeep} strokeWidth="2.4" />
    </g>
  );
}

function MysteryArt() {
  return (
    <g>
      <circle cx="32" cy="34" r="22" fill={C.lilacLight} stroke={C.lilacDeep} strokeWidth="2.6" />
      <path d="M25 27 C25 19 39 19 39 27 C39 33 32 33 32 40" fill="none" stroke={C.lilacDeep} strokeWidth="4.4" />
      <circle cx="32" cy="47" r="2.8" fill={C.lilacDeep} />
      <g fill={C.blueDeep}>
        <ellipse cx="52" cy="14" rx="4" ry="3" transform="rotate(-20 52 14)" />
        <rect x="54.5" y="2" width="2.4" height="12" rx="1.2" />
      </g>
      <g fill={C.coral}>
        <ellipse cx="9" cy="18" rx="4" ry="3" transform="rotate(-20 9 18)" />
        <rect x="11.5" y="6" width="2.4" height="12" rx="1.2" />
      </g>
    </g>
  );
}

function PlanArt() {
  return (
    <g>
      <rect x="10" y="8" width="44" height="52" rx="6" fill={C.wood} stroke={C.woodDeep} strokeWidth="2.6" />
      <rect x="15" y="15" width="34" height="40" rx="3" fill={C.white} />
      <rect x="24" y="4" width="16" height="9" rx="3" fill={C.blueDeep} />
      <path d="M22 26 C20 24 17 25 17 28 C17 31 22 34 22 34 C22 34 27 31 27 28 C27 25 24 24 22 26 Z" fill={C.berry} />
      <path d="M31 28 H44" stroke={C.inkSoft} strokeWidth="2.4" />
      <g fill={C.blueDeep}>
        <ellipse cx="20" cy="45" rx="3.4" ry="2.6" transform="rotate(-20 20 45)" />
        <rect x="22" y="36" width="2" height="9" rx="1" />
      </g>
      <path d="M31 44 H42" stroke={C.inkSoft} strokeWidth="2.4" />
    </g>
  );
}

/** Picture for each mini-adventure button. */
export function ActivityArt({ id, className }: { id: ActivityId; className?: string }) {
  switch (id) {
    case 'bubbles':
      return (
        <Svg className={className}>
          <JarArt fill={3} />
          <Bubble x={52} y={12} r={7} />
          <Bubble x={10} y={22} r={5} />
        </Svg>
      );
    case 'hiccupHelper':
      return (
        <Svg className={className}>
          <g transform="translate(20 38) scale(0.85)">
            <CupArt />
          </g>
          <g transform="translate(46 26) scale(0.6)">
            <PinwheelArt />
          </g>
          <g transform="translate(32 10) scale(0.55)">
            <SillyGlassesArt />
          </g>
        </Svg>
      );
    case 'wardrobe':
      return (
        <Svg className={className}>
          <g transform="translate(0 12) scale(0.9)">
            <ScarfArt />
          </g>
          <g transform="translate(30 -2) scale(0.55)">
            <BeanieArt />
          </g>
        </Svg>
      );
    case 'tissue':
      return (
        <Svg className={className}>
          <TissueBoxArt />
        </Svg>
      );
    case 'bunnyCheck':
      return (
        <Svg className={className}>
          <ShapeList shapes={plushShapes('bunny', [26, 40], 0.62)} />
          <g transform="translate(30 18) scale(0.55)">
            <StethoscopeArt />
          </g>
        </Svg>
      );
    case 'comfortPlan':
      return (
        <Svg className={className}>
          <PlanArt />
        </Svg>
      );
    case 'pretendShot':
      return (
        <Svg className={className}>
          <g transform="translate(4 2) scale(0.8)">
            <PretendShotArt />
          </g>
          <g transform="translate(40 46) rotate(-25) scale(0.5)">
            <rect x="-26" y="-8" width="52" height="16" rx="8" fill={C.berryLight} stroke={C.berry} strokeWidth="3" />
            <rect x="-8" y="-6.5" width="16" height="13" rx="3" fill={C.paper} />
          </g>
        </Svg>
      );
    case 'soundMystery':
      return (
        <Svg className={className}>
          <MysteryArt />
        </Svg>
      );
    case 'sockRescue':
      return (
        <Svg className={className}>
          <g transform="translate(-4 8) scale(0.85)">
            <SockArt />
          </g>
          <g transform="translate(30 -2) scale(0.55)">
            <PartyHatArt />
          </g>
        </Svg>
      );
  }
}

export function Pic({ children, className, box }: PicProps & { children: React.ReactNode; box?: string }) {
  return (
    <Svg className={className} box={box}>
      {children}
    </Svg>
  );
}

