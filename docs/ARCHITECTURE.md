# Architecture

A short tour for developers. The owner's guide is the [README](../README.md).

## Technology

- **TypeScript, React 19, Vite.** React holds screen state; there is no state library.
- **SVG for all artwork**, generated from code. No image files are needed for gameplay, and no image service is called at runtime.
- **CSS animations** for every character move and effect. No game engine.
- **Web Audio** for sound. Every effect is synthesized in `src/audio/sound.ts`, so there are no audio files to download.
- **pdf-lib** builds the printable coloring book in the browser. It loads only when a grown-up opens the grown-up area.
- **Static hosting.** There is no server code in the deployed site. `server/` holds a tested, undeployed email endpoint for later ([EMAIL-INTEGRATION.md](EMAIL-INTEGRATION.md)).

## Screens and states

`src/game/state.ts` is a small reducer. Screens:

| Screen | What happens |
| --- | --- |
| `welcome` | Title, the four creatures (tap to say hi), Play button |
| `waitingRoom` | The hub. Tap a creature to start a visit; tap the bell, plant, clock, fish tank, or magazine for surprises |
| `exam` | One patient's adventure (see below) |
| `visitComplete` | Farewell animation, the new coloring page flies into the book, then a calm pause with two choices |
| `goodbye` | Shown the instant "All done" is tapped, from anywhere |

Overlays sit on top of a screen without unmounting it, so a visit in progress survives a peek at the book: `coloringBook`, `parentGate`, `parentArea`. The screen underneath is `inert` and hidden from assistive technology while an overlay is open.

Every transition is guarded in the reducer, so rewards and transitions can't fire twice. Each patient unlocks exactly one page (`award` in `state.ts`); replays never add duplicates.

## The exam room

`src/game/ExamScreen.tsx` hosts every visit. It owns the visit state, the reaction player, and the room, and renders these pieces:

