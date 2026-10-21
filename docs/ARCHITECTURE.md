# Architecture

A short tour for developers. The owner's guide is the [README](../README.md).

## Technology

- **TypeScript, React 19, Vite.** React holds screen state; there is no state library.
- **SVG for all artwork**, generated from code. No image files are needed for gameplay, and no image service is called at runtime.
- **CSS animations** for every character move and effect. No game engine.
- **Web Audio** for sound. Every effect is synthesized in `src/audio/sound.ts`, so there are no audio files to download.
- **pdf-lib** builds the printable sticker book, both in the browser (download) and on the server (email). It is loaded only when a grown-up asks for it.
- **Netlify** hosts the static site and runs one function, `netlify/functions/sticker-book-email.mts`.

Initial load is about 125 KB of compressed JavaScript and CSS, plus up to three ~16 KB font files. The grown-up area (5 KB) and the PDF code (177 KB) load on demand.

## Screens and states

`src/game/state.ts` is a small reducer. Screens:

| Screen | What happens |
| --- | --- |
| `welcome` | Title, the four creatures (tap to say hi), Play button |
| `waitingRoom` | The hub. Tap a creature to start a visit; tap the bell, plant, clock, fish tank, or magazine for surprises |
| `exam` | One patient on the exam table, four tools, comfort choices, bandages |
| `visitComplete` | Farewell animation, sticker reveal, then a calm pause with two choices |
| `goodbye` | Shown the instant "All done" is tapped, from anywhere |

Overlays sit on top of a screen without unmounting it, so a visit in progress survives a peek at the sticker book: `stickerBook`, `parentGate`, `parentArea`. The screen underneath is `inert` and hidden from assistive technology while an overlay is open.

Every transition is guarded in the reducer. A second tap on "Feeling better!" or on a patient does nothing, so rewards and transitions can't fire twice.

## Characters

Character art is plain data. `src/art/shapes.ts` builds Bezier paths (ellipses, blobs, hearts, stars) and `src/art/face.ts` turns an expression name (`happy`, `worried`, `crossEyed`...) into eyes, brows, mouth and cheeks. Each character file (`src/art/pip.ts` and friends) returns named layers:

```
shadow, tail, wingL, wingR, feet, body, plush, armL, armR, head, cheeks, eyes, brows, mouth
```

`src/characters/Creature.tsx` renders the layers as SVG groups with classes like `ch-head`, and `src/styles/characters.css` animates those classes: `.act-wave .ch-armR`, `.act-hiccup`, and so on. Head animations also move the face parts around the same pivot, so a tilted head keeps its eyes. Because the art is data, the same character drawing is reused for stickers, the PDF, and the print view.

Characters take *props* for persistent changes during a visit: Waddles' scarf count, Mochi's sock position, Prickle curled up or holding the bunny.

## Patients and reactions

Each patient (`src/game/patients/*.ts`) is a data object: anchors (chest, ear, mouth...), bandage spots, tool reactions, comfort reactions, poke zones, an intro, an idle loop, a "feels better" moment, a farewell, and a goodbye.

A reaction is a list of beats:

```ts
{ ms: 1100, action: 'bop', expression: 'excited', sound: 'heartbeatMusical',
  effects: [{ kind: 'note', at: 'chest', count: 3 }], say: 'A musical heartbeat! Pip bops along.' }
```

`src/game/visit.ts` is the only place that changes a visit. It is pure and fully unit tested: it counts meaningful interactions (the "Feeling better!" button appears after three), eases the patient's silly problem, picks variant reactions on repeat use, and records bandages. Prickle's worry eases only with comfort choices, and the pretend shot is never required.

`src/game/useReactionPlayer.ts` plays beats on a timeline. A new tap cancels the current reaction, so feedback is always immediate.

## Input

- **Tap, then tap**: tap a tool (it lifts and the target glows), then tap anywhere on the patient. Bandages snap to the nearest safe spot.
- **Drag**: drag a tool from the toolbar onto the patient (`src/tools/Toolbar.tsx`). Drops are generous (12% outside the patient still counts).
- **Keyboard**: every control is a real button. Pressing Enter on the patient uses the tool on its usual spot.

Artwork stays in SVG; transparent HTML buttons are laid over it using the SVG's screen matrix (`src/utils/useSvgLayout.ts`), which gives real focus rings and labels.

## Hints

Each hint appears at most once per page visit (`src/game/session.ts`) and only if nobody has tapped: a pointing hand in the waiting room after 5 seconds, a stethoscope that floats to the patient and back after the intro, and a hand that moves a new sticker to the page.

## Sticker book

`src/stickers/catalog.ts` lists sticker ids and the six spots on the page. Placement is tap-to-pick, tap-to-place, with swapping. Progress is saved by `src/services/storage.ts`, which validates everything it reads and falls back to memory when storage is blocked.

The PDF (`src/stickers/pdf.ts`) and the print view (`src/parent/PrintSheet.tsx`) draw the same shapes on a US Letter page.

## Backend

`server/stickerBookEmail.ts` is a plain `Request -> Response` handler, so it runs the same way on Netlify, in the local dev server (`server/devApi.ts`), and in tests. Steps:

1. Check method, origin (allowlist), content type, and body size (4 KB).
2. Validate strictly: known keys only, a safe email address, known sticker ids and spots.
3. Reject the hidden bot field.
4. Rate-limit by device, recipient, and globally (hashed keys, in memory), on top of Netlify's platform limit.
5. Build the PDF from the trusted template and send it through the email provider, with an idempotency key so retries never send twice.
6. Separately, and only if the box was ticked, offer the address to MailerLite (`server/mailerlite.ts`).

Logs contain event names and status codes only.

## Calm mode

`[data-calm='true']` on the root element replaces most motion with gentle fades, stops idle loops, limits particles, and lowers volume. It turns on from the grown-up area or automatically when the device asks for reduced motion.
