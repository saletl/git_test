import { useRef, useState, type FormEvent } from 'react';
import type { PlacedSticker } from '../stickers/catalog';
import { isLikelyEmail, sendStickerBook, type SendResult } from '../services/stickerBookApi';

/** The newsletter wording. If you change it, keep it truthful and keep the box unchecked by default. */
export const NEWSLETTER_CONSENT_TEXT =
  "I'd also like occasional parenting ideas and resources from The Burrow Parenting. I can unsubscribe anytime.";

function newRequestId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function EmailForm({ stickers, onDownloadInstead }: { stickers: PlacedSticker[]; onDownloadInstead: () => void }) {
  const [email, setEmail] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [trap, setTrap] = useState('');
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const requestId = useRef(newRequestId());

  const emailOk = isLikelyEmail(email);
  const showEmailError = touched && !emailOk;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!emailOk || sending) return;
    setSending(true);
    setResult(null);
    const r = await sendStickerBook({ email: email.trim(), stickers, newsletter, requestId: requestId.current, website: trap });
    setSending(false);
    setResult(r);
    if (r.kind === 'sent' || r.kind === 'mock') requestId.current = newRequestId();
  };

  if (result && (result.kind === 'sent' || result.kind === 'mock')) {
    return (
      <div className="email-done" role="status">
        {result.kind === 'sent' ? (
          <>
            <p className="email-done__title">Sent!</p>
            <p>The sticker book is on its way. It can take a few minutes, so check your spam folder if you don&rsquo;t see it.</p>
          </>
        ) : (
          <>
            <p className="email-done__title">Test mode: no email was sent</p>
            <p>
              This copy of the game isn&rsquo;t connected to an email service yet, so nothing went out. On a developer&rsquo;s computer, the PDF and
              email are saved in the <code>.dev-outbox</code> folder instead.
            </p>
          </>
        )}
        {result.newsletter === 'received' ? (
          <p>Thanks for your interest in The Burrow&rsquo;s newsletter. If this is a new sign-up, look for an email asking you to confirm.</p>
        ) : null}
        {result.newsletter === 'unavailable' ? (
          <p>We couldn&rsquo;t reach the newsletter service just now, so you haven&rsquo;t been signed up. You can try again later.</p>
        ) : null}
        <button
          type="button"
          className="adult-link"
          onClick={() => {
            setResult(null);
            setEmail('');
            setNewsletter(false);
            setTouched(false);
          }}
        >
          Send to another address
        </button>
      </div>
    );
  }

  return (
    <form className="email-form" onSubmit={submit} noValidate>
      <p>We&rsquo;ll email a printable PDF of the sticker book. No account needed.</p>
      <label className="email-form__label" htmlFor="parent-email">
        Your email address
      </label>
      <input
        id="parent-email"
        className={`email-form__input${showEmailError ? ' has-error' : ''}`}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={254}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          requestId.current = newRequestId();
        }}
        onBlur={() => setTouched(true)}
        aria-invalid={showEmailError}
        aria-describedby={showEmailError ? 'email-error email-use' : 'email-use'}
        required
      />
      {showEmailError ? (
        <p id="email-error" className="email-form__error">
          Please check the email address. It should look like name@example.com.
        </p>
      ) : null}
      <p id="email-use" className="parent__small">
        We use this address once, to send the sticker book. We don&rsquo;t keep it afterward.
      </p>

      <div className="email-form__trap" aria-hidden="true">
        <label htmlFor="parent-website">Leave this empty</label>
        <input id="parent-website" type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
      </div>

      <label className="email-form__consent">
        <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
        <span>{NEWSLETTER_CONSENT_TEXT}</span>
      </label>
      <p className="parent__small">
        Optional and separate from the sticker book. You&rsquo;ll get the sticker book either way.{' '}
        <a href="/privacy.html" target="_blank" rel="noopener">
          Privacy notice
        </a>
      </p>

      {result ? (
        <div className="parent__error" role="alert">
          <p>{result.message}</p>
          {result.newsletter === 'received' ? <p>Your newsletter request was received separately.</p> : null}
          <div className="parent__actions parent__actions--small">
            <button type="submit" className="adult-btn adult-btn--secondary" disabled={sending}>
              Try again
            </button>
            <button type="button" className="adult-link" onClick={onDownloadInstead}>
              Download it instead
            </button>
          </div>
        </div>
      ) : null}

      <button type="submit" className="adult-btn" disabled={sending}>
        {sending ? 'Sending...' : 'Send sticker book'}
      </button>
    </form>
  );
}
