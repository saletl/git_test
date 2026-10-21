import { useState, type FormEvent } from 'react';
import type { PageId } from '../coloring/catalog';
import { coloringBookDelivery, isLikelyEmail, NOT_CONNECTED_MESSAGE, type DeliveryResult } from '../services/coloringBookDelivery';

/** The newsletter wording. If you change it, keep it truthful and keep the box unchecked by default. */
export const NEWSLETTER_CONSENT_TEXT =
  "I'd also like occasional parenting ideas and resources from The Burrow Parenting. I can unsubscribe anytime.";

/**
 * A preview of how emailing the coloring book will work. It checks the address on this device only.
 * Nothing is sent anywhere and nothing is saved: see services/coloringBookDelivery.ts.
 */
export function EmailForm({ pages, onDownload, downloading }: { pages: PageId[]; onDownload: () => void; downloading: boolean }) {
  const [email, setEmail] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [touched, setTouched] = useState(false);
  const [result, setResult] = useState<DeliveryResult | null>(null);

  const emailOk = isLikelyEmail(email);
  const showEmailError = touched && !emailOk;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setResult(null);
    if (!emailOk) return;
    setResult(await coloringBookDelivery.send({ email: email.trim(), pages, newsletter }));
  };

  return (
    <form className="email-form" onSubmit={submit} noValidate>
      <p className="preview-badge">Preview only: email isn&rsquo;t connected yet</p>
      <p>When email is set up, you&rsquo;ll be able to send the coloring book PDF to your inbox. No account needed.</p>
      <label className="email-form__label" htmlFor="parent-email">
        Parent&rsquo;s email address
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
          setResult(null);
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
        In this preview, the address stays on this screen. It isn&rsquo;t sent or saved.
      </p>

      <label className="email-form__consent">
        <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
        <span>{NEWSLETTER_CONSENT_TEXT}</span>
      </label>
      <p className="parent__small">Optional and separate from the coloring book.</p>

      <button type="submit" className="adult-btn">
        Email coloring book
      </button>

      {result?.status === 'not_connected' ? (
        <div className="email-done" role="status">
          <p className="email-done__title">{NOT_CONNECTED_MESSAGE}</p>
          <button type="button" className="adult-btn adult-btn--secondary" onClick={onDownload} disabled={downloading || pages.length === 0}>
            {downloading ? 'Preparing...' : 'Download coloring book'}
          </button>
        </div>
      ) : null}
      {result?.status === 'error' ? (
        <div className="parent__error" role="alert">
          <p>{result.message}</p>
        </div>
      ) : null}
    </form>
  );
}
