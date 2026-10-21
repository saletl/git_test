import { useEffect, useState } from 'react';
import { useSettings } from '../app/settings';
import { brand, game } from '../config/brand';
import type { OfficeConfig } from '../config/offices';
import { Creature } from '../characters/Creature';
import { TopBar } from '../components/Frame';
import { PlayIcon } from '../icons/UiIcons';
import { PATIENTS } from './patients';
import type { Expression } from '../art/face';
import type { PatientId } from './types';

export function WelcomeScreen({
  office,
  onPlay,
  onStickers,
  onGrownUps,
}: {
  office: OfficeConfig | null;
  onPlay: () => void;
  onStickers: () => void;
  onGrownUps: () => void;
}) {
  const { unlock, play, announce } = useSettings();
  const [poked, setPoked] = useState<{ id: PatientId; key: number } | null>(null);
  const [nudge, setNudge] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setNudge(true), 3500);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="screen welcome">
      <TopBar onStickers={onStickers} onGrownUps={onGrownUps} />
      <main className="welcome__main">
        {office ? (
          <div className="welcome__office">
            {office.logoSrc ? <img src={office.logoSrc} alt="" className="welcome__office-logo" /> : null}
            <p className="welcome__office-name">Welcome from {office.displayName}</p>
            {office.welcomeMessage ? <p className="welcome__office-message">{office.welcomeMessage}</p> : null}
          </div>
        ) : null}
        <h1 className="welcome__title" aria-label={game.title}>
          <span className="welcome__title-small">The</span>
          <span className="welcome__title-big">Curious Creature</span>
          <span className="welcome__title-clinic">
            Clinic
            <svg viewBox="0 0 24 24" className="welcome__title-heart" aria-hidden="true">
              <path d="M12 21 C4 16 1.5 12 3 8 C4.5 4 9 3.5 12 7 C15 3.5 19.5 4 21 8 C22.5 12 20 16 12 21 Z" fill="currentColor" />
            </svg>
          </span>
        </h1>
        <p className="welcome__tagline">{game.tagline}</p>

        <div className="welcome__stage">
          <svg viewBox="0 0 360 150" className="welcome__clinic" aria-hidden="true">
            <ellipse cx="180" cy="142" rx="176" ry="14" fill="#a9c3a0" />
            <path d="M70 140 V58 C70 36 90 20 112 20 H248 C270 20 290 36 290 58 V140 Z" fill="#fffaf0" stroke="#4f7259" strokeWidth="4" />
            <path d="M58 62 L180 4 L302 62" fill="none" stroke="#ee8b6f" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="152" y="70" width="56" height="70" rx="26" fill="#8fb3c9" stroke="#5d86a3" strokeWidth="4" />
            <circle cx="196" cy="108" r="4" fill="#e9be5c" />
            <circle cx="180" cy="44" r="15" fill="#fffaf0" stroke="#ee8b6f" strokeWidth="3" />
            <path d="M180 53 C172 48 170 44 172 41 C173.5 38.5 177 38.5 180 42 C183 38.5 186.5 38.5 188 41 C190 44 188 48 180 53 Z" fill="#ee8b6f" />
            <rect x="92" y="72" width="40" height="34" rx="8" fill="#c4dce8" stroke="#5d86a3" strokeWidth="3" />
            <rect x="228" y="72" width="40" height="34" rx="8" fill="#c4dce8" stroke="#5d86a3" strokeWidth="3" />
          </svg>
          <div className="welcome__crew">
            {PATIENTS.map((p, i) => {
              const isPoked = poked?.id === p.id;
              const expression: Expression = isPoked ? 'giggle' : p.id === 'prickle' ? 'shy' : 'happy';
              return (
                <button
                  key={p.id}
                  type="button"
                  className="welcome__creature"
                  style={{ animationDelay: `${i * 0.35}s` }}
                  aria-label={`Say hi to ${p.name}`}
                  onClick={() => {
                    unlock();
                    play('giggle');
                    announce(`${p.name} waves hello!`);
                    setPoked({ id: p.id, key: (poked?.key ?? 0) + 1 });
                  }}
                >
                  <Creature
                    artist={p.artist}
                    expression={expression}
                    props={p.waitingProps ?? p.initialProps}
                    action={isPoked ? 'bounce' : null}
                    actionKey={isPoked ? poked.key : 0}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className={`play-btn${nudge ? ' play-btn--nudge' : ''}`}
          aria-label="Play"
          onClick={() => {
            unlock();
            play('jingle');
            onPlay();
          }}
        >
          <PlayIcon className="play-btn__icon" />
        </button>
      </main>
      <p className="welcome__credit">{brand.credit}</p>
    </div>
  );
}
