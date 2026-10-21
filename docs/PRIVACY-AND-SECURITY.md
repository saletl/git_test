# Privacy and security details

This is an inventory of everything the game stores, sends, and receives, for the owner and for whoever does the legal review. It describes what the code does; it is not legal advice and does not claim legal compliance.

## Children's side of the game

| Question | Answer |
| --- | --- |
| Accounts or profiles | None |
| Names, ages, health or behavioral information | Never asked for or stored |
| Analytics, ads, tracking pixels, third-party scripts | None. The Content Security Policy in `netlify.toml` only allows the site's own files |
| Cookies | None |
| Fonts | Bundled with the site (no Google Fonts or other font services) |
| Network requests during play | None after the page loads |
| Marketing | None. The newsletter and the Burrow link appear only in the grown-up area |

## Stored on the device (localStorage)

One key, `curious-creature-clinic.v1`, holding:

```json
{ "stickers": ["pip"], "placements": { "pip": 0 }, "muted": false, "calm": false }
```

Anything else found under that key is discarded when read. Hints shown and how a child played are never saved. "Start a fresh sticker book" in the grown-up area clears the stickers.

## Grown-up area

The grown-up check asks the adult to tap three numbers written as words. It keeps little fingers out; it is **not** verifiable parental consent.

### Download and print

The PDF is built in the browser. Nothing is sent anywhere.

### Email the sticker book

The browser sends one request to `/api/sticker-book/email`:

```json
{ "email": "parent@example.com", "stickers": [{ "id": "pip", "slot": 0 }], "newsletter": false, "requestId": "random", "website": "" }
```

- The office code is never sent.
- The server builds the PDF and sends it through Resend as an attachment. Nothing is written to disk or a database, and there is no download link.
- For rate limiting and retry protection, the server keeps salted SHA-256 hashes of the address and the client IP in memory for about an hour at most; expired entries are cleared every few minutes. Serverless instances are short-lived, so these usually disappear sooner.
- Logs contain event names and status codes only, never addresses or IPs.

### Newsletter

Only if the grown-up ticks the box (it starts unchecked):

- The address, the group ID, and the sign-up time go to MailerLite.
- New sign-ups start as **unconfirmed** (double opt-in), so they only become active after confirming.
- Unsubscribed, bounced, or junk contacts are never changed or resubscribed.
- The response is the same whether or not someone was already on the list, so the form can't be used to check who is subscribed.
- Delivery and newsletter are independent: one failing never blocks the other.

## Third parties

| Service | Role | Receives | When |
| --- | --- | --- | --- |
| Netlify | Hosting, serverless function | Standard request data, including IP address, in its logs | Every visit |
| Resend | Transactional email | Recipient address, email content, PDF | Only when a grown-up requests the email |
| MailerLite | Newsletter | Address, group, sign-up time | Only when a grown-up ticks the box |

## Security measures

- Secrets live only in Netlify environment variables. `npm run check` scans the built site for keys and server-only names.
- Content Security Policy, `X-Frame-Options: DENY`, `nosniff`, strict referrer policy, and a Permissions Policy that turns off camera, microphone and location.
- The email endpoint accepts only POST, JSON, under 4 KB, from allowed origins, with strict validation of every field.
- Header injection is blocked by rejecting line breaks, commas, angle brackets and quotes in addresses.
- The email template is fixed. Nothing typed by a visitor, including the address, is placed into it.
- Platform rate limit (5 per minute per visitor) plus in-function limits per device, per recipient, and overall.
- Idempotency keys stop retries from sending twice.
- Office customization only uses entries from a list in the code, and logo paths are restricted to the site's own files, so links can't inject text or images.
- Children never see technical error messages. Grown-ups see plain-language errors with a retry and a download option.

## Items for legal review

See section 9 of the [README](../README.md#9-what-still-needs-manual-setup).
