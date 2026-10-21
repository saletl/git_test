import { useEffect, useRef, useState } from 'react';
import { EffectsLayer } from '../animations/Effects';
import { useSettings } from '../app/settings';
import { Creature } from '../characters/Creature';
import { BottomBar, TopBar } from '../components/Frame';
import { BookIcon, DoorIcon } from '../icons/UiIcons';
import { PAGES, type PageId } from '../coloring/catalog';
import { PageView } from '../coloring/PageView';
import { PATIENT_BY_ID } from './patients';
import type { PatientId } from './types';
import { useReactionPlayer } from './useReactionPlayer';

/**
 * A short, happy ending: the patient's farewell, the new coloring page, then a calm pause with clear choices.
 * Nothing starts automatically after this.
 */
export function VisitCompleteScreen({
  patientId,
  pageId,
  onWaitingRoom,
  onBook,
  onGrownUps,
  onExit,
  onPageLanded,
  bookKey,
}: {
  patientId: PatientId;
  pageId: PageId;
  onWaitingRoom: () => void;
  onBook: () => void;
  onGrownUps: () => void;
  onExit: () => void;
  onPageLanded: () => void;
  bookKey: number;
}) {
  const def = PATIENT_BY_ID[patientId];
  const { play, announce, calm } = useSettings();
  const player = useReactionPlayer(def);
  const [stage, setStage] = useState<'farewell' | 'page' | 'flying' | 'done'>('farewell');
  const pageRef = useRef<HTMLDivElement>(null);
  const landed = useRef(false);

  useEffect(() => {
    player.play(def.farewell);
    const farewellMs = def.farewell.reduce((sum, b) => sum + b.ms, 0);
    const showPage = window.setTimeout(() => {
      setStage('page');
      play('sparkle');
      announce(`You earned ${PAGES[pageId].name}'s coloring page! It goes into your coloring book.`);
    }, Math.min(farewellMs, 3600));
    return () => window.clearTimeout(showPage);
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stage !== 'page') return;
    const t = window.setTimeout(() => setStage('flying'), 1800);
    return () => window.clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'flying') return;
    const el = pageRef.current;
    const target = document.querySelector('[data-book-target]');
    const finish = () => {
      if (landed.current) return;
      landed.current = true;
      setStage('done');
      play('pop');
      onPageLanded();
    };
    if (!el || !target || calm || !el.animate) {
      const t = window.setTimeout(finish, calm ? 400 : 0);
      return () => window.clearTimeout(t);
    }
    const from = el.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const anim = el.animate(
      [
        { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - 40}px) scale(0.7) rotate(-8deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.12) rotate(10deg)`, opacity: 0.6 },
      ],
      { duration: 900, easing: 'ease-in', fill: 'forwards' },
    );
    anim.onfinish = finish;
    const fallback = window.setTimeout(finish, 1200);
    return () => {
      window.clearTimeout(fallback);
    };
  }, [stage, calm, play, onPageLanded]);

  const expression = player.visual.expression ?? 'happy';

  return (
    <div className="screen complete">
      <TopBar onHome={onWaitingRoom} homeLabel="Back to the waiting room" onBook={onBook} onGrownUps={onGrownUps} bookKey={bookKey} />
      <main className="complete__main">
        <div className="complete__burst" aria-hidden="true" />
        <div className="complete__patient">
          <svg viewBox="0 0 240 240" overflow="visible" aria-hidden="true">
            <Creature
              artist={def.artist}
              expression={expression}
              look={player.visual.look}
              props={player.props}
              action={player.visual.action}
              actionKey={player.visual.actionKey}
            />
            <EffectsLayer effects={player.effects} />
          </svg>
        </div>
        {stage === 'page' || stage === 'flying' ? (
          <div ref={pageRef} className="complete__page" role="img" aria-label={`New coloring page: ${PAGES[pageId].title}`}>
            <PageView id={pageId} />
          </div>
        ) : null}
        <div className={`complete__choices${stage === 'farewell' ? '' : ' is-visible'}`}>
          <button type="button" className="big-choice big-choice--room" onClick={onWaitingRoom}>
            <DoorIcon className="big-choice__icon" />
            <span>Next patient</span>
          </button>
          <button type="button" className="big-choice big-choice--book" onClick={onBook}>
            <BookIcon className="big-choice__icon" />
            <span>My coloring book</span>
          </button>
        </div>
      </main>
      <BottomBar onExit={onExit} highlightExit={stage === 'done'} />
    </div>
  );
}
