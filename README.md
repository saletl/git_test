# The Curious Creature Clinic

**Little patients. Big imaginations.**

A tiny, magical doctor's office game for children aged 4 to 9, made for the few minutes families spend in a pediatric waiting room. Parents scan a QR code, hand over the phone, and the child cares for four silly patients: a dragon with bubbly hiccups, a penguin wearing far too many scarves, a worried porcupine who never lets go of a stuffed bunny, and a monster with a rumbly tummy and a sock stuck on its head.

Created with care by [The Burrow Parenting](https://theburrowparenting.com).

- Children can play everything without reading.
- No accounts, ads, analytics, or tracking.
- One big "All done" button ends the game happily at any moment.
- Grown-ups can download, print, or email a sticker book keepsake.

This guide is written for the business owner. Developers will find extra detail in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Contents

1. [Running the game on your computer](#1-running-the-game-on-your-computer)
2. [Publishing the game](#2-publishing-the-game)
3. [Setting up email delivery](#3-setting-up-email-delivery)
4. [Setting up MailerLite](#4-setting-up-mailerlite)
5. [Customizing the branding](#5-customizing-the-branding)
6. [Adding a patient](#6-adding-a-patient)
7. [Updating the sticker book](#7-updating-the-sticker-book)
8. [Sharing with pediatric offices](#8-sharing-with-pediatric-offices)
9. [What still needs manual setup](#9-what-still-needs-manual-setup)
10. [Checking that everything works](#10-checking-that-everything-works)
11. [What was and wasn't tested](#11-what-was-and-wasnt-tested)
12. [Ideas for later](#12-ideas-for-later)

---

## 1. Running the game on your computer

You need [Node.js](https://nodejs.org) version 22 or newer. Download the "LTS" installer from the Node.js website if you don't have it.

Open a terminal in this folder and run:

```bash
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173) in your browser. To see the phone layout, open your browser's developer tools and switch on the device toolbar.

On your computer, the "Email sticker book" button runs in **test mode**: no email is sent. The game says so on screen, and the PDF and email it would have sent are saved in a `.dev-outbox` folder so you can look at them.

To stop the game, press `Ctrl + C` in the terminal.

## 2. Publishing the game

The game is a static website plus one small server function (for email). [Netlify](https://www.netlify.com) runs both on its free plan, and this project is already configured for it in `netlify.toml`.

1. Put this project in a GitHub repository (it already is if you're reading this on GitHub).
2. Create a free Netlify account and choose **Add new site > Import an existing project**.
3. Pick the GitHub repository. Netlify reads `netlify.toml`, so the build settings fill in by themselves: build command `npm run build`, publish folder `dist`.
4. Click **Deploy**. After a minute or two, Netlify gives you a public address like `https://curious-creature-clinic.netlify.app`. That's the game.
5. Optional: under **Domain management**, connect your own address, such as `clinic.theburrowparenting.com`. Netlify provides HTTPS automatically.

Every time a change is merged into the main branch on GitHub, Netlify publishes it again.

The game works fully at this point. Email delivery and the newsletter stay switched off until you add the settings in the next two sections, and the grown-up area says so honestly.

## 3. Setting up email delivery

The sticker book email is sent through [Resend](https://resend.com), a transactional email service with a free starter plan that supports PDF attachments. Check Resend's pricing page for current limits. Because the PDF is attached, nothing is stored on a server and there is no download link to expire.

1. Create a Resend account.
2. Under **Domains**, add the domain you want to send from (for example `theburrowparenting.com`) and add the DNS records Resend shows you at your domain provider. Wait until Resend shows the domain as verified.
3. Under **API Keys**, create a key with **Sending access**. Copy it (it starts with `re_`).
4. In Netlify, open your site, then **Site configuration > Environment variables**, and add:

| Name | Value |
| --- | --- |
| `EMAIL_PROVIDER` | `resend` |
| `RESEND_API_KEY` | the key from step 3 |
| `EMAIL_FROM` | for example `The Curious Creature Clinic <clinic@theburrowparenting.com>` |
| `EMAIL_REPLY_TO` | optional: an inbox you check |
| `ALLOWED_ORIGINS` | the exact address of your live game, for example `https://clinic.theburrowparenting.com` (add more separated by commas) |
| `RATE_LIMIT_SALT` | any long random text, such as a password from a password manager |

5. In Netlify, go to **Deploys** and choose **Trigger deploy > Deploy site** so the function picks up the new settings.
6. Test it: open the live game, tap **Grown-ups**, and email the sticker book to yourself.

**Keep keys secret.** Only put them in Netlify's environment variables. Never paste them into code, a chat, or a `.env` file that gets committed. `npm run check` fails if a key ever ends up in the website files.

**Using a different provider.** All email code sits behind a small interface in `server/emailProviders.ts`. To use Postmark, SendGrid, or another provider that supports attachments, a developer adds a class next to `ResendProvider` and a matching `EMAIL_PROVIDER` value in `server/config.ts`. Don't use a personal Gmail account.

**Abuse protection.** The function only accepts requests from your game's address, limits each device to a handful of emails, limits each email address to 3 sticker books an hour, refuses anything but known sticker names, and uses a fixed email template (nothing a visitor types is ever put into the email). Netlify also applies a platform rate limit of 5 requests per minute per visitor, set in `netlify/functions/sticker-book-email.mts`.

## 4. Setting up MailerLite

The newsletter checkbox is optional, unchecked by default, and separate from the sticker book. If no MailerLite settings are added, ticking the box simply tells the parent the newsletter isn't available right now; the sticker book still sends.

1. In MailerLite, go to **Subscribers > Groups** and create a group named **Curious Creature Clinic — Newsletter Opt-ins**. Open it and copy its ID from the page address or group settings.
2. Go to **Integrations > API**, create a new token, and copy it.
3. Go to your account's subscribe settings and turn on **Double opt-in for API and integrations**. With this on, people who sign up from the game get MailerLite's confirmation email and only become active subscribers after they confirm.
4. In Netlify's environment variables, add:

| Name | Value |
| --- | --- |
| `MAILERLITE_API_KEY` | the token from step 2 |
| `MAILERLITE_STICKER_BOOK_GROUP_ID` | the group ID from step 1 |
| `MAILERLITE_DOUBLE_OPT_IN` | `true` (recommended) |

5. Redeploy (Deploys > Trigger deploy).

How the game treats subscribers:

- Only people who tick the box are sent to MailerLite. Sticker-book-only requests never reach MailerLite.
- New sign-ups are created as **unconfirmed** and added to the group, with the sign-up time recorded as consent evidence.
- Anyone already unsubscribed, bounced, or marked as junk is left exactly as they are. The game never resubscribes anyone.
- Existing active subscribers are added to the group without changing their status.
- Only the email address, the group, and the sign-up time are sent. Nothing about the child or the game.
- Retrying a failed request never creates a duplicate subscriber, because MailerLite keys subscribers by email address.

**Welcome email.** A suggested welcome email for confirmed subscribers is in [docs/newsletter-welcome-email.md](docs/newsletter-welcome-email.md). Set it up as a MailerLite automation triggered when someone joins the group, so only confirmed newsletter subscribers receive it. Sticker-book-only recipients never get it.

## 5. Customizing the branding

| What | Where |
| --- | --- |
| Credit line, Burrow website, "About The Burrow Parenting" text | `src/config/brand.ts` |
| Colors | `src/art/palette.ts` (artwork and PDF) and the top of `src/styles/base.css` (buttons and screens) |
| Title and tagline | `src/config/brand.ts` (`game`) and the title on the welcome screen in `src/game/WelcomeScreen.tsx` |
| Browser tab icon | `public/favicon.svg` and `public/apple-touch-icon.png` |
| Email wording | `server/emailTemplate.ts` |
| Newsletter checkbox wording | `src/parent/EmailForm.tsx` (`NEWSLETTER_CONSENT_TEXT`) |
| Doctor-visit tips for parents | `src/parent/ParentArea.tsx` (`TIPS`) |
| Privacy notice | `public/privacy.html` |

To show a Burrow logo on the welcome screen instead of the text credit, add the logo file to `public/brand/` and set `logoSrc` in `src/config/brand.ts`. Keep branding small and in the credit line; the game is designed to feel like a gift, not an ad.

## 6. Adding a patient

Each patient is one file in `src/game/patients/`, plus one drawing file in `src/art/`. Nothing else in the game needs to be rewritten.

1. **Draw the character.** Copy `src/art/pip.ts` to a new file, such as `src/art/bramble.ts`, and change the shapes and colors. Each body part is a named layer (`head`, `armR`, `tail`...) so the existing animations work on it. Run `npm run dev` and open http://localhost:5173/?gallery to see your character with every facial expression. (Add it to the list at the top of `src/dev/ArtGallery.tsx` first.)
2. **Write the visit.** Copy `src/game/patients/pip.ts` to `src/game/patients/bramble.ts`. Each reaction is a short list of "beats": a face, an animation, sparkles or bubbles, a sound, and a sentence for screen readers. Change the reactions to tools, comfort choices, bandage spots, the introduction, and the goodbye.
3. **Add the sticker.** Add the new id to `STICKER_IDS` and `STICKERS` in `src/stickers/catalog.ts`, and a sticker drawing in `src/stickers/art.ts`.
4. **List the patient.** Add it to `PATIENTS` in `src/game/patients/index.ts` and give it a chair in the waiting room (`WR_PATIENT_BOXES` in `src/scenes/WaitingRoomArt.tsx`).
5. Run `npm run check`. The tests confirm every tool and comfort choice works for every patient and that each patient reacts differently.

A developer should do steps 3 and 4, since the waiting room is laid out for four patients today.

## 7. Updating the sticker book

- **Sticker designs** live in `src/stickers/art.ts`. Each sticker is built from the character drawings, so changing a character updates its sticker too. The same artwork is used on screen, in the PDF, and in the printed page.
- **Sticker spots on the page** are `BOOK_SLOTS` in `src/stickers/catalog.ts` (position and tilt).
- **Page decorations** (washi tape, stars, the little hill) are in `src/stickers/decor.ts`.
- **The printable PDF layout** (title, "This sticker book belongs to" line, credit) is in `src/stickers/pdf.ts`.

## 8. Sharing with pediatric offices

One published game serves every office. Each office gets its own link, which shows the office's name (and optional logo and welcome note) on the start screen.

1. Add the office to `src/config/offices.ts`:

   ```ts
   'sunny-kids-pediatrics': {
     displayName: 'Sunny Kids Pediatrics',
     welcomeMessage: 'Welcome, little doctors! Your care team will see you soon.',
     logoSrc: '/offices/sunny-kids.svg', // optional: put the file in public/offices/
   },
   ```

   The code (`sunny-kids-pediatrics`) may use lowercase letters, numbers and dashes. Only offices in this list can change what the game shows, so nobody can put their own text on the welcome screen by editing a link. Remove the `example-pediatrics` sample when you add real offices.

2. Publish the change (merge it on GitHub; Netlify redeploys).
3. The office's link is your game address plus `?office=` and the code, for example `https://clinic.theburrowparenting.com/?office=sunny-kids-pediatrics`.
4. Make the QR code and poster:

   ```bash
   npm run qr -- "https://clinic.theburrowparenting.com/?office=sunny-kids-pediatrics"
   ```

   This creates `qr-output/qr.svg`, `qr-output/qr.png` (high resolution), and `qr-output/poster.pdf` (a ready-to-print US Letter poster). The script refuses local or placeholder addresses. Always scan the printed code with a phone before handing posters out.

No analytics or tracking are added per office. The office code is never sent to the email function.

## 9. What still needs manual setup

These need your accounts, decisions, or a professional review. The code is ready for each one.

**Accounts and settings**

- [ ] Netlify site (section 2).
- [ ] Resend account, verified sending domain, and API key (section 3).
- [ ] MailerLite group, API token, and double opt-in for API turned on (section 4).
- [ ] Your live address added to `ALLOWED_ORIGINS`.
- [ ] Real office entries in `src/config/offices.ts`, replacing the sample.
- [ ] QR codes and posters generated from the live address (section 8).

**Legal and privacy review (please do this before public launch)**

This game is directed at children, so U.S. children's privacy law (COPPA, including the FTC's 2025 amendments to the COPPA Rule) and state privacy laws apply. The design collects as little as possible, but design choices are not a legal guarantee, and nothing here claims the game is legally compliant. Please have a qualified privacy attorney review:

- [ ] Collecting a parent's email address on a child-directed site, behind a simple grown-up check. A grown-up check discourages accidental taps; it is not verifiable parental consent.
- [ ] The newsletter consent wording and the double opt-in flow (also CAN-SPAM requirements for the newsletter itself).
- [ ] The privacy notice in `public/privacy.html`: it's a plain-language draft that accurately describes what the code does, but it needs legal review and your contact details.
- [ ] Disclosures about Netlify (hosting logs include IP addresses), Resend, and MailerLite as service providers, and whether you need agreements with them.
- [ ] Whether partner pediatric practices need any agreement or disclosure (no health or patient information is collected, and office codes are never sent to the server).
- [ ] A written data retention policy (the email address isn't stored by this code; check your providers' retention settings).

Full details of what the game stores and sends are in [docs/PRIVACY-AND-SECURITY.md](docs/PRIVACY-AND-SECURITY.md).

## 10. Checking that everything works

```bash
npm run check      # type checks, lint, unit tests, production build, and a scan for leaked secrets
npm run test:e2e   # plays through the game in a real (headless) Chrome browser at several phone sizes
```

`npm run test:e2e` needs Playwright's browser once: `npx playwright install chromium`.

## 11. What was and wasn't tested

**Tested automatically** (unit tests and end-to-end browser tests in headless Chromium):

- Every screen and transition, all four patients, all tools, comfort choices and bandage spots.
- Sticker awarding (including double taps), sticker placement and saving, and the game working when browser storage is blocked.
- Exiting from every child screen, mute, calm mode, the grown-up gate, PDF download, and email form validation.
- The email function: validation, origin checks, size limits, rate limits, retries, provider failures, and consent separation (email-only requests never reach MailerLite).
- Layout at 320, 375, 390 and 430 pixel widths, tablet width, and landscape phones.

**Not tested yet**

- **Real devices.** No testing has been done on actual iPhones, iPads, or Android phones, or in Safari. Please try the game on a few real phones, especially Safari on iPhone, before printing posters.
- **Real email.** Resend and MailerLite were tested against simulated responses based on their documentation, because no accounts were available. Send yourself a test sticker book and newsletter sign-up after setup.
- **Netlify deployment.** The configuration is in place, but the site hasn't been deployed from this project yet, so no live address exists. The platform rate limit only takes effect once deployed.
- **Screen readers.** Buttons have labels and reactions are announced, but no one has tested with VoiceOver or TalkBack yet.
- **Children.** The best test is watching a few four- and five-year-olds play. Their confusion is the most useful feedback you can get.

## 12. Ideas for later

In rough order of value:

1. Watch a handful of children play and adjust anything they get stuck on.
2. Test on real phones (Safari on iPhone first) and fix anything that looks off.
3. Add a fifth patient once the first four feel right.
4. Add an optional, very short spoken greeting per patient for non-readers, with a parent setting to turn it off.
5. Offer the game in Spanish (the game is picture-based, so only the grown-up area and screen-reader text need translating).
6. Let offices request their link and poster through a simple form instead of a code change.

---

### For developers

```
src/
  app/          App shell, settings (sound, calm mode), screen-reader announcements
  art/          Vector art toolkit and every character drawing (shared by screen and PDF)
  animations/   Particle effects (bubbles, hearts, notes...)
  characters/   Renders character art as animated SVG
  components/   Shared frame: top bar, bottom bar, "All done" button, hints
  config/       Brand and office settings
  game/         Game state machine, patient definitions, screens
  icons/        Tool, comfort and interface icons
  parent/       Grown-up gate and grown-up area (loaded on demand)
  scenes/       Waiting room and exam room artwork
  services/     Local storage, email API client
  stickers/     Sticker catalog, art, sticker book, PDF builder
  styles/       CSS (character animations, screens, calm mode)
server/         Email function logic: validation, rate limiting, Resend, MailerLite
netlify/        The Netlify Function entry point
scripts/        QR/poster maker, bundle secret scan
tests/          Unit tests (Vitest) and browser tests (Playwright)
```

Useful commands: `npm run dev`, `npm run build`, `npm run preview`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e`, `npm run qr -- <url>`.
