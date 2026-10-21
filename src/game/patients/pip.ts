import { pipArt } from '../../art/pip';
import { pick } from '../visit';
import type { PatientDefinition, Reaction, ReactionContext } from '../types';
import { breakReaction, earReaction, handReaction, musicReaction, stick, throatReaction } from './common';

const hiccup = (count = 1): Reaction => [
  { ms: 520, action: 'hiccup', expression: 'surprised', effects: [{ kind: 'bubble', at: 'mouth', count }], sound: 'bubble' },
];

export type PipHelper = 'water' | 'pinwheel' | 'silly';

/** The three pretend hiccup helpers. Each one does something different; none is a real remedy. */
export const PIP_HELPERS: Record<PipHelper, { label: string; reaction: (ctx: ReactionContext) => Reaction }> = {
  water: {
    label: 'Sip of water',
    reaction: () => [
      { ms: 450, item: { kind: 'cup', at: 'mouth' }, expression: 'curious', look: 'down', say: 'Pip takes a pretend sip of water.' },
      { ms: 1000, sound: 'gulp', action: 'sip', expression: 'calm' },
      { ms: 700, item: null, action: 'hiccup', expression: 'surprised', look: null, effects: [{ kind: 'bubble', at: 'mouth', size: 0.45 }], sound: 'bubble', say: 'Just one teeny, tiny hiccup now!' },
      { ms: 600, expression: 'happy' },
    ],
  },
  pinwheel: {
    label: 'Pinwheel breaths',
    reaction: () => [
      { ms: 450, item: { kind: 'pinwheel', at: 'side' }, expression: 'curious', look: 'right' },
      { ms: 1500, sound: 'breath', action: 'puff', expression: 'calm', look: 'right', effects: [{ kind: 'breathe', at: 'mouth' }], say: 'Pip takes a big breath and blows on the pinwheel. Whirr!' },
      { ms: 1300, item: null, look: null, expression: 'surprised', effects: [{ kind: 'bubble', at: 'mouth', size: 2.6 }], sound: 'bubble', say: 'Whoa! One giant bubble floats away.' },
      { ms: 600, expression: 'giggle' },
    ],
  },
  silly: {
    label: 'Silly glasses',
    reaction: ({ props }) =>
      props.glasses
        ? [
            { ms: 400, props: { glasses: false }, expression: 'surprised', sound: 'pop', say: 'Off come the silly glasses.' },
            { ms: 900, action: 'wiggle', expression: 'giggle', sound: 'giggle', effects: [{ kind: 'bubble', at: 'mouth', count: 2 }] },
          ]
        : [
            { ms: 450, props: { glasses: true }, expression: 'silly', sound: 'boing', say: 'Pip tries on the silliest glasses.' },
            { ms: 1200, action: 'wiggle', expression: 'giggle', sound: 'giggle', effects: [{ kind: 'bubble', at: 'mouth', count: 4 }], say: 'Pip laughs so hard the hiccups turn into giggles!' },
            { ms: 600, expression: 'proud' },
          ],
  },
};

/** Little pictures that can be inside a bubble. */
export const BUBBLE_SURPRISES = ['star', 'fish', 'duck', 'heart', 'note', 'flower'] as const;
export type BubbleSurprise = (typeof BUBBLE_SURPRISES)[number];

export const pipBubbleReactions = {
  /** Pip hiccups out a bubble for the bubble game. */
  hiccup: (): Reaction => [{ ms: 520, action: 'hiccup', expression: 'surprised', sound: 'bubble' }, { ms: 300, expression: 'excited' }],
  pop: (surprise: BubbleSurprise | null): Reaction =>
    surprise
      ? [{ ms: 900, action: 'bounce', expression: 'excited', look: 'up', say: `Pop! A tiny ${surprise} was inside the bubble!` }, { ms: 200, look: null }]
      : [{ ms: 600, expression: 'giggle', sound: 'giggle', say: 'Pop!' }],
  jar: (count: number): Reaction => [
    { ms: 800, action: 'bop', expression: 'proud', look: 'downLeft', say: count === 1 ? 'A bubble in the jar!' : `${count} bubbles in the jar!` },
    { ms: 200, look: null },
  ],
};

