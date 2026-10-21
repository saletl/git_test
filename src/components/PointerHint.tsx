import { useEffect } from 'react';
import type { PxBox } from '../utils/useSvgLayout';

/** A friendly cartoon hand that taps once or twice, then disappears. */
export function HandArt() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path
        d="M24 30 V10 C24 6 30 6 30 10 V28 L31 22 C31.5 18.5 37 19 36.5 22.5 L36 29 L37 25 C38 21.5 43 22.5 42.5 26 L41.5 31 L43 29 C45 26.5 49 28.5 47.5 32 L42 46 C39.5 53 34 57 27 57 C20 57 15 52 15 45 V36 C15 32.5 20 32 21 35.5 L24 42 Z"
        fill="#fffaf0"
        stroke="#3d3631"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M18 8 C15 10 14 13 14.5 16 M34 6 C37 7.5 38.5 10 38.5 13" fill="none" stroke="#ee8b6f" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function PointerHint({ box, onDone, duration = 2600 }: { box: PxBox; onDone: () => void; duration?: number }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, duration);
    return () => window.clearTimeout(t);
  }, [onDone, duration]);
  return (
    <div
      className="pointer-hint"
      aria-hidden="true"
      style={{ left: box.left + box.width / 2 - 8, top: box.top + box.height * 0.45, animationDuration: `${duration}ms` }}
    >
      <HandArt />
    </div>
  );
}
