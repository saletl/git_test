import { useEffect, useState } from 'react';
import { EffectsLayer } from '../animations/Effects';
import { hamsterArt } from '../art/hamster';
import { useSettings } from '../app/settings';
import { Creature } from '../characters/Creature';
import { PAGES, type PageId } from '../coloring/catalog';
import { PageView } from '../coloring/PageView';
import { PATIENTS, PATIENT_BY_ID } from './patients';
import type { PatientDefinition, PatientId } from './types';
import { useReactionPlayer } from './useReactionPlayer';

/**
 * Shown the moment someone taps "All done". No questions, no warnings, no countdown:
 * just a wave, a cheerful picture, and one big button to finish.
 */
export function GoodbyeScreen({
  patientId,
  pageId,
  onFinish,
}: {
  patientId: PatientId | null;
  pageId: PageId | null;
  onFinish: () => void;
}) {
  const { play, announce } = useSettings();
  useEffect(() => {
    play('jingle');
    announce(pageId ? `Bye-bye! ${PAGES[pageId].name}'s coloring page is saved in your coloring book.` : 'Bye-bye! See you next time.');
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="screen goodbye">
      <main className="goodbye__main">
        <svg className="goodbye__sky" viewBox="0 0 400 860" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="400" height="860" fill="#e1edf3" />
          <g fill="none" strokeWidth="18" strokeLinecap="round" opacity="0.85">
            <path d="M14 660 A186 186 0 0 1 386 660" stroke="#ee8b6f" />
            <path d="M34 660 A166 166 0 0 1 366 660" stroke="#e9be5c" />
            <path d="M54 660 A146 146 0 0 1 346 660" stroke="#a9c3a0" />
            <path d="M74 660 A126 126 0 0 1 326 660" stroke="#8fb3c9" />
          </g>
          <path d="M-40 680 C60 620 140 640 200 650 C270 662 330 620 440 650 V900 H-40 Z" fill="#cfe0c6" />
          <g transform="translate(318 118)">
            <circle r="40" fill="#f5da92" />
            <circle r="30" fill="#e9be5c" />
            <circle cx="-9" cy="-5" r="3.4" fill="#3d3631" />
            <circle cx="9" cy="-5" r="3.4" fill="#3d3631" />
            <path d="M-10 7 C-5 14 5 14 10 7" stroke="#3d3631" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          </g>
          <g fill="#ffffff">
            <circle cx="70" cy="170" r="20" />
            <circle cx="96" cy="160" r="25" />
            <circle cx="124" cy="172" r="18" />
            <circle cx="250" cy="268" r="14" />
            <circle cx="270" cy="260" r="18" />
            <circle cx="290" cy="270" r="13" />
          </g>
        </svg>
        <p className="goodbye__words" aria-hidden="true">
          Bye-bye!
        </p>
        <div className="goodbye__friends">
          {patientId ? <WavingPatient def={PATIENT_BY_ID[patientId]} /> : <WavingCrew />}
          {pageId ? (
            <div className="goodbye__page" role="img" aria-label={`${PAGES[pageId].name}'s coloring page saved`}>
              <PageView id={pageId} />
            </div>
          ) : null}
        </div>
        <button type="button" className="done-btn" aria-label="Finish" onClick={onFinish}>
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path d="M12 25 L21 34 L37 15" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </main>
    </div>
  );
}

function WavingPatient({ def }: { def: PatientDefinition }) {
  const player = useReactionPlayer(def, { ...def.initialProps, curl: false });
  useEffect(() => {
    player.play(def.goodbye);
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="goodbye__patient">
      <svg viewBox="0 0 240 240" overflow="visible" aria-hidden="true">
        <Creature
          artist={def.artist}
          expression={player.visual.expression ?? 'happy'}
          look={player.visual.look}
          props={player.props}
          action={player.visual.action ?? 'wave'}
          actionKey={player.visual.actionKey}
        />
        <EffectsLayer effects={player.effects} />
      </svg>
    </div>
  );
}

function WavingCrew() {
  const [key, setKey] = useState(1);
  useEffect(() => {
    const t = window.setInterval(() => setKey((k) => (k < 3 ? k + 1 : k)), 1400);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="goodbye__crew">
      {PATIENTS.map((p) => (
        <div key={p.id} className="goodbye__crew-member">
          <Creature artist={p.artist} expression="happy" props={p.waitingProps ?? p.initialProps} action="wave" actionKey={key} />
        </div>
      ))}
      <div className="goodbye__crew-member goodbye__crew-member--hamster">
        <Creature artist={hamsterArt} expression="giggle" action="wave" actionKey={key} />
      </div>
    </div>
  );
}
