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

/** The coloring book: an open book with line art and a crayon. */
export function BookIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 11 C12 9 19 10 24 14 V40 C19 36 12 35 6 37 Z" fill={C.white} stroke={C.forestDeep} strokeWidth="3" />
      <path d="M42 11 C36 9 29 10 24 14 V40 C29 36 36 35 42 37 Z" fill={C.white} stroke={C.forestDeep} strokeWidth="3" />
      <circle cx="15" cy="22" r="4.5" fill="none" stroke={C.ink} strokeWidth="1.8" />
      <path d="M10 31 C13 28 17 28 20 31" fill="none" stroke={C.ink} strokeWidth="1.8" />
      <path d="M29 18 l1.6 3.3 3.6 .4-2.7 2.5 .7 3.6-3.2-1.8-3.2 1.8 .7-3.6-2.7-2.5 3.6-.4z" fill={C.gold} stroke={C.ink} strokeWidth="1.4" />
      <g transform="rotate(38 36 30)">
        <rect x="33" y="22" width="7" height="18" rx="1.6" fill={C.coral} stroke={C.coralDeep} strokeWidth="1.8" />
        <path d="M33 40 L36.5 46 L40 40 Z" fill={C.peachLight} stroke={C.coralDeep} strokeWidth="1.6" />
      </g>
    </Svg>
  );
}

export function UndoIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M18 14 L9 22 L18 30" fill="none" stroke={C.forestDeep} strokeWidth="4.5" />
      <path d="M10 22 H28 C35 22 40 27 40 33 C40 38 36 41 31 41 H24" fill="none" stroke={C.forestDeep} strokeWidth="4.5" />
    </Svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M11 15 H37" stroke={C.coralDeep} strokeWidth="4" />
      <path d="M19 15 V10 H29 V15" fill="none" stroke={C.coralDeep} strokeWidth="3.4" />
      <path d="M14 15 L16 40 H32 L34 15 Z" fill={C.peachLight} stroke={C.coralDeep} strokeWidth="3.4" />
      <path d="M21 22 V33 M27 22 V33" stroke={C.coralDeep} strokeWidth="3" />
    </Svg>
  );
}

export function ClipboardIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="9" y="8" width="30" height="36" rx="4" fill={C.wood} stroke={C.woodDeep} strokeWidth="3" />
      <rect x="13" y="13" width="22" height="27" rx="2" fill={C.white} />
      <rect x="17" y="5" width="14" height="8" rx="3" fill={C.blueDeep} />
      <circle cx="19" cy="21" r="2.6" fill={C.berry} />
      <path d="M24 21 H31" stroke={C.inkSoft} strokeWidth="2.4" />
      <circle cx="19" cy="28" r="2.6" fill={C.gold} />
      <path d="M24 28 H31" stroke={C.inkSoft} strokeWidth="2.4" />
      <circle cx="19" cy="35" r="2.6" fill={C.mint} />
      <path d="M24 35 H29" stroke={C.inkSoft} strokeWidth="2.4" />
    </Svg>
  );
}

export function StampIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 8 H28 C30 8 31 10 30 12 L28 22 H20 L18 12 C17 10 18 8 20 8 Z" fill={C.berry} stroke="#c55a83" strokeWidth="3" />
      <rect x="10" y="22" width="28" height="9" rx="3" fill={C.wood} stroke={C.woodDeep} strokeWidth="3" />
      <path d="M11 35 H37" stroke={C.berry} strokeWidth="4" />
      <path d="M17 40 H31" stroke={C.berry} strokeWidth="3" opacity="0.6" />
    </Svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M10 24 H36 M26 13 L37 24 L26 35" fill="none" stroke={C.white} strokeWidth="5" />
    </Svg>
  );
}

/** Two speech bubbles: a little idea to talk about together. */
export function TalkIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 10 H28 C30 10 31 11 31 13 V25 C31 27 30 28 28 28 H16 L10 33 V28 H6 C4 28 3 27 3 25 V13 C3 11 4 10 6 10 Z" fill={C.goldLight} stroke={C.goldDeep} strokeWidth="2.6" />
      <path d="M22 22 H42 C44 22 45 23 45 25 V35 C45 37 44 38 42 38 H39 V42 L34 38 H22 C20 38 19 37 19 35 V25 C19 23 20 22 22 22 Z" fill={C.blueLight} stroke={C.blueDeep} strokeWidth="2.6" />
    </Svg>
  );
}

export function SpeakerIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 19 H15 L25 10 V38 L15 29 H8 Z" fill={C.gold} stroke={C.goldDeep} strokeWidth="3" />
      <path d="M31 18 C34 21 34 27 31 30" fill="none" stroke={C.forestDeep} strokeWidth="3.5" />
      <path d="M36 13 C42 19 42 29 36 35" fill="none" stroke={C.forestDeep} strokeWidth="3.5" />
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
