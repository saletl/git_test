import { memo } from 'react';
import { C } from '../art/palette';
import { hamsterArt } from '../art/hamster';
import { Creature } from '../characters/Creature';
import type { Expression } from '../art/face';

/**
 * The waiting room, drawn in a 400 x 660 core area (the SVG shows a little extra on wide screens).
 * Interactive pieces take simple state props so the screen can make them react.
 */

export const WR_VIEWBOX = '-80 -20 560 700';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const WR_SPOTS = {
  door: { x: 16, y: 92, w: 112, h: 246 },
  clock: { x: 164, y: 10, w: 72, h: 124 },
  bell: { x: 346, y: 160, w: 54, h: 46 },
  hamster: { x: 262, y: 118, w: 92, h: 82 },
  plant: { x: 222, y: 100, w: 46, h: 100 },
  tank: { x: 134, y: 208, w: 82, h: 74 },
  magazine: { x: 344, y: 356, w: 56, h: 70 },
  eyeChart: { x: 0, y: 0, w: 0, h: 0 },
} satisfies Record<string, Rect>;

export const WR_PATIENT_BOXES: Rect[] = [
  { x: 26, y: 290, w: 150, h: 150 },
  { x: 172, y: 290, w: 150, h: 150 },
  { x: 28, y: 460, w: 168, h: 168 },
  { x: 204, y: 458, w: 176, h: 176 },
];

/** Where patients walk to when they go to the exam room. */
export const WR_DOOR_POINT = { x: 70, y: 280 };

export const WaitingRoomBackdrop = memo(function WaitingRoomBackdrop() {
  return (
    <g>
      <defs>
        <pattern id="wr-dots" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="2.2" fill={C.sagePale} />
          <circle cx="21" cy="21" r="2.2" fill={C.peachLight} />
        </pattern>
      </defs>
      <rect x="-80" y="-20" width="560" height="360" fill={C.cream} />
      <rect x="-80" y="-20" width="560" height="360" fill="url(#wr-dots)" />
      <rect x="-80" y="240" width="560" height="98" fill={C.sageLight} />
      {[-60, 20, 100, 180, 260, 340, 420].map((x) => (
        <rect key={x} x={x + 6} y="254" width="66" height="70" rx="8" fill="none" stroke={C.sage} strokeWidth="3" opacity="0.7" />
      ))}
      <rect x="-80" y="232" width="560" height="10" rx="4" fill={C.sage} />
      <rect x="-80" y="334" width="560" height="346" fill={C.woodLight} />
      {[364, 398, 440, 492, 556, 632].map((y) => (
        <path key={y} d={`M-80 ${y} H480`} stroke={C.wood} strokeWidth="3" opacity="0.7" />
      ))}
      {[[40, 364, 398], [190, 398, 440], [120, 440, 492], [300, 364, 398], [260, 492, 556], [60, 556, 632], [350, 556, 632]].map(([x, a, b]) => (
        <path key={`${x}-${a}`} d={`M${x} ${a} V${b}`} stroke={C.wood} strokeWidth="3" opacity="0.6" />
      ))}
      <rect x="-80" y="330" width="560" height="10" fill={C.creamDeep} />
      <ellipse cx="200" cy="478" rx="176" ry="30" fill={C.peach} />
      <ellipse cx="200" cy="478" rx="150" ry="22" fill="none" stroke={C.peachLight} strokeWidth="5" strokeDasharray="10 8" />
      {/* Picture: hills and a sun */}
      <rect x="296" y="38" width="86" height="68" rx="6" fill={C.wood} stroke={C.woodDeep} strokeWidth="3" />
      <rect x="304" y="46" width="70" height="52" rx="3" fill={C.bluePale} />
      <circle cx="352" cy="62" r="9" fill={C.gold} />
      <path d="M304 98 V84 C318 70 330 72 342 82 C352 74 364 72 374 80 V98 Z" fill={C.sage} />
      {/* Exam room sign above the door */}
      <rect x="42" y="64" width="58" height="26" rx="8" fill={C.paper} stroke={C.forest} strokeWidth="3" />
      <path d="M71 86 C61 80 58 75 60.5 71 C62.5 68 66 68 71 72 C76 68 79.5 68 81.5 71 C84 75 81 80 71 86 Z" fill={C.coral} />
    </g>
  );
});

