import { mochiArt, type MochiHat, type SockSpot } from '../../art/mochi';
import type { CreatureProps } from '../../art/creature';
import { pick } from '../visit';
import type { PatientDefinition, Reaction, ReactionContext, SoundId } from '../types';
import { earReaction, handReaction, musicReaction, stick, throatReaction } from './common';

const rumble = (say?: string): Reaction => [
  { ms: 900, action: 'rumble', sound: 'rumble', effects: [{ kind: 'rumble', at: 'belly' }], expression: 'surprised', say },
  { ms: 500, expression: 'giggle' },
];

/** The pretend sound sources for the tummy sound mystery. They are toys to compare with, not things inside Mochi. */
export const MOCHI_SOUNDS = ['trumpet', 'duck', 'squeaky'] as const;
export type MochiSound = (typeof MOCHI_SOUNDS)[number];

export const MOCHI_SOUND_INFO: Record<MochiSound, { label: string; sound: SoundId }> = {
  trumpet: { label: 'Tiny trumpet', sound: 'toot' },
  duck: { label: 'Rubber duck', sound: 'quack' },
  squeaky: { label: 'Squeaky toy', sound: 'squeak' },
};

export const mochiMystery = {
  /** Mochi's tummy makes the secret sound. */
  tummy: (secret: MochiSound): Reaction => [
    { ms: 500, action: 'rumble', sound: 'rumble', effects: [{ kind: 'rumble', at: 'belly' }], expression: 'surprised' },
    { ms: 900, sound: MOCHI_SOUND_INFO[secret].sound, effects: [{ kind: 'question', at: 'belly' }], expression: 'curious', look: 'down', say: 'Listen! Which toy sounds like Mochi’s tummy?' },
    { ms: 300, look: null },
  ],
  toy: (toy: MochiSound): Reaction => [{ ms: 700, sound: MOCHI_SOUND_INFO[toy].sound, expression: 'curious', look: 'right' }, { ms: 200, look: null }],
  match: (toy: MochiSound): Reaction => [
    { ms: 400, sound: MOCHI_SOUND_INFO[toy].sound, expression: 'excited' },
    { ms: 1600, action: 'dance', sound: 'jingle', effects: [{ kind: 'confetti', at: 'top' }, { kind: 'note', at: 'belly', count: 3 }], expression: 'giggle', say: `That's it! Mochi’s tummy sounds just like a ${MOCHI_SOUND_INFO[toy].label.toLowerCase()}.` },
    { ms: 400, expression: 'happy' },
  ],
  notQuite: (toy: MochiSound): Reaction => [
    { ms: 600, sound: MOCHI_SOUND_INFO[toy].sound, expression: 'silly' },
    { ms: 900, action: 'jiggle', expression: 'giggle', sound: 'giggle', say: 'Hee hee, not that one. Listen again!' },
  ],
};

export type MochiSockTarget = Exclude<SockSpot, 'giant'>;

/** Where the sock can go, found from the tapped point. */
export function sockTargetAt(point: readonly [number, number] | null): MochiSockTarget {
  if (!point) return 'head';
  const [x, y] = point;
  if (y > 206) return 'foot';
  if (x > 136 && y < 92) return 'horn';
  if ((x < 56 || x > 184) && y > 88 && y < 140) return 'ear';
  if (y > 98 && y < 140) return 'eye';
  return 'head';
}

const SOCK_SAY: Record<MochiSockTarget, string> = {
  head: 'Back on top, where Mochi likes it.',
  eye: 'Peekaboo! The sock flops over one eye.',
  horn: 'The sock dangles from a horn like a little flag!',
  ear: 'A sock ear warmer! Now Mochi can only hear one side.',
  foot: 'One cozy sock foot. Mochi does a hop.',
  off: 'Sock off! Mochi’s head feels a little chilly.',
};

const SOCK_ACTION: Record<MochiSockTarget, string> = {
  head: 'bounce',
  eye: 'sockSlip',
  horn: 'wiggle',
  ear: 'tiltR',
  foot: 'hop',
  off: 'tremble',
};

