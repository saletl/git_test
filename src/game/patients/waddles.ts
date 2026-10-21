import { waddlesArt } from '../../art/waddles';
import { pick } from '../visit';
import type { CreatureProps } from '../../art/creature';
import type { PatientDefinition, Reaction } from '../types';
import { breakReaction, earReaction, handReaction, musicReaction, stick, throatReaction } from './common';

export const MAX_SCARVES = 7;

export const scarfCount = (props: CreatureProps): number => (typeof props.scarves === 'number' ? props.scarves : 5);

/** A sneeze. Only the very first one (in the introduction) sends a scarf flying. */
function sneeze(props: CreatureProps, say = 'Achoo!', launchScarf = false): Reaction {
  const n = scarfCount(props);
  const flies = launchScarf && n > 1;
  return [
    { ms: 450, action: 'preSneeze', expression: 'squeeze' },
    {
      ms: 650,
      action: 'sneeze',
      expression: 'surprised',
      sound: 'sneeze',
      effects: flies ? [{ kind: 'scarf', at: 'neck' }, { kind: 'puff', at: 'mouth' }] : [{ kind: 'puff', at: 'mouth' }],
      props: flies ? { scarves: n - 1 } : undefined,
      say,
    },
    { ms: 800, action: 'lookAround', expression: 'curious', look: 'left' },
    { ms: 300, look: null, expression: 'happy' },
  ];
}

/** Dressing up. Fuzzy scarves tickle the beak, which is the secret behind the sneezes. */
export const waddlesWardrobe = {
  scarfOff: (props: CreatureProps): { key: string; reaction: Reaction } => {
    const n = scarfCount(props);
    if (n <= 0) {
      return { key: 'act:wardrobe:none', reaction: [{ ms: 900, action: 'lookAround', expression: 'curious', look: 'down', effects: [{ kind: 'question', at: 'head' }], say: 'No scarves left! Just a fancy bow tie.' }, { ms: 200, look: null }] };
    }
    const left = n - 1;
    const base: Reaction[number] = { ms: 450, props: { scarves: left }, effects: [{ kind: 'scarf', at: 'neck' }], sound: 'whoosh', expression: 'surprised' };
    if (left === 2) {
      return {
        key: 'act:wardrobe:pin',
        reaction: [base, { ms: 1300, action: 'leanIn', expression: 'excited', look: 'downLeft', effects: [{ kind: 'sparkle', at: 'pin', count: 3 }], sound: 'sparkle', say: 'Look! A little fish pin was hiding under the scarves.' }, { ms: 200, look: null }],
      };
    }
    if (left === 0) {
      return {
        key: 'act:wardrobe:bowtie',
        reaction: [base, { ms: 1300, action: 'spin', expression: 'proud', effects: [{ kind: 'sparkle', at: 'neck', count: 3 }], sound: 'jingle', say: 'Ta-da! A fancy bow tie was under there all along.' }],
      };
    }
    return {
      key: 'act:wardrobe:off',
      reaction: [base, { ms: 900, action: 'waddle', expression: 'happy', say: left >= 4 ? 'One less fuzzy scarf. Less tickly!' : 'Ahh. Much less tickly on the beak.' }],
    };
  },
  scarfOn: (props: CreatureProps): { key: string; reaction: Reaction } => {
    const n = scarfCount(props);
    if (n >= MAX_SCARVES) {
      return { key: 'act:wardrobe:full', reaction: [{ ms: 300, expression: 'squeeze' }, ...sneeze(props, 'So many fuzzy scarves! They tickle the beak... achoo!')] };
    }
    const reaction: Reaction = [{ ms: 450, props: { scarves: n + 1 }, sound: 'stick', expression: 'happy' }, { ms: 800, action: 'squeezeHug', expression: 'calm', say: 'Cozy! Another scarf for Waddles.' }];
    if (n + 1 >= 5) reaction.push(...sneeze({ scarves: n + 1 }, 'The fuzzy scarf tickles the beak... achoo!'));
    return { key: 'act:wardrobe:on', reaction };
  },
  hat: (props: CreatureProps): Reaction =>
    props.hat === 'beanie'
      ? [{ ms: 400, props: { hat: 'none' }, sound: 'boing', expression: 'surprised' }, { ms: 900, action: 'boing', expression: 'giggle', say: "Boing! Waddles' head feathers pop back up." }]
      : [{ ms: 400, props: { hat: 'beanie' }, sound: 'stick', expression: 'excited', look: 'up' }, { ms: 1200, action: 'spin', sound: 'whoosh', expression: 'proud', look: null, say: 'A cozy hat! Waddles spins around to show it off.' }],
  earmuffs: (props: CreatureProps): Reaction =>
    props.earmuffs
      ? [{ ms: 400, props: { earmuffs: false }, expression: 'surprised' }, { ms: 900, action: 'tiltR', expression: 'happy', say: 'Earmuffs off. Now Waddles can hear you again!' }]
      : [
          { ms: 400, props: { earmuffs: true }, sound: 'stick', expression: 'happy' },
          { ms: 1300, action: 'tiltBig', expression: 'curious', effects: [{ kind: 'question', at: 'head' }], say: 'Huh? With earmuffs on, Waddles can’t hear a thing!' },
          { ms: 400, expression: 'giggle' },
        ],
  blanket: (props: CreatureProps): Reaction =>
    props.blanket
      ? [{ ms: 400, props: { blanket: false }, expression: 'surprised' }, { ms: 900, action: 'waddle', expression: 'happy', say: 'Blanket off. Waddles does a wake-up waddle.' }]
      : [
          { ms: 400, props: { blanket: true }, expression: 'calm' },
          { ms: 1600, action: 'settle', sound: 'breath', expression: 'sleepy', effects: [{ kind: 'zzz', at: 'top' }], say: 'Waddles snuggles into the cozy blanket.' },
          { ms: 400, expression: 'happy' },
        ],
};

