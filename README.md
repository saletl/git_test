# The Curious Creature Clinic

**Little patients. Big imaginations.**

A tiny, magical doctor's office game for children aged 4 to 9, made for the few minutes families spend in a pediatric waiting room. Parents scan a QR code, hand over the phone, and the child becomes the doctor for four silly patients, each with its own small adventure:

| Patient | The adventure | What the child does |
| --- | --- | --- |
| Pip the Dragon | The Case of the Bubble Hiccups | Listens to a bubbly rhythm, catches hiccup bubbles (some hold tiny surprises), tries pretend hiccup helpers |
| Waddles the Penguin | The Great Sneezing Mystery | Takes off fuzzy scarves to find a fish pin and a bow tie, tries a hat, earmuffs and a blanket, tidies a sparkly sneeze with a tissue |
| Prickle the Porcupine | The Brave Little Checkup | Checks the stuffed bunny first, makes a comfort plan, and can practice a gentle pretend shot (or skip it) |
| Mochi the Monster | The Mysterious Tummy | Finds different tummy sounds with the stethoscope, solves a sound mystery, rescues the sock and swaps in silly hats |

Every patient also has a chart that fills itself in, freeform bandages, ear and throat checks, comfort choices, and a room with a lamp, sink, cabinet and poster to play with. Each finished visit adds that patient's page to **My Creature Clinic Coloring Book**, which grown-ups can download as a printable PDF.

