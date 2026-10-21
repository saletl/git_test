import { memo } from 'react';
import { C } from '../art/palette';

/**
 * The exam room. The core area is 400 x 640 (x 0..400); extra wall and floor on each side
 * fill wider screens. The patient stands on the exam table at the center.
 */

export const EXAM_VIEWBOX = '-100 0 600 640';
/** Where the 240 x 240 patient art is placed in the room. */
export const EXAM_PATIENT_BOX = { x: 40, y: 182, w: 320, h: 320 };

/** Things in the room that do something when tapped. */
export const ROOM_PROP_BOXES = {
  lamp: { x: 196, y: 0, w: 72, h: 76 },
  poster: { x: 280, y: 42, w: 104, h: 140 },
  sink: { x: -6, y: 318, w: 70, h: 88 },
  cabinet: { x: 336, y: 194, w: 66, h: 108 },
} as const;
export type RoomProp = keyof typeof ROOM_PROP_BOXES;

export interface RoomState {
  lamp: boolean;
  poster: number;
  cabinet: boolean;
  sink: number;
}

export const POSTER_COUNT = 3;

function Poster({ which }: { which: number }) {
  switch (which % POSTER_COUNT) {
    case 1:
      return (
        <g>
          <rect x="282" y="44" width="100" height="136" rx="10" fill={C.bluePale} stroke={C.blueDeep} strokeWidth="3" />
          {[C.coral, C.gold, C.mint, C.blue].map((color, i) => (
            <path key={color} d={`M${300 + i * 6} 150 C${300 + i * 6} ${100 + i * 6} ${364 - i * 6} ${100 + i * 6} ${364 - i * 6} 150`} fill="none" stroke={color} strokeWidth="6" />
          ))}
          <circle cx="306" cy="70" r="12" fill={C.gold} />
          <circle cx="352" cy="156" r="9" fill={C.white} />
          <circle cx="364" cy="152" r="11" fill={C.white} />
          <circle cx="312" cy="156" r="9" fill={C.white} />
        </g>
      );
    case 2:
      return (
        <g>
          <rect x="282" y="44" width="100" height="136" rx="10" fill={C.berryLight} stroke={C.berry} strokeWidth="3" />
          <path d="M332 150 C306 132 296 116 302 102 C308 90 324 90 332 102 C340 90 356 90 362 102 C368 116 358 132 332 150 Z" fill={C.white} stroke={C.berry} strokeWidth="3" />
          <circle cx="322" cy="112" r="3" fill={C.ink} />
          <circle cx="342" cy="112" r="3" fill={C.ink} />
          <path d="M324 122 C328 127 336 127 340 122" fill="none" stroke={C.ink} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M300 64 L303 71 L311 72 L305 77 L307 85 L300 81 L293 85 L295 77 L289 72 L297 71 Z" fill={C.gold} />
          <path d="M364 60 L366 65 L371 66 L367 69 L368 74 L364 71 L360 74 L361 69 L357 66 L362 65 Z" fill={C.gold} />
        </g>
      );
    default:
      return (
        <g>
          <rect x="282" y="44" width="100" height="136" rx="10" fill={C.white} stroke={C.blueDeep} strokeWidth="3" />
          <circle className="ec-shape" cx="332" cy="72" r="15" fill={C.coral} />
          <path className="ec-shape" d="M308 122 C300 116 298 112 300 108 C302 105 306 105 308 108 C310 105 314 105 316 108 C318 112 316 116 308 122 Z" fill={C.berry} />
          <path className="ec-shape" d="M332 104 L336 112 L345 113 L338 119 L340 128 L332 123 L324 128 L326 119 L319 113 L328 112 Z" fill={C.gold} />
          <path className="ec-shape" d="M356 106 L364 120 H348 Z" fill={C.blue} />
          {[302, 318, 334, 350, 366].map((x, i) => (
            <circle key={x} className="ec-shape" cx={x} cy="150" r="4.5" fill={[C.mint, C.lilac, C.coral, C.gold, C.blue][i]} />
          ))}
          <rect x="296" y="164" width="72" height="6" rx="3" fill={C.sageLight} />
        </g>
      );
  }
}

/** The hanging exam lamp. When it is on, a warm glow falls on the patient. */
export function LampLight({ on }: { on: boolean }) {
  if (!on) return null;
  return <path className="lamp-glow" d="M214 60 L248 60 L330 500 L110 500 Z" fill={C.goldLight} opacity="0.32" />;
}

