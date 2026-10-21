import type { CreatureArtist, CreatureProps } from './creature';
import { plushShapes } from './creature';
import { faceParts, type Expression, type Look } from './face';
import { C } from './palette';
import { curve, ellipse, fill, heart, line, mirror, smooth, star, type Point, type Shape } from './shapes';

/** Pip the Dragon: dramatic, expressive, lovable. Keeps hiccuping bubbles. */

const BODY = C.mint;
const EDGE = C.mintDeep;
const BELLY = C.peachLight;
const BELLY_LINE = '#efc29c';

const wingPts: Point[] = [
  [86, 132],
  [66, 104],
  [42, 90],
  [46, 110],
  [32, 118],
  [46, 130],
  [40, 146],
  [64, 146],
  [84, 146],
];

const finPts: Point[] = [
  [70, 84],
  [50, 70],
  [52, 86],
  [42, 96],
  [66, 104],
];

const hornPts: Point[] = [
  [92, 56],
  [86, 38],
  [80, 20],
  [94, 30],
  [106, 50],
];

function spike(x: number): string {
  return smooth(
    [
      [x - 8, 54],
      [x, 34],
      [x + 8, 54],
    ],
    true,
    0.55,
  );
}

export const pipArt: CreatureArtist = {
  draw(expression: Expression, look: Look | undefined, props: CreatureProps) {
    const face = faceParts(
      {
        eyes: [
          [98, 82],
          [142, 82],
        ],
        eyeR: 13,
        eyeStretch: 1.1,
        browGap: 21,
        browLen: 15,
        mouth: [120, 121],
        mouthW: 22,
        cheeks: [
          [78, 106],
          [162, 106],
        ],
        cheekR: 8,
        skin: BODY,
      },
      expression,
      look,
    );
    const hugging = props.hug === true;
    const plush: Shape[] = hugging ? plushShapes('star', [120, 176], 0.95, false, -8) : [];

    const armL: Shape[] = hugging
      ? [fill(ellipse(96, 178, 9, 19, -58), BODY, EDGE, 3)]
      : [fill(ellipse(78, 170, 10, 18, -14), BODY, EDGE, 3)];
    const armR: Shape[] = hugging
      ? [fill(ellipse(144, 178, 9, 19, 58), BODY, EDGE, 3)]
      : [fill(ellipse(162, 170, 10, 18, 14), BODY, EDGE, 3)];

    return {
      eyesOpen: face.eyesOpen,
      layers: [
        { part: 'shadow', shapes: [fill(ellipse(120, 229, 64, 8), C.shadow, undefined, 0, 0.12)] },
        {
          part: 'tail',
          pivot: [150, 204],
          shapes: [
            line(
              smooth(
                [
                  [146, 206],
                  [182, 212],
                  [208, 192],
                  [218, 162],
                  [210, 140],
                ],
                false,
              ),
              EDGE,
              24,
            ),
            line(
              smooth(
                [
                  [146, 206],
                  [182, 212],
                  [208, 192],
                  [218, 162],
                  [210, 140],
                ],
                false,
              ),
              BODY,
              17,
            ),
            fill(heart(208, 128, 30, -18), C.coral, C.coralDeep, 3),
          ],
        },
        { part: 'wingL', pivot: [86, 136], shapes: wingShapes(wingPts) },
        { part: 'wingR', pivot: [154, 136], shapes: wingShapes(mirror(wingPts, 120)) },
        {
          part: 'feet',
          shapes: [
            fill(ellipse(96, 222, 20, 11), BODY, EDGE, 3),
            fill(ellipse(144, 222, 20, 11), BODY, EDGE, 3),
            ...[86, 96, 106, 134, 144, 154].map((x) => fill(ellipse(x, 226, 3.2, 2.6), C.cream)),
          ],
        },
        {
          part: 'body',
          pivot: [120, 226],
          shapes: [
            fill(
              smooth([
                [120, 128],
                [158, 140],
                [172, 176],
                [164, 210],
                [140, 227],
                [100, 227],
                [76, 210],
                [68, 176],
                [82, 140],
              ]),
              BODY,
              EDGE,
              3.5,
            ),
            fill(ellipse(88, 168, 7, 16, 18), C.white, undefined, 0, 0.22),
            fill(ellipse(120, 186, 32, 35), BELLY, '#e7b08a', 2.5),
            line(curve([95, 168], [120, 174], [145, 168]), BELLY_LINE, 2.6),
            line(curve([92, 185], [120, 191], [148, 185]), BELLY_LINE, 2.6),
            line(curve([94, 202], [120, 208], [146, 202]), BELLY_LINE, 2.6),
          ],
        },
        { part: 'plush', shapes: plush },
        { part: 'armL', pivot: [84, 156], shapes: armL },
        { part: 'armR', pivot: [156, 156], shapes: armR },
        {
          part: 'head',
          pivot: [120, 136],
          shapes: [
            fill(smooth(finPts), C.lilac, C.lilacDeep, 3),
            fill(smooth(mirror(finPts, 120)), C.lilac, C.lilacDeep, 3),
            fill(smooth(hornPts), C.gold, C.goldDeep, 3),
            fill(smooth(mirror(hornPts, 120)), C.gold, C.goldDeep, 3),
            fill(spike(108), C.coral, C.coralDeep, 2.6),
            fill(spike(132), C.coral, C.coralDeep, 2.6),
            fill(spike(120), C.coral, C.coralDeep, 2.6),
            fill(ellipse(120, 92, 58, 48), BODY, EDGE, 3.5),
            fill(ellipse(92, 68, 14, 7, -25), C.white, undefined, 0, 0.3),
            fill(ellipse(120, 112, 34, 22), C.mintLight, EDGE, 2.5),
            fill(ellipse(110, 104, 3.4, 2.4), EDGE),
            fill(ellipse(130, 104, 3.4, 2.4), EDGE),
          ],
        },
        { part: 'cheeks', shapes: face.cheeks },
        { part: 'eyes', shapes: face.eyes },
        { part: 'brows', shapes: face.brows },
        { part: 'mouth', shapes: face.mouth },
        { part: 'glasses', shapes: props.glasses === true ? sillyGlasses() : [] },
      ],
    };
  },
};

