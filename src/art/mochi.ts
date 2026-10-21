import type { CreatureArtist, CreatureProps } from './creature';
import { plushShapes } from './creature';
import { faceParts, type Expression, type Look } from './face';
import { C } from './palette';
import { circle, ellipse, fill, line, mirror, rrect, smooth, transformShapes, type Point, type Shape } from './shapes';

/** Mochi the Monster: silly, mischievous, affectionate. Has a sock stuck on its head. */

const BODY = C.lilac;
const EDGE = C.lilacDeep;
const SPOT = '#a48cc8';

const hornPts: Point[] = [
  [80, 86],
  [80, 66],
  [88, 50],
  [98, 64],
  [100, 84],
];

const earPts: Point[] = [
  [48, 110],
  [22, 92],
  [28, 116],
  [44, 130],
];

/** A striped tube sock lying flat, cuff at the left, toe curling down on the right. */
function sockBase(): Shape[] {
  const outline = C.coralDeep;
  return [
    fill(
      smooth(
        [
          [0, -13],
          [36, -14],
          [64, -12],
          [82, -6],
          [92, 8],
          [86, 24],
          [70, 24],
          [60, 12],
          [36, 13],
          [0, 13],
        ],
        true,
        0.8,
      ),
      C.paper,
      outline,
      2.6,
    ),
    fill(rrect(20, -13.5, 8, 27, 2), C.coral),
    fill(rrect(36, -14, 8, 27, 2), C.gold),
    fill(rrect(52, -13.5, 8, 26, 2), C.coral),
    fill(
      smooth(
        [
          [72, -8],
          [86, -2],
          [92, 10],
          [86, 23],
          [72, 22],
          [70, 6],
        ],
        true,
        0.8,
      ),
      C.coral,
      outline,
      2.4,
    ),
    fill(rrect(-4, -15, 18, 30, 5), C.cream, outline, 2.6),
    line('M1 -11L1 11', C.creamDeep, 2),
    line('M6 -11L6 11', C.creamDeep, 2),
  ];
}

export type SockSpot = 'head' | 'eye' | 'giant' | 'off';

export function sockShapes(spot: SockSpot): Shape[] {
  switch (spot) {
    case 'head':
      return transformShapes(sockBase(), { rotate: 8, translate: [92, 58] });
    case 'eye':
      return transformShapes(sockBase(), { rotate: 34, translate: [104, 52] });
    case 'giant':
      return transformShapes(sockBase(), { scale: 1.55, rotate: -6, translate: [70, 46] });
    case 'off':
      return [];
  }
}

export const mochiArt: CreatureArtist = {
  draw(expression: Expression, look: Look | undefined, props: CreatureProps) {
    const sock = (typeof props.sock === 'string' ? props.sock : 'head') as SockSpot;
    const face = faceParts(
      {
        eyes: [
          [94, 122],
          [148, 118],
        ],
        eyeR: 15,
        eyeR2: 19,
        browGap: 25,
        browLen: 16,
        mouth: [122, 160],
        mouthW: 44,
        cheeks: [
          [70, 150],
          [174, 148],
        ],
        cheekR: 9,
        skin: BODY,
      },
      expression,
      sock === 'eye' && !look ? 'left' : look,
    );
    const tooth: Shape[] =
      face.mouthKind === 'smile' || face.mouthKind === 'bigSmile' || face.mouthKind === 'tongue'
        ? [fill(rrect(127, 165, 9, 8, 2.5), C.white, C.ink, 2)]
        : face.mouthKind === 'grin'
          ? [fill(rrect(128, 156, 9, 7, 2.5), C.white, C.ink, 1.8)]
          : [];
    const hugging = props.hug === true;
    const plush: Shape[] = hugging ? plushShapes('bear', [120, 194], 0.92, true) : [];
    const armL: Shape[] = hugging
      ? [fill(ellipse(88, 192, 11, 18, -60), BODY, EDGE, 3)]
      : [fill(ellipse(40, 170, 11, 18, 34), BODY, EDGE, 3)];
    const armR: Shape[] = hugging
      ? [fill(ellipse(152, 192, 11, 18, 60), BODY, EDGE, 3)]
      : [fill(ellipse(200, 170, 11, 18, -34), BODY, EDGE, 3)];

    return {
      eyesOpen: face.eyesOpen,
      layers: [
        { part: 'shadow', shapes: [fill(ellipse(120, 229, 74, 8), C.shadow, undefined, 0, 0.12)] },
        { part: 'armL', pivot: [52, 158], shapes: hugging ? [] : armL },
        { part: 'armR', pivot: [188, 158], shapes: hugging ? [] : armR },
        {
          part: 'feet',
          shapes: [fill(ellipse(92, 225, 17, 8), BODY, EDGE, 2.8), fill(ellipse(148, 225, 17, 8), BODY, EDGE, 2.8)],
        },
        {
          part: 'head',
          pivot: [120, 150],
          shapes: [
            fill(smooth(earPts, true, 0.8), BODY, EDGE, 3),
            fill(smooth(mirror(earPts, 120), true, 0.8), BODY, EDGE, 3),
            fill(smooth(hornPts, true, 0.7), C.gold, C.goldDeep, 3),
            fill(smooth(mirror(hornPts, 120), true, 0.7), C.gold, C.goldDeep, 3),
          ],
        },
        {
          part: 'body',
          pivot: [120, 226],
          shapes: [
            fill(
              smooth([
                [120, 72],
                [166, 78],
                [196, 110],
                [204, 160],
                [190, 206],
                [150, 226],
                [90, 226],
                [50, 206],
                [36, 160],
                [44, 110],
                [74, 78],
              ]),
              BODY,
              EDGE,
              3.5,
            ),
            fill(ellipse(70, 106, 9, 16, 30), C.white, undefined, 0, 0.22),
            fill(circle(58, 168, 8), SPOT, undefined, 0, 0.8),
            fill(circle(186, 138, 6), SPOT, undefined, 0, 0.8),
            fill(circle(180, 186, 9), SPOT, undefined, 0, 0.8),
            fill(circle(66, 198, 5), SPOT, undefined, 0, 0.8),
          ],
        },
        {
          part: 'belly',
          pivot: [120, 190],
          shapes: [fill(ellipse(120, 192, 46, 30), C.lilacLight)],
        },
        { part: 'plush', shapes: plush },
        { part: 'cheeks', shapes: face.cheeks },
        { part: 'eyes', shapes: face.eyes },
        { part: 'brows', shapes: face.brows },
        {
          part: 'mouth',
          shapes: [fill(ellipse(122, 143, 4.5, 3.2), EDGE), ...face.mouth, ...tooth],
        },
        { part: 'hugArms', shapes: hugging ? [...armL, ...armR] : [] },
        { part: 'sock', pivot: [110, 60], shapes: sockShapes(sock) },
      ],
    };
  },
};