export const RoomProps = memo(function RoomProps({ room }: { room: RoomState }) {
  return (
    <g>
      {/* Lamp */}
      <path d="M232 0 V28" stroke={C.inkSoft} strokeWidth="3" />
      <path d="M206 58 C206 40 216 28 232 28 C248 28 258 40 258 58 Z" fill={room.lamp ? C.gold : C.blueDeep} stroke={C.ink} strokeWidth="2.6" />
      <ellipse cx="232" cy="60" rx="12" ry="6" fill={room.lamp ? C.white : C.creamDeep} stroke={C.ink} strokeWidth="2" />
      {room.lamp ? <circle cx="232" cy="62" r="16" fill={C.goldLight} opacity="0.6" /> : null}

      {/* Poster: tap to change it */}
      <g key={room.poster} className={room.poster ? 'eye-chart is-wiggling' : 'eye-chart'}>
        <Poster which={room.poster} />
      </g>

      {/* Sink with bubbles */}
      <rect x="4" y="306" width="10" height="26" rx="3" fill={C.blueDeep} />
      <path d="M4 310 H28 C32 310 34 312 34 316 V320" fill="none" stroke={C.blueDeep} strokeWidth="6" strokeLinecap="round" />
      <path d="M-4 344 H62 C62 372 50 384 30 384 C10 384 -4 372 -4 344 Z" fill={C.white} stroke={C.blueDeep} strokeWidth="3" />
      <rect x="-8" y="338" width="74" height="10" rx="5" fill={C.bluePale} stroke={C.blueDeep} strokeWidth="2.6" />
      <rect x="24" y="384" width="12" height="30" fill={C.creamDeep} stroke={C.blueDeep} strokeWidth="2" />
      {room.sink ? (
        <g key={room.sink} className="sink-bubbles">
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} className="sink-bubble" style={{ ['--i' as string]: i } as React.CSSProperties}>
              <circle cx={10 + i * 10} cy={334} r={5 + (i % 3) * 2} fill={C.blueLight} fillOpacity="0.5" stroke={C.blue} strokeWidth="1.6" />
            </g>
          ))}
        </g>
      ) : null}

      {/* Cabinet */}
      <rect x="338" y="196" width="62" height="104" rx="6" fill={C.woodLight} stroke={C.woodDeep} strokeWidth="3" />
      {room.cabinet ? (
        <g>
          <rect x="342" y="200" width="54" height="96" rx="3" fill={C.cream} />
          <path d="M342 248 H396" stroke={C.woodDeep} strokeWidth="3" />
          <rect x="348" y="222" width="16" height="24" rx="4" fill={C.white} stroke={C.blueDeep} strokeWidth="2" />
          <circle cx="353" cy="232" r="3.4" fill={C.white} stroke={C.creamDeep} />
          <circle cx="359" cy="238" r="3.4" fill={C.white} stroke={C.creamDeep} />
          <ellipse cx="382" cy="240" rx="10" ry="6" fill={C.gold} stroke={C.goldDeep} strokeWidth="2" />
          <circle cx="387" cy="230" r="6" fill={C.gold} stroke={C.goldDeep} strokeWidth="2" />
          <path d="M392 230 L398 232 L392 234 Z" fill={C.coral} />
          <rect x="350" y="262" width="38" height="22" rx="3" fill={C.berryLight} stroke={C.berry} strokeWidth="2" />
          <path d="M362 273 H376 M369 266 V280" stroke={C.white} strokeWidth="3" strokeLinecap="round" />
          <path d="M338 196 L326 204 V292 L338 300" fill={C.wood} stroke={C.woodDeep} strokeWidth="2.6" />
          <path d="M400 196 L412 204 V292 L400 300" fill={C.wood} stroke={C.woodDeep} strokeWidth="2.6" />
        </g>
      ) : (
        <g>
          <path d="M369 198 V298" stroke={C.woodDeep} strokeWidth="2.6" />
          <circle cx="362" cy="248" r="3.4" fill={C.gold} stroke={C.goldDeep} strokeWidth="1.6" />
          <circle cx="376" cy="248" r="3.4" fill={C.gold} stroke={C.goldDeep} strokeWidth="1.6" />
          <path d="M362 212 L364 216 L368 216.5 L365 219 L366 223 L362 221 L358 223 L359 219 L356 216.5 L360 216 Z" fill={C.berry} />
        </g>
      )}
    </g>
  );
});

