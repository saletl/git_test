import { C } from '../art/palette';
import type { Point } from '../art/shapes';
import type { ItemKind } from '../game/types';
import { HoldHandArt, MusicBoxArt } from '../icons/ComfortIcons';
import { PretendShotArt, TongueArt } from '../icons/ToolIcons';

/**
 * Props that appear beside a patient for a moment, drawn in the patient's 240 x 240 space.
 * Each is drawn around (0, 0) and placed on an anchor.
 */

export function CupArt() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M-14 -16 H14 L10 18 C9 21 6 22 0 22 C-6 22 -9 21 -10 18 Z" fill={C.bluePale} stroke={C.blueDeep} strokeWidth="2.6" />
      <path d="M-12 -4 H12 L10 16 C8 19 -8 19 -10 16 Z" fill={C.blueLight} />
      <path d="M6 -16 L14 -30" stroke={C.coral} strokeWidth="3.4" />
      <ellipse cx="-5" cy="2" rx="2" ry="6" fill={C.white} opacity="0.7" />
    </g>
  );
}

export function PinwheelArt() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 0 V46" stroke={C.woodDeep} strokeWidth="4" />
      <g className="item-spin">
        <path d="M0 0 L0 -26 C10 -26 16 -18 14 -10 Z" fill={C.coral} stroke={C.coralDeep} strokeWidth="2" />
        <path d="M0 0 L26 0 C26 10 18 16 10 14 Z" fill={C.gold} stroke={C.goldDeep} strokeWidth="2" />
        <path d="M0 0 L0 26 C-10 26 -16 18 -14 10 Z" fill={C.mint} stroke={C.mintDeep} strokeWidth="2" />
        <path d="M0 0 L-26 0 C-26 -10 -18 -16 -10 -14 Z" fill={C.blue} stroke={C.blueDeep} strokeWidth="2" />
        <circle r="4" fill={C.paper} stroke={C.woodDeep} strokeWidth="2" />
      </g>
    </g>
  );
}

export function SillyGlassesArt() {
  return (
    <g strokeLinecap="round">
      <circle cx="-14" cy="0" r="12" fill={C.white} fillOpacity="0.4" stroke={C.coralDeep} strokeWidth="4" />
      <circle cx="14" cy="0" r="12" fill={C.white} fillOpacity="0.4" stroke={C.coralDeep} strokeWidth="4" />
      <path d="M-3 -2 C-1 -5 1 -5 3 -2" fill="none" stroke={C.coralDeep} strokeWidth="3.4" />
    </g>
  );
}

export function TissueArt() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M-16 -12 C-8 -20 8 -20 16 -12 C20 -2 18 10 12 16 C4 20 -4 20 -12 16 C-18 10 -20 -2 -16 -12 Z" fill={C.white} stroke={C.blueLight} strokeWidth="2.6" />
      <path d="M-8 -6 C-2 -2 4 -2 10 -6" fill="none" stroke={C.bluePale} strokeWidth="2.4" />
      <path d="M-6 6 C0 9 4 9 8 6" fill="none" stroke={C.bluePale} strokeWidth="2.4" />
    </g>
  );
}

/** A friendly hamster helper in a nurse cap, who helps with Prickle's pretend shot. */
export function HelperArt() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="0" cy="34" rx="26" ry="24" fill={C.mintLight} stroke={C.mintDeep} strokeWidth="2.6" />
      <circle cx="-17" cy="-20" r="8" fill="#f0b978" stroke="#b77f45" strokeWidth="2.4" />
      <circle cx="17" cy="-20" r="8" fill="#f0b978" stroke="#b77f45" strokeWidth="2.4" />
      <ellipse cx="0" cy="0" rx="24" ry="22" fill="#f0b978" stroke="#b77f45" strokeWidth="2.6" />
      <ellipse cx="0" cy="8" rx="15" ry="11" fill={C.cream} />
      <path d="M-14 -16 C-10 -28 10 -28 14 -16 Z" fill={C.white} stroke={C.blueDeep} strokeWidth="2" />
      <path d="M-3 -21 H3 M0 -24 V-18" stroke={C.berry} strokeWidth="2.4" />
      <circle cx="-8" cy="-3" r="3" fill={C.ink} />
      <circle cx="8" cy="-3" r="3" fill={C.ink} />
      <circle cx="-7" cy="-4" r="1" fill={C.white} />
      <circle cx="9" cy="-4" r="1" fill={C.white} />
      <ellipse cx="0" cy="4" rx="3" ry="2.2" fill={C.berry} />
      <path d="M-5 8 C-2 12 2 12 5 8" fill="none" stroke={C.ink} strokeWidth="2" />
      <ellipse cx="-14" cy="6" rx="4" ry="2.6" fill={C.blush} opacity="0.6" />
      <ellipse cx="14" cy="6" rx="4" ry="2.6" fill={C.blush} opacity="0.6" />
    </g>
  );
}

function ItemArt({ kind }: { kind: ItemKind }) {
  switch (kind) {
    case 'cup':
      return <CupArt />;
    case 'pinwheel':
      return <PinwheelArt />;
    case 'sillyGlasses':
      return <SillyGlassesArt />;
    case 'tissue':
      return <TissueArt />;
    case 'musicBox':
      return (
        <g transform="translate(-30 -36) scale(0.62)">
          <MusicBoxArt />
        </g>
      );
    case 'helperHand':
      return (
        <g transform="translate(-48 -46) scale(0.82)">
          <HoldHandArt />
        </g>
      );
    case 'toyShot':
      return (
        <g transform="translate(-22 -22) scale(0.7)">
          <PretendShotArt />
        </g>
      );
    case 'tongueDepressor':
      return (
        <g transform="translate(-30 -30) scale(0.9)">
          <TongueArt />
        </g>
      );
  }
}

export function ItemSprite({ kind, at }: { kind: ItemKind; at: Point }) {
  return (
    <g className={`item-sprite item-sprite--${kind}`} transform={`translate(${at[0]} ${at[1]})`}>
      <g className="item-sprite__inner">
        <ItemArt kind={kind} />
      </g>
    </g>
  );
}
