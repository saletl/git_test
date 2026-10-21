import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../app/settings';
import { brand } from '../config/brand';
import { CloseIcon } from '../icons/UiIcons';
import { PAGES, type PageId } from '../coloring/catalog';
import { PageView } from '../coloring/PageView';
import { EmailForm } from './EmailForm';
import { PrintSheet } from './PrintSheet';
import '../styles/parent.css';

/**
 * The grown-up area. Everything here is for parents and caregivers: saving the coloring book,
 * a preview of email delivery (not connected yet), a few doctor-visit ideas, settings, and privacy information.
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
  pages,
  storagePersistent,
  onReset,
  onClose,
}: {
  pages: PageId[];
  storagePersistent: boolean;
  onReset: () => void;
  onClose: () => void;
}) {
  const { muted, toggleMuted, calm, setCalm, systemReducedMotion } = useSettings();
  const [view, setView] = useState<View>('home');
  const [download, setDownload] = useState<DownloadState>({ status: 'idle' });
  const [confirmReset, setConfirmReset] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasPages = pages.length > 0;

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
    if (hasPages) void import('../coloring/pdf');
  }, [hasPages]);

  const makePdf = async () => {
    setDownload({ status: 'working' });
    try {
      const { buildColoringBookPdf, PDF_FILENAME } = await import('../coloring/pdf');
      const bytes = await buildColoringBookPdf(pages);
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
      await navigator.share({ files: [download.file], title: 'My Creature Clinic Coloring Book' });
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
              Email coloring book
            </h2>
            <EmailForm pages={pages} onDownload={makePdf} downloading={download.status === 'working'} />
            {download.status === 'ready' ? (
              <p className="parent__note" role="status">
                Your coloring book is downloading. You can also <button type="button" className="adult-link" onClick={() => setView('home')}>go back</button> to save, share or print it.
              </p>
            ) : null}
          </section>
        ) : (
          <>
            <section className="parent__section parent__keep">
              <h2 id="parent-title" ref={headingRef} tabIndex={-1}>
                Send your coloring book home!
              </h2>
              <p>Your little doctor has been busy! Save your coloring pages to print at home.</p>
              {hasPages ? (
                <div className="parent__pages" aria-label="Coloring pages earned">
                  {pages.map((id) => (
                    <figure key={id}>
                      <PageView id={id} />
                      <figcaption>{PAGES[id].name}</figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="parent__note">No pages yet. Each time your child finishes a visit, that patient&rsquo;s coloring page appears here.</p>
              )}
              <div className="parent__actions">
                <button type="button" className="adult-btn" disabled={!hasPages || download.status === 'working'} onClick={makePdf}>
                  {download.status === 'working' ? 'Preparing...' : 'Download coloring book'}
                </button>
                <button type="button" className="adult-btn adult-btn--secondary" onClick={() => setView('email')}>
                  Email coloring book <span className="preview-tag">Preview</span>
                </button>
              </div>
              {download.status === 'ready' ? (
                <div className="parent__download" role="status">
                  <p>
                    <strong>Your coloring book is ready.</strong> It&rsquo;s a PDF with a cover and {pages.length === 1 ? 'one page' : `${pages.length} pages`}, sized
                    for US Letter paper.
                  </p>
                  <div className="parent__actions parent__actions--small">
                    <a className="adult-btn adult-btn--secondary" href={download.url} download="my-creature-clinic-coloring-book.pdf">
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
                  <p>We couldn&rsquo;t make the PDF on this device. You can still print the coloring pages.</p>
                  <button type="button" className="adult-btn adult-btn--secondary" onClick={() => window.print()}>
                    Print instead
                  </button>
                </div>
              ) : null}
              {hasPages && download.status === 'idle' ? (
                <button type="button" className="adult-link" onClick={() => window.print()}>
                  Or print the pages straight away
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
                  <p>Start a fresh, empty coloring book on this device?</p>
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
                      Keep my pages
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" className="adult-link" onClick={() => setConfirmReset(true)} disabled={!hasPages}>
                  Start a fresh coloring book
                </button>
              )}
              {!storagePersistent ? (
                <p className="parent__small">This browser isn&rsquo;t saving game data, so coloring pages will reset when the page closes.</p>
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
                The game has no accounts, ads, or tracking. It saves only which coloring pages were earned and two settings, on this device.
                Email delivery isn&rsquo;t connected yet: an address typed into the email preview is never sent or saved.
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
      {hasPages ? <PrintSheet pages={pages} /> : null}
    </div>
  );
}