export const ExamRoomBackdrop = memo(function ExamRoomBackdrop({ tint }: { tint: string }) {
  return (
    <g>
      <defs>
        <pattern id="exam-dots" width="34" height="34" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="2.4" fill={C.white} opacity="0.65" />
          <circle cx="25" cy="25" r="2.4" fill={C.white} opacity="0.65" />
        </pattern>
      </defs>
      <rect x="-100" y="0" width="600" height="410" fill={tint} />
      <rect x="-100" y="0" width="600" height="410" fill="url(#exam-dots)" />
      <rect x="-100" y="404" width="600" height="120" fill={C.creamDeep} />
      <rect x="-100" y="400" width="600" height="10" rx="4" fill={C.sage} />
      {[-90, -10, 70, 150, 230, 310, 390, 470].map((x) => (
        <rect key={x} x={x + 6} y="422" width="66" height="84" rx="8" fill="none" stroke={C.cream} strokeWidth="3" />
      ))}
      <rect x="-100" y="520" width="600" height="120" fill={C.woodLight} />
      {[548, 588, 630].map((y) => (
        <path key={y} d={`M-100 ${y} H500`} stroke={C.wood} strokeWidth="3" opacity="0.7" />
      ))}
      <rect x="-100" y="516" width="600" height="8" fill={C.cream} />

      {/* Window with clouds */}
      <rect x="6" y="54" width="112" height="112" rx="14" fill={C.paper} stroke={C.wood} strokeWidth="5" />
      <rect x="16" y="64" width="92" height="92" rx="8" fill={C.bluePale} />
      <g className="cloud-drift">
        <circle cx="44" cy="96" r="12" fill={C.white} />
        <circle cx="58" cy="90" r="15" fill={C.white} />
        <circle cx="72" cy="98" r="10" fill={C.white} />
      </g>
      <circle cx="92" cy="80" r="9" fill={C.goldLight} />
      <path d="M62 64 V156 M16 110 H108" stroke={C.wood} strokeWidth="4" />
      <path d="M0 50 C14 90 10 140 -4 176 L-30 176 L-30 50 Z" fill={C.coral} opacity="0.9" />
      <path d="M124 50 C110 90 114 140 128 176 L154 176 L154 50 Z" fill={C.coral} opacity="0.9" />

      {/* Height chart giraffe for wide screens */}
      <g opacity="0.95">
        <rect x="420" y="120" width="40" height="290" rx="8" fill={C.goldLight} stroke={C.goldDeep} strokeWidth="3" />
        {[150, 190, 230, 270, 310, 350, 390].map((y) => (
          <path key={y} d={`M420 ${y} H436`} stroke={C.goldDeep} strokeWidth="3" />
        ))}
        <circle cx="446" cy="160" r="5" fill={C.woodDeep} opacity="0.6" />
        <circle cx="444" cy="240" r="6" fill={C.woodDeep} opacity="0.6" />
        <circle cx="448" cy="320" r="5" fill={C.woodDeep} opacity="0.6" />
      </g>

      {/* Shelf with jars */}
      <rect x="-90" y="262" width="96" height="8" rx="3" fill={C.woodDeep} />
      <rect x="-80" y="226" width="30" height="36" rx="6" fill={C.white} opacity="0.85" stroke={C.blueDeep} strokeWidth="2.4" />
      <circle cx="-70" cy="244" r="6" fill={C.white} stroke={C.creamDeep} />
      <circle cx="-60" cy="250" r="6" fill={C.white} stroke={C.creamDeep} />
      <rect x="-40" y="232" width="26" height="30" rx="6" fill={C.white} opacity="0.85" stroke={C.blueDeep} strokeWidth="2.4" />
      <circle cx="-27" cy="244" r="5" fill={C.berry} />
      <circle cx="-22" cy="252" r="5" fill={C.gold} />

      {/* Exam table */}
      <rect x="70" y="500" width="260" height="104" rx="10" fill={C.wood} stroke={C.woodDeep} strokeWidth="3" />
      <rect x="86" y="516" width="106" height="34" rx="6" fill="none" stroke={C.woodDeep} strokeWidth="2.4" opacity="0.6" />
      <rect x="208" y="516" width="106" height="34" rx="6" fill="none" stroke={C.woodDeep} strokeWidth="2.4" opacity="0.6" />
      <circle cx="139" cy="533" r="4" fill={C.woodDeep} />
      <circle cx="261" cy="533" r="4" fill={C.woodDeep} />
      <rect x="34" y="480" width="332" height="26" rx="13" fill={C.coral} stroke={C.coralDeep} strokeWidth="3" />
      <rect x="64" y="478" width="272" height="10" rx="4" fill={C.white} opacity="0.95" />
      <ellipse cx="200" cy="608" rx="150" ry="8" fill={C.shadow} opacity="0.1" />
    </g>
  );
});