export function Door({ open }: { open: boolean }) {
  return (
    <g>
      <rect x="18" y="94" width="106" height="244" rx="10" fill={C.forest} />
      <rect x="26" y="104" width="90" height="234" rx="6" fill="#fff1c9" />
      <path d="M26 338 L116 338 L96 250 L46 250 Z" fill="#ffe6a6" opacity="0.6" />
      <g className={`door-panel${open ? ' is-open' : ''}`}>
        <rect x="26" y="104" width="90" height="234" rx="6" fill={C.blue} stroke={C.blueDeep} strokeWidth="3" />
        <circle cx="71" cy="150" r="20" fill={C.bluePale} stroke={C.blueDeep} strokeWidth="4" />
        <path d="M60 144 C64 138 70 136 76 138" stroke={C.white} strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="40" y="198" width="62" height="56" rx="6" fill="none" stroke={C.blueDeep} strokeWidth="3" opacity="0.5" />
        <rect x="40" y="268" width="62" height="54" rx="6" fill="none" stroke={C.blueDeep} strokeWidth="3" opacity="0.5" />
        <circle cx="104" cy="232" r="6" fill={C.gold} stroke={C.goldDeep} strokeWidth="2" />
      </g>
    </g>
  );
}

export function Clock({ birdKey }: { birdKey: number }) {
  return (
    <g>
      <path d="M166 50 L200 12 L234 50 Z" fill={C.woodDeep} stroke={C.ink} strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="190" y="26" width="20" height="20" rx="4" fill={C.ink} opacity="0.85" />
      <g key={birdKey} className={birdKey ? 'clock-bird is-out' : 'clock-bird'}>
        <circle cx="200" cy="36" r="9" fill={C.gold} stroke={C.goldDeep} strokeWidth="2" />
        <path d="M207 35 L215 37 L207 39 Z" fill={C.coral} />
        <circle cx="202" cy="33" r="1.8" fill={C.ink} />
        <path d="M192 36 C194 41 198 42 201 40" fill="none" stroke={C.goldDeep} strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <rect x="188" y="22" width="24" height="5" fill={C.woodDeep} />
      <circle cx="200" cy="76" r="32" fill={C.wood} stroke={C.woodDeep} strokeWidth="3" />
      <circle cx="200" cy="76" r="25" fill={C.paper} />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => (
        <circle key={a} cx="200" cy="55" r={a % 90 === 0 ? 2.6 : 1.6} fill={C.inkSoft} transform={`rotate(${a} 200 76)`} />
      ))}
      <path d="M200 76 L200 60" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M200 76 L212 82" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
      <circle cx="200" cy="76" r="3" fill={C.coral} />
      <g key={`p${birdKey}`} className={birdKey ? 'pendulum is-swinging' : 'pendulum'}>
        <path d="M200 106 V124" stroke={C.woodDeep} strokeWidth="2.4" />
        <circle cx="200" cy="128" r="6" fill={C.gold} stroke={C.goldDeep} strokeWidth="2" />
      </g>
    </g>
  );
}

const HAMSTER_FACE: Expression[] = ['happy', 'proud', 'surprised', 'giggle'];

export function ReceptionDesk({ hamsterKey, hamsterMood, bellKey }: { hamsterKey: number; hamsterMood: number; bellKey: number }) {
  const expression = hamsterKey ? HAMSTER_FACE[hamsterMood % HAMSTER_FACE.length]! : 'calm';
  return (
    <g>
      <g key={`h${hamsterKey}`} className={hamsterKey ? 'hamster is-up' : 'hamster'}>
        <svg x="262" y="114" width="92" height="92" viewBox="0 0 240 240" overflow="visible">
          <Creature artist={hamsterArt} expression={expression} idle={!hamsterKey} />
        </svg>
        {hamsterKey % 3 === 2 ? (
          <g className="hamster-stamp">
            <rect x="330" y="160" width="22" height="28" rx="3" fill={C.white} stroke={C.inkSoft} strokeWidth="2" transform="rotate(8 341 174)" />
            <circle cx="341" cy="176" r="6" fill="none" stroke={C.coral} strokeWidth="2.4" />
          </g>
        ) : null}
      </g>
      <rect x="220" y="192" width="200" height="16" rx="6" fill={C.woodDeep} />
      <rect x="226" y="206" width="194" height="132" fill={C.peach} />
      <rect x="226" y="226" width="194" height="12" fill={C.coral} opacity="0.75" />
      <circle cx="318" cy="286" r="20" fill={C.paper} />
      <path d="M318 298 C306 291 303 285 305.5 280.5 C307.5 277 312 277 318 282 C324 277 328.5 277 330.5 280.5 C333 285 330 291 318 298 Z" fill={C.coral} />
      <g key={`b${bellKey}`} className={bellKey ? 'bell is-ringing' : 'bell'}>
        <path d="M358 190 C358 174 386 174 386 190 Z" fill={C.gold} stroke={C.goldDeep} strokeWidth="2.6" strokeLinejoin="round" />
        <rect x="354" y="189" width="36" height="5" rx="2.5" fill={C.goldDeep} />
        <circle cx="372" cy="172" r="4" fill={C.goldDeep} />
        <path d="M364 182 C365 178 368 177 370 177" stroke={C.white} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
      </g>
    </g>
  );
}

