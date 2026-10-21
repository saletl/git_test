import { memo } from 'react';
import { C } from '../art/palette';

/**
 * The exam room. The core area is 400 x 640 (x 0..400); extra wall and floor on each side
 * fill wider screens. The patient stands on the exam table at the center.
 */

export const EXAM_VIEWBOX = '-100 0 600 640';
/** Where the 240 x 240 patient art is placed in the room. */
export const EXAM_PATIENT_BOX = { x: 40, y: 182, w: 320, h: 320 };
/** Prickle's pretend-shot tray. */
export const EXAM_TRAY_BOX = { x: -4, y: 404, w: 64, h: 64 };

export const ExamRoomBackdrop = memo(function ExamRoomBackdrop({ tint, chartKey }: { tint: string; chartKey: number }) {
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

      {/* Shape "eye chart": no letters, just friendly shapes */}
      <g key={chartKey} className={chartKey ? 'eye-chart is-wiggling' : 'eye-chart'}>
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

/** A small tray that holds Prickle's toy shot. */
export function ShotTray({ empty }: { empty: boolean }) {
  return (
    <g>
      <rect x="8" y="468" width="8" height="52" fill={C.woodDeep} />
      <ellipse cx="12" cy="520" rx="16" ry="4" fill={C.woodDeep} />
      <ellipse cx="28" cy="466" rx="34" ry="8" fill="#dfe7ea" stroke={C.blueDeep} strokeWidth="2.4" />
      {empty ? null : <ellipse cx="28" cy="440" rx="30" ry="30" fill={C.goldLight} opacity="0.35" />}
    </g>
  );
}