export const mochiSock = {
  place: (target: MochiSockTarget, props: CreatureProps): Reaction => {
    // A hat and a head-sock don't fit together, so the hat comes off.
    const hat = target === 'head' || target === 'eye' ? { hat: 'none' } : {};
    return [
      { ms: 420, props: { sock: target, ...hat }, sound: target === 'off' ? 'pop' : 'boing', expression: 'surprised' },
      { ms: 1100, action: SOCK_ACTION[target], expression: target === 'off' ? 'nervous' : 'giggle', say: SOCK_SAY[target], effects: target === 'off' ? [{ kind: 'snowflake', at: 'top', count: 2 }] : undefined },
      { ms: 300, expression: props.hat && props.hat !== 'none' ? 'proud' : 'happy' },
    ];
  },
  hat: (hat: MochiHat, props: CreatureProps): Reaction => {
    const sockOnHead = props.sock === 'head' || props.sock === 'eye' || props.sock === 'giant' || props.sock === undefined;
    const say: Record<MochiHat, string> = {
      none: 'Hat off!',
      party: 'A party hat! Mochi wiggles with joy.',
      crown: 'A crown! Mochi feels very royal.',
      bow: 'A big bow. So fancy!',
    };
    return [
      ...(sockOnHead && hat !== 'none'
        ? [{ ms: 500, props: { sock: 'off' as const }, sound: 'boing' as const, action: 'jump', expression: 'surprised' as const, say: 'Boing! The hat bumps the sock right off.' }]
        : []),
      { ms: 450, props: { hat }, sound: 'stick', expression: 'excited' },
      { ms: 1100, action: hat === 'crown' ? 'fancy' : 'wiggle', expression: 'proud', effects: [{ kind: 'sparkle', at: 'sock', count: 2 }], say: say[hat] },
    ];
  },
};

function tummyListen({ point, use }: ReactionContext): Reaction {
  // Different parts of the tummy make different funny sounds.
  const zone = point ? (point[1] < 168 ? 'chest' : point[1] > 204 ? 'low' : point[0] < 120 ? 'left' : 'right') : (['left', 'right', 'low', 'chest'] as const)[(use - 1) % 4]!;
  switch (zone) {
    case 'chest':
      return [
        { ms: 350, toolAt: { tool: 'stethoscope', at: 'chest' }, expression: 'curious', look: 'down' },
        { ms: 1200, sound: 'heartbeatMusical', action: 'dance', effects: [{ kind: 'note', at: 'top', count: 4 }], say: "Mochi's heartbeat plays a little tune, and Mochi dances!" },
        { ms: 600, toolAt: null, expression: 'silly', look: null },
      ];
    case 'left':
      return [
        { ms: 350, toolAt: { tool: 'stethoscope', at: 'tummyLeft' }, expression: 'curious', look: 'downLeft' },
        { ms: 1200, sound: 'toot', action: 'jiggle', effects: [{ kind: 'note', at: 'tummyLeft', count: 2 }], expression: 'surprised', say: 'Toot toot! This side of the tummy sounds like a tiny trumpet.' },
        { ms: 600, toolAt: null, expression: 'giggle', look: null },
      ];
    case 'right':
      return [
        { ms: 350, toolAt: { tool: 'stethoscope', at: 'tummyRight' }, expression: 'curious', look: 'downRight' },
        { ms: 1200, sound: 'squeak', action: 'wiggle', effects: [{ kind: 'sparkle', at: 'tummyRight', count: 2 }], expression: 'crossEyed', say: 'Squeak squeak! This side goes squeaky.' },
        { ms: 600, toolAt: null, expression: 'giggle', look: null },
      ];
    case 'low':
      return [
        { ms: 350, toolAt: { tool: 'stethoscope', at: 'tummyLow' }, expression: 'curious', look: 'down' },
        { ms: 1300, sound: 'rumble', action: 'rumble', effects: [{ kind: 'rumble', at: 'belly' }], expression: 'surprised', say: 'Blub-blub-bloop! A big rumbly sound down low.' },
        { ms: 600, sound: 'boing', action: 'jiggle', toolAt: null, expression: 'giggle', look: null },
      ];
  }
}