/** The tissue game: a pretend sneeze leaves a few sparkly snowflakes to tidy up. */
export const waddlesTissue = {
  sneeze: (): Reaction => [
    { ms: 600, action: 'preSneeze', expression: 'squeeze', say: 'Ah... ah...' },
    { ms: 700, action: 'sneeze', expression: 'surprised', sound: 'sneeze', effects: [{ kind: 'snowflake', at: 'mouth', count: 4 }, { kind: 'puff', at: 'mouth' }], say: 'Achoo! Sparkly snowflakes everywhere. Can you tidy up with a tissue?' },
    { ms: 600, expression: 'shy', look: 'down' },
    { ms: 200, look: null },
  ],
  wipe: (): Reaction => [{ ms: 500, expression: 'giggle', sound: 'whoosh' }],
  beak: (): Reaction => [{ ms: 400, item: { kind: 'tissue', at: 'mouth' }, expression: 'squeeze' }, { ms: 700, item: null, action: 'wiggle', expression: 'giggle', sound: 'giggle', say: 'A gentle wipe on the beak. That tickles!' }],
  done: (): Reaction => [
    { ms: 400, expression: 'excited' },
    { ms: 1200, action: 'nod', expression: 'proud', effects: [{ kind: 'sparkle', at: 'top', count: 3 }], sound: 'jingle', say: 'All tidy! Waddles says thank you.' },
    { ms: 500, expression: 'happy' },
  ],
};

