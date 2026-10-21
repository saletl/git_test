import { plushShapes, type PlushKind } from '../art/creature';
import { C } from '../art/palette';
import type { ComfortId } from '../game/types';
import { ShapeList } from '../characters/Creature';

/** Pictures for the comfort choices, drawn in a 96 x 96 box so children can tell them apart at a glance. */

export function PlushIcon({ plush, className }: { plush: PlushKind; className?: string }) {
  return (
    <svg viewBox="-40 -44 80 84" className={className} aria-hidden="true" focusable="false">
      <ShapeList shapes={plushShapes(plush, [0, plush === 'bunny' ? 8 : 2], plush === 'star' ? 1.05 : 0.95)} />
    </svg>
  );
}

export function MusicBoxArt() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <rect x="20" y="46" width="56" height="34" rx="6" fill={C.berryLight} stroke={C.berry} strokeWidth="3" />
      <path d="M20 56 H76" stroke={C.berry} strokeWidth="3" />
      <path d="M18 46 L28 30 H68 L78 46 Z" fill={C.berry} stroke="#c55a83" strokeWidth="3" />
      <circle cx="48" cy="68" r="5" fill={C.gold} stroke={C.goldDeep} strokeWidth="2" />
      <path d="M78 64 H86 V58" fill="none" stroke={C.woodDeep} strokeWidth="3.4" />
      <g fill={C.blueDeep}>
        <ellipse cx="34" cy="20" rx="5" ry="4" transform="rotate(-20 34 20)" />
        <rect x="37" y="4" width="3" height="16" rx="1.5" />
        <ellipse cx="62" cy="16" rx="5" ry="4" transform="rotate(-20 62 16)" />
        <rect x="65" y="0" width="3" height="16" rx="1.5" />
        <path d="M38.5 4 L66.5 0 L66.5 5 L38.5 9 Z" />
      </g>
    </g>
  );
}

export function BreakArt() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 62 C12 46 26 40 48 40 C70 40 84 46 84 62 C84 76 70 80 48 80 C26 80 12 76 12 62 Z" fill={C.blueLight} stroke={C.blueDeep} strokeWidth="3" />
      <path d="M22 58 C34 54 62 54 74 58" fill="none" stroke={C.white} strokeWidth="4" opacity="0.8" />
      <path d="M40 14 C30 18 28 32 38 38 C30 38 22 30 24 20 C26 12 34 10 40 14 Z" fill={C.gold} stroke={C.goldDeep} strokeWidth="2.4" />
      <path d="M58 16 H68 L58 26 H68" fill="none" stroke={C.blueDeep} strokeWidth="3.2" />
      <path d="M72 6 H78 L72 12 H78" fill="none" stroke={C.blueDeep} strokeWidth="2.6" />
    </g>
  );
}

export function HoldHandArt() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 58 C14 50 22 44 34 44 L52 46 C56 47 56 53 52 54 L40 54" fill={C.peach} stroke={C.coralDeep} strokeWidth="3" />
      <path d="M6 58 L20 76 C30 80 42 78 50 72 L64 60" fill={C.peach} stroke={C.coralDeep} strokeWidth="3" />
      <path d="M90 42 C82 36 72 34 62 38 L44 48 C40 50 42 56 46 56 L58 52 C62 56 66 62 64 66" fill={C.peachLight} stroke={C.woodDeep} strokeWidth="3" />
      <path d="M90 42 L82 68 C74 74 66 72 60 66" fill={C.peachLight} stroke={C.woodDeep} strokeWidth="3" />
      <path d="M48 14 C44 10 38 12 38 18 C38 24 48 30 48 30 C48 30 58 24 58 18 C58 12 52 10 48 14 Z" fill={C.berry} stroke="#c55a83" strokeWidth="2" />
    </g>
  );
}

export function ComfortArt({ choice, plush }: { choice: ComfortId; plush: PlushKind }) {
  switch (choice) {
    case 'hug':
      return (
        <svg viewBox="-48 -48 96 96" aria-hidden="true" focusable="false">
          <ShapeList shapes={plushShapes(plush, [-2, plush === 'bunny' ? 10 : 4], plush === 'star' ? 1.1 : 1)} />
          <path d="M28 -32 C22 -36 18 -32 20 -28 C22 -24 28 -22 28 -22 C28 -22 34 -24 36 -28 C38 -32 34 -36 28 -32 Z" fill={C.berry} />
        </svg>
      );
    case 'break':
      return (
        <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
          <BreakArt />
        </svg>
      );
    case 'music':
      return (
        <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
          <MusicBoxArt />
        </svg>
      );
    case 'hand':
      return (
        <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
          <HoldHandArt />
        </svg>
      );
  }
}
