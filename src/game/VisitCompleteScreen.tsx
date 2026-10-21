import { useEffect, useRef, useState } from 'react';
import { EffectsLayer } from '../animations/Effects';
import { useSettings } from '../app/settings';
import { Creature } from '../characters/Creature';
import { BottomBar, TopBar } from '../components/Frame';
import { BookIcon, DoorIcon } from '../icons/UiIcons';
import { StickerArt } from '../stickers/StickerArt';
import { STICKERS, type StickerId } from '../stickers/catalog';
import { PATIENT_BY_ID } from './patients';
import type { PatientId } from './types';
import { useReactionPlayer } from './useReactionPlayer';

/**
 * A short, happy ending: the patient's farewell, the sticker, then a calm pause with clear choices.
 * Nothing starts automatically after this.
 */
export function VisitCompleteScreen({
  patientId,
  stickerId,
  onWaitingRoom,
  onStickers,
  onGrownUps,
  onExit,
  onStickerLanded,
  bookKey,
}: {
  patientId: PatientId;
  stickerId: StickerId;
  onWaitingRoom: () => void;
  onStickers: () => void;
  onGrownUps: () => void;
  onExit: () => void;
  onStickerLanded: () => void;
  bookKey: number;
}) {
  const def = PATIENT_BY_ID[patientId];
  const { play, announce, calm } = useSettings();
  const player = useReactionPlayer(def);
  const [stage, setStage] = useState<'farewell' | 'sticker' | 'flying' | 'done'>('farewell');
  const stickerRef = useRef<HTMLDivElement>(null);
  const landed = useRef(false);

  useEffect(() => {
    player.play(def.farewell);
    const farewellMs = def.farewell.reduce((sum, b) => sum + b.ms, 0);
    const showSticker = window.setTimeout(() => {
      setStage('sticker');
      play('sparkle');
      announce(`You earned the ${STICKERS[stickerId].name} sticker! It goes into your sticker book.`);
    }, Math.min(farewellMs, 3200));
    return () => window.clearTimeout(showSticker);
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stage !== 'sticker') return;
    const t = window.setTimeout(() => setStage('flying'), 1500);
    return () => window.clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'flying') return;
    const el = stickerRef.current;
    const target = document.querySelector('[data-book-target]');
    const finish = () => {
      if (landed.current) return;
      landed.current = true;
      setStage('done');
      play('pop');
      onStickerLanded();
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
  }, [stage, calm, play, onStickerLanded]);

  const expression = player.visual.expression ?? 'happy';

  return (
    <div className="screen complete">
      <TopBar onHome={onWaitingRoom} homeLabel="Back to the waiting room" onStickers={onStickers} onGrownUps={onGrownUps} bookKey={bookKey} />
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
        {stage === 'sticker' || stage === 'flying' ? (
          <div ref={stickerRef} className="complete__sticker" role="img" aria-label={`${STICKERS[stickerId].name} sticker`}>
            <StickerArt id={stickerId} />
          </div>
        ) : null}
        <div className={`complete__choices${stage === 'farewell' ? '' : ' is-visible'}`}>
          <button type="button" className="big-choice big-choice--room" onClick={onWaitingRoom}>
            <DoorIcon className="big-choice__icon" />
            <span>Next patient</span>
          </button>
          <button type="button" className="big-choice big-choice--book" onClick={onStickers}>
            <BookIcon className="big-choice__icon" />
            <span>My stickers</span>
          </button>
        </div>
      </main>
      <BottomBar onExit={onExit} highlightExit={stage === 'done'} />
    </div>
  );
}
