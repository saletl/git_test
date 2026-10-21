import { waddlesArt } from '../../art/waddles';
import { pick } from '../visit';
import type { CreatureProps } from '../../art/creature';
import type { PatientDefinition, Reaction } from '../types';

const scarves = (props: CreatureProps): number => (typeof props.scarves === 'number' ? props.scarves : 5);

/** A sneeze sends the top scarf flying, but Waddles always keeps one cozy scarf. */
function sneeze(props: CreatureProps, say = 'Achoo! A scarf flies off!'): Reaction {
  const n = scarves(props);
  const flies = n > 1;
  return [
    { ms: 450, action: 'preSneeze', expression: 'squeeze' },
    {
      ms: 650,
      action: 'sneeze',
      expression: 'surprised',
      sound: 'sneeze',
      effects: flies ? [{ kind: 'scarf', at: 'neck' }] : [{ kind: 'puff', at: 'mouth' }],
      props: { scarves: flies ? n - 1 : n },
      say: flies ? say : 'Achoo! A tiny sneeze.',
    },
    { ms: 800, action: 'lookAround', expression: 'curious', look: 'left', say: flies ? 'Waddles looks around innocently.' : undefined },
    { ms: 300, look: null, expression: 'happy' },
  ];
}

export const waddles: PatientDefinition = {
  id: 'waddles',
  name: 'Waddles the Penguin',
  summary: 'Waddles the penguin keeps sneezing and is wearing far too many scarves.',
  artist: waddlesArt,
  plush: 'fish',
  initialProps: { scarves: 5, hug: false, offer: false },
  waitingProps: { scarves: 5 },
  roomTint: '#e2edf3',
  anchors: {
    chest: [120, 172],
    ear: [168, 78],
    mouth: [120, 100],
    neck: [120, 112],
    nose: [120, 96],
    belly: [120, 190],
    head: [120, 36],
    top: [120, 12],
    feet: [120, 222],
    flipper: [44, 174],
    plush: [120, 176],
    offer: [214, 86],
    demo: [214, 212],
  },
  toolTarget: { stethoscope: 'chest', thermometer: 'mouth', otoscope: 'ear', bandage: 'flipper' },
  issueStart: 3,
  restingExpression: () => 'happy',
  intro: [
    { ms: 450, expression: 'happy', look: 'up' },
    ...sneeze({ scarves: 5 }, 'Achoo! Waddles sneezes, and a scarf flies into the air!'),
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
            {
              ms: 1100,
              toolAt: { tool: 'stethoscope', at: 'flipper' },
              action: 'flap',
              expression: 'curious',
              look: 'left',
              say: 'Now Waddles listens to a flipper. Flap flap!',
            },
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
    otoscope: ({ use }) =>
      pick<Reaction>(
        [
          [
            { ms: 400, toolAt: { tool: 'otoscope', at: 'ear' }, action: 'tiltBig', expression: 'surprised', say: 'Waddles tilts its head dramatically.' },
            { ms: 1700, action: 'tiltBigHold', popup: { kind: 'lens', discovery: 'snowman' }, sound: 'sparkle', say: "A tiny snowman waves hello from inside Waddles' ear!" },
            { ms: 700, popup: null, toolAt: null, expression: 'giggle' },
          ],
          [
            { ms: 400, toolAt: { tool: 'otoscope', at: 'ear' }, action: 'tiltBig', expression: 'curious' },
            { ms: 1700, action: 'tiltBigHold', popup: { kind: 'lens', discovery: 'snowflake' }, sound: 'sparkle', say: 'A sparkly snowflake twirls inside!' },
            { ms: 700, popup: null, toolAt: null, expression: 'excited', effects: [{ kind: 'snowflake', at: 'ear', count: 2 }] },
          ],
        ],
        use,
      ),
    bandage: () => [],
  },
  bandageSpots: [
    {
      id: 'flipper',
      at: [46, 170],
      part: 'flipperL',
      rotate: 62,
      scale: 0.6,
      reaction: () => [
        { ms: 450, expression: 'excited', look: 'left', sound: 'stick' },
        { ms: 1100, action: 'flap', expression: 'proud', effects: [{ kind: 'sparkle', at: 'flipper', count: 3 }], say: 'Waddles decorates its flipper and admires it.' },
        { ms: 300, look: null },
      ],
    },
    {
      id: 'head',
      at: [120, 44],
      part: 'head',
      rotate: -6,
      scale: 0.65,
      reaction: () => [
        { ms: 450, expression: 'curious', look: 'up', sound: 'stick' },
        { ms: 1100, action: 'spin', sound: 'whoosh', expression: 'surprised', say: 'Waddles spins around trying to see the bandage on its head!' },
        { ms: 500, expression: 'giggle', look: null },
      ],
    },
    {
      id: 'belly',
      at: [120, 196],
      part: 'body',
      rotate: 3,
      scale: 0.75,
      reaction: () => [
        { ms: 400, expression: 'surprised', look: 'down', sound: 'stick' },
        { ms: 900, action: 'bounce', expression: 'giggle', sound: 'giggle', say: 'Waddles pats the bandage on its tummy. Pat pat!' },
        { ms: 200, look: null },
      ],
    },
    {
      id: 'foot',
      at: [140, 222],
      part: 'feet',
      rotate: 0,
      scale: 0.55,
      reaction: () => [
        { ms: 400, expression: 'curious', look: 'down', sound: 'stick' },
        { ms: 1200, action: 'tapDance', expression: 'excited', effects: [{ kind: 'note', at: 'feet', count: 3 }], say: 'Waddles does a happy tap dance!' },
        { ms: 200, look: null },
      ],
    },
  ],
  pokes: [
    {
      at: [120, 98],
      radius: 22,
      reaction: ({ props }) => sneeze(props, 'Boop on the beak! Achoo! Off flies a scarf.'),
    },
    { at: [120, 36], radius: 26, reaction: () => [{ ms: 800, action: 'boing', expression: 'surprised', sound: 'boing', say: "Waddles' head feathers go boing!" }] },
    { at: [120, 190], radius: 32, reaction: () => [{ ms: 800, action: 'wiggle', expression: 'giggle', sound: 'giggle', say: 'Waddles giggles.' }] },
    { at: [44, 174], radius: 30, reaction: () => [{ ms: 900, action: 'flap', expression: 'excited', say: 'Flap flap! Waddles flaps hello.' }] },
    { at: [120, 222], radius: 26, reaction: () => [{ ms: 1000, action: 'tapDance', expression: 'happy', effects: [{ kind: 'note', at: 'feet' }], say: 'Tippy tap toes!' }] },
  ],
  defaultPoke: () => [{ ms: 900, action: 'waddle', expression: 'happy', say: 'Waddles waddles side to side.' }],
  comfort: {
    cuddle: () => [
      { ms: 400, props: { hug: true }, expression: 'calm' },
      { ms: 900, action: 'squeezeHug', expression: 'happy', say: 'Waddles hugs the fish plush...' },
      { ms: 1300, props: { hug: false, offer: true }, expression: 'excited', effects: [{ kind: 'heart', at: 'offer' }], say: '...then offers it back to you. So kind!' },
      { ms: 300, props: { offer: false }, expression: 'happy' },
    ],
    song: () => [
      { ms: 2800, sound: 'song', action: 'dance', expression: 'giggle', effects: [{ kind: 'note', at: 'top', count: 3 }], say: 'Waddles dances to the song and the scarves twirl.' },
      { ms: 400, expression: 'happy' },
    ],
    pause: () => [
      { ms: 1900, sound: 'breath', action: 'settle', expression: 'calm', toolAt: null, say: 'Waddles takes a pause and wiggles its toes.' },
      { ms: 600, expression: 'happy' },
    ],
    showTool: ({ selectedTool }) => [
      { ms: 350, demo: { tool: selectedTool ?? 'stethoscope', at: 'demo' }, expression: 'curious', look: 'downRight' },
      { ms: 1300, effects: [{ kind: 'sparkle', at: 'demo', count: 2 }], action: 'leanIn', expression: 'excited', say: 'The doctor checks the fish plush first. Waddles leans in to see.' },
      { ms: 600, demo: null, look: null, expression: 'giggle' },
    ],
  },
  feelsBetter: [
    { ms: 500, action: 'preSneeze', expression: 'squeeze' },
    { ms: 900, expression: 'surprised', say: 'No sneeze! Waddles feels much better.' },
    { ms: 1000, action: 'jump', expression: 'excited', sound: 'jingle', effects: [{ kind: 'sparkle', at: 'top', count: 3 }] },
  ],
  farewell: [
    { ms: 400, expression: 'excited' },
    { ms: 1200, action: 'slideAway', sound: 'whoosh', expression: 'giggle', say: 'Wheee! Waddles slides across the floor...' },
    { ms: 1000, action: 'slideBack', expression: 'excited', say: '...comes back...' },
    { ms: 1200, action: 'wave', expression: 'happy', say: '...and waves goodbye.' },
  ],
  goodbye: [
    { ms: 1200, action: 'wave', expression: 'happy', say: 'Waddles waves...' },
    { ms: 1300, action: 'slideOff', sound: 'whoosh', expression: 'giggle', say: '...and slides away. Wheee!' },
  ],
  waitingIdle: [{ action: 'sneeze', effects: [{ kind: 'puff', at: 'mouth' }] }, { action: 'waddle' }],
};
