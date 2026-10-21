# Emailing the coloring book: future integration plan

**Status: not connected.** The game does not send email, call any email or newsletter service, create MailerLite subscribers, or store email addresses. The grown-up area shows a preview of the email form so the experience can be reviewed, and the Download button works without an email address.

This document is the checklist for connecting email later, after the prelaunch privacy review in the [README](../README.md#9-what-still-needs-manual-setup).

## How the pieces fit today

| Piece | File | State |
| --- | --- | --- |
| Email form (preview) | `src/parent/EmailForm.tsx` | Live. Checks the address format on the device. The newsletter box starts unchecked. On submit it shows "Email delivery isn't connected yet. You can download your coloring book now!" |
| Delivery seam | `src/services/coloringBookDelivery.ts` | Live. `coloringBookDelivery` is `disconnectedDelivery`, which returns `{ status: 'not_connected' }` and touches nothing. |
| Server endpoint | `server/coloringBookEmail.ts` | Written and unit tested, **not deployed and not called**. |
| Validation, rate limits, provider, MailerLite | `server/validation.ts`, `server/rateLimit.ts`, `server/emailProviders.ts`, `server/mailerlite.ts`, `server/config.ts` | Written and unit tested, not deployed. |
| Netlify functions | none | `netlify.toml` has no `[functions]` section and there is no `netlify/functions/` folder. |
| Bundle check | `scripts/check-bundle-secrets.mjs` | `npm run check` fails if the built site mentions `/api/coloring-book`, a server-only setting name, or a provider address. Remove the endpoint rule when you connect email on purpose. |

The client interface the app depends on:

```ts
interface ColoringBookEmailRequest {
  email: string;
  pages: PageId[];      // which pages to include; the server rebuilds the PDF from these ids
  newsletter: boolean;  // a separate, optional opt-in that must never affect delivery
}

type DeliveryResult =
  | { status: 'not_connected' }
  | { status: 'sent'; newsletter: 'not_requested' | 'received' | 'unavailable' }
  | { status: 'error'; message: string; retry: boolean };

interface ColoringBookDelivery {
  readonly connected: boolean;
  send(request: ColoringBookEmailRequest): Promise<DeliveryResult>;
}
```

Connecting email means writing a second implementation of `ColoringBookDelivery` that POSTs to the endpoint, swapping it in at the bottom of `coloringBookDelivery.ts`, and updating the form's wording. Nothing else in the game changes.

## Checklist

### 1. Secure one-time coloring book delivery

- [ ] The email is sent once, as a PDF attachment, with no download link to expire and nothing stored on a server.
- [ ] The server builds the PDF itself from the page ids (`buildColoringBookPdf` in `src/coloring/pdf.ts`), so nothing a visitor sends ends up inside the file.
- [ ] The email template is fixed (`server/emailTemplate.ts`). Nothing typed by a visitor, including the address, is placed into it.
- [ ] Each request carries a random `requestId`; the endpoint and the provider's idempotency key make retries safe, so a double tap never sends twice.
- [ ] The success message says "sent" only after the provider accepts the message.

### 2. An independent newsletter opt-in

- [ ] The checkbox stays unchecked by default and uses the approved wording (`NEWSLETTER_CONSENT_TEXT`).
- [ ] Delivery and newsletter run independently: a newsletter failure never blocks the coloring book, and a coloring book request without the box ticked never reaches MailerLite (already enforced and tested in `server/coloringBookEmail.ts`).
- [ ] People who only asked for the coloring book never receive newsletter or welcome emails.

### 3. MailerLite configuration, on the server only

- [ ] Create a group, for example "Curious Creature Clinic: Newsletter Opt-ins", and note its ID.
- [ ] Create an API token under Integrations > API.
- [ ] Store both only as server environment variables (`MAILERLITE_API_KEY`, `MAILERLITE_GROUP_ID`). Never put them in browser code, `.env` files in Git, or chat.
- [ ] Turn on double opt-in for API and integrations in MailerLite, and keep `MAILERLITE_DOUBLE_OPT_IN=true`.
- [ ] Set up the welcome email as an automation triggered by joining the group ([newsletter-welcome-email.md](newsletter-welcome-email.md) has a draft).

### 4. Choosing a transactional email provider

- [ ] Pick a provider that supports PDF attachments and idempotency (the code includes Resend; Postmark or SendGrid can be added as another class in `server/emailProviders.ts`). Don't use a personal Gmail account.
- [ ] Verify the sending domain (SPF, DKIM, DMARC) before going live.
- [ ] Store `EMAIL_PROVIDER`, the provider key (for Resend, `RESEND_API_KEY` with sending access only), `EMAIL_FROM`, and optional `EMAIL_REPLY_TO` as server environment variables.

### 5. Serverless endpoint, validation, security and rate limiting

- [ ] Add the function back, for example `netlify/functions/coloring-book-email.mts`:

  ```ts
  import type { Config, Context } from '@netlify/functions';
  import { depsFromEnv } from '../../server/config';
  import { handleColoringBookEmail } from '../../server/coloringBookEmail';

  export default async (request: Request, context: Context) => handleColoringBookEmail(request, depsFromEnv(process.env), context.ip ?? null);

  export const config: Config = {
    path: '/api/coloring-book/email',
    method: ['POST', 'OPTIONS'],
    rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] },
  };
  ```

  and restore `[functions] node_bundler = "esbuild", directory = "netlify/functions"` in `netlify.toml` (plus `npm install -D @netlify/functions`).
- [ ] The handler already: accepts only POST with JSON under 4 KB, checks the `Origin` against `ALLOWED_ORIGINS`, validates every field strictly (known keys, a safe address that rules out header injection, known page ids), rejects a hidden bot field, and rate-limits per device, per recipient and overall using salted hashes kept in memory (`RATE_LIMIT_SALT`).
- [ ] Keep the platform rate limit in the function config as a second layer.
- [ ] The Content Security Policy in `netlify.toml` already allows `connect-src 'self'`, which covers a same-site endpoint. Don't widen it to the provider's domain; only the server talks to providers.

### 6. Unsubscribes, consent and confirmation

- [ ] Never resubscribe anyone who is unsubscribed, bounced or marked as junk (`server/mailerlite.ts` checks status first and leaves those contacts untouched; tested).
- [ ] New sign-ups start as unconfirmed until they confirm by email.
- [ ] Record the sign-up time as consent evidence (sent as `opted_in_at`).
- [ ] Respond the same way whether or not someone was already subscribed, so the form can't be used to check who is on the list.
- [ ] Confirm the consent wording, the confirmation flow, and CAN-SPAM requirements with counsel.

### 7. Error handling, privacy and production deployment

- [ ] Grown-ups see plain-language errors with Try again and Download instead; children never see technical errors.
- [ ] Logs contain event names and status codes only, never addresses or IPs (`server/config.ts`).
- [ ] Update `public/privacy.html` and `docs/PRIVACY-AND-SECURITY.md` to name the providers, what they receive, and retention.
- [ ] Complete the prelaunch privacy review (README section 9), including whether collecting a parent's email address on a child-directed site needs anything beyond the grown-up check. The grown-up check is not verification of a parent and is not proof of COPPA compliance.
- [ ] Deploy to a preview site first; send real test emails with and without the newsletter box; check spam placement; confirm an unsubscribed test address stays unsubscribed.
- [ ] Update the browser tests: replace the "sends or saves nothing" test with tests that mock the endpoint (the original sticker-book version of these tests is in Git history).
- [ ] Remove the `/api/coloring-book` rule from `scripts/check-bundle-secrets.mjs` once the call is intentional.