/** Big round party glasses for the "silly face" hiccup helper. */
function sillyGlasses(): Shape[] {
  return [
    line('M80 78L62 70', C.coralDeep, 4),
    line('M160 78L178 70', C.coralDeep, 4),
    fill(ellipse(98, 82, 20, 19), C.white, C.coralDeep, 5, 0.25),
    fill(ellipse(142, 82, 20, 19), C.white, C.coralDeep, 5, 0.25),
    line(curve([118, 80], [120, 74], [122, 80]), C.coralDeep, 4.5),
    fill(star(78, 64, 7, 3.5), C.gold, C.goldDeep, 1.6),
    fill(star(162, 64, 7, 3.5), C.gold, C.goldDeep, 1.6),
  ];
}

function wingShapes(pts: Point[]): Shape[] {
  const base = pts[0]!;
  const a = pts[2]!;
  const b = pts[4]!;
  const c = pts[6]!;
  return [
    fill(smooth(pts, true, 0.7), C.lilac, C.lilacDeep, 3),
    line(curve(base, [(base[0] + a[0]) / 2, (base[1] + a[1]) / 2 + 4], a), C.lilacDeep, 2, 0.6),
    line(curve(base, [(base[0] + b[0]) / 2, (base[1] + b[1]) / 2], b), C.lilacDeep, 2, 0.6),
    line(curve(base, [(base[0] + c[0]) / 2, (base[1] + c[1]) / 2 - 3], c), C.lilacDeep, 2, 0.6),
  ];
}
