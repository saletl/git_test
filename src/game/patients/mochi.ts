import { mochiArt } from '../../art/mochi';
import { pick } from '../visit';
import type { PatientDefinition, Reaction } from '../types';

const rumble = (say?: string): Reaction => [
  { ms: 900, action: 'rumble', sound: 'rumble', effects: [{ kind: 'rumble', at: 'belly' }], expression: 'surprised', say },
  { ms: 500, expression: 'giggle' },
];

export const mochi: PatientDefinition = {
  id: 'mochi',
  name: 'Mochi the Monster',
  summary: "Mochi the monster has a mysterious rumbly tummy and a sock stuck on its head.",
  artist: mochiArt,
  plush: 'bear',
  initialProps: { sock: 'head', hug: false },
  waitingProps: { sock: 'head' },
  roomTint: '#ece6f4',
  anchors: {
    chest: [120, 176],
    belly: [120, 196],
    ear: [202, 110],
    mouth: [122, 160],
    nose: [122, 143],
    lip: [122, 151],
    horn: [154, 66],
    sock: [118, 54],
    head: [120, 66],
    top: [120, 22],
    plush: [120, 194],
    demo: [216, 212],
  },
  toolTarget: { stethoscope: 'belly', thermometer: 'mouth', otoscope: 'ear', bandage: 'lip' },
  issueStart: 3,
  restingExpression: (visit) => (visit.issue > 0 ? 'curious' : 'happy'),
  intro: [
    { ms: 400, expression: 'happy' },
    { ms: 1000, action: 'rumble', sound: 'rumble', effects: [{ kind: 'rumble', at: 'belly' }], say: "Mochi's tummy rumbles!" },
    { ms: 600, expression: 'surprised', say: "Mochi's eyes go wide." },
    { ms: 800, action: 'sockSlip', props: { sock: 'eye' }, sound: 'boing', expression: 'surprised', say: 'Oops! The sock slips over one eye.' },
    { ms: 500, expression: 'silly' },
  ],
  idle: (visit, props) => {
    if (visit.issue > 0) return [{ ms: 900, action: 'rumble', effects: [{ kind: 'rumble', at: 'belly' }], expression: 'surprised' }, { ms: 300, expression: 'giggle' }];
    if (props.sock === 'head') return [{ ms: 800, action: 'sockSlip', props: { sock: 'eye' }, expression: 'silly' }];
    return [{ ms: 900, action: 'jiggle', expression: 'happy' }];
  },
  tools: {
    stethoscope: ({ use }) =>
      pick<Reaction>(
        [
          [
            { ms: 350, toolAt: { tool: 'stethoscope', at: 'belly' }, expression: 'curious', look: 'down' },
            {
              ms: 1300,
              sound: 'rumble',
              action: 'rumble',
              effects: [{ kind: 'rumble', at: 'belly' }, { kind: 'note', at: 'belly', count: 2 }],
              expression: 'surprised',
              look: null,
              say: 'Blub-blub-bloop! A strange, musical tummy rumble.',
            },
            { ms: 800, sound: 'boing', action: 'jiggle', expression: 'giggle', effects: [{ kind: 'note', at: 'top' }], toolAt: null },
          ],
          [
            { ms: 350, toolAt: { tool: 'stethoscope', at: 'belly' }, expression: 'excited' },
            { ms: 1200, sound: 'heartbeatMusical', action: 'dance', effects: [{ kind: 'note', at: 'top', count: 4 }], say: "Mochi's tummy plays a little tune, and Mochi dances!" },
            { ms: 600, toolAt: null, expression: 'silly' },
          ],
        ],
        use,
      ),
    thermometer: () => [
      { ms: 350, toolAt: { tool: 'thermometer', at: 'mouth' }, expression: 'silly' },
      { ms: 600, popup: { kind: 'gauge', reading: 'wiggly' }, action: 'faces', expression: 'crossEyed', say: 'Mochi makes the silliest faces while the gauge wiggles.' },
      { ms: 600, expression: 'excited' },
      { ms: 600, expression: 'surprised' },
      { ms: 600, expression: 'silly', say: 'All cozy!' },
      { ms: 600, popup: null, toolAt: null, expression: 'giggle', sound: 'giggle' },
    ],
    otoscope: ({ use }) =>
      pick<Reaction>(
        [
          [
            { ms: 400, toolAt: { tool: 'otoscope', at: 'ear' }, action: 'tiltR', expression: 'curious' },
            { ms: 1700, popup: { kind: 'lens', discovery: 'duck' }, sound: 'squeak', say: "A tiny rubber duck is hiding in Mochi's ear! Squeak!" },
            { ms: 700, popup: null, toolAt: null, action: 'jiggle', expression: 'giggle' },
          ],
          [
            { ms: 400, toolAt: { tool: 'otoscope', at: 'ear' }, action: 'tiltR', expression: 'excited' },
            { ms: 1700, popup: { kind: 'lens', discovery: 'tinySock' }, sound: 'boing', say: 'A teeny tiny sock! Mochi really loves socks.' },
            { ms: 700, popup: null, toolAt: null, expression: 'silly' },
          ],
        ],
        use,
      ),
    bandage: () => [],
  },
  bandageSpots: [
    {
      id: 'lip',
      at: [122, 151],
      part: 'mouth',
      rotate: 0,
      scale: 0.75,
      reaction: () => [
        { ms: 500, expression: 'surprised', look: 'down', sound: 'stick' },
        { ms: 1300, action: 'fancy', expression: 'proud', look: null, effects: [{ kind: 'sparkle', at: 'lip', count: 2 }], say: 'Mochi wears the bandage like a fancy mustache!' },
        { ms: 500, expression: 'silly' },
      ],
    },
    {
      id: 'horn',
      at: [154, 68],
      part: 'head',
      rotate: 55,
      scale: 0.5,
      reaction: () => [
        { ms: 300, sound: 'stick' },
        { ms: 700, action: 'bonk', sound: 'bonk', expression: 'crossEyed', say: 'Bonk! A bandage on the horn.' },
        { ms: 500, expression: 'giggle' },
      ],
    },
    {
      id: 'belly',
      at: [120, 198],
      part: 'belly',
      rotate: -4,
      scale: 0.8,
      reaction: () => [{ ms: 300, sound: 'stick', expression: 'curious', look: 'down' }, ...rumble('The rumbly tummy bounces the bandage up and down!'), { ms: 100, look: null }],
    },
    {
      id: 'sock',
      at: [116, 52],
      part: 'sock',
      rotate: 10,
      scale: 0.6,
      reaction: () => [
        { ms: 400, sound: 'stick', expression: 'curious', look: 'up' },
        { ms: 900, action: 'jump', expression: 'excited', look: null, say: 'A bandage on the sock! Mochi thinks that is hilarious.' },
        { ms: 400, expression: 'giggle', sound: 'giggle' },
      ],
    },
  ],
  pokes: [
    {
      at: [130, 66],
      radius: 40,
      reaction: ({ props }) =>
        props.sock === 'eye'
          ? [
              { ms: 500, action: 'sockSlip', props: { sock: 'head' }, sound: 'pop', expression: 'surprised', say: 'You push the sock back up. Mochi can see again!' },
              { ms: 700, expression: 'excited' },
            ]
          : [
              { ms: 700, action: 'sockSlip', props: { sock: 'eye' }, sound: 'boing', expression: 'silly', say: 'Whoops! The sock slips down again.' },
              { ms: 300, expression: 'giggle' },
            ],
    },
    { at: [148, 118], radius: 22, reaction: ({ props }) => (props.sock === 'eye' ? [{ ms: 500, action: 'sockSlip', props: { sock: 'head' }, sound: 'pop', expression: 'excited', say: 'Peekaboo! Mochi can see again.' }] : [{ ms: 600, expression: 'squeeze' }, { ms: 300, expression: 'giggle' }]) },
    { at: [120, 196], radius: 36, reaction: () => rumble('Tummy rumble! Mochi giggles.') },
    { at: [122, 143], radius: 14, reaction: () => [{ ms: 800, action: 'wiggle', expression: 'silly', sound: 'squeak', say: 'Boop! Mochi sticks out its tongue.' }] },
  ],
  defaultPoke: () => [{ ms: 800, action: 'jiggle', expression: 'giggle', say: 'Mochi jiggles like jelly.' }],
  comfort: {
    cuddle: () => [
      { ms: 400, props: { hug: true }, expression: 'excited' },
      { ms: 1300, action: 'squeezeHug', expression: 'giggle', effects: [{ kind: 'heart', at: 'plush', count: 2 }], say: 'Mochi hugs the teddy bear... upside down!' },
      { ms: 300, props: { hug: false }, expression: 'happy' },
    ],
    song: () => [
      { ms: 1400, sound: 'song', action: 'sway', expression: 'calm', effects: [{ kind: 'note', at: 'top', count: 2 }], say: "A gentle song. Mochi's tummy rumbles along to the beat." },
      { ms: 1400, action: 'rumble', effects: [{ kind: 'rumble', at: 'belly' }, { kind: 'note', at: 'belly' }], expression: 'giggle' },
    ],
    pause: () => [
      { ms: 900, action: 'flop', expression: 'sleepy', toolAt: null, say: 'Mochi takes a pause...' },
      { ms: 1300, sound: 'breath', effects: [{ kind: 'zzz', at: 'top' }], expression: 'sleepy', say: '...and lets out a tiny snore.' },
      { ms: 700, action: 'bounce', expression: 'giggle' },
    ],
    showTool: ({ selectedTool }) => [
      { ms: 350, demo: { tool: selectedTool ?? 'stethoscope', at: 'demo' }, expression: 'curious', look: 'downRight' },
      { ms: 1300, effects: [{ kind: 'sparkle', at: 'demo', count: 2 }], expression: 'excited', say: 'The doctor checks the teddy bear first. Mochi copies, very seriously.' },
      { ms: 600, demo: null, look: null, expression: 'silly' },
    ],
  },
  feelsBetter: [
    { ms: 700, action: 'rumble', effects: [{ kind: 'note', at: 'belly' }], expression: 'surprised', say: 'The rumble turns into a happy little purr.' },
    { ms: 1000, action: 'jump', expression: 'excited', sound: 'jingle', effects: [{ kind: 'sparkle', at: 'top', count: 3 }] },
  ],
  farewell: [
    { ms: 500, props: { sock: 'head' }, expression: 'happy' },
    { ms: 1000, action: 'jumpBig', sound: 'boing', expression: 'excited', say: 'Mochi jumps for joy...' },
    { ms: 900, action: 'sockSlip', props: { sock: 'eye' }, expression: 'surprised', say: '...and the sock gets stuck again!' },
    { ms: 1200, action: 'wave', expression: 'giggle' },
  ],
  goodbye: [{ ms: 2200, action: 'bigWave', expression: 'excited', say: 'Mochi gives an enormous, wiggly wave goodbye!' }],
  waitingIdle: [{ action: 'rumble', effects: [{ kind: 'rumble', at: 'belly' }] }, { action: 'jiggle' }],
};