export const waddles: PatientDefinition = {
  id: 'waddles',
  name: 'Waddles the Penguin',
  summary: 'Waddles the penguin keeps sneezing and is wearing far too many scarves.',
  artist: waddlesArt,
  plush: 'fish',
  initialProps: { scarves: 5, hug: false, offer: false, hat: 'none', earmuffs: false, blanket: false },
  waitingProps: { scarves: 5 },
  roomTint: '#e2edf3',
  anchors: {
    chest: [120, 172],
    ear: [168, 78],
    mouth: [120, 100],
    neck: [120, 126],
    pin: [90, 146],
    nose: [120, 96],
    belly: [120, 190],
    head: [120, 36],
    top: [120, 12],
    feet: [120, 222],
    flipper: [44, 174],
    plush: [120, 176],
    offer: [214, 86],
    side: [214, 206],
    hand: [190, 176],
  },
  toolTarget: { stethoscope: 'chest', thermometer: 'mouth', light: 'ear' },
  toolZones: { light: [[168, 78], [120, 100]] },
  story: {
    intro: "Waddles can't stop sneezing! What's going on?",
    reason: 'The great sneezing mystery',
    prompts: [
      'Why do you think Waddles keeps sneezing?',
      'How many scarves should Waddles wear?',
      'Take turns: one picks a hat, the other picks a scarf.',
    ],
  },
  chart: {
    discoveries: [
      { id: 'heartbeat', icon: 'heartbeat', label: 'Thump-thump heartbeat' },
      { id: 'bowtie', icon: 'bowtie', label: 'Scarf surprise' },
      { id: 'tissue', icon: 'tissue', label: 'Tissue tidy-up' },
    ],
  },
  discoverOn: { 'tool:stethoscope': 'heartbeat', 'act:wardrobe:pin': 'bowtie', 'act:wardrobe:bowtie': 'bowtie', 'act:tissue:done': 'tissue' },
  activities: [
    { id: 'wardrobe', label: 'Scarves and hats' },
    { id: 'tissue', label: 'Tissue' },
  ],
  comfortLabels: { hug: 'Hug fish', break: 'Take a break', music: 'Play music', hand: 'Hold a hand' },
  issueStart: 3,
  eases: (key) => key.startsWith('act:wardrobe:pin') || key.startsWith('act:wardrobe:off') || key.startsWith('act:wardrobe:bowtie') || key.startsWith('act:tissue:') || key.startsWith('comfort:'),
  restingExpression: () => 'happy',
  intro: [
    { ms: 450, expression: 'happy', look: 'up' },
    ...sneeze({ scarves: 5 }, 'Achoo! Waddles sneezes so hard a scarf flies into the air!', true),
  ],
  idle: (visit, props) => (visit.issue > 0 ? sneeze(props) : [{ ms: 1000, action: 'waddle', expression: 'happy' }]),
  tools: {
    stethoscope: ({ use }) =>
      pick<Reaction>(
        [
          [
            { ms: 350, toolAt: { tool: 'stethoscope', at: 'chest' }, expression: 'curious', look: 'down' },
            { ms: 900, sound: 'heartbeat', effects: [{ kind: 'pulse', at: 'chest' }], expression: 'excited', say: 'Thump-thump! Waddles hears a heartbeat.' },
            {
              ms: 1200,
              toolAt: { tool: 'stethoscope', at: 'feet' },
              action: 'bendDown',
              expression: 'curious',
              look: 'down',
              effects: [{ kind: 'question', at: 'head' }],
              say: 'Waddles tries to listen to its own feet!',
            },
            { ms: 700, toolAt: null, action: 'waddle', expression: 'giggle', sound: 'giggle', look: null },
          ],
          [
            { ms: 350, toolAt: { tool: 'stethoscope', at: 'chest' }, expression: 'excited' },
            { ms: 800, sound: 'heartbeat', effects: [{ kind: 'pulse', at: 'chest' }] },
            { ms: 1100, toolAt: { tool: 'stethoscope', at: 'flipper' }, action: 'flap', expression: 'curious', look: 'left', say: 'Now Waddles listens to a flipper. Flap flap!' },
            { ms: 600, toolAt: null, expression: 'giggle', look: null },
          ],
        ],
        use,
      ),
    thermometer: () => [
      { ms: 350, toolAt: { tool: 'thermometer', at: 'mouth' }, expression: 'curious', look: 'up' },
      { ms: 1800, popup: { kind: 'gauge', reading: 'chilly' }, action: 'leanIn', expression: 'excited', look: 'right', say: 'Waddles watches the thermometer with enormous curiosity.' },
      { ms: 850, effects: [{ kind: 'snowflake', at: 'top', count: 3 }], sound: 'sparkle', expression: 'surprised', say: 'Brrr! Penguin-chilly. Just right for a penguin!' },
      { ms: 700, popup: null, toolAt: null, action: 'bounce', expression: 'proud', look: null },
    ],
  },
  look: {
    ear: ({ use }) =>
      use % 2 === 1
        ? earReaction('snowman', "A tiny snowman waves hello from inside Waddles' ear!", 'tiltBig')
        : earReaction('snowflake', 'A sparkly snowflake twirls inside!', 'tiltBig', [{ ms: 400, effects: [{ kind: 'snowflake', at: 'ear', count: 2 }] }]),
    throat: ({ props }) =>
      throatReaction('iceberg', 'Say ahh! A pretend little iceberg, with a fish waving hello.', [{ ms: 200 }, ...sneeze(props, 'Achoo! That light tickled.')]),
  },
  bodyRegions: [
    { part: 'feet', cx: 120, cy: 224, rx: 40, ry: 9 },
    { part: 'flipperL', cx: 56, cy: 154, rx: 17, ry: 34 },
    { part: 'flipperR', cx: 184, cy: 154, rx: 17, ry: 34 },
    { part: 'body', cx: 120, cy: 150, rx: 64, ry: 78 },
    { part: 'head', cx: 120, cy: 70, rx: 48, ry: 42 },
  ],
  bandageZones: [
    {
      id: 'beak',
      at: [120, 98],
      radius: 16,
      reaction: ({ props }) => [stick('crossEyed'), { ms: 900, expression: 'crossEyed', say: 'A bandage on the beak? That tickles...' }, ...sneeze(props, 'Achoo! What a ticklish beak.')],
    },
    {
      id: 'flipper',
      at: [50, 166],
      radius: 30,
      reaction: () => [stick('excited', 'left'), { ms: 1100, action: 'flap', expression: 'proud', effects: [{ kind: 'sparkle', at: 'flipper', count: 3 }], say: 'Waddles flaps the decorated flipper and admires it.' }, { ms: 300, look: null }],
    },
    {
      id: 'head',
      at: [120, 44],
      radius: 28,
      reaction: () => [stick('curious', 'up'), { ms: 1100, action: 'spin', sound: 'whoosh', expression: 'surprised', say: 'Waddles spins around trying to see the bandage on its head!' }, { ms: 500, expression: 'giggle', look: null }],
    },
    {
      id: 'belly',
      at: [120, 194],
      radius: 30,
      reaction: () => [stick('surprised', 'down'), { ms: 900, action: 'bounce', expression: 'giggle', sound: 'giggle', say: 'Waddles pats the bandage on its tummy. Pat pat!' }, { ms: 200, look: null }],
    },
    {
      id: 'foot',
      at: [120, 222],
      radius: 26,
      reaction: () => [stick('curious', 'down'), { ms: 1200, action: 'tapDance', expression: 'excited', effects: [{ kind: 'note', at: 'feet', count: 3 }], say: 'Waddles does a happy tap dance!' }, { ms: 200, look: null }],
    },
  ],
  bandageSurprise: () => [stick('happy'), { ms: 1000, action: 'waddle', expression: 'proud', effects: [{ kind: 'sparkle', at: 'chest', count: 2 }], say: 'Waddles waddles proudly with the new bandage.' }],
  pokes: [
    { at: [120, 98], radius: 22, reaction: ({ props }) => sneeze(props, 'Boop on the beak! Achoo!') },
    { at: [120, 36], radius: 26, reaction: () => [{ ms: 800, action: 'boing', expression: 'surprised', sound: 'boing', say: "Waddles' head feathers go boing!" }] },
    { at: [120, 190], radius: 32, reaction: () => [{ ms: 800, action: 'wiggle', expression: 'giggle', sound: 'giggle', say: 'Waddles giggles.' }] },
    { at: [44, 174], radius: 30, reaction: () => [{ ms: 900, action: 'flap', expression: 'excited', say: 'Flap flap! Waddles flaps hello.' }] },
    { at: [120, 222], radius: 26, reaction: () => [{ ms: 1000, action: 'tapDance', expression: 'happy', effects: [{ kind: 'note', at: 'feet' }], say: 'Tippy tap toes!' }] },
  ],
  defaultPoke: () => [{ ms: 900, action: 'waddle', expression: 'happy', say: 'Waddles waddles side to side.' }],
  comfort: {
    hug: () => [
      { ms: 400, props: { hug: true }, expression: 'calm' },
      { ms: 900, action: 'squeezeHug', expression: 'happy', effects: [{ kind: 'heart', at: 'plush', count: 2 }], say: 'Waddles hugs the fish plush...' },
      { ms: 1300, props: { hug: false, offer: true }, expression: 'excited', effects: [{ kind: 'heart', at: 'offer' }], say: '...then offers it back to you. So kind!' },
      { ms: 300, props: { offer: false }, expression: 'happy' },
    ],
    break: () => breakReaction('Waddles takes a break and wiggles its toes.', [{ ms: 600, action: 'settle', expression: 'happy' }]),
    music: () => musicReaction('A music box plays. Waddles dances, and the scarves twirl.', 'dance'),
    hand: () => handReaction('A friendly hand holds Waddles’ flipper. Flap, flap, thank you!', [{ ms: 700, action: 'flap', expression: 'giggle' }]),
  },
  feelsBetter: [
    { ms: 500, action: 'preSneeze', expression: 'squeeze' },
    { ms: 900, expression: 'surprised', say: 'No sneeze! Waddles feels much better.' },
    { ms: 1000, action: 'jump', expression: 'excited', sound: 'jingle', effects: [{ kind: 'sparkle', at: 'top', count: 3 }] },
  ],
  farewell: [
    { ms: 500, action: 'preSneeze', expression: 'squeeze', item: null },
    { ms: 800, action: 'sneeze', sound: 'sneeze', expression: 'surprised', effects: [{ kind: 'puff', at: 'mouth', size: 1.8 }, { kind: 'snowflake', at: 'top', count: 4 }], say: 'One last ENORMOUS sneeze... ACHOO!' },
    { ms: 1200, action: 'slideAway', sound: 'whoosh', expression: 'giggle', say: 'Wheee! Waddles slides across the room...' },
    { ms: 1000, action: 'slideBack', expression: 'excited', say: '...comes back...' },
    { ms: 1200, action: 'wave', expression: 'happy', say: '...and waves goodbye.' },
  ],
  goodbye: [
    { ms: 1200, action: 'wave', expression: 'happy', say: 'Waddles waves...' },
    { ms: 1300, action: 'slideOff', sound: 'whoosh', expression: 'giggle', say: '...and slides away. Wheee!' },
  ],
  waitingIdle: [{ action: 'sneeze', effects: [{ kind: 'puff', at: 'mouth' }] }, { action: 'waddle' }],
};
