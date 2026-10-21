import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../app/settings';
import { brand } from '../config/brand';
import { CloseIcon } from '../icons/UiIcons';
import { StickerArt } from '../stickers/StickerArt';
import { layoutStickers, STICKERS, type PlacedSticker, type StickerId } from '../stickers/catalog';
import { EmailForm } from './EmailForm';
import { PrintSheet } from './PrintSheet';
import '../styles/parent.css';

/**
 * The grown-up area. Everything here is for parents and caregivers: saving the sticker book,
 * optional email delivery, a few doctor-visit ideas, settings, and privacy information.
 */

type View = 'home' | 'email';

type DownloadState =
  | { status: 'idle' }
  | { status: 'working' }
  | { status: 'ready'; url: string; file: File | null }
  | { status: 'error' };

const TIPS = [
  'Explain what will happen using simple, accurate words.',
  'Offer real choices where you can, like which arm or which toy to hold.',
  "Let your child know that feeling nervous is okay. Grown-ups feel that way too.",
  'Ask what might help them feel more comfortable, and listen to their ideas.',
  "Avoid promising that something won't hurt when it might. Try “it might pinch for a moment, and I'll be right here.”",
  'Think about sensory needs, like noise or bright lights, and give your child time to take things in.',
];

export default function ParentArea({
  stickers,
  placements,
  storagePersistent,
  onReset,
  onClose,
}: {
  stickers: StickerId[];
  placements: Partial<Record<StickerId, number>>;
  storagePersistent: boolean;
  onReset: () => void;
  onClose: () => void;
}) {
  const { muted, toggleMuted, calm, setCalm, systemReducedMotion } = useSettings();
  const [view, setView] = useState<View>('home');
  const [download, setDownload] = useState<DownloadState>({ status: 'idle' });
  const [confirmReset, setConfirmReset] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const layout: PlacedSticker[] = layoutStickers(stickers, placements);
  const hasStickers = layout.length > 0;

  useEffect(() => {
    headingRef.current?.focus();
  }, [view]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(
    () => () => {
      if (download.status === 'ready') URL.revokeObjectURL(download.url);
    },
    [download],
  );

  // Warm up the PDF code while the grown-up reads, so the download is quick.
  useEffect(() => {
    if (hasStickers) void import('../stickers/pdf');
  }, [hasStickers]);

  const makePdf = async () => {
    setDownload({ status: 'working' });
    try {
      const { buildStickerBookPdf, PDF_FILENAME } = await import('../stickers/pdf');
      const bytes = await buildStickerBookPdf(layout);
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      let file: File | null = null;
      try {
        file = new File([blob], PDF_FILENAME, { type: 'application/pdf' });
      } catch {
        file = null;
      }
      setDownload({ status: 'ready', url, file });
      const a = document.createElement('a');
      a.href = url;
      a.download = PDF_FILENAME;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setDownload({ status: 'error' });
    }
  };

  const canShare =
    download.status === 'ready' &&
    download.file !== null &&
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [download.file] });

  const share = async () => {
    if (download.status !== 'ready' || !download.file) return;
    try {
      await navigator.share({ files: [download.file], title: 'My Curious Creature Clinic Sticker Book' });
    } catch {
      // The person closed the share sheet. Nothing to do.
    }
  };

  return (
    <div className="adult-overlay adult-overlay--page" role="dialog" aria-modal="true" aria-labelledby="parent-title">
      <div className="parent">
        <header className="parent__header">
          {view === 'email' ? (
            <button type="button" className="adult-link adult-link--back" onClick={() => setView('home')}>
              &larr; Grown-up area
            </button>
          ) : (
            <span className="parent__eyebrow">For grown-ups</span>
          )}
          <button type="button" className="adult-close" onClick={onClose} aria-label="Back to the game">
            <CloseIcon />
          </button>
        </header>

        {view === 'email' ? (
          <section className="parent__section">
            <h2 id="parent-title" ref={headingRef} tabIndex={-1}>
              Email the sticker book
            </h2>
            <EmailForm stickers={layout} onDownloadInstead={() => setView('home')} />
          </section>
        ) : (
          <>
            <section className="parent__section parent__keep">
              <h2 id="parent-title" ref={headingRef} tabIndex={-1}>
                Keep your little doctor&rsquo;s sticker book!
              </h2>
              <p>Save a copy to print or send it to your inbox so your child can enjoy their creations again.</p>
              {hasStickers ? (
                <div className="parent__stickers" aria-label="Stickers collected">
                  {layout.map((s) => (
                    <figure key={s.id}>
                      <StickerArt id={s.id} />
                      <figcaption>{STICKERS[s.id].name}</figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="parent__note">No stickers yet. When your child finishes a visit, their sticker will appear here.</p>
              )}
              <div className="parent__actions">
                <button type="button" className="adult-btn" disabled={!hasStickers || download.status === 'working'} onClick={makePdf}>
                  {download.status === 'working' ? 'Preparing...' : 'Download sticker book'}
                </button>
                <button type="button" className="adult-btn" disabled={!hasStickers} onClick={() => setView('email')}>
                  Email sticker book
                </button>
              </div>
              {download.status === 'ready' ? (
                <div className="parent__download" role="status">
                  <p>
                    <strong>Your sticker book is ready.</strong> It&rsquo;s a one-page PDF sized for US Letter paper.
                  </p>
                  <div className="parent__actions parent__actions--small">
                    <a className="adult-btn adult-btn--secondary" href={download.url} download="curious-creature-clinic-sticker-book.pdf">
                      Save PDF
                    </a>
                    {canShare ? (
                      <button type="button" className="adult-btn adult-btn--secondary" onClick={share}>
                        Share or save to Files
                      </button>
                    ) : null}
                    <button type="button" className="adult-btn adult-btn--secondary" onClick={() => window.print()}>
                      Print
                    </button>
                    <a className="adult-btn adult-btn--secondary" href={download.url} target="_blank" rel="noopener">
                      Open PDF
                    </a>
                  </div>
                  <p className="parent__hint">
                    On iPhone or iPad, if nothing seems to happen, tap <em>Share or save to Files</em> or <em>Open PDF</em>, then use the Share
                    button to save or print.
                  </p>
                </div>
              ) : null}
              {download.status === 'error' ? (
                <div className="parent__error" role="alert">
                  <p>We couldn&rsquo;t make the PDF on this device. You can still print the sticker book.</p>
                  <button type="button" className="adult-btn adult-btn--secondary" onClick={() => window.print()}>
                    Print instead
                  </button>
                </div>
              ) : null}
              {hasStickers && download.status === 'idle' ? (
                <button type="button" className="adult-link" onClick={() => window.print()}>
                  Or print it straight away
                </button>
              ) : null}
            </section>

            <section className="parent__section">
              <h2>Helping your child feel more comfortable at the doctor</h2>
              <ul className="parent__tips">
                {TIPS.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
              <p className="parent__small">These are general ideas, not medical advice. Your child&rsquo;s care team knows them best.</p>
            </section>

            <section className="parent__section">
              <h2>Settings</h2>
              <label className="parent__toggle">
                <input type="checkbox" checked={!muted} onChange={toggleMuted} />
                <span>
                  <strong>Sound</strong>
                  <small>Gentle sound effects. Nothing plays until your child taps.</small>
                </span>
              </label>
              <label className="parent__toggle">
                <input type="checkbox" checked={calm} disabled={systemReducedMotion} onChange={(e) => setCalm(e.target.checked)} />
                <span>
                  <strong>Calm mode</strong>
                  <small>
                    Slower, smaller animations and softer sounds.
                    {systemReducedMotion ? ' On automatically because this device asks for reduced motion.' : ''}
                  </small>
                </span>
              </label>
              {confirmReset ? (
                <div className="parent__confirm">
                  <p>Start a fresh, empty sticker book on this device?</p>
                  <div className="parent__actions parent__actions--small">
                    <button
                      type="button"
                      className="adult-btn adult-btn--secondary"
                      onClick={() => {
                        onReset();
                        setConfirmReset(false);
                        setDownload({ status: 'idle' });
                      }}
                    >
                      Yes, start fresh
                    </button>
                    <button type="button" className="adult-link" onClick={() => setConfirmReset(false)}>
                      Keep my stickers
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" className="adult-link" onClick={() => setConfirmReset(true)} disabled={!hasStickers}>
                  Start a fresh sticker book
                </button>
              )}
              {!storagePersistent ? (
                <p className="parent__small">This browser isn&rsquo;t saving game data, so stickers will reset when the page closes.</p>
              ) : null}
            </section>

            <section className="parent__section">
              <h2>{brand.aboutHeading}</h2>
              <p>{brand.aboutCopy}</p>
              <a className="adult-link" href={brand.website} target="_blank" rel="noopener">
                Visit {brand.websiteLabel}
              </a>
            </section>

            <section className="parent__section">
              <h2>Privacy</h2>
              <p>
                The game has no accounts, ads, or tracking. It saves only the sticker book and two settings on this device. An email address is
                used only if you choose to email the sticker book or join the newsletter.
              </p>
              <a className="adult-link" href="/privacy.html" target="_blank" rel="noopener">
                Read the privacy notice
              </a>
            </section>

            <button type="button" className="adult-btn adult-btn--secondary parent__back" onClick={onClose}>
              Back to the game
            </button>
          </>
        )}
      </div>
      {hasStickers ? <PrintSheet stickers={layout} /> : null}
    </div>
  );
}