Created with care by [The Burrow Parenting](https://theburrowparenting.com).

- Children can play everything with pictures; short words help grown-ups follow along.
- No accounts, ads, analytics, tracking, scores, coins or levels.
- One big "All done" button ends the game happily at any moment.
- Email delivery and the newsletter are **not connected yet**. The grown-up area shows an honest preview; nothing is sent or saved.

This guide is written for the business owner. Developers will find more in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and the plan for email in [docs/EMAIL-INTEGRATION.md](docs/EMAIL-INTEGRATION.md).

---

## Contents

1. [Running the game on your computer](#1-running-the-game-on-your-computer)
2. [Publishing the game](#2-publishing-the-game)
3. [Email and newsletter: not connected yet](#3-email-and-newsletter-not-connected-yet)
4. [Customizing the branding](#4-customizing-the-branding)
5. [Changing a patient's adventure](#5-changing-a-patients-adventure)
6. [Adding a patient](#6-adding-a-patient)
7. [Updating the coloring book](#7-updating-the-coloring-book)
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

To stop the game, press `Ctrl + C` in the terminal.

## 2. Publishing the game

The game is a static website with no server code, so any static host works. [Netlify](https://www.netlify.com) runs it on its free plan, and this project is already configured for it in `netlify.toml` (build settings and security headers).

1. Put this project in a GitHub repository (it already is if you're reading this on GitHub).
2. Create a free Netlify account and choose **Add new site > Import an existing project**.
3. Pick the GitHub repository. Netlify reads `netlify.toml`, so the build settings fill in by themselves: build command `npm run build`, publish folder `dist`.
4. Click **Deploy**. After a minute or two, Netlify gives you a public address like `https://curious-creature-clinic.netlify.app`. That's the game.
5. Optional: under **Domain management**, connect your own address, such as `clinic.theburrowparenting.com`. Netlify provides HTTPS automatically.

Every time a change is merged into the main branch on GitHub, Netlify publishes it again.

## 3. Email and newsletter: not connected yet

The grown-up area offers two ways to keep the coloring book:

- **Download coloring book** works now. It builds a US Letter PDF on the phone (a cover plus each page the child earned). No email address is needed.
- **Email coloring book** is a clearly labeled preview. It checks that the address looks right, on the device, then says: "Email delivery isn't connected yet. You can download your coloring book now!" It makes no network request and saves nothing. The newsletter checkbox starts unchecked.

When you're ready to switch email on, [docs/EMAIL-INTEGRATION.md](docs/EMAIL-INTEGRATION.md) has the checklist: choosing an email provider, the MailerLite group and API key (kept on the server only), the serverless endpoint and its security, consent and unsubscribe handling, error handling, privacy, and deployment. Server code that does most of this already exists in `server/`, with tests, but nothing deploys or calls it today.

## 4. Customizing the branding

| What | Where |
| --- | --- |
| Credit line, Burrow website, "About The Burrow Parenting" text | `src/config/brand.ts` |
| Colors | `src/art/palette.ts` (artwork) and the top of `src/styles/base.css` (buttons and screens) |
| Title and tagline | `src/config/brand.ts` (`game`) and the title on the welcome screen in `src/game/WelcomeScreen.tsx` |
| Browser tab icon | `public/favicon.svg` and `public/apple-touch-icon.png` |
| Coloring book cover and page credits | `src/coloring/scenes.ts` |
| Newsletter checkbox wording | `src/parent/EmailForm.tsx` (`NEWSLETTER_CONSENT_TEXT`) |
| Doctor-visit tips for parents | `src/parent/ParentArea.tsx` (`TIPS`) |
| Privacy notice | `public/privacy.html` |

To show a Burrow logo on the welcome screen instead of the text credit, add the logo file to `public/brand/` and set `logoSrc` in `src/config/brand.ts`. Keep branding small and in the credit line; the game should feel like a gift.

## 5. Changing a patient's adventure

Everything a patient says and does lives in one file in `src/game/patients/` (for example `pip.ts`):

- `story`: the speech bubble that opens the visit, the reason for the visit on the chart, and two or three optional ideas for a grown-up and child to talk about or take turns with.
- `chart`: the three discoveries, and `discoverOn`, which says what fills each one (for example listening with the stethoscope fills "Bubbly heartbeat").
- `activities`: the patient's own mini-adventures, shown as picture buttons on the front of the exam table.
- `comfortLabels` and `comfort`: the four comfort choices (hug the patient's toy, take a break, play music, hold a hand) and what each one does.
- `tools`, `look`: reactions to the stethoscope, thermometer, and the light (ear or throat).
- `bodyRegions` and `bandageZones`: where bandages can stick, and the places that get a special reaction.

The mini-adventure screens themselves are in `src/game/exam/activities/`. Prickle's pretend-shot wording is in `src/game/patients/prickle.ts` (`prickleShot`); please keep it truthful ("Shots can pinch for a moment. You can ask for help.") and keep the "Not today" choice.

## 6. Adding a patient

1. **Draw the character.** Copy `src/art/pip.ts` to a new file and change the shapes and colors. Each body part is a named layer (`head`, `armR`, `tail`...) so the existing animations work on it. Run `npm run dev` and open http://localhost:5173/?gallery to see your character with every facial expression (add it to the list at the top of `src/dev/ArtGallery.tsx` first).
2. **Write the visit.** Copy `src/game/patients/pip.ts` and change the story, chart, reactions, comfort choices and bandage areas (section 5).
3. **Give it at least two activities.** Add small components in `src/game/exam/activities/` and list them in `index.tsx` there. Activities borrow the exam room through a small interface (`src/game/exam/api.ts`), so they don't need their own screen.
4. **Draw its coloring page.** Add the id to `src/coloring/catalog.ts` and a scene to `src/coloring/scenes.ts`. The character's line art is made automatically from its color drawing.
5. **List the patient.** Add it to `PATIENTS` in `src/game/patients/index.ts` and give it a chair in the waiting room (`WR_PATIENT_BOXES` in `src/scenes/WaitingRoomArt.tsx`).
6. Run `npm run check`. The tests confirm every tool and comfort choice works for every patient, that each patient reacts differently, and that coloring pages are pure black-and-white line art.

The waiting room and coloring book are laid out for four patients today, so a developer should do steps 4 and 5.

## 7. Updating the coloring book

- **The four scenes and the cover** are in `src/coloring/scenes.ts`, drawn on a 540 x 720 page (the printable area of US Letter with half-inch margins).
- **Line art** is made by `src/coloring/lineArt.ts`, which turns the game's colorful characters into white shapes with bold black outlines. Simple props (bubbles, stethoscope, tissue box...) are drawn directly as outlines in `src/coloring/props.ts`.
- **The PDF** is built by `src/coloring/pdf.ts`. The same drawings appear in the game's book, the PDF, and the print view, so they always match.

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

No analytics or tracking are added per office.

## 9. What still needs manual setup

**Accounts and settings**

- [ ] Netlify site (section 2).
- [ ] Real office entries in `src/config/offices.ts`, replacing the sample.
- [ ] QR codes and posters generated from the live address (section 8).
- [ ] Email delivery and the newsletter, when you decide to add them: follow [docs/EMAIL-INTEGRATION.md](docs/EMAIL-INTEGRATION.md).

**Prelaunch privacy review (please do this before public launch)**

This game is directed at children, so U.S. children's privacy law (COPPA, including the FTC's 2025 amendments to the COPPA Rule) and state privacy laws apply. The design collects as little as possible, but design choices are not a legal guarantee, and nothing here claims the game is legally compliant. Please have a qualified privacy attorney review:

- [ ] The game as it is today: no accounts, nothing sent during play, and only earned coloring pages and two settings saved on the device.
- [ ] The grown-up check. It asks for three numbers written as words, which keeps little fingers out. It is not legal verification of a parent and not proof of COPPA compliance.
- [ ] Before email is connected: collecting a parent's email address on a child-directed site, the newsletter consent wording and confirmation (double opt-in) flow, CAN-SPAM requirements, and agreements with the email and newsletter providers.
- [ ] The privacy notice in `public/privacy.html`: a plain-language draft that describes what the code does, which needs legal review and your contact details. Update it before email goes live.
- [ ] Disclosures about Netlify (hosting logs include IP addresses).
- [ ] Whether partner pediatric practices need any agreement or disclosure (no health or patient information is collected).

Details of what the game stores and sends are in [docs/PRIVACY-AND-SECURITY.md](docs/PRIVACY-AND-SECURITY.md).

## 10. Checking that everything works

```bash
npm run check      # type checks, lint, unit tests, production build, and a scan for secrets or email calls in the website files
npm run test:e2e   # plays through the game in headless Chrome at several phone and tablet sizes
```

`npm run test:e2e` needs Playwright's browser once: `npx playwright install chromium`.

## 11. What was and wasn't tested

**Tested automatically** with unit tests (Vitest) and browser tests (Playwright in headless Chromium). The phone and tablet sizes are **simulated viewports** in a desktop browser, not real devices.

- All four adventures: bubble catching and the jar, hiccup helpers, the scarf surprises, the tissue tidy-up, the bunny check, the comfort plan, the full pretend shot (and skipping or stopping it at each step), the sound mystery, and the sock rescue.
- Labeled tools, ear and throat checks for every patient, comfort choices with visible results, and room props.
- Freeform bandages: placing them exactly where tapped, dragging, tap-to-pick-up-then-tap-to-move, undo, remove, dragging a pattern onto the patient, and staying in place after the screen is resized.
- The chart filling in and the stamp finishing the visit; optional talk-together ideas.
- "All done" from the introduction, activities, decorating, the pretend shot, the chart, the coloring book and its preview, and leaving early keeping the page after a little play.
- Exactly four coloring pages, each unlocked by its own patient; old sticker saves carrying over as pages; pages made only of black and white line art.
- A real US Letter PDF download (cover plus earned pages, checked by reading the file), and the print view.
- The email preview: format check, unchecked newsletter box, the "not connected yet" message, no network requests, and nothing saved.
- Layout at 320, 375, 390 and 430 pixel widths and tablet width, a keyboard-only playthrough, calm mode, mute, and blocked browser storage.

**Not tested yet**

- **Real devices.** No testing has been done on actual iPhones, iPads, or Android phones, or in Safari. Please try the game on a few real phones, especially Safari on iPhone, including touch dragging of bubbles and bandages, before printing posters.
- **Downloading and printing on phones.** The PDF download was tested in desktop Chromium. Saving and printing from Safari on iPhone and Chrome on Android, and printing the pages on a home printer, still need a real-device check.
- **Screen readers.** Buttons have labels and reactions are announced, but no one has tested with VoiceOver or TalkBack yet.
- **Children.** The best test is watching a few four- and five-year-olds play. Their confusion is the most useful feedback you can get.

## 12. Ideas for later

In rough order of value:

1. Watch a handful of children play and adjust anything they get stuck on.
2. Test on real phones (Safari on iPhone first) and fix anything that looks off.
3. Connect email delivery and the newsletter after the privacy review (section 3).
4. Simple tap-to-fill coloring inside the game, using the same line art.
5. An optional, very short spoken greeting per patient for non-readers, with a parent setting to turn it off.
6. Offer the game in Spanish (it is picture-based, so mostly the grown-up area, short labels and screen-reader text need translating).

---

### For developers

```
src/
  app/          App shell, settings (sound, calm mode), screen-reader announcements
  art/          Vector art toolkit and every character drawing (shared by screen, coloring pages and PDF)
  animations/   Particle effects (bubbles, hearts, notes, breathing circle, confetti...)
  characters/   Renders character art as animated SVG
  coloring/     Coloring book: page catalog, line-art conversion, scenes, in-game book, PDF builder
  components/   Shared frame: top bar, bottom bar, "All done" button, hints
  config/       Brand and office settings
  game/         Game state machine, visit rules, patient definitions, screens
  game/exam/    Exam room pieces: activities, chart, bandage handles, trays, story bubbles
  icons/        Tool, comfort, activity and interface icons
  parent/       Grown-up gate and grown-up area (loaded on demand)
  scenes/       Waiting room and exam room artwork, room props
  services/     Local storage, and the disconnected email delivery seam
  styles/       CSS (character animations, screens, calm mode)
server/         Future email endpoint (not deployed): validation, rate limiting, provider, MailerLite
scripts/        QR/poster maker, bundle scan for secrets and email calls
tests/          Unit tests (Vitest) and browser tests (Playwright)
```

Useful commands: `npm run dev`, `npm run build`, `npm run preview`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e`, `npm run qr -- <url>`.
