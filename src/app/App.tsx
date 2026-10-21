import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { stopAllSounds } from '../audio/sound';
import { resolveOffice } from '../config/office';
import { ExamScreen } from '../game/ExamScreen';
import { GoodbyeScreen } from '../game/GoodbyeScreen';
import { gameReducer, initialGameState } from '../game/state';
import { VisitCompleteScreen } from '../game/VisitCompleteScreen';
import { WaitingRoomScreen } from '../game/WaitingRoomScreen';
import { WelcomeScreen } from '../game/WelcomeScreen';
import type { PatientId } from '../game/types';
import { ParentGate } from '../parent/ParentGate';
import { ProgressStore } from '../services/storage';
import { ColoringBook } from '../coloring/ColoringBook';
import { SettingsProvider, useSettings } from './settings';

const ParentArea = lazy(() => import('../parent/ParentArea'));

const store = new ProgressStore();
const saved = store.load();

export function App() {
  const onSettingsChange = useCallback((muted: boolean, calm: boolean) => {
    const current = store.load();
    store.save({ ...current, muted, calm });
  }, []);
  return (
    <SettingsProvider initialMuted={saved.muted} initialCalm={saved.calm} onChange={onSettingsChange}>
      <Game />
    </SettingsProvider>
  );
}

function Game() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => initialGameState(saved.pages));
  const [bookKey, setBookKey] = useState(0);
  const office = useMemo(() => resolveOffice(window.location.search), []);
  const settings = useSettings();

  useEffect(() => {
    const current = store.load();
    store.save({ ...current, pages: state.pages });
  }, [state.pages]);

  const openBook = useCallback(() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'coloringBook' }), []);
  const openGate = useCallback(() => {
    settings.play('tap');
    dispatch({ type: 'OPEN_OVERLAY', overlay: 'parentGate' });
  }, [settings]);
  const exit = useCallback((patientId: PatientId | null = null, earned = false) => {
    stopAllSounds();
    dispatch({ type: 'EXIT', patientId, earned });
  }, []);
  const toWaitingRoom = useCallback(() => dispatch({ type: 'BACK_TO_WAITING_ROOM' }), []);
  const enterExam = useCallback((patientId: PatientId) => dispatch({ type: 'ENTER_EXAM', patientId }), []);
  const onPageLanded = useCallback(() => setBookKey((k) => k + 1), []);

  const screen = state.screen;
  const overlayOpen = state.overlay !== null;

  let content: React.ReactNode = null;
  switch (screen.name) {
    case 'welcome':
      content = (
        <WelcomeScreen office={office} onPlay={() => dispatch({ type: 'START' })} onBook={openBook} onGrownUps={openGate} />
      );
      break;
    case 'waitingRoom':
      content = (
        <WaitingRoomScreen
          entering={screen.entering}
          onChoose={(patientId) => dispatch({ type: 'CHOOSE_PATIENT', patientId })}
          onEnterExam={enterExam}
          onHome={() => dispatch({ type: 'GO_HOME' })}
          onBook={openBook}
          onGrownUps={openGate}
          onExit={() => exit()}
          bookKey={bookKey}
        />
      );
      break;
    case 'exam':
      content = (
        <ExamScreen
          key={screen.visitKey}
          patientId={screen.patientId}
          onComplete={(patientId) => dispatch({ type: 'COMPLETE_VISIT', patientId })}
          onExit={(patientId, earned) => exit(patientId, earned)}
          onWaitingRoom={toWaitingRoom}
          onBook={openBook}
          onGrownUps={openGate}
          bookKey={bookKey}
          paused={overlayOpen}
        />
      );
      break;
    case 'visitComplete':
      content = (
        <VisitCompleteScreen
          key={`${screen.patientId}-${state.visitCounter}`}
          patientId={screen.patientId}
          pageId={screen.pageId}
          onWaitingRoom={toWaitingRoom}
          onBook={openBook}
          onGrownUps={openGate}
          onExit={() => exit(screen.patientId)}
          onPageLanded={onPageLanded}
          bookKey={bookKey}
        />
      );
      break;
    case 'goodbye':
      content = (
        <GoodbyeScreen
          key={state.visitCounter}
          patientId={screen.patientId}
          pageId={screen.pageId}
          onFinish={() => dispatch({ type: 'FINISH_GOODBYE' })}
        />
      );
      break;
  }

  return (
    <div className="app">
      <div className="app__screen" inert={overlayOpen} aria-hidden={overlayOpen || undefined}>
        {content}
      </div>
      {state.overlay === 'coloringBook' ? (
        <div className="app__overlay">
          <ColoringBook
            pages={state.pages}
            newPage={state.newPage}
            onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
            onGrownUps={openGate}
            onExit={() => exit(screen.name === 'exam' ? screen.patientId : null)}
          />
        </div>
      ) : null}
      {state.overlay === 'parentGate' ? (
        <ParentGate onPass={() => dispatch({ type: 'OPEN_OVERLAY', overlay: 'parentArea' })} onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })} />
      ) : null}
      {state.overlay === 'parentArea' ? (
        <Suspense
          fallback={
            <div className="adult-overlay">
              <div className="adult-card">
                <p>Opening the grown-up area...</p>
              </div>
            </div>
          }
        >
          <ParentArea
            pages={state.pages}
            storagePersistent={store.persistent}
            onReset={() => dispatch({ type: 'RESET_PAGES' })}
            onClose={() => dispatch({ type: 'CLOSE_OVERLAY' })}
          />
        </Suspense>
      ) : null}
      <div className="rotate-hint" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <rect x="38" y="18" width="44" height="80" rx="9" fill="#fffaf0" stroke="#4f7259" strokeWidth="5" />
          <circle cx="60" cy="86" r="4" fill="#4f7259" />
          <path d="M96 50 C104 62 102 78 90 88" fill="none" stroke="#ee8b6f" strokeWidth="5" strokeLinecap="round" />
          <path d="M86 82 L90 90 L98 86" fill="none" stroke="#ee8b6f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p>Turn your phone up tall to play.</p>
      </div>
    </div>
  );
}