export const mochi: PatientDefinition = {
  id: 'mochi',
  name: 'Mochi the Monster',
  summary: 'Mochi the monster has a mysterious rumbly tummy and a sock stuck on its head.',
  artist: mochiArt,
  plush: 'bear',
  initialProps: { sock: 'head', hat: 'none', hug: false },
  waitingProps: { sock: 'head' },
  roomTint: '#ece6f4',
  anchors: {
    chest: [120, 160],
    belly: [120, 196],
    tummyLeft: [100, 188],
    tummyRight: [142, 188],
    tummyLow: [120, 212],
    ear: [202, 110],
    mouth: [122, 160],
    nose: [122, 143],
    lip: [122, 151],
    horn: [154, 66],
    sock: [118, 54],
    head: [120, 66],
    top: [120, 22],
    plush: [120, 194],
    side: [218, 206],
    hand: [200, 176],
  },
  toolTarget: { stethoscope: 'belly', thermometer: 'mouth', light: 'ear' },
  toolZones: {
    stethoscope: [[120, 160], [100, 188], [142, 188], [120, 212]],
    light: [[202, 110], [122, 160]],
  },
  story: {
    intro: "Mochi's tummy keeps making funny noises! Can you investigate?",
    reason: 'A mysterious, rumbly tummy',
    prompts: ['What do you think that funny sound is?', 'Take turns: one guesses the sound, the other checks!', 'Where should the sock go next?'],
  },
  chart: {
    discoveries: [
      { id: 'rumble', icon: 'rumble', label: 'Tummy sounds' },
      { id: 'mystery', icon: 'mystery', label: 'Sound mystery' },
      { id: 'sock', icon: 'sock', label: 'Sock rescue' },
    ],
  },
  discoverOn: { 'tool:stethoscope': 'rumble', 'act:sound:match': 'mystery', 'act:sock:*': 'sock' },
  activities: [
    { id: 'soundMystery', label: 'Sound mystery' },
    { id: 'sockRescue', label: 'Sock and hats' },
  ],
  comfortLabels: { hug: 'Hug bear', break: 'Take a break', music: 'Play music', hand: 'Hold a hand' },
  issueStart: 3,
  eases: (key) => key.startsWith('act:sound:') || key.startsWith('comfort:') || key === 'tool:stethoscope',
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
    stethoscope: tummyListen,
    thermometer: () => [
      { ms: 350, toolAt: { tool: 'thermometer', at: 'mouth' }, expression: 'silly' },
      { ms: 600, popup: { kind: 'gauge', reading: 'wiggly' }, action: 'faces', expression: 'crossEyed', say: 'Mochi makes the silliest faces while the gauge wiggles.' },
      { ms: 600, expression: 'excited' },
      { ms: 600, expression: 'surprised' },
      { ms: 600, expression: 'silly', say: 'All cozy!' },
      { ms: 600, popup: null, toolAt: null, expression: 'giggle', sound: 'giggle' },
    ],
  },
  look: {
    ear: ({ use }) =>
      pick<Reaction>(
        [
          earReaction('duck', "A tiny pretend rubber duck in Mochi's ear! Squeak!", 'tiltR', [{ ms: 300, action: 'jiggle', expression: 'giggle', sound: 'squeak' }]),
          earReaction('tinySock', 'A teeny tiny sock! Mochi really loves socks.', 'tiltR', [{ ms: 300, expression: 'silly' }]),
        ],
        use,
      ),
    throat: () => throatReaction('disco', 'Say ahh! A pretend sparkly disco ball. No wonder Mochi wants to dance!', [{ ms: 900, action: 'dance', expression: 'giggle', effects: [{ kind: 'note', at: 'top', count: 2 }] }]),
  },
  bodyRegions: [
    { part: 'armL', cx: 40, cy: 170, rx: 14, ry: 21 },
    { part: 'armR', cx: 200, cy: 170, rx: 14, ry: 21 },
    { part: 'feet', cx: 120, cy: 225, rx: 46, ry: 9 },
    { part: 'head', cx: 36, cy: 112, rx: 16, ry: 22 },
    { part: 'head', cx: 204, cy: 112, rx: 16, ry: 22 },
    { part: 'head', cx: 90, cy: 66, rx: 13, ry: 22 },
    { part: 'head', cx: 150, cy: 66, rx: 13, ry: 22 },
    { part: 'body', cx: 120, cy: 150, rx: 84, ry: 78 },
    { part: 'belly', cx: 120, cy: 192, rx: 46, ry: 30 },
    { part: 'mouth', cx: 122, cy: 152, rx: 26, ry: 14 },
  ],
  bandageZones: [
    {
      id: 'lip',
      at: [122, 151],
      radius: 16,
      reaction: () => [stick('surprised', 'down'), { ms: 1300, action: 'fancy', expression: 'proud', look: null, effects: [{ kind: 'sparkle', at: 'lip', count: 2 }], say: 'Mochi wears the bandage like a fancy mustache!' }, { ms: 500, expression: 'silly' }],
    },
    { id: 'horn', at: [152, 66], radius: 22, reaction: () => [{ ms: 300, sound: 'stick' }, { ms: 700, action: 'bonk', sound: 'bonk', expression: 'crossEyed', say: 'Bonk! A bandage on the horn.' }, { ms: 500, expression: 'giggle' }] },
    { id: 'hornL', at: [90, 66], radius: 22, reaction: () => [{ ms: 300, sound: 'stick' }, { ms: 700, action: 'bonk', sound: 'bonk', expression: 'crossEyed', say: 'Bonk! A bandage on the horn.' }, { ms: 500, expression: 'giggle' }] },
    { id: 'belly', at: [120, 196], radius: 30, reaction: () => [stick('curious', 'down'), ...rumble('The rumbly tummy bounces the bandage up and down!'), { ms: 100, look: null }] },
    { id: 'ear', at: [36, 112], radius: 22, reaction: () => [stick('curious', 'left'), { ms: 1000, action: 'tiltL', expression: 'giggle', say: 'A bandage on an ear! Mochi wiggles it.' }, { ms: 200, look: null }] },
    { id: 'foot', at: [120, 224], radius: 30, reaction: () => [stick('surprised', 'down'), { ms: 1000, action: 'hop', expression: 'excited', say: 'Mochi hops on the bandaged foot. Boing boing!' }, { ms: 200, look: null }] },
  ],
  bandageSurprise: ({ visit }) =>
    visit.bandages.length >= 4
      ? [stick('silly'), { ms: 1200, action: 'dance', expression: 'giggle', sound: 'giggle', say: 'Mochi is covered in bandages and loves every one!' }]
      : [stick('happy'), { ms: 900, action: 'jiggle', expression: 'proud', say: 'Mochi jiggles happily with the new bandage.' }],
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
          : props.sock === 'head'
            ? [
                { ms: 700, action: 'sockSlip', props: { sock: 'eye' }, sound: 'boing', expression: 'silly', say: 'Whoops! The sock slips down again.' },
                { ms: 300, expression: 'giggle' },
              ]
            : [{ ms: 800, action: 'wiggle', expression: 'giggle', sound: 'giggle', say: 'Mochi wiggles its head.' }],
    },
    {
      at: [148, 118],
      radius: 22,
      reaction: ({ props }) =>
        props.sock === 'eye'
          ? [{ ms: 500, action: 'sockSlip', props: { sock: 'head' }, sound: 'pop', expression: 'excited', say: 'Peekaboo! Mochi can see again.' }]
          : [{ ms: 600, expression: 'squeeze' }, { ms: 300, expression: 'giggle' }],
    },
    { at: [120, 196], radius: 36, reaction: () => rumble('Tummy rumble! Mochi giggles.') },
    { at: [122, 143], radius: 14, reaction: () => [{ ms: 800, action: 'wiggle', expression: 'silly', sound: 'squeak', say: 'Boop! Mochi sticks out its tongue.' }] },
  ],
  defaultPoke: () => [{ ms: 800, action: 'jiggle', expression: 'giggle', say: 'Mochi jiggles like jelly.' }],
  comfort: {
    hug: () => [
      { ms: 400, props: { hug: true }, expression: 'excited' },
      { ms: 1300, action: 'squeezeHug', expression: 'giggle', effects: [{ kind: 'heart', at: 'plush', count: 2 }], say: 'Mochi hugs the teddy bear... upside down!' },
      { ms: 300, props: { hug: false }, expression: 'happy' },
    ],
    break: () => [
      { ms: 900, action: 'flop', expression: 'sleepy', toolAt: null, item: null, say: 'Mochi takes a break and flops down...' },
      { ms: 1500, sound: 'breath', effects: [{ kind: 'zzz', at: 'top' }, { kind: 'breathe', at: 'chest' }], expression: 'sleepy', say: '...and lets out a tiny snore.' },
      { ms: 700, action: 'bounce', expression: 'giggle' },
    ],
    music: () => musicReaction("A music box plays. Mochi's tummy rumbles along to the beat.", 'sway', [{ ms: 900, action: 'rumble', effects: [{ kind: 'note', at: 'belly' }], expression: 'giggle' }]),
    hand: () => handReaction('A friendly hand holds Mochi’s paw. Mochi gives it a gentle squeeze.'),
  },
  feelsBetter: [
    { ms: 700, action: 'rumble', effects: [{ kind: 'note', at: 'belly' }], expression: 'surprised', say: 'The rumble turns into a happy little purr.' },
    { ms: 1000, action: 'jump', expression: 'excited', sound: 'jingle', effects: [{ kind: 'sparkle', at: 'top', count: 3 }] },
  ],
  farewell: [
    { ms: 400, props: { sock: 'off', hat: 'none' }, expression: 'happy', item: null },
    { ms: 1600, action: 'dance', sound: 'song', expression: 'giggle', effects: [{ kind: 'note', at: 'top', count: 3 }], say: 'Mochi does a happy dance...' },
    { ms: 900, action: 'jumpBig', props: { sock: 'head' }, sound: 'boing', expression: 'surprised', say: '...and the sock lands right back on top!' },
    { ms: 1200, action: 'wave', expression: 'giggle' },
  ],
  goodbye: [{ ms: 2200, action: 'bigWave', expression: 'excited', say: 'Mochi gives an enormous, wiggly wave goodbye!' }],
  waitingIdle: [{ action: 'rumble', effects: [{ kind: 'rumble', at: 'belly' }] }, { action: 'jiggle' }],
};
