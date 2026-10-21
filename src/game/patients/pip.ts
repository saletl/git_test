import { pipArt } from '../../art/pip';
import { pick } from '../visit';
import type { PatientDefinition, Reaction, ReactionContext } from '../types';

const hiccup = (count = 1): Reaction => [
  { ms: 520, action: 'hiccup', expression: 'surprised', effects: [{ kind: 'bubble', at: 'mouth', count }], sound: 'bubble' },
];

export const pip: PatientDefinition = {
  id: 'pip',
  name: 'Pip the Dragon',
  summary: 'Pip the dragon has the hiccups and keeps blowing bubbles.',
  artist: pipArt,
  plush: 'star',
  initialProps: { hug: false },
  roomTint: '#e4f1ea',
  anchors: {
    chest: [120, 160],
    ear: [178, 92],
    mouth: [120, 124],
    nose: [120, 104],
    belly: [120, 190],
    head: [120, 44],
    top: [120, 18],
    tail: [212, 146],
    wing: [50, 122],
    feet: [120, 222],
    plush: [120, 176],
    demo: [214, 212],
  },
  toolTarget: { stethoscope: 'chest', thermometer: 'mouth', otoscope: 'ear', bandage: 'nose' },
  issueStart: 3,
  restingExpression: (visit) => (visit.issue > 0 && !visit.comforted ? 'brave' : 'happy'),
  intro: [
    { ms: 450, expression: 'happy' },
    { ms: 650, action: 'hiccup', expression: 'surprised', effects: [{ kind: 'bubble', at: 'mouth' }], sound: 'bubble', say: 'Pip hiccups, and a bubble floats out!' },
    { ms: 750, expression: 'surprised', look: 'up', say: 'Pip looks very surprised.' },
    { ms: 650, action: 'hiccup', expression: 'crossEyed', effects: [{ kind: 'bubble', at: 'mouth', count: 2 }], sound: 'bubble', say: 'Another bubble escapes!' },
    { ms: 700, action: 'dramatic', expression: 'worried', look: null },
  ],
  idle: (visit) => (visit.issue > 0 ? hiccup(visit.issue) : [{ ms: 900, action: 'wag', expression: 'happy' }]),
  tools: {
    stethoscope: ({ use }: ReactionContext) =>
      pick<Reaction>(
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
            { ms: 350, toolAt: { tool: 'stethoscope', at: 'chest' }, expression: 'curious', look: 'down' },
            { ms: 900, sound: 'heartbeatMusical', effects: [{ kind: 'pulse', at: 'chest' }, { kind: 'note', at: 'chest', count: 2 }], expression: 'excited', look: null },
            {
              ms: 650,
              action: 'hiccup',
              sound: 'bubble',
              effects: [{ kind: 'bubble', at: 'mouth', count: 3 }],
              expression: 'surprised',
              say: 'The heartbeat makes Pip hiccup a bubbly tune!',
            },
            { ms: 600, action: 'bop', expression: 'giggle', toolAt: null },
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
      ),
    thermometer: ({ use }) =>
      pick<Reaction>(
        [
          [
            { ms: 350, toolAt: { tool: 'thermometer', at: 'mouth' }, expression: 'nervous', look: 'down' },
            { ms: 1700, popup: { kind: 'gauge', reading: 'toasty' }, action: 'tremble', expression: 'worried', look: 'right', say: 'Pip watches the gauge nervously.' },
            { ms: 750, effects: [{ kind: 'flame', at: 'mouth' }], sound: 'pop', expression: 'surprised', look: null, say: 'A tiny warm puff! Dragons are nice and toasty.' },
            { ms: 700, popup: null, toolAt: null, action: 'bounce', expression: 'giggle' },
          ],
          [
            { ms: 350, toolAt: { tool: 'thermometer', at: 'mouth' }, expression: 'squeeze' },
            { ms: 1600, popup: { kind: 'gauge', reading: 'cozy' }, action: 'peekOne', expression: 'nervous', look: 'right', say: 'Pip peeks at the gauge... it says cozy!' },
            { ms: 800, popup: null, toolAt: null, action: 'jump', expression: 'proud', look: null, effects: [{ kind: 'sparkle', at: 'top', count: 3 }], sound: 'sparkle' },
          ],
        ],
        use,
      ),
    otoscope: ({ use }) =>
      pick<Reaction>(
        [
          [
            { ms: 350, toolAt: { tool: 'otoscope', at: 'ear' }, action: 'tiltR', expression: 'curious' },
            { ms: 1700, popup: { kind: 'lens', discovery: 'sparkle' }, sound: 'sparkle', say: "Inside Pip's ear: a tiny glowing sparkle!" },
            { ms: 700, popup: null, toolAt: null, expression: 'excited', effects: [{ kind: 'sparkle', at: 'ear', count: 3 }] },
          ],
          [
            { ms: 350, toolAt: { tool: 'otoscope', at: 'ear' }, action: 'tiltR', expression: 'giggle' },
            { ms: 1700, popup: { kind: 'lens', discovery: 'heartSparkle' }, sound: 'sparkle', say: 'This time the sparkle is shaped like a heart!' },
            { ms: 700, popup: null, toolAt: null, expression: 'proud', effects: [{ kind: 'heart', at: 'ear', count: 2 }] },
          ],
        ],
        use,
      ),
    bandage: () => [],
  },
  bandageSpots: [
    {
      id: 'nose',
      at: [120, 102],
      part: 'head',
      rotate: -8,
      scale: 0.7,
      reaction: () => [
        { ms: 450, expression: 'crossEyed', sound: 'stick', say: 'Pip goes cross-eyed looking at the bandage on its nose!' },
        { ms: 1100, action: 'wobble', expression: 'crossEyed' },
        { ms: 600, expression: 'giggle', sound: 'giggle' },
      ],
    },
    {
      id: 'wing',
      at: [52, 124],
      part: 'wingL',
      rotate: -32,
      scale: 0.6,
      reaction: () => [
        { ms: 400, expression: 'curious', look: 'left', sound: 'stick' },
        { ms: 1100, action: 'flap', expression: 'proud', look: null, effects: [{ kind: 'sparkle', at: 'wing', count: 2 }], say: 'Pip flaps its bandaged wing proudly.' },
      ],
    },
    {
      id: 'tail',
      at: [214, 156],
      part: 'tail',
      rotate: 75,
      scale: 0.65,
      reaction: () => [
        { ms: 450, expression: 'surprised', look: 'right', sound: 'stick' },
        { ms: 1100, action: 'wag', expression: 'giggle', effects: [{ kind: 'heart', at: 'tail' }], say: 'Pip wags the bandaged tail. Swish swish!' },
      ],
    },
    {
      id: 'belly',
      at: [120, 194],
      part: 'body',
      rotate: 4,
      scale: 0.75,
      reaction: () => [
        { ms: 300, expression: 'surprised', sound: 'stick' },
        { ms: 900, action: 'wiggle', expression: 'giggle', sound: 'giggle', effects: [{ kind: 'bubble', at: 'mouth', count: 2 }], say: 'Hee hee! Pip has a ticklish tummy.' },
      ],
    },
  ],
  pokes: [
    { at: [120, 106], radius: 26, reaction: () => [...hiccup(1), { ms: 500, expression: 'giggle', say: 'Boop! A bubble pops out of Pip.' }] },
    { at: [212, 146], radius: 30, reaction: () => [{ ms: 900, action: 'wag', expression: 'giggle', effects: [{ kind: 'heart', at: 'tail' }], say: 'Pip wags its tail.' }] },
    { at: [120, 190], radius: 32, reaction: () => [{ ms: 800, action: 'wiggle', expression: 'giggle', sound: 'giggle', say: 'Pip giggles. Ticklish!' }] },
    { at: [52, 124], radius: 30, reaction: () => [{ ms: 900, action: 'flap', expression: 'excited', say: 'Pip flaps its little wings.' }] },
    { at: [120, 44], radius: 34, reaction: () => [{ ms: 800, action: 'tiltL', expression: 'curious', look: 'up', effects: [{ kind: 'sparkle', at: 'head' }], say: "Pip's horns get a gentle pat." }] },
  ],
  defaultPoke: () => [{ ms: 700, action: 'bounce', expression: 'happy', say: 'Pip bounces happily.' }],
  comfort: {
    cuddle: () => [
      { ms: 350, props: { hug: true }, expression: 'calm' },
      { ms: 800, action: 'squeezeHug', expression: 'squeeze', say: 'Pip hugs the star plush so tightly...' },
      { ms: 900, action: 'hiccup', expression: 'surprised', effects: [{ kind: 'bubble', at: 'mouth', count: 5 }], sound: 'bubble', say: '...that bubbles pop out everywhere!' },
      { ms: 800, expression: 'giggle' },
      { ms: 200, props: { hug: false }, expression: 'happy' },
    ],
    song: () => [
      { ms: 2800, sound: 'song', action: 'sway', expression: 'calm', effects: [{ kind: 'note', at: 'top', count: 3 }], say: 'Pip sways to a gentle song.' },
      { ms: 500, expression: 'happy' },
    ],
    pause: () => [
      { ms: 1900, sound: 'breath', action: 'breathe', expression: 'calm', look: 'up', toolAt: null, say: 'Pip takes a big, slow dragon breath.' },
      { ms: 800, expression: 'happy', look: null, effects: [{ kind: 'bubble', at: 'mouth', size: 0.6 }] },
    ],
    showTool: ({ selectedTool }) => [
      { ms: 350, demo: { tool: selectedTool ?? 'stethoscope', at: 'demo' }, expression: 'curious', look: 'downRight' },
      { ms: 1300, effects: [{ kind: 'sparkle', at: 'demo', count: 2 }], expression: 'excited', say: 'The doctor checks the star plush first. Pip watches closely.' },
      { ms: 600, demo: null, look: null, expression: 'giggle' },
    ],
  },
  feelsBetter: [
    { ms: 600, action: 'hiccup', expression: 'surprised', effects: [{ kind: 'bubble', at: 'mouth', size: 0.5 }] },
    { ms: 900, expression: 'surprised', look: 'up', say: "Pip's hiccups have stopped!" },
    { ms: 1000, action: 'jump', expression: 'excited', look: null, sound: 'jingle', effects: [{ kind: 'sparkle', at: 'top', count: 3 }] },
  ],
  farewell: [
    { ms: 450, expression: 'happy' },
    { ms: 1500, action: 'puff', expression: 'proud', sound: 'bubble', effects: [{ kind: 'heartBubble', at: 'mouth' }], say: 'Pip blows a giant heart-shaped bubble!' },
    { ms: 1300, action: 'wave', expression: 'giggle', say: 'Pip waves goodbye.' },
  ],
  goodbye: [
    { ms: 1300, action: 'puff', expression: 'proud', effects: [{ kind: 'heartBubble', at: 'mouth' }], sound: 'bubble' },
    { ms: 1400, action: 'wave', expression: 'happy', say: 'Pip blows a heart bubble and waves goodbye.' },
  ],
  waitingIdle: [
    { action: 'hiccup', effects: [{ kind: 'bubble', at: 'mouth' }] },
    { action: 'wag' },
  ],
};