| Piece | File | Notes |
| --- | --- | --- |
| Toolbar | `src/tools/Toolbar.tsx` | Listen, Temperature, Look, Bandages, Comfort. Each button has a picture and a short word. Tap then tap the patient, or drag onto the patient. The first use of each tool shows a quick float-to-the-patient demonstration. |
| Comfort tray | `src/game/exam/Trays.tsx` | Four labeled choices (hug the patient's toy, take a break, play music, hold a hand). |
| Bandage tray and handles | `src/game/exam/Trays.tsx`, `BandageHandles.tsx` | Patterns, Undo and Remove; finger-sized handles over placed bandages for dragging or tap-to-pick-up. |
| Adventure shelf | `src/game/exam/AdventureShelf.tsx` | The patient's own activities, as picture buttons on the table front. |
| Activity | `src/game/exam/activities/*` | Takes the toolbar's place while open, with a big close button. |
| Chart | `src/game/exam/Chart.tsx` | Clipboard button (three dots fill in) and the chart panel with the stamp. |
| Story bubble | `src/game/exam/StoryBubble.tsx` | The opening line, then up to three optional talk-together ideas, each easy to dismiss. |
| Room props | `src/scenes/ExamRoomArt.tsx` | Lamp, poster, sink and cabinet, with hotspot buttons. |

"All done" (bottom left) calls `stopAll()`, which stops the reaction, closes any activity, tray or chart, and leaves straight away.

## Visits, events and the chart

`src/game/visit.ts` is the only place that changes a visit. It is pure and fully unit tested. Every action is an event:

```ts
{ type: 'tool', tool: 'stethoscope' }      // the tap point picks the reaction (Pip's chest or belly, Mochi's four tummy spots)
{ type: 'look', target: 'throat' }         // the light: ear or throat, chosen by where the child taps
{ type: 'comfort', choice: 'music' }
{ type: 'bandage', at: [x, y], style }     // placed exactly where tapped
{ type: 'moveBandage' | 'removeBandage' | 'setBandages', ... }
{ type: 'act', key: 'act:bubbles:pop', reaction }   // a step inside an activity
{ type: 'poke' }
```

Each event has a key (`tool:stethoscope`, `act:helper:pinwheel`...). Keys count uses, decide which chart discovery fills (`discoverOn`, with wildcards like `comfort:*`), and decide what eases the patient's silly problem (`eases`). After two meaningful interactions the "Feeling better!" button appears; the chart's stamp can finish a visit at any time. Nothing has to be completed.

## Patients and activities

Each patient (`src/game/patients/*.ts`) is a data object: story, chart discoveries, activities, comfort labels and reactions, tool and look reactions, body regions and bandage zones, poke zones, an intro, an idle loop, a "feels better" moment, a farewell, and a goodbye. Patient-specific activity reactions are exported next to it (`PIP_HELPERS`, `waddlesWardrobe`, `prickleShot`, `mochiMystery`...).

Activities are small components that receive an `ActivityApi` (`src/game/exam/api.ts`): record a step (`act`), play a reaction, take over taps on the patient, highlight spots, map patient coordinates to the screen, and portal pictures into the room (bubbles, sparkles, the helper, a thought bubble). They never duplicate the exam screen.

| Activity | Patient | Play |
| --- | --- | --- |
| `BubbleGame` | Pip | Bubbles rise from Pip's hiccups and rest near the top; tap to pop (some hold a surprise) or drag into the jar. No timer. |
| `HiccupHelpers` | Pip | Water, pinwheel, silly glasses; each has its own result. |
| `Wardrobe` | Waddles | Add or remove scarves (tap Waddles' neck or drag a scarf on), hat, earmuffs, blanket. Removing scarves reveals a fish pin, then a bow tie. |
| `TissueGame` | Waddles | A pretend sneeze leaves sparkly snowflakes; tap them or sweep the tissue across. |
| `BunnyCheck` | Prickle | The bunny moves to Prickle's side for its own checkup. |
| `ComfortPlan` | Prickle | Pick comforts; each fills a slot on the plan card and plays its comfort. |
| `PretendShot` | Prickle | Step by step: honest intro with Get ready or Not today, a comfort, a bandage choice, the helper, the shot (a quick pinch seen from a distance), placing the bandage, an after-care choice. Stop at any step. |
| `SoundMystery` | Mochi | Listen to the tummy, compare three toys, guess. A wrong guess gets a giggle and another listen; the right toy glows after two misses. |
| `SockRescue` | Mochi | Take the sock off, then tap where it goes (horn, ear, foot, eye, head), or swap in hats. |

## Characters

Character art is plain data. `src/art/shapes.ts` builds Bezier paths and `src/art/face.ts` turns an expression name into eyes, brows, mouth and cheeks. Each character returns named layers (`head`, `armR`, `tail`...), which `src/characters/Creature.tsx` renders as SVG groups and `src/styles/characters.css` animates (`.act-wave .ch-armR`, `.act-hiccup`...). Characters take props for persistent changes during a visit: Pip's silly glasses, Waddles' scarves, hat, earmuffs and blanket, Prickle's curl and bunny position, Mochi's sock spot and hat.

`src/game/useReactionPlayer.ts` plays reactions (lists of timed beats: face, animation, effects, sound, a tool or item on the patient, a popup, screen-reader text). A new tap cancels the current reaction, so feedback is always immediate.

## Freeform bandages

Bandages are stored in the patient's own 240 x 240 space with the body part under them (`placeOnBody` uses rough ellipses per part, and slides taps just off the patient onto the nearest edge). Each bandage is drawn inside its part's SVG group, so it moves with that part's animation and scales with the screen. Undo keeps a short history of bandage lists in the exam screen. Up to twelve bandages fit; the oldest goes first after that.

## Coloring book

`src/coloring/catalog.ts` lists exactly four pages. `src/coloring/lineArt.ts` converts the color character art into line art (white fills, black outlines, pupils stay black, blush and shine are dropped), and `src/coloring/scenes.ts` composes each scene and the cover on a 540 x 720 page, the printable area of US Letter inside half-inch margins. `PageView.tsx` renders a page as SVG for the book, the visit-complete screen and the print view; `pdf.ts` draws the same shapes into a PDF, with hollow outline titles for coloring.

Progress is saved by `src/services/storage.ts` as `{ pages, muted, calm }`. It validates everything it reads, turns first-version `stickers` saves into pages, and falls back to memory when storage is blocked.

## Grown-up area

`src/parent/ParentArea.tsx` (loaded on demand) offers the PDF download, the print view, and the email preview. `EmailForm.tsx` calls `coloringBookDelivery.send()`, which today is `disconnectedDelivery` and returns `not_connected` without any network call.

## Calm mode

`[data-calm='true']` on the root element replaces most motion with gentle fades, slows bubbles, stops idle loops and glows, limits particles, and lowers volume. It turns on from the grown-up area or automatically when the device asks for reduced motion.
