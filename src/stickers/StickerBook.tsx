import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../app/settings';
import { BottomBar, TopBar } from '../components/Frame';
import { HandArt } from '../components/PointerHint';
import { session } from '../game/session';
import { DoorIcon } from '../icons/UiIcons';
import { EmptySticker, StickerArt } from './StickerArt';
import { BOOK_SLOTS, PAGE_HEIGHT, PAGE_WIDTH, STICKERS, STICKER_IDS, STICKER_SIZE, type StickerId } from './catalog';
import { PageDecorations } from './PageDecorations';

/**
 * The scrapbook. Tap a sticker to pick it up, then tap a dotted spot to stick it there.
 * Tap a stuck sticker to make it wiggle and pick it up again.
 */
export function StickerBook({
  stickers,
  placements,
  newSticker,
  onPlace,
  onClose,
  onGrownUps,
  onExit,
}: {
  stickers: StickerId[];
  placements: Partial<Record<StickerId, number>>;
  newSticker: StickerId | null;
  onPlace: (id: StickerId, slot: number | null) => void;
  onClose: () => void;
  onGrownUps: () => void;
  onExit: () => void;
}) {
  const { play, announce } = useSettings();
  const [selected, setSelected] = useState<StickerId | null>(null);
  const [wiggle, setWiggle] = useState<{ id: StickerId; key: number } | null>(null);
  const [hint, setHint] = useState<{ from: number; to: number } | null>(null);
  const touched = useRef(false);

  const placedAt = new Map<number, StickerId>();
  for (const id of stickers) {
    const slot = placements[id];
    if (slot !== undefined) placedAt.set(slot, id);
  }
  const unplaced = STICKER_IDS.filter((id) => stickers.includes(id) && placements[id] === undefined);
  const firstFree = BOOK_SLOTS.findIndex((_, i) => !placedAt.has(i));

  useEffect(() => {
    if (session.bookHintShown || unplaced.length === 0 || firstFree < 0) return;
    const t = window.setTimeout(() => {
      if (touched.current) return;
      session.bookHintShown = true;
      setHint({ from: STICKER_IDS.indexOf(unplaced[0]!), to: firstFree });
    }, 2500);
    return () => window.clearTimeout(t);
  }, [unplaced, firstFree]);

  useEffect(() => {
    if (!hint) return;
    const t = window.setTimeout(() => setHint(null), 3000);
    return () => window.clearTimeout(t);
  }, [hint]);

  const touch = () => {
    touched.current = true;
    setHint(null);
  };

  const pick = (id: StickerId) => {
    touch();
    if (selected === id) {
      setSelected(null);
      play('tap');
      return;
    }
    setSelected(id);
    setWiggle({ id, key: (wiggle?.key ?? 0) + 1 });
    play('select');
    announce(`${STICKERS[id].name} picked up. Tap a dotted spot on the page to stick it there.`);
  };

  const dropOn = (slot: number) => {
    touch();
    const occupant = placedAt.get(slot);
    if (!selected) {
      if (occupant) pick(occupant);
      return;
    }
    if (occupant === selected) {
      setSelected(null);
      return;
    }
    onPlace(selected, slot);
    play('stick');
    setWiggle({ id: selected, key: (wiggle?.key ?? 0) + 1 });
    announce(`${STICKERS[selected].name} is stuck on the page!`);
    setSelected(null);
  };

  const returnToTray = () => {
    touch();
    if (selected && placements[selected] !== undefined) {
      onPlace(selected, null);
      play('page');
      announce(`${STICKERS[selected].name} is back in the sticker pocket.`);
    }
    setSelected(null);
  };

  const slotStyle = (slot: number) => {
    const s = BOOK_SLOTS[slot]!;
    return {
      left: `${((s.x - STICKER_SIZE / 2) / PAGE_WIDTH) * 100}%`,
      top: `${((s.y - STICKER_SIZE / 2) / PAGE_HEIGHT) * 100}%`,
      width: `${(STICKER_SIZE / PAGE_WIDTH) * 100}%`,
      height: `${(STICKER_SIZE / PAGE_HEIGHT) * 100}%`,
      ['--rot' as string]: `${s.rotate}deg`,
    };
  };

  return (
    <div className="screen book" role="dialog" aria-label="My sticker book">
      <TopBar onHome={onClose} homeKind="back" homeLabel="Close the sticker book" onGrownUps={onGrownUps} />
      <main className="book__main">
        <div className="book__page-wrap">
          <div className={`book__page${selected ? ' is-placing' : ''}`}>
            <svg className="book__decor" viewBox={`0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}`} aria-hidden="true">
              <PageDecorations />
            </svg>
            {BOOK_SLOTS.map((_, slot) => {
              const id = placedAt.get(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  className={`book__slot${id ? ' has-sticker' : ''}${id && selected === id ? ' is-selected' : ''}`}
                  style={slotStyle(slot)}
                  aria-label={id ? `${STICKERS[id].description}. Tap to pick it up.` : selected ? 'Stick it here' : 'Empty sticker spot'}
                  onClick={() => dropOn(slot)}
                >
                  {id ? (
                    <span key={wiggle?.id === id ? wiggle.key : 0} className={`book__sticker${wiggle?.id === id ? ' is-wiggling' : ''} sticker--${id}`}>
                      <StickerArt id={id} />
                    </span>
                  ) : (
                    <span className="book__dots" aria-hidden="true" />
                  )}
                </button>
              );
            })}
            {hint ? <BookHint from={hint.from} to={hint.to} /> : null}
          </div>
        </div>

        <div className="book__tray" role="group" aria-label="Sticker pocket" onClick={(e) => e.target === e.currentTarget && returnToTray()}>
          {stickers.length === 0 ? (
            <div className="book__empty">
              <DoorIcon className="book__empty-icon" />
              <p>Help a patient to earn your first sticker!</p>
            </div>
          ) : null}
          {STICKER_IDS.map((id, i) => {
            const have = stickers.includes(id);
            const onPage = placements[id] !== undefined;
            if (!have) {
              return (
                <span key={id} className="tray-slot tray-slot--empty" aria-hidden={stickers.length === 0}>
                  <EmptySticker />
                  <span className="sr-only">A sticker still to find</span>
                </span>
              );
            }
            if (onPage) {
              return (
                <button
                  key={id}
                  type="button"
                  className={`tray-slot tray-slot--used${selected === id ? ' is-target' : ''}`}
                  aria-label={selected === id ? `Put ${STICKERS[id].name} back in the pocket` : `${STICKERS[id].name} is on the page`}
                  onClick={() => (selected === id ? returnToTray() : pick(id))}
                  style={{ ['--i' as string]: i }}
                >
                  <EmptySticker />
                </button>
              );
            }
            return (
              <button
                key={id}
                type="button"
                className={`tray-slot${selected === id ? ' is-selected' : ''}${newSticker === id ? ' is-new' : ''}`}
                aria-label={`${STICKERS[id].description}. Tap to pick it up.`}
                aria-pressed={selected === id}
                onClick={() => pick(id)}
              >
                <span key={wiggle?.id === id ? wiggle.key : 0} className={`tray-slot__art${wiggle?.id === id ? ' is-wiggling' : ''}`}>
                  <StickerArt id={id} />
                </span>
              </button>
            );
          })}
        </div>
      </main>
      <BottomBar onExit={onExit} />
    </div>
  );
}

function BookHint({ from, to }: { from: number; to: number }) {
  const slot = BOOK_SLOTS[to]!;
  return (
    <div
      className="book-hint"
      aria-hidden="true"
      style={{
        ['--to-x' as string]: `${(slot.x / PAGE_WIDTH) * 100}%`,
        ['--to-y' as string]: `${(slot.y / PAGE_HEIGHT) * 100}%`,
        ['--from-i' as string]: from,
      }}
    >
      <HandArt />
    </div>
  );
}
