import type { ReactNode } from 'react';
import { useSettings } from '../../app/settings';
import { ActivityArt } from '../../icons/ActivityIcons';
import { CloseIcon } from '../../icons/UiIcons';
import type { ActivityId } from '../types';

/** The shared frame for a mini-adventure: picture and name on the left, a big close button on the right. */
export function ActivityPanel({
  id,
  title,
  onClose,
  children,
  closeLabel = 'Back to the doctor tools',
}: {
  id: ActivityId;
  title: string;
  onClose: () => void;
  children: ReactNode;
  closeLabel?: string;
}) {
  const { play } = useSettings();
  return (
    <section className="activity-panel" aria-label={title} data-activity={id}>
      <header className="activity-panel__head">
        <ActivityArt id={id} className="activity-panel__pic" />
        <h2 className="activity-panel__title">{title}</h2>
        <button
          type="button"
          className="activity-panel__close"
          aria-label={closeLabel}
          onClick={() => {
            play('tap');
            onClose();
          }}
        >
          <CloseIcon />
        </button>
      </header>
      <div className="activity-panel__body">{children}</div>
    </section>
  );
}

/** A big picture button with a short word under it, used inside activities. */
export function ChoiceButton({
  label,
  onClick,
  children,
  selected,
  glow,
  className = '',
  ariaLabel,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  selected?: boolean;
  glow?: boolean;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`pick-btn${selected ? ' is-selected' : ''}${glow ? ' is-glowing' : ''} ${className}`}
      aria-label={ariaLabel ?? label}
      aria-pressed={selected}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="pick-btn__pic">{children}</span>
      <span className="pick-btn__label" aria-hidden="true">
        {label}
      </span>
    </button>
  );
}
