import type { CreatureArtist, CreatureProps } from './creature';
import { plushShapes } from './creature';
import { faceParts, isMouthOpen, type Expression, type Look } from './face';
import { C } from './palette';
import { curve, ellipse, fill, line, mirror, rrect, smooth, transformShapes, type Point, type Shape } from './shapes';

/** Waddles the Penguin: curious, enthusiastic, slightly clumsy. Wearing far too many scarves. */

const BODY = '#4e6e8e';
const EDGE = '#33495f';
const SCARF_COLORS = [C.coral, C.gold, '#8db38a', C.berry, C.blue, C.lilac, C.coral];
const SCARF_STRIPES = ['#f8b8a6', '#f8e2a8', '#c5ddb8', '#f6bfd2', '#dcebf3', '#ebe2f5', '#f8b8a6'];

const flipperPts: Point[] = [
  [70, 118],
  [54, 136],
  [42, 164],
  [40, 188],
  [52, 186],
  [68, 160],
  [76, 136],
];

function flipper(points: Point[]): Shape[] {
  return [fill(smooth(points, true, 0.9), BODY, EDGE, 3)];
}

export function scarfBand(i: number, count: number): Shape[] {
  const y = 147 - i * 9.5;
  const wobble = i % 2 === 0 ? -1.8 : 1.8;
  const color = SCARF_COLORS[i % SCARF_COLORS.length]!;
  const stripe = SCARF_STRIPES[i % SCARF_STRIPES.length]!;
  const half = 64 - Math.max(0, i - 2) * 2.5;
  const shapes: Shape[] = [fill(rrect(120 - half, y - 6.5, half * 2, 13, 6.5, wobble), color, C.ink, 2.2)];
  for (const dx of [-38, -14, 10, 34]) {
    shapes.push(line(`M${120 + dx} ${y - 4}L${120 + dx + 3} ${y + 4}`, stripe, 3, 0.9));
  }
  if (i === 0 && count > 0) {
    shapes.unshift(
      fill(rrect(146, y - 2, 15, 42, 6, 9), color, C.ink, 2.2),
      fill(rrect(160, y - 4, 14, 36, 6, 18), color, C.ink, 2.2),
    );
  }
  return shapes;
}

