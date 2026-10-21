import { prickleArt } from '../../art/prickle';
import { pick } from '../visit';
import type { ComfortId, PatientDefinition, Reaction, ReactionContext } from '../types';
import { breakReaction, earReaction, handReaction, musicReaction, stick, throatReaction } from './common';

/**
 * Prickle feels nervous about a checkup and a pretend shot. Comfort helps Prickle feel supported,
 * but worry is never treated as bad, and Prickle can finish the visit without the pretend shot.
 */

/** Checking the bunny first, with the same pretend tools. Prickle watches and feels more ready. */
export const prickleBunny = {
  start: (): Reaction => [
    { ms: 600, props: { bunny: 'lap', curl: false }, expression: 'shy', look: 'right', say: 'Prickle sets the bunny down so the doctor can check it first.' },
    { ms: 300, look: null },
  ],
  stethoscope: (): Reaction => [
    { ms: 350, toolAt: { tool: 'stethoscope', at: 'bunny' }, expression: 'curious', look: 'right' },
    { ms: 1300, sound: 'heartbeat', effects: [{ kind: 'heart', at: 'bunny', count: 3, size: 0.7 }], say: 'The bunny has a soft, fluffy heartbeat.' },
    { ms: 600, toolAt: null, expression: 'brave', look: null },
  ],
  thermometer: (): Reaction => [
    { ms: 350, toolAt: { tool: 'thermometer', at: 'bunnyMouth' }, expression: 'curious', look: 'right' },
    { ms: 1600, popup: { kind: 'gauge', reading: 'gentle' }, say: 'The bunny is cozy. That did not hurt the bunny at all.' },
    { ms: 600, popup: null, toolAt: null, expression: 'brave', look: null },
  ],
  light: (): Reaction => [
    { ms: 350, toolAt: { tool: 'light', at: 'bunnyEar' }, expression: 'curious', look: 'right' },
    { ms: 1700, popup: { kind: 'lens', discovery: 'carrot', view: 'ear' }, sound: 'sparkle', say: 'A tiny carrot in the bunny’s ear! Prickle smiles.' },
    { ms: 600, popup: null, toolAt: null, expression: 'happy', look: null },
  ],
  ready: (): Reaction => [
    { ms: 500, expression: 'calm', look: 'right' },
    { ms: 1300, action: 'nod', expression: 'brave', look: null, effects: [{ kind: 'heart', at: 'top' }], say: 'The bunny did great. Prickle nods: maybe Prickle can try too.' },
  ],
  done: (): Reaction => [{ ms: 600, props: { bunny: 'hug' }, action: 'squeezeHug', expression: 'calm', effects: [{ kind: 'heart', at: 'bunny', count: 2 }], say: 'Prickle hugs the bunny again.' }],
};

const comfortReactions: Record<ComfortId, (ctx: ReactionContext) => Reaction> = {
  hug: () => [
    { ms: 400, props: { bunny: 'hug', curl: false }, action: 'squeezeHug', expression: 'calm', effects: [{ kind: 'heart', at: 'bunny', count: 2 }], say: 'Prickle hugs the bunny close. The quills soften.' },
    { ms: 1000, expression: 'brave' },
  ],
  break: () => breakReaction('A break. The tools rest, and Prickle breathes in slowly... and out.', [{ ms: 600, expression: 'brave', props: { curl: false } }]),
  music: () => musicReaction('Gentle music plays. Prickle sways, and the quills relax.', 'sway', [{ ms: 300, props: { curl: false } }]),
  hand: () =>
    handReaction('Prickle asks for help, and a friendly hand holds on. Asking for help is a great idea.', [{ ms: 400, props: { curl: false }, expression: 'brave' }]),
};