export function Plant({ danceKey }: { danceKey: number }) {
  return (
    <g key={danceKey} className={danceKey ? 'plant is-dancing' : 'plant'}>
      <g className="plant-leaves">
        <path d="M244 172 C230 150 222 132 228 112 C240 124 246 146 244 172 Z" fill={C.forest} stroke={C.forestDeep} strokeWidth="2.4" />
        <path d="M244 172 C252 146 262 126 270 118 C272 140 262 160 244 172 Z" fill={C.sage} stroke={C.forestDeep} strokeWidth="2.4" />
        <path d="M244 172 C236 156 222 150 214 152 C220 166 232 172 244 172 Z" fill={C.sage} stroke={C.forestDeep} strokeWidth="2.4" />
        <path d="M244 172 C246 150 244 120 246 104 C254 120 254 150 244 172 Z" fill={C.mint} stroke={C.forestDeep} strokeWidth="2.4" />
        {danceKey % 2 === 1 ? <circle cx="246" cy="104" r="7" fill={C.berry} stroke={C.white} strokeWidth="2" /> : null}
      </g>
      <path d="M230 170 H258 L254 194 H234 Z" fill={C.coral} stroke={C.coralDeep} strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="228" y="166" width="32" height="8" rx="3" fill={C.coralDeep} />
    </g>
  );
}

export function FishTank({ fish }: { fish: { x: number; y: number; flip: boolean } }) {
  return (
    <g>
      <rect x="134" y="274" width="82" height="62" rx="4" fill={C.wood} stroke={C.woodDeep} strokeWidth="2.6" />
      <circle cx="175" cy="300" r="3" fill={C.woodDeep} />
      <rect x="138" y="214" width="74" height="62" rx="8" fill={C.blueLight} stroke={C.blueDeep} strokeWidth="3" />
      <rect x="138" y="222" width="74" height="8" fill={C.white} opacity="0.35" />
      <path d="M140 268 C156 260 170 266 186 262 C196 260 204 262 210 266 V274 H140 Z" fill={C.goldLight} />
      <path d="M152 268 C150 256 154 246 150 236 M156 268 C160 258 158 250 162 242" stroke={C.forest} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <circle cx="198" cy="244" r="3" fill={C.white} opacity="0.7" className="tank-bubble" />
      <circle cx="194" cy="234" r="2" fill={C.white} opacity="0.7" className="tank-bubble tank-bubble--late" />
      <g className="fish" style={{ transform: `translate(${fish.x}px, ${fish.y}px)` }}>
        <g transform={fish.flip ? 'scale(-1 1)' : undefined}>
          <path d="M7 0 L15 -6 L15 6 Z" fill={C.coralDeep} />
          <ellipse cx="0" cy="0" rx="10" ry="7" fill={C.coral} stroke={C.coralDeep} strokeWidth="1.6" />
          <circle cx="-4" cy="-1.5" r="1.6" fill={C.ink} />
        </g>
      </g>
      <g className="fish fish--buddy">
        <path d="M188 254 l6 -4 v8 z" fill={C.goldDeep} />
        <ellipse cx="182" cy="254" rx="7" ry="5" fill={C.gold} />
        <circle cx="179" cy="253" r="1.2" fill={C.ink} />
      </g>
      <rect x="138" y="214" width="74" height="62" rx="8" fill="none" stroke={C.blueDeep} strokeWidth="3" />
    </g>
  );
}

/** The silly magazine covers. Each tap shows the next one. */
export const MAGAZINE_COVERS = ['cat in space', 'banana in sunglasses', 'snail on a skateboard', 'cloud wearing boots', 'teacup sailboat'];