export const waddlesArt: CreatureArtist = {
  draw(expression: Expression, look: Look | undefined, props: CreatureProps) {
    const face = faceParts(
      {
        eyes: [
          [102, 76],
          [138, 76],
        ],
        eyeR: 11.5,
        eyeStretch: 1.12,
        browGap: 18,
        browLen: 13,
        mouth: [120, 100],
        mouthW: 20,
        cheeks: [
          [88, 92],
          [152, 92],
        ],
        cheekR: 7,
        skin: C.cream,
        noMouth: true,
      },
      expression,
      look,
    );
    const open = isMouthOpen(expression);
    const beak: Shape[] = open
      ? [
          fill(smooth([[110, 99], [130, 99], [120, 113]], true, 0.5), C.mouth, C.goldDeep, 2),
          fill(smooth([[106, 92], [120, 86], [134, 92], [120, 100]], true, 0.6), C.gold, C.goldDeep, 2.6),
          fill(smooth([[110, 104], [130, 104], [120, 116]], true, 0.5), C.gold, C.goldDeep, 2.4),
        ]
      : [fill(smooth([[106, 93], [120, 87], [134, 93], [120, 108]], true, 0.6), C.gold, C.goldDeep, 2.6)];

    const count = typeof props.scarves === 'number' ? Math.max(0, Math.min(7, props.scarves)) : 5;
    const scarves: Shape[] = [];
    for (let i = 0; i < count; i++) scarves.push(...scarfBand(i, count));

    const hugging = props.hug === true;
    const offering = props.offer === true;
    let flipL = flipper(flipperPts);
    let flipR = flipper(mirror(flipperPts, 120));
    let plush: Shape[] = [];
    if (hugging) {
      flipL = [fill(ellipse(96, 180, 9, 21, -52), BODY, EDGE, 3)];
      flipR = [fill(ellipse(144, 180, 9, 21, 52), BODY, EDGE, 3)];
      plush = plushShapes('fish', [120, 176], 0.95, false, -6);
    } else if (offering) {
      flipR = transformShapes(flipR, { origin: [170, 124], rotate: -105 });
      plush = plushShapes('fish', [214, 86], 0.9, false, -20);
    }
    const scarfHat: Shape[] = props.scarfHat
      ? [
          fill(rrect(80, 30, 80, 16, 8, -4), C.berry, C.ink, 2.2),
          fill(rrect(84, 18, 72, 15, 7.5, 3), C.gold, C.ink, 2.2),
          fill(rrect(132, 8, 13, 30, 6, 30), C.gold, C.ink, 2.2),
        ]
      : [];

    return {
      eyesOpen: face.eyesOpen,
      layers: [
        { part: 'shadow', shapes: [fill(ellipse(120, 229, 58, 8), C.shadow, undefined, 0, 0.12)] },
        {
          part: 'feet',
          shapes: [
            fill(ellipse(100, 224, 19, 8), C.gold, C.goldDeep, 2.6),
            fill(ellipse(140, 224, 19, 8), C.gold, C.goldDeep, 2.6),
            line('M94 220L92 228', C.goldDeep, 2, 0.7),
            line('M106 220L108 228', C.goldDeep, 2, 0.7),
            line('M134 220L132 228', C.goldDeep, 2, 0.7),
            line('M146 220L148 228', C.goldDeep, 2, 0.7),
          ],
        },
        { part: 'flipperL', pivot: [70, 124], shapes: hugging ? [] : flipL },
        { part: 'flipperR', pivot: [170, 124], shapes: hugging ? [] : flipR },
        {
          part: 'body',
          pivot: [120, 228],
          shapes: [
            fill(
              smooth([
                [120, 34],
                [160, 46],
                [180, 96],
                [184, 158],
                [172, 208],
                [140, 227],
                [100, 227],
                [68, 208],
                [56, 158],
                [60, 96],
                [80, 46],
              ]),
              BODY,
              EDGE,
              3.5,
            ),
            fill(ellipse(80, 76, 7, 18, 18), C.white, undefined, 0, 0.18),
            fill(
              smooth([
                [120, 118],
                [150, 128],
                [162, 168],
                [154, 208],
                [120, 222],
                [86, 208],
                [78, 168],
                [90, 128],
              ]),
              C.cream,
              '#d8cbb3',
              2,
            ),
          ],
        },
        {
          part: 'head',
          pivot: [120, 120],
          shapes: [
            line(curve([118, 40], [110, 24], [100, 22]), EDGE, 5),
            line(curve([120, 40], [122, 22], [130, 16]), EDGE, 5),
            line(curve([122, 40], [134, 28], [142, 30]), EDGE, 5),
            fill(
              smooth([
                [120, 62],
                [142, 48],
                [162, 60],
                [164, 86],
                [150, 104],
                [120, 110],
                [90, 104],
                [76, 86],
                [78, 60],
                [98, 48],
              ]),
              C.cream,
              '#d8cbb3',
              2,
            ),
            line(curve([164, 72], [170, 78], [166, 86]), EDGE, 2.4, 0.6),
            ...scarfHat,
          ],
        },
        { part: 'cheeks', shapes: face.cheeks },
        { part: 'eyes', shapes: face.eyes },
        { part: 'brows', shapes: face.brows },
        { part: 'mouth', pivot: [120, 96], shapes: beak },
        { part: 'scarves', pivot: [120, 150], shapes: scarves },
        { part: 'plush', shapes: plush },
        {
          part: 'hugFlippers',
          shapes: hugging ? [...flipL, ...flipR] : [],
        },
      ],
    };
  },
};
