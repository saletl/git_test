import { prickleArt } from '../../art/prickle';
import { comfortCount, pick } from '../visit';
import type { PatientDefinition, Reaction, ReactionContext } from '../types';

/**
 * Prickle is nervous about a checkup and a pretend shot.
 * Comfort choices help Prickle feel supported, but worry is never treated as a problem to fix,
 * and Prickle can finish the visit without the pretend shot.
 */
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
    arm: [154, 198],
    bunny: [118, 186],
    bunnyEar: [110, 150],
    knee: [98, 216],
    head: [120, 66],
    top: [120, 30],
    quills: [196, 118],
    demo: [118, 186],
  },
  toolTarget: { stethoscope: 'chest', thermometer: 'mouth', otoscope: 'ear', bandage: 'arm' },
  issueStart: 2,
  restingExpression: (visit) => {
    const comfort = comfortCount(visit);
    if (comfort === 0) return 'worried';
    if (comfort === 1 && !visit.feelsBetter) return 'brave';
    return 'calm';
  },
  intro: [
    { ms: 500, expression: 'shy', props: { curl: false } },
    { ms: 1000, expression: 'nervous', look: 'right', say: 'Prickle clutches a stuffed bunny and notices the doctor tools.' },
    { ms: 900, action: 'curl', props: { curl: true }, expression: 'worried', look: null, say: 'Prickle curls up a little.' },
  ],
  idle: (visit) =>
    comfortCount(visit) === 0
      ? [{ ms: 1100, action: 'peek', expression: 'nervous', look: 'right' }, { ms: 200, look: null }]
      : [{ ms: 1000, action: 'squeezeHug', expression: 'calm' }],
  tools: {
    stethoscope: ({ visit }: ReactionContext) =>
      comfortCount(visit) === 0
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
    otoscope: ({ use }) =>
      pick<Reaction>(
        [
          [
            { ms: 400, toolAt: { tool: 'otoscope', at: 'ear' }, action: 'tiltL', expression: 'nervous' },
            { ms: 1700, popup: { kind: 'lens', discovery: 'flower' }, sound: 'sparkle', say: "A tiny flower is blooming in Prickle's ear!" },
            { ms: 800, popup: null, toolAt: null, expression: 'shy', effects: [{ kind: 'sparkle', at: 'ear' }] },
          ],
          [
            { ms: 400, toolAt: { tool: 'otoscope', at: 'ear' }, action: 'tiltL', expression: 'curious' },
            { ms: 1700, popup: { kind: 'lens', discovery: 'note' }, sound: 'sparkle', say: 'A little music note! Prickle has been humming.' },
            { ms: 800, popup: null, toolAt: null, expression: 'giggle', effects: [{ kind: 'note', at: 'ear' }] },
          ],
        ],
        use,
      ),
    bandage: () => [],
  },
  bandageSpots: [
    {
      id: 'arm',
      at: [154, 198],
      part: 'armR',
      rotate: 58,
      scale: 0.55,
      reaction: () => [
        { ms: 500, expression: 'shy', look: 'downRight', sound: 'stick' },
        { ms: 900, action: 'nod', expression: 'brave', say: 'Prickle looks at the bandage and gives a little nod.' },
        { ms: 200, look: null },
      ],
    },
    {
      id: 'nose',
      at: [120, 122],
      part: 'head',
      rotate: 0,
      scale: 0.5,
      reaction: () => [
        { ms: 400, expression: 'surprised', sound: 'stick' },
        { ms: 1000, action: 'wiggleNose', expression: 'shy', say: 'Prickle wiggles a bandaged nose and smiles shyly.' },
      ],
    },
    {
      id: 'bunny',
      at: [108, 156],
      part: 'bunny',
      rotate: 70,
      scale: 0.45,
      reaction: () => [
        { ms: 400, expression: 'surprised', look: 'down', sound: 'stick' },
        { ms: 1100, action: 'squeezeHug', expression: 'happy', effects: [{ kind: 'heart', at: 'bunny', count: 2 }], say: 'The bunny gets a bandage too! Prickle hugs the bunny.' },
        { ms: 200, look: null },
      ],
    },
    {
      id: 'knee',
      at: [98, 216],
      part: 'feet',
      rotate: -10,
      scale: 0.5,
      reaction: () => [
        { ms: 500, expression: 'curious', look: 'downLeft', sound: 'stick' },
        { ms: 900, expression: 'shy', say: 'Prickle looks down at the bandage with a tiny smile.' },
        { ms: 200, look: null },
      ],
    },
  ],
  pokes: [
    { at: [120, 122], radius: 20, reaction: () => [{ ms: 900, action: 'wiggleNose', expression: 'shy', sound: 'giggle', say: 'Prickle gives a shy little giggle.' }] },
    { at: [118, 186], radius: 30, reaction: () => [{ ms: 1000, action: 'squeezeHug', expression: 'calm', effects: [{ kind: 'heart', at: 'bunny' }], say: 'Prickle hugs the bunny.' }] },
    { at: [196, 118], radius: 40, reaction: () => [{ ms: 900, action: 'ruffle', expression: 'surprised', say: "Prickle's soft quills ruffle." }] },
    { at: [44, 118], radius: 40, reaction: () => [{ ms: 900, action: 'ruffle', expression: 'surprised', say: "Prickle's soft quills ruffle." }] },
    { at: [164, 90], radius: 18, reaction: () => [{ ms: 700, action: 'tiltL', expression: 'curious', say: 'Prickle tilts their head.' }] },
  ],
  defaultPoke: () => [{ ms: 900, action: 'shyWave', expression: 'shy', say: 'Prickle gives a tiny wave.' }],
  comfort: {
    cuddle: () => [
      { ms: 400, props: { bunny: 'hug', curl: false }, action: 'squeezeHug', expression: 'calm', effects: [{ kind: 'heart', at: 'bunny', count: 2 }], say: 'Prickle hugs the bunny close. The quills soften.' },
      { ms: 1000, expression: 'brave' },
    ],
    song: () => [
      { ms: 2800, sound: 'song', action: 'sway', props: { curl: false }, expression: 'calm', effects: [{ kind: 'note', at: 'top', count: 3 }], say: 'A gentle song. Prickle sways and relaxes.' },
      { ms: 400, expression: 'brave' },
    ],
    pause: () => [
      { ms: 500, toolAt: null, expression: 'calm', say: 'Taking a pause. The tools rest, and Prickle breathes slowly.' },
      { ms: 1900, sound: 'breath', action: 'breathe', expression: 'calm' },
      { ms: 600, expression: 'brave', look: 'up' },
      { ms: 200, look: null },
    ],
    showTool: ({ selectedTool, props }) => {
      const tool = selectedTool ?? 'stethoscope';
      if (tool === 'pretendShot') {
        return [
          { ms: 400, toolAt: { tool, at: 'bunnyEar' }, expression: 'nervous', look: 'down', say: 'First, the bunny gets a pretend shot.' },
          { ms: 700, effects: [{ kind: 'star', at: 'bunnyEar' }], sound: 'pop' },
          { ms: 900, toolAt: null, props: { bunnyBandage: true }, expression: 'surprised', sound: 'stick', say: 'Boop! The bunny gets a tiny bandage.' },
          { ms: 900, expression: 'brave', look: null, say: 'Prickle watched it happen. Prickle feels a little more ready.' },
        ];
      }
      return [
        { ms: 400, toolAt: { tool, at: 'bunny' }, expression: 'curious', look: 'down', say: 'The doctor shows the tool on the bunny first.' },
        { ms: 1200, effects: [{ kind: 'sparkle', at: 'bunny', count: 2 }], expression: props.curl ? 'shy' : 'calm' },
        { ms: 500, toolAt: null, look: null, props: { curl: false }, expression: 'brave', say: 'The bunny is fine! Prickle nods.' },
      ];
    },
  },
  special: {
    tool: 'pretendShot',
    bandageAfter: { spot: 'arm', style: 'hearts' },
    onSelect: () => [
      {
        ms: 500,
        action: 'curl',
        props: { curl: true },
        expression: 'nervous',
        look: 'left',
        say: 'Prickle sees the pretend shot and feels worried. That is okay. A comfort choice can help, or tap Prickle when ready.',
      },
      { ms: 400, expression: 'worried', look: null },
    ],
    apply: ({ visit }) => {
      const supported = comfortCount(visit) > 0;
      return [
        { ms: 400, toolAt: { tool: 'pretendShot', at: 'arm' }, action: 'squeezeHug', props: { bunny: 'hug' }, expression: 'squeeze', say: 'Prickle squeezes the bunny and closes their eyes.' },
        { ms: 700, effects: [{ kind: 'pinch', at: 'arm' }], sound: 'pop', say: 'Boop! A quick little pinch.' },
        { ms: 800, toolAt: null, expression: 'surprised' },
        supported
          ? { ms: 1300, props: { curl: false }, expression: 'proud', effects: [{ kind: 'heart', at: 'top', count: 2 }], say: 'Prickle did it, with the bunny close by. A little proud, and still a little wobbly.' }
          : { ms: 1300, expression: 'brave', effects: [{ kind: 'star', at: 'arm' }], say: 'All done. Prickle still feels a little wobbly, and that is okay.' },
      ];
    },
  },
  feelsBetter: [
    { ms: 600, props: { curl: false }, expression: 'calm' },
    { ms: 1000, action: 'smallBounce', expression: 'happy', effects: [{ kind: 'heart', at: 'top', count: 2 }], say: 'Prickle feels supported.' },
  ],
  farewell: [
    { ms: 400, props: { curl: false }, expression: 'shy' },
    { ms: 1200, action: 'shyWave', expression: 'shy', say: 'Prickle gives a tiny, shy wave...' },
    { ms: 1400, action: 'bigWave', expression: 'excited', effects: [{ kind: 'heart', at: 'top' }], say: '...and then a big happy wave!' },
  ],
  goodbye: [
    { ms: 300, props: { curl: false, bunny: 'hug' }, expression: 'shy' },
    { ms: 1600, action: 'bunnyWave', expression: 'happy', effects: [{ kind: 'heart', at: 'bunny' }], say: 'Prickle waves goodbye with the bunny.' },
  ],
  waitingIdle: [{ action: 'peek' }, { action: 'squeezeHug' }],
};
