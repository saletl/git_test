import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from '../icons/UiIcons';

/**
 * A simple grown-up check to keep curious little fingers in the game.
 * It discourages accidental taps; it is not a form of parental consent.
 */

const WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

export function makeChallenge(random: () => number = Math.random): number[] {
  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const picked: number[] = [];
  while (picked.length < 3) {
    const i = Math.floor(random() * pool.length);
    picked.push(pool.splice(i, 1)[0]!);
  }
  return picked;
}

export function ParentGate({ onPass, onClose }: { onPass: () => void; onClose: () => void }) {
  const [challenge, setChallenge] = useState(() => makeChallenge());
  const [entered, setEntered] = useState<number[]>([]);
  const [tryAgain, setTryAgain] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const press = (n: number) => {
    const next = [...entered, n];
    if (next.length < challenge.length) {
      setEntered(next);
      return;
    }
    if (next.every((v, i) => v === challenge[i])) {
      onPass();
      return;
    }
    setTryAgain(true);
    setEntered([]);
    setChallenge(makeChallenge());
  };

  const words = challenge.map((n) => WORDS[n - 1]).join(', ');

  return (
    <div className="adult-overlay" role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <div className="adult-card gate">
        <button type="button" className="adult-close" onClick={onClose} aria-label="Back to the game">
          <CloseIcon />
        </button>
        <h2 id="gate-title" ref={headingRef} tabIndex={-1}>
          For grown-ups
        </h2>
        <p className="gate__prompt">
          To continue, tap the numbers <strong>{words}</strong> in order.
        </p>
        {tryAgain ? <p className="gate__retry">Not quite. Here are new numbers to try.</p> : null}
        <div className="gate__dots" aria-hidden="true">
          {challenge.map((_, i) => (
            <span key={i} className={i < entered.length ? 'is-filled' : ''} />
          ))}
        </div>
        <div className="gate__pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} type="button" className="gate__key" onClick={() => press(n)}>
              {n}
            </button>
          ))}
        </div>
        <button type="button" className="adult-link" onClick={onClose}>
          Back to the game
        </button>
      </div>
    </div>
  );
}
