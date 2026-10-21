import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../app/settings';
import { Creature } from '../characters/Creature';
import { BottomBar, TopBar } from '../components/Frame';
import { PATIENT_BY_ID } from '../game/patients';
import { PageView } from './PageView';
import { PAGE_IDS, PAGES, type PageId } from './catalog';

/**
 * My Creature Clinic Coloring Book: exactly four pages, one for each patient.
 * Earned pages show a thumbnail that opens a big preview; the others show who to visit.
 */
export function ColoringBook({
  pages,
  newPage,
  onClose,
  onGrownUps,
  onExit,
}: {
  pages: PageId[];
  newPage: PageId | null;
  onClose: () => void;
  onGrownUps: () => void;
  onExit: () => void;
}) {
  const { play, announce } = useSettings();
  const [open, setOpen] = useState<PageId | null>(null);
  const [wiggle, setWiggle] = useState<{ id: PageId; key: number } | null>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const complete = pages.length === PAGE_IDS.length;

  useEffect(() => {
    backRef.current?.querySelector<HTMLButtonElement>('.icon-btn')?.focus();
  }, [open]);

  return (
    <div className="screen book" role="dialog" aria-label="My Creature Clinic Coloring Book">
      <div ref={backRef}>
        <TopBar
          onHome={open ? () => setOpen(null) : onClose}
          homeKind="back"
          homeLabel={open ? 'Back to all the pages' : 'Close the coloring book'}
          onGrownUps={onGrownUps}
        />
      </div>
      <main className="book__main">
        {open ? (
          <div className="book__preview">
            <PageView id={open} className="book__preview-page" title={PAGES[open].description} />
            <p className="book__preview-note">Grown-ups can print this page from the grown-up area.</p>
          </div>
        ) : (
          <>
            <h1 className="book__title">
              My Creature Clinic <span>Coloring Book</span>
            </h1>
            <ul className="book__grid">
              {PAGE_IDS.map((id) => {
                const earned = pages.includes(id);
                const patient = PATIENT_BY_ID[id];
                const first = patient.name.split(' ')[0];
                return (
                  <li key={id}>
                    {earned ? (
                      <button
                        type="button"
                        className={`book__card${newPage === id ? ' is-new' : ''}`}
                        aria-label={`${PAGES[id].title}. ${PAGES[id].description}. Tap to look closer.`}
                        onClick={() => {
                          play('page');
                          setOpen(id);
                        }}
                      >
                        <PageView id={id} className="book__thumb" />
                        <span className="book__card-name">{first}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="book__card book__card--waiting"
                        aria-label={`${first}'s page. Help ${first} at the clinic to add it to your book.`}
                        onClick={() => {
                          play('boing');
                          setWiggle({ id, key: Date.now() });
                          announce(`Help ${first} at the clinic to add this page.`);
                        }}
                      >
                        <span key={wiggle?.id === id ? wiggle.key : 0} className={`book__waiting-art${wiggle?.id === id ? ' is-wiggling' : ''}`} aria-hidden="true">
                          <Creature artist={patient.artist} expression="happy" props={patient.waitingProps ?? patient.initialProps} idle={false} />
                        </span>
                        <span className="book__card-name">{first}</span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            {complete ? <p className="book__complete">All four pages! Your coloring book is complete.</p> : null}
          </>
        )}
      </main>
      <BottomBar onExit={onExit} />
    </div>
  );
}