export const pip: PatientDefinition = {
  id: 'pip',
  name: 'Pip the Dragon',
  summary: 'Pip the dragon has the hiccups and keeps blowing bubbles.',
  artist: pipArt,
  plush: 'star',
  initialProps: { hug: false, glasses: false },
  roomTint: '#e4f1ea',
  anchors: {
    chest: [120, 158],
    ear: [178, 92],
    mouth: [120, 124],
    nose: [120, 104],
    belly: [120, 194],
    head: [120, 44],
    top: [120, 18],
    tail: [212, 146],
    wing: [50, 122],
    feet: [120, 222],
    plush: [120, 176],
    side: [214, 206],
    hand: [164, 176],
  },
  toolTarget: { stethoscope: 'chest', thermometer: 'mouth', light: 'ear' },
  toolZones: { stethoscope: [[120, 158], [120, 198]], light: [[178, 92], [120, 124]] },
  story: {
    intro: 'Oh no! Pip keeps hiccuping bubbles! Can you help?',
    reason: 'Bubble hiccups',
    prompts: [
      'What do you think Pip needs?',
      'Can you find a bubble with a surprise inside?',
      'Take turns: one picks a bandage, the other puts it on Pip.',
    ],
  },
  chart: {
    discoveries: [
      { id: 'heartbeat', icon: 'heartbeat', label: 'Bubbly heartbeat' },
      { id: 'bubbles', icon: 'bubbles', label: 'Bubble surprises' },
      { id: 'helper', icon: 'helper', label: 'Something that helped' },
    ],
  },
  discoverOn: { 'tool:stethoscope': 'heartbeat', 'act:bubbles:*': 'bubbles', 'act:helper:*': 'helper', 'comfort:*': 'helper' },
  activities: [
    { id: 'bubbles', label: 'Catch bubbles' },
    { id: 'hiccupHelper', label: 'Hiccup helpers' },
  ],
  comfortLabels: { hug: 'Hug star', break: 'Take a break', music: 'Play music', hand: 'Hold a hand' },
  issueStart: 3,
  eases: (key) => key.startsWith('act:helper:') || key.startsWith('comfort:'),
  restingExpression: (visit) => (visit.issue > 0 && !visit.comforted ? 'brave' : 'happy'),
  intro: [
    { ms: 450, expression: 'happy' },
    { ms: 650, action: 'hiccup', expression: 'surprised', effects: [{ kind: 'bubble', at: 'mouth' }], sound: 'bubble', say: 'Pip hiccups, and a bubble floats out!' },
    { ms: 750, expression: 'surprised', look: 'up' },
    { ms: 650, action: 'hiccup', expression: 'crossEyed', effects: [{ kind: 'bubble', at: 'mouth', count: 2 }], sound: 'bubble', say: 'Another bubble escapes!' },
    { ms: 700, action: 'dramatic', expression: 'worried', look: null },
  ],
  idle: (visit) => (visit.issue > 0 ? hiccup(visit.issue) : [{ ms: 900, action: 'wag', expression: 'happy' }]),
  tools: {
    stethoscope: ({ use, point }: ReactionContext) => {
      const belly = point ? point[1] > 176 : use % 2 === 0;
      if (belly) {
        return [
          { ms: 350, toolAt: { tool: 'stethoscope', at: 'belly' }, expression: 'curious', look: 'down' },
          {
            ms: 1300,
            sound: 'glub',
            action: 'wiggle',
            expression: 'surprised',
            effects: [{ kind: 'bubble', at: 'belly', count: 4, size: 0.6 }],
            say: 'Glub, glub, bloop! A bubbly rhythm in Pip’s belly.',
          },
          { ms: 700, action: 'hiccup', sound: 'bubble', effects: [{ kind: 'bubble', at: 'mouth', count: 2 }], expression: 'giggle', toolAt: null, look: null },
        ];
      }
      return pick<Reaction>(
        [
          [
            { ms: 350, toolAt: { tool: 'stethoscope', at: 'chest' }, expression: 'curious', look: 'down' },
            {
              ms: 1100,
              sound: 'heartbeatMusical',
              action: 'bop',
              expression: 'excited',
              look: null,
              effects: [{ kind: 'pulse', at: 'chest' }, { kind: 'note', at: 'chest', count: 3 }],
              say: 'A musical heartbeat! Pip bops along.',
            },
            { ms: 700, action: 'wiggle', expression: 'giggle', effects: [{ kind: 'note', at: 'top' }], toolAt: null },
          ],
          [
            { ms: 350, toolAt: { tool: 'stethoscope', at: 'chest' }, expression: 'calm' },
            {
              ms: 1300,
              sound: 'heartbeatMusical',
              action: 'sing',
              expression: 'proud',
              effects: [{ kind: 'note', at: 'top', count: 4 }, { kind: 'pulse', at: 'chest' }],
              say: 'Pip sings along with the heartbeat. La la la!',
            },
            { ms: 400, toolAt: null, expression: 'happy' },
          ],
        ],
        use,
      );
    },
    thermometer: ({ use }) =>
      pick<Reaction>(
        [
          [
            { ms: 350, toolAt: { tool: 'thermometer', at: 'mouth' }, expression: 'nervous', look: 'down' },
            { ms: 1700, popup: { kind: 'gauge', reading: 'toasty' }, action: 'tremble', expression: 'worried', look: 'right', say: 'Pip watches the gauge.' },
            { ms: 750, effects: [{ kind: 'flame', at: 'mouth' }], sound: 'pop', expression: 'surprised', look: null, say: 'A tiny warm puff! Dragons are nice and toasty.' },
            { ms: 700, popup: null, toolAt: null, action: 'bounce', expression: 'giggle' },
          ],
          [
            { ms: 350, toolAt: { tool: 'thermometer', at: 'mouth' }, expression: 'squeeze' },
            { ms: 1600, popup: { kind: 'gauge', reading: 'cozy' }, action: 'peekOne', expression: 'nervous', look: 'right', say: 'Pip peeks at the gauge. It says cozy!' },
            { ms: 800, popup: null, toolAt: null, action: 'jump', expression: 'proud', look: null, effects: [{ kind: 'sparkle', at: 'top', count: 3 }], sound: 'sparkle' },
          ],
        ],
        use,
      ),
  },
  look: {
    ear: ({ use }) =>
      use % 2 === 1
        ? earReaction('sparkle', "Inside Pip's ear: a tiny glowing sparkle!", 'tiltR', [{ ms: 500, effects: [{ kind: 'sparkle', at: 'ear', count: 3 }] }])
        : earReaction('heartSparkle', 'This time the sparkle is shaped like a heart!', 'tiltR', [{ ms: 500, effects: [{ kind: 'heart', at: 'ear', count: 2 }] }]),
    throat: () =>
      throatReaction('campfire', 'Say ahh! A teeny pretend campfire keeps the dragon cozy.', [
        { ms: 700, action: 'hiccup', sound: 'bubble', effects: [{ kind: 'bubble', at: 'mouth', count: 2 }], expression: 'surprised' },
      ]),
  },
  bodyRegions: [
    { part: 'tail', cx: 204, cy: 172, rx: 22, ry: 44 },
    { part: 'wingL', cx: 58, cy: 118, rx: 28, ry: 28 },
    { part: 'wingR', cx: 182, cy: 118, rx: 28, ry: 28 },
    { part: 'feet', cx: 120, cy: 222, rx: 44, ry: 10 },
    { part: 'body', cx: 120, cy: 180, rx: 52, ry: 48 },
    { part: 'armL', cx: 78, cy: 170, rx: 12, ry: 20 },
    { part: 'armR', cx: 162, cy: 170, rx: 12, ry: 20 },
    { part: 'head', cx: 120, cy: 82, rx: 60, ry: 60 },
  ],
  bandageZones: [
    {
      id: 'nose',
      at: [120, 108],
      radius: 20,
      reaction: () => [
        stick('crossEyed'),
        { ms: 1100, action: 'wobble', expression: 'crossEyed', say: 'Pip goes cross-eyed looking at the bandage on its nose!' },
        { ms: 600, expression: 'giggle', sound: 'giggle' },
      ],
    },
    {
      id: 'horns',
      at: [100, 34],
      radius: 28,
      reaction: () => [stick('curious', 'up'), { ms: 1100, action: 'tiltL', expression: 'giggle', look: 'up', say: 'A bandage on a horn! Pip tries to look up at it.' }, { ms: 200, look: null }],
    },
    {
      id: 'tail',
      at: [210, 156],
      radius: 30,
      reaction: () => [stick('surprised', 'right'), { ms: 1100, action: 'wag', expression: 'giggle', effects: [{ kind: 'heart', at: 'tail' }], say: 'Pip wags the bandaged tail. Swish swish!' }, { ms: 200, look: null }],
    },
    {
      id: 'wing',
      at: [54, 120],
      radius: 30,
      reaction: () => [stick('curious', 'left'), { ms: 1100, action: 'flap', expression: 'proud', look: null, effects: [{ kind: 'sparkle', at: 'wing', count: 2 }], say: 'Pip flaps its bandaged wing proudly.' }],
    },
    {
      id: 'belly',
      at: [120, 194],
      radius: 26,
      reaction: () => [stick(), { ms: 900, action: 'wiggle', expression: 'giggle', sound: 'giggle', effects: [{ kind: 'bubble', at: 'mouth', count: 2 }], say: 'Hee hee! Pip has a ticklish tummy.' }],
    },
    {
      id: 'feet',
      at: [120, 222],
      radius: 26,
      reaction: () => [stick('curious', 'down'), { ms: 1100, action: 'tapDance', expression: 'excited', effects: [{ kind: 'note', at: 'feet', count: 2 }], say: 'Pip does a happy little stomp.' }, { ms: 200, look: null }],
    },
  ],
  bandageSurprise: ({ visit }) =>
    visit.bandages.length >= 5
      ? [stick('surprised'), { ms: 1200, action: 'spin', expression: 'giggle', sound: 'whoosh', say: 'So many bandages! Pip spins around to see them all.' }]
      : [stick('happy'), { ms: 900, action: 'bounce', expression: 'proud', effects: [{ kind: 'sparkle', at: 'top', count: 2 }], say: 'Pip admires the new bandage.' }],
  pokes: [
    { at: [120, 106], radius: 26, reaction: () => [...hiccup(1), { ms: 500, expression: 'giggle', say: 'Boop! A bubble pops out of Pip.' }] },
    { at: [212, 146], radius: 30, reaction: () => [{ ms: 900, action: 'wag', expression: 'giggle', effects: [{ kind: 'heart', at: 'tail' }], say: 'Pip wags its tail.' }] },
    { at: [120, 190], radius: 32, reaction: () => [{ ms: 800, action: 'wiggle', expression: 'giggle', sound: 'giggle', say: 'Pip giggles. Ticklish!' }] },
    { at: [52, 124], radius: 30, reaction: () => [{ ms: 900, action: 'flap', expression: 'excited', say: 'Pip flaps its little wings.' }] },
    { at: [120, 44], radius: 34, reaction: () => [{ ms: 800, action: 'tiltL', expression: 'curious', look: 'up', effects: [{ kind: 'sparkle', at: 'head' }], say: "Pip's horns get a gentle pat." }] },
  ],
  defaultPoke: () => [{ ms: 700, action: 'bounce', expression: 'happy', say: 'Pip bounces happily.' }],
  comfort: {
    hug: () => [
      { ms: 350, props: { hug: true }, expression: 'calm' },
      { ms: 800, action: 'squeezeHug', expression: 'squeeze', effects: [{ kind: 'heart', at: 'plush', count: 2 }], say: 'Pip hugs the star plush so tightly...' },
      { ms: 900, action: 'hiccup', expression: 'surprised', effects: [{ kind: 'bubble', at: 'mouth', count: 5 }], sound: 'bubble', say: '...that bubbles pop out everywhere!' },
      { ms: 800, expression: 'giggle' },
      { ms: 200, props: { hug: false }, expression: 'happy' },
    ],
    break: () => breakReaction('Pip takes a break and a big, slow dragon breath.', [{ ms: 700, expression: 'happy', effects: [{ kind: 'bubble', at: 'mouth', size: 0.6 }] }]),
    music: () => musicReaction('A little music box plays. Pip sways, and the hiccups bounce to the beat.', 'sway', [{ ms: 500, action: 'hiccup', effects: [{ kind: 'note', at: 'mouth' }], expression: 'giggle' }]),
    hand: () => handReaction('A friendly hand holds Pip’s claw. Pip feels calmer.'),
  },
  feelsBetter: [
    { ms: 600, action: 'hiccup', expression: 'surprised', effects: [{ kind: 'bubble', at: 'mouth', size: 0.5 }] },
    { ms: 900, expression: 'surprised', look: 'up', say: "Pip's hiccups have stopped!" },
    { ms: 1000, action: 'jump', expression: 'excited', look: null, sound: 'jingle', effects: [{ kind: 'sparkle', at: 'top', count: 3 }] },
  ],
  farewell: [
    { ms: 450, expression: 'happy', item: null },
    { ms: 1800, action: 'puff', expression: 'proud', sound: 'bubble', effects: [{ kind: 'heartBubble', at: 'mouth', size: 1.5 }], say: 'Pip blows one enormous bubble. It turns into a heart that says thank you!' },
    { ms: 1300, action: 'wave', expression: 'giggle', say: 'Pip waves goodbye.' },
  ],
  goodbye: [
    { ms: 1300, action: 'puff', expression: 'proud', effects: [{ kind: 'heartBubble', at: 'mouth' }], sound: 'bubble' },
    { ms: 1400, action: 'wave', expression: 'happy', say: 'Pip blows a heart bubble and waves goodbye.' },
  ],
  waitingIdle: [{ action: 'hiccup', effects: [{ kind: 'bubble', at: 'mouth' }] }, { action: 'wag' }],
};
