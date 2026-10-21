import { C } from '../art/palette';

/** Interface icons. Each is drawn in a 48 x 48 box. */

type IconProps = { className?: string };

function Svg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <g strokeLinecap="round" strokeLinejoin="round">{children}</g>
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 22 L24 9 L40 22" fill="none" stroke={C.forestDeep} strokeWidth="4" />
      <path d="M12 21 V39 H36 V21" fill={C.cream} stroke={C.forestDeep} strokeWidth="3.5" />
      <path d="M24 35 C18 31 17 28 19.5 25.5 C21.5 23.5 23.5 24.5 24 26 C24.5 24.5 26.5 23.5 28.5 25.5 C31 28 30 31 24 35 Z" fill={C.coral} />
    </Svg>
  );
}

export function SoundIcon({ className, on }: IconProps & { on: boolean }) {
  return (
    <Svg className={className}>
      <path d="M8 19 H15 L25 10 V38 L15 29 H8 Z" fill={C.gold} stroke={C.goldDeep} strokeWidth="3" />
      {on ? (
        <>
          <path d="M31 18 C34 21 34 27 31 30" fill="none" stroke={C.forestDeep} strokeWidth="3.5" />
          <path d="M36 13 C42 19 42 29 36 35" fill="none" stroke={C.forestDeep} strokeWidth="3.5" />
        </>
      ) : (
        <>
          <path d="M31 18 L41 30 M41 18 L31 30" fill="none" stroke={C.coralDeep} strokeWidth="3.5" />
        </>
      )}
    </Svg>
  );
}

export function BookIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 10 C14 8 20 9 24 13 V40 C20 36 14 35 8 37 Z" fill={C.sageLight} stroke={C.forestDeep} strokeWidth="3" />
      <path d="M40 10 C34 8 28 9 24 13 V40 C28 36 34 35 40 37 Z" fill={C.peachLight} stroke={C.forestDeep} strokeWidth="3" />
      <path d="M32 17 l1.8 3.7 4 .5-3 2.8.8 4-3.6-2-3.6 2 .8-4-3-2.8 4-.5z" fill={C.gold} stroke={C.goldDeep} strokeWidth="1.4" />
      <circle cx="15" cy="22" r="3.6" fill={C.coral} />
    </Svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M16 22 V16 C16 11 19.5 8 24 8 C28.5 8 32 11 32 16 V22" fill="none" stroke={C.inkSoft} strokeWidth="3.5" />
      <rect x="11" y="21" width="26" height="20" rx="5" fill={C.creamDeep} stroke={C.inkSoft} strokeWidth="3" />
      <circle cx="24" cy="30" r="3" fill={C.inkSoft} />
      <path d="M24 32 V36" stroke={C.inkSoft} strokeWidth="3" />
    </Svg>
  );
}

/** The "all done" exit: a big friendly waving hand. */
export function WaveIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        d="M14 27 L11 20 C10 18 12.5 16.5 14 18 L18 24 L14 12 C13.4 10 16 9 17 11 L21 21 L20 9 C20 7 23 7 23.3 9 L25 21 L26.5 11 C27 9 29.8 9.5 29.6 11.6 L28.5 24 L32 19 C33.5 17.4 35.8 18.8 35 21 L30 33 C28 38 24 41 19.5 40 C15 39 13 35 14 27 Z"
        fill={C.peach}
        stroke={C.coralDeep}
        strokeWidth="2.6"
      />
      <path d="M38 9 C41 11 42 14 41.5 17" fill="none" stroke={C.forest} strokeWidth="2.8" />
      <path d="M6 16 C5 13 6 10 8.5 8.5" fill="none" stroke={C.forest} strokeWidth="2.8" />
    </Svg>
  );
}

/** "Feeling better" : a heart with a check mark. */
export function HeartCheckIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M24 41 C10 32 6 25 8.5 18 C11 11 19 10.5 24 16.5 C29 10.5 37 11 39.5 18 C42 25 38 32 24 41 Z" fill={C.berry} stroke="#c55a83" strokeWidth="3" />
      <path d="M16 25 L22 31 L33 19" fill="none" stroke={C.white} strokeWidth="4.5" />
    </Svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M24 41 C10 32 6 25 8.5 18 C11 11 19 10.5 24 16.5 C29 10.5 37 11 39.5 18 C42 25 38 32 24 41 Z" fill={C.coral} stroke={C.coralDeep} strokeWidth="3" />
      <ellipse cx="16" cy="20" rx="3.4" ry="2.2" fill={C.white} opacity="0.6" transform="rotate(-30 16 20)" />
    </Svg>
  );
}

export function BackIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M28 10 L14 24 L28 38" fill="none" stroke={C.forestDeep} strokeWidth="5" />
    </Svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M17 11 C17 9 19 8 21 9 L38 21.5 C39.6 22.7 39.6 25.3 38 26.5 L21 39 C19 40 17 39 17 37 Z" fill={C.white} />
    </Svg>
  );
}

export function DoorIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="12" y="6" width="24" height="36" rx="3" fill={C.blue} stroke={C.blueDeep} strokeWidth="3" />
      <circle cx="24" cy="16" r="5" fill={C.bluePale} stroke={C.blueDeep} strokeWidth="2" />
      <circle cx="31" cy="26" r="2.4" fill={C.gold} />
    </Svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M14 14 L34 34 M34 14 L14 34" fill="none" stroke={C.inkSoft} strokeWidth="4" />
    </Svg>
  );
}