function Cover({ index }: { index: number }) {
  switch (index % MAGAZINE_COVERS.length) {
    case 0:
      return (
        <g>
          <circle cx="370" cy="390" r="12" fill={C.lilac} />
          <circle cx="370" cy="390" r="14" fill="none" stroke={C.white} strokeWidth="2.4" opacity="0.8" />
          <path d="M362 382 L364 376 L368 381 M378 382 L376 376 L372 381" fill={C.lilac} />
          <circle cx="366" cy="390" r="1.6" fill={C.ink} />
          <circle cx="374" cy="390" r="1.6" fill={C.ink} />
          <circle cx="358" cy="374" r="1.4" fill={C.gold} />
          <circle cx="384" cy="402" r="1.4" fill={C.gold} />
        </g>
      );
    case 1:
      return (
        <g>
          <path d="M358 402 C366 410 380 404 384 386 C378 396 366 400 358 402 Z" fill={C.gold} stroke={C.goldDeep} strokeWidth="1.8" />
          <rect x="364" y="390" width="8" height="5" rx="2" fill={C.ink} />
          <rect x="374" y="388" width="8" height="5" rx="2" fill={C.ink} />
        </g>
      );
    case 2:
      return (
        <g>
          <rect x="356" y="404" width="30" height="4" rx="2" fill={C.coral} />
          <circle cx="361" cy="410" r="2.6" fill={C.ink} />
          <circle cx="381" cy="410" r="2.6" fill={C.ink} />
          <circle cx="374" cy="396" r="7" fill={C.woodLight} stroke={C.woodDeep} strokeWidth="2" />
          <path d="M360 402 C362 398 366 400 368 402 Z" fill={C.sage} />
          <path d="M362 398 L360 390 M365 398 L366 390" stroke={C.forest} strokeWidth="1.6" />
        </g>
      );
    case 3:
      return (
        <g>
          <circle cx="364" cy="390" r="7" fill={C.white} />
          <circle cx="374" cy="386" r="9" fill={C.white} />
          <circle cx="381" cy="392" r="6" fill={C.white} />
          <rect x="364" y="396" width="5" height="9" fill={C.coral} />
          <rect x="376" y="396" width="5" height="9" fill={C.coral} />
        </g>
      );
    default:
      return (
        <g>
          <path d="M360 400 H384 C382 408 362 408 360 400 Z" fill={C.berryLight} stroke={C.berry} strokeWidth="1.8" />
          <path d="M372 400 V382 L384 394 Z" fill={C.white} stroke={C.blueDeep} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M356 410 C362 406 368 412 374 408 C380 404 384 410 388 408" stroke={C.blue} strokeWidth="2" fill="none" />
        </g>
      );
  }
}

export function SideTable({ cover }: { cover: number }) {
  return (
    <g>
      <rect x="361" y="424" width="8" height="44" fill={C.woodDeep} />
      <ellipse cx="365" cy="470" rx="18" ry="5" fill={C.woodDeep} />
      <ellipse cx="365" cy="424" rx="30" ry="8" fill={C.wood} stroke={C.woodDeep} strokeWidth="2.4" />
      <g transform="rotate(-6 371 392)">
        <g key={cover} className="magazine-flip">
          <rect x="350" y="362" width="42" height="56" rx="3" fill={C.paper} stroke={C.inkSoft} strokeWidth="2.4" />
          <rect x="354" y="366" width="34" height="8" rx="2" fill={C.coral} />
          <Cover index={cover} />
        </g>
      </g>
    </g>
  );
}

export function Sofa() {
  return (
    <g>
      <rect x="10" y="346" width="326" height="78" rx="24" fill={C.blue} stroke={C.blueDeep} strokeWidth="3" />
      <path d="M173 352 V420" stroke={C.blueDeep} strokeWidth="3" opacity="0.5" />
      <rect x="18" y="404" width="310" height="52" rx="16" fill="#a6c4d6" stroke={C.blueDeep} strokeWidth="3" />
      <rect x="0" y="382" width="34" height="80" rx="14" fill={C.blue} stroke={C.blueDeep} strokeWidth="3" />
      <rect x="312" y="382" width="34" height="80" rx="14" fill={C.blue} stroke={C.blueDeep} strokeWidth="3" />
      <rect x="24" y="456" width="10" height="14" rx="3" fill={C.woodDeep} />
      <rect x="312" y="456" width="10" height="14" rx="3" fill={C.woodDeep} />
    </g>
  );
}

export function Armchair({ x, color, edge }: { x: number; color: string; edge: string }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x="10" y="510" width="168" height="96" rx="30" fill={color} stroke={edge} strokeWidth="3" />
      <rect x="0" y="592" width="188" height="48" rx="18" fill={color} stroke={edge} strokeWidth="3" />
      <rect x="-8" y="556" width="34" height="78" rx="15" fill={color} stroke={edge} strokeWidth="3" />
      <rect x="162" y="556" width="34" height="78" rx="15" fill={color} stroke={edge} strokeWidth="3" />
      <rect x="10" y="640" width="12" height="14" rx="3" fill={C.woodDeep} />
      <rect x="166" y="640" width="12" height="14" rx="3" fill={C.woodDeep} />
    </g>
  );
}