/** The pretend shot, one gentle step at a time. Every step can be skipped. */
export const prickleShot = {
  intro: (): Reaction => [
    { ms: 700, action: 'curl', props: { curl: true }, expression: 'nervous', look: 'left', say: 'Prickle’s visit has a pretend shot. Shots can pinch for a moment. You can ask for help.' },
    { ms: 400, expression: 'worried', look: null },
  ],
  helperArrives: (): Reaction => [
    { ms: 900, expression: 'shy', look: 'left', say: 'A friendly helper comes to help with the pretend shot.' },
    { ms: 300, look: null },
  ],
  shot: (): Reaction => [
    { ms: 600, props: { bunny: 'hug' }, action: 'squeezeHug', expression: 'squeeze', say: 'Prickle holds the bunny tight.' },
    { ms: 700, item: { kind: 'toyShot', at: 'shotSpot' }, effects: [{ kind: 'pinch', at: 'arm' }], sound: 'pop', action: 'tremble', say: 'Boop! A quick little pinch.' },
    { ms: 900, item: null, expression: 'worried' },
    { ms: 1300, expression: 'brave', effects: [{ kind: 'heart', at: 'top', count: 2 }], say: 'All done. That pinch was quick, and the bunny was right there.' },
  ],
  bandage: (): Reaction => [stick('shy', 'downRight'), { ms: 1100, action: 'nod', expression: 'happy', look: null, effects: [{ kind: 'sparkle', at: 'arm', count: 2 }], say: 'A colorful bandage on the spot. Prickle gives a little nod.' }],
  after: (choice: 'hug' | 'dance' | 'rest'): Reaction => {
    switch (choice) {
      case 'hug':
        return [
          { ms: 400, props: { bunny: 'hug', curl: false }, action: 'squeezeHug', expression: 'calm', effects: [{ kind: 'heart', at: 'bunny', count: 3 }], say: 'A big bunny hug.' },
          { ms: 900, expression: 'happy' },
        ];
      case 'dance':
        return [
          { ms: 400, item: { kind: 'musicBox', at: 'side' }, props: { curl: false }, expression: 'excited' },
          { ms: 2000, sound: 'song', action: 'sway', expression: 'giggle', effects: [{ kind: 'note', at: 'top', count: 3 }], say: 'A wiggly happy dance!' },
          { ms: 300, item: null, expression: 'happy' },
        ];
      case 'rest':
        return [
          { ms: 500, props: { curl: false }, expression: 'calm', say: 'A quiet rest, all snuggled up.' },
          { ms: 1700, sound: 'breath', action: 'breathe', effects: [{ kind: 'breathe', at: 'chest' }], expression: 'calm' },
          { ms: 400, expression: 'happy' },
        ];
    }
  },
  finished: (): Reaction => [{ ms: 1200, action: 'smallBounce', expression: 'proud', effects: [{ kind: 'heart', at: 'top', count: 2 }], say: 'Pretend shot practice is all done. Prickle feels a little more ready.' }],
  skip: (): Reaction => [
    { ms: 500, props: { curl: false, bunny: 'hug' }, expression: 'calm', say: 'No pretend shot today. That is okay too.' },
    { ms: 800, action: 'squeezeHug', expression: 'brave' },
  ],
};

