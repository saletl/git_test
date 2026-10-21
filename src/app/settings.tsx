import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { playSound, setMuted, setQuiet, unlockAudio, type SoundId } from '../audio/sound';

interface Settings {
  muted: boolean;
  /** Calm mode: less motion, softer sound, fewer particles. Also turned on by the system reduced-motion setting. */
  calm: boolean;
  systemReducedMotion: boolean;
  toggleMuted: () => void;
  setCalm: (value: boolean) => void;
  play: (id: SoundId) => void;
  unlock: () => void;
  announce: (text: string) => void;
}

const SettingsContext = createContext<Settings | null>(null);

export function useSettings(): Settings {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');
  return value;
}

function useReducedMotionQuery(): boolean {
  const [reduced, setReduced] = useState(() => {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    let query: MediaQueryList;
    try {
      query = window.matchMedia('(prefers-reduced-motion: reduce)');
    } catch {
      return;
    }
    const onChange = () => setReduced(query.matches);
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

export function SettingsProvider({
  children,
  initialMuted,
  initialCalm,
  onChange,
}: {
  children: ReactNode;
  initialMuted: boolean;
  initialCalm: boolean;
  onChange: (muted: boolean, calm: boolean) => void;
}) {
  const [muted, setMutedState] = useState(initialMuted);
  const [calmSetting, setCalmSetting] = useState(initialCalm);
  const systemReducedMotion = useReducedMotionQuery();
  const calm = calmSetting || systemReducedMotion;
  const [message, setMessage] = useState('');
  const flip = useRef(false);

  useEffect(() => {
    setMuted(muted);
  }, [muted]);
  useEffect(() => {
    setQuiet(calm);
    document.documentElement.dataset.calm = calm ? 'true' : 'false';
  }, [calm]);
  useEffect(() => {
    onChange(muted, calmSetting);
  }, [muted, calmSetting, onChange]);

  const announce = useCallback((text: string) => {
    // Alternate a zero-width space so repeated messages are still read out.
    flip.current = !flip.current;
    setMessage(text + (flip.current ? '​' : ''));
  }, []);

  const value = useMemo<Settings>(
    () => ({
      muted,
      calm,
      systemReducedMotion,
      toggleMuted: () => {
        unlockAudio();
        setMutedState((m) => !m);
      },
      setCalm: setCalmSetting,
      play: (id: SoundId) => playSound(id),
      unlock: unlockAudio,
      announce,
    }),
    [muted, calm, systemReducedMotion, announce],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {message}
      </div>
    </SettingsContext.Provider>
  );
}
