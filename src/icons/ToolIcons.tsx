import type { AnyToolId } from '../game/types';
import { C } from '../art/palette';

/** Big, friendly medical tools. All drawn in a 64 x 64 box. */

export function StethoscopeArt() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8 C14 22 16 30 26 34 C36 30 38 22 34 8" fill="none" stroke={C.berry} strokeWidth="4.5" />
      <path d="M26 34 C26 46 30 54 40 54 C48 54 52 48 50 40" fill="none" stroke={C.berry} strokeWidth="4.5" />
      <circle cx="18" cy="7" r="3.6" fill={C.blueDeep} />
      <circle cx="34" cy="7" r="3.6" fill={C.blueDeep} />
      <circle cx="50" cy="36" r="9" fill="#dfe7ea" stroke={C.blueDeep} strokeWidth="3" />
      <circle cx="50" cy="36" r="4.4" fill={C.blueLight} />
      <circle cx="47.5" cy="33.5" r="1.6" fill={C.white} />
    </g>
  );
}

export function ThermometerArt() {
  return (
    <g transform="rotate(28 32 32)" strokeLinecap="round" strokeLinejoin="round">
      <rect x="25" y="4" width="14" height="42" rx="7" fill={C.white} stroke={C.blueDeep} strokeWidth="3" />
      <rect x="29.5" y="20" width="5" height="28" rx="2.5" fill={C.coral} />
      <circle cx="32" cy="51" r="9" fill={C.coral} stroke={C.coralDeep} strokeWidth="3" />
      <circle cx="29" cy="48" r="2.4" fill={C.white} opacity="0.8" />
      <path d="M39 12h-4M39 19h-4M39 26h-4M39 33h-4" stroke={C.blueDeep} strokeWidth="2" />
    </g>
  );
}

export function OtoscopeArt() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <rect x="20" y="30" width="14" height="30" rx="6" fill={C.gold} stroke={C.goldDeep} strokeWidth="3" />
      <path d="M22 40h10M22 46h10M22 52h10" stroke={C.goldDeep} strokeWidth="2" opacity="0.6" />
      <rect x="15" y="16" width="26" height="16" rx="7" fill={C.blueDeep} stroke="#3f5f78" strokeWidth="3" />
      <path d="M41 19 L56 22 L56 26 L41 29 Z" fill="#e8edf0" stroke="#3f5f78" strokeWidth="3" />
      <circle cx="58" cy="24" r="4" fill={C.goldLight} />
      <circle cx="58" cy="24" r="7" fill={C.goldLight} opacity="0.35" />
      <circle cx="24" cy="22" r="2.4" fill={C.white} opacity="0.8" />
    </g>
  );
}

export function BandagesArt() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <g transform="rotate(-35 32 32)">
        <rect x="6" y="24" width="52" height="16" rx="8" fill={C.berryLight} stroke={C.berry} strokeWidth="3" />
        <rect x="24" y="25.5" width="16" height="13" rx="3" fill={C.paper} />
        <circle cx="14" cy="32" r="2.2" fill={C.coralDeep} />
        <circle cx="50" cy="32" r="2.2" fill={C.coralDeep} />
      </g>
      <g transform="rotate(35 32 32)">
        <rect x="6" y="24" width="52" height="16" rx="8" fill={C.blueLight} stroke={C.blueDeep} strokeWidth="3" />
        <rect x="24" y="25.5" width="16" height="13" rx="3" fill={C.paper} />
        <path d="M14 29l1 2.4 2.6.2-2 1.6.7 2.6-2.3-1.4-2.3 1.4.7-2.6-2-1.6 2.6-.2z" fill={C.gold} />
        <path d="M50 29l1 2.4 2.6.2-2 1.6.7 2.6-2.3-1.4-2.3 1.4.7-2.6-2-1.6 2.6-.2z" fill={C.gold} />
      </g>
    </g>
  );
}

/** A clearly pretend, toy-like shot with a soft round tip. */
export function PretendShotArt() {
  return (
    <g transform="rotate(-40 32 32)" strokeLinecap="round" strokeLinejoin="round">
      <rect x="27" y="2" width="10" height="10" rx="3" fill={C.coral} stroke={C.coralDeep} strokeWidth="2.6" />
      <rect x="30" y="10" width="4" height="12" fill={C.coralDeep} />
      <rect x="18" y="20" width="28" height="6" rx="3" fill={C.berry} stroke="#c55a83" strokeWidth="2.4" />
      <rect x="23" y="24" width="18" height="28" rx="6" fill="#d9ecf5" stroke={C.blueDeep} strokeWidth="3" />
      <path d="M32 31l1.4 3 3.2.3-2.4 2.1.8 3.1-3-1.7-3 1.7.8-3.1-2.4-2.1 3.2-.3z" fill={C.gold} />
      <path d="M28 44h8" stroke={C.blueDeep} strokeWidth="2" opacity="0.6" />
      <rect x="29" y="52" width="6" height="6" rx="2" fill={C.goldLight} stroke={C.goldDeep} strokeWidth="2" />
      <circle cx="32" cy="60.5" r="3.2" fill={C.gold} stroke={C.goldDeep} strokeWidth="2" />
    </g>
  );
}

export function ToolArt({ tool }: { tool: AnyToolId }) {
  switch (tool) {
    case 'stethoscope':
      return <StethoscopeArt />;
    case 'thermometer':
      return <ThermometerArt />;
    case 'otoscope':
      return <OtoscopeArt />;
    case 'bandage':
      return <BandagesArt />;
    case 'pretendShot':
      return <PretendShotArt />;
  }
}

export function ToolIcon({ tool, className }: { tool: AnyToolId; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false" overflow="visible">
      <ToolArt tool={tool} />
    </svg>
  );
}

export const TOOL_LABELS: Record<AnyToolId, string> = {
  stethoscope: 'Stethoscope',
  thermometer: 'Thermometer',
  otoscope: 'Ear light',
  bandage: 'Bandages',
  pretendShot: 'Pretend shot',
};
