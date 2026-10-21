import type { ReactNode } from 'react';
import { useSettings } from '../app/settings';
import { BackIcon, BookIcon, HomeIcon, LockIcon, SoundIcon, WaveIcon } from '../icons/UiIcons';

/**
 * Every child-facing screen shares the same frame, so controls never move:
 * home at top left; sound, coloring book and grown-ups at top right; the "all done" wave at bottom left.
 */

export interface FrameActions {
  onHome?: () => void;
  homeKind?: 'home' | 'back';
  homeLabel?: string;
  onBook?: () => void;
  onGrownUps?: () => void;
  onExit: () => void;
  bookKey?: number;
}

export function IconButton({
  label,
  onClick,
  children,
  className = '',
  pressed,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  pressed?: boolean;
}) {
  return (
    <button type="button" className={`icon-btn ${className}`} aria-label={label} aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  );
}

export function TopBar({ onHome, homeKind = 'home', homeLabel, onBook, onGrownUps, bookKey = 0 }: Omit<FrameActions, 'onExit'>) {
  const { muted, toggleMuted, play } = useSettings();
  return (
    <header className="top-bar">
      <div className="top-bar__left">
        {onHome ? (
          <IconButton
            label={homeLabel ?? (homeKind === 'back' ? 'Back' : 'Waiting room')}
            onClick={() => {
              play('tap');
              onHome();
            }}
          >
            {homeKind === 'back' ? <BackIcon /> : <HomeIcon />}
          </IconButton>
        ) : null}
      </div>
      <div className="top-bar__right">
        <IconButton label={muted ? 'Sound is off. Turn sound on' : 'Sound is on. Turn sound off'} pressed={!muted} onClick={toggleMuted}>
          <SoundIcon on={!muted} />
        </IconButton>
        {onBook ? (
          <IconButton
            label="My coloring book"
            className={`book-btn${bookKey ? ' book-btn--bump' : ''}`}
            onClick={() => {
              play('page');
              onBook();
            }}
          >
            <span key={bookKey} className="book-btn__art" data-book-target>
              <BookIcon />
            </span>
          </IconButton>
        ) : null}
        {onGrownUps ? (
          <button type="button" className="grownups-btn" onClick={onGrownUps}>
            <LockIcon />
            <span>Grown-ups</span>
          </button>
        ) : null}
      </div>
    </header>
  );
}

export function ExitButton({ onExit, highlight = false }: { onExit: () => void; highlight?: boolean }) {
  const { play } = useSettings();
  return (
    <button
      type="button"
      className={`exit-btn${highlight ? ' exit-btn--highlight' : ''}`}
      onClick={() => {
        play('tap');
        onExit();
      }}
      aria-label="All done. My doctor is ready!"
    >
      <WaveIcon className="exit-btn__icon" />
      <span className="exit-btn__text">All done</span>
    </button>
  );
}

export function BottomBar({ onExit, right, highlightExit }: { onExit: () => void; right?: ReactNode; highlightExit?: boolean }) {
  return (
    <footer className="bottom-bar">
      <ExitButton onExit={onExit} highlight={highlightExit} />
      <div className="bottom-bar__right">{right}</div>
    </footer>
  );
}