export const prickle: PatientDefinition = {
  id: 'prickle',
  name: 'Prickle the Porcupine',
  summary: 'Prickle the porcupine is holding a stuffed bunny and feels a little nervous about the checkup.',
  artist: prickleArt,
  plush: 'bunny',
  initialProps: { curl: false, bunny: 'hug', bunnyBandage: false },
  roomTint: '#f6eadf',
  anchors: {
    chest: [150, 158],
    ear: [164, 90],
    mouth: [120, 138],
    nose: [120, 122],
    belly: [120, 210],
    arm: [160, 190],
    shotSpot: [196, 172],
    bunny: [178, 204],
    bunnyMouth: [180, 192],
    bunnyEar: [184, 170],
    knee: [98, 216],
    head: [120, 66],
    top: [120, 30],
    quills: [196, 118],
    plush: [118, 186],
    side: [32, 206],
    hand: [164, 190],
  },
  toolTarget: { stethoscope: 'chest', thermometer: 'mouth', light: 'ear' },
  toolZones: { light: [[164, 90], [120, 138]] },
  story: {
    intro: "Prickle feels nervous about today's checkup. Let's help Prickle get ready.",
    reason: 'A checkup and a pretend shot',
    prompts: ['Should we check the bunny first?', 'What could help Prickle feel ready?', 'Take turns: one picks a comfort, the other gives it to Prickle.'],
  },
  chart: {
    discoveries: [
      { id: 'heartbeat', icon: 'heartbeat', label: 'Heartbeat' },
      { id: 'bunny', icon: 'bunny', label: 'Bunny checkup' },
      { id: 'plan', icon: 'plan', label: 'Comfort plan' },
    ],
  },
  discoverOn: { 'tool:stethoscope': 'heartbeat', 'act:bunny:*': 'bunny', 'act:plan:*': 'plan' },
  activities: [
    { id: 'bunnyCheck', label: 'Check bunny' },
    { id: 'comfortPlan', label: 'Comfort plan' },
    { id: 'pretendShot', label: 'Pretend shot' },
  ],
  comfortLabels: { hug: 'Hug bunny', break: 'Take a break', music: 'Play music', hand: 'Hold a hand' },
  issueStart: 2,
  eases: (key) => key.startsWith('comfort:') || key.startsWith('act:bunny:') || key.startsWith('act:plan:') || key.startsWith('act:shot:'),
  restingExpression: (visit) => (visit.issue >= 2 ? 'worried' : visit.issue === 1 ? 'brave' : 'calm'),
  intro: [
    { ms: 500, expression: 'shy', props: { curl: false } },
    { ms: 1000, expression: 'nervous', look: 'right', say: 'Prickle clutches a stuffed bunny and notices the doctor tools.' },
    { ms: 900, action: 'curl', props: { curl: true }, expression: 'worried', look: null, say: 'Prickle curls up a little. Feeling nervous is okay.' },
  ],
  idle: (visit) =>
    visit.issue >= 2
      ? [{ ms: 1100, action: 'peek', expression: 'nervous', look: 'right' }, { ms: 200, look: null }]
      : [{ ms: 1000, action: 'squeezeHug', expression: 'calm' }],
  tools: {
    stethoscope: ({ visit }: ReactionContext) =>
      visit.issue >= 2
        ? [
            { ms: 350, toolAt: { tool: 'stethoscope', at: 'chest' }, expression: 'nervous', look: 'down' },
            {
              ms: 1300,
              sound: 'heartbeatQuick',
              effects: [{ kind: 'pulse', at: 'chest', size: 0.7 }, { kind: 'heart', at: 'chest', count: 3, size: 0.6 }],
              say: 'A quick little heartbeat. Prickle feels a bit nervous, and that is okay.',
            },
            { ms: 500, toolAt: null, expression: 'brave', look: null },
          ]
        : [
            { ms: 350, toolAt: { tool: 'stethoscope', at: 'chest' }, expression: 'calm' },
            {
              ms: 1500,
              sound: 'heartbeat',
              effects: [{ kind: 'pulse', at: 'chest', size: 1.2 }, { kind: 'heart', at: 'chest', size: 1.3 }],
              say: 'A slow, steady heartbeat. Prickle feels calmer.',
            },
            { ms: 500, toolAt: null, expression: 'happy' },
          ],
    thermometer: () => [
      { ms: 350, toolAt: { tool: 'thermometer', at: 'mouth' }, expression: 'nervous' },
      { ms: 1800, popup: { kind: 'gauge', reading: 'gentle' }, action: 'peek', expression: 'shy', look: 'right', say: 'Prickle peeks at the thermometer from behind the bunny.' },
      { ms: 700, popup: null, toolAt: null, expression: 'brave', look: null, effects: [{ kind: 'sparkle', at: 'top' }] },
    ],
  },
  look: {
    ear: ({ use }) =>
      pick<Reaction>(
        [
          earReaction('flower', "A tiny flower is blooming in Prickle's ear!", 'tiltL', [{ ms: 300, expression: 'shy' }]),
          earReaction('note', 'A little music note! Prickle has been humming.', 'tiltL', [{ ms: 300, effects: [{ kind: 'note', at: 'ear' }], expression: 'giggle' }]),
        ],
        use,
      ),
    throat: () => throatReaction('flower', 'Say ahh! A pretend little flower garden. Prickle giggles shyly.', [{ ms: 400, expression: 'shy' }]),
  },
  bodyRegions: [
    { part: 'quills', cx: 120, cy: 140, rx: 96, ry: 80 },
    { part: 'feet', cx: 120, cy: 224, rx: 40, ry: 9 },
    { part: 'body', cx: 120, cy: 180, rx: 54, ry: 48 },
    { part: 'head', cx: 120, cy: 108, rx: 52, ry: 46 },
    { part: 'bunny', cx: 118, cy: 182, rx: 24, ry: 34 },
    { part: 'armL', cx: 86, cy: 192, rx: 14, ry: 18 },
    { part: 'armR', cx: 156, cy: 190, rx: 16, ry: 18 },
  ],
  bandageZones: [
    { id: 'arm', at: [158, 190], radius: 22, reaction: () => [stick('shy', 'downRight'), { ms: 900, action: 'nod', expression: 'brave', say: 'Prickle looks at the bandage and gives a little nod.' }, { ms: 200, look: null }] },
    { id: 'nose', at: [120, 122], radius: 16, reaction: () => [stick('surprised'), { ms: 1000, action: 'wiggleNose', expression: 'shy', say: 'Prickle wiggles a bandaged nose and smiles shyly.' }] },
    {
      id: 'bunny',
      at: [116, 176],
      radius: 26,
      reaction: () => [stick('surprised', 'down'), { ms: 1100, action: 'squeezeHug', expression: 'happy', effects: [{ kind: 'heart', at: 'plush', count: 2 }], say: 'The bunny gets a bandage too! Prickle hugs the bunny.' }, { ms: 200, look: null }],
    },
    { id: 'quills', at: [196, 110], radius: 40, reaction: () => [stick('surprised'), { ms: 900, action: 'ruffle', expression: 'giggle', say: 'A bandage on the soft quills! They ruffle with a giggle.' }] },
    { id: 'quillsL', at: [44, 110], radius: 40, reaction: () => [stick('surprised'), { ms: 900, action: 'ruffle', expression: 'giggle', say: 'A bandage on the soft quills! They ruffle with a giggle.' }] },
  ],
  bandageSurprise: () => [stick('shy'), { ms: 900, expression: 'happy', effects: [{ kind: 'sparkle', at: 'top' }], say: 'Prickle looks at the new bandage with a tiny smile.' }],
  pokes: [
    { at: [120, 122], radius: 20, reaction: () => [{ ms: 900, action: 'wiggleNose', expression: 'shy', sound: 'giggle', say: 'Prickle gives a shy little giggle.' }] },
    { at: [118, 186], radius: 30, reaction: () => [{ ms: 1000, action: 'squeezeHug', expression: 'calm', effects: [{ kind: 'heart', at: 'plush' }], say: 'Prickle hugs the bunny.' }] },
    { at: [196, 118], radius: 40, reaction: () => [{ ms: 900, action: 'ruffle', expression: 'surprised', say: "Prickle's soft quills ruffle." }] },
    { at: [44, 118], radius: 40, reaction: () => [{ ms: 900, action: 'ruffle', expression: 'surprised', say: "Prickle's soft quills ruffle." }] },
    { at: [164, 90], radius: 18, reaction: () => [{ ms: 700, action: 'tiltL', expression: 'curious', say: 'Prickle tilts their head.' }] },
  ],
  defaultPoke: () => [{ ms: 900, action: 'shyWave', expression: 'shy', say: 'Prickle gives a tiny wave.' }],
  comfort: comfortReactions,
  feelsBetter: [
    { ms: 600, props: { curl: false }, expression: 'calm' },
    { ms: 1000, action: 'smallBounce', expression: 'happy', effects: [{ kind: 'heart', at: 'top', count: 2 }], say: 'Prickle feels supported.' },
  ],
  farewell: [
    { ms: 400, props: { curl: false, bunny: 'hug' }, expression: 'shy', item: null },
    { ms: 1300, action: 'squeezeHug', expression: 'calm', effects: [{ kind: 'heart', at: 'plush', count: 2 }], say: 'Prickle hugs the bunny...' },
    { ms: 1400, action: 'shyWave', expression: 'happy', say: '...and gives a little wave.' },
  ],
  goodbye: [
    { ms: 300, props: { curl: false, bunny: 'hug' }, expression: 'shy' },
    { ms: 1600, action: 'bunnyWave', expression: 'happy', effects: [{ kind: 'heart', at: 'plush' }], say: 'Prickle waves goodbye with the bunny.' },
  ],
  waitingIdle: [{ action: 'peek' }, { action: 'squeezeHug' }],
};
