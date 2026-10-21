import type { CreatureArtist } from './creature';
import { faceParts, type Expression, type Look } from './face';
import { C } from './palette';
import { circle, curve, ellipse, fill, line, smooth } from './shapes';

/** The clinic's tiny, very important hamster receptionist. */

const FUR = '#f0b978';
const EDGE = '#b77f45';

export const hamsterArt: CreatureArtist = {
  draw(expression: Expression, look: Look | undefined) {
    const face = faceParts(
      {
        eyes: [
          [104, 108],
          [136, 108],
        ],
        eyeR: 8,
        browGap: 13,
        browLen: 10,
        mouth: [120, 134],
        mouthW: 14,
        cheeks: [
          [88, 128],
          [152, 128],
        ],
        cheekR: 9,
        skin: FUR,
      },
      expression,
      look,
    );
    return {
      eyesOpen: face.eyesOpen,
      layers: [
        {
          part: 'body',
          pivot: [120, 230],
          shapes: [
            fill(ellipse(120, 196, 52, 44), FUR, EDGE, 3),
            fill(ellipse(120, 204, 32, 30), C.cream),
            fill(smooth([[120, 160], [104, 150], [104, 170]], true, 0.4), C.coral, C.coralDeep, 2.4),
            fill(smooth([[120, 160], [136, 150], [136, 170]], true, 0.4), C.coral, C.coralDeep, 2.4),
            fill(circle(120, 160, 4.5), C.coralDeep),
          ],
        },
        {
          part: 'head',
          pivot: [120, 150],
          shapes: [
            fill(circle(82, 76, 15), FUR, EDGE, 3),
            fill(circle(82, 76, 8), C.berryLight),
            fill(circle(158, 76, 15), FUR, EDGE, 3),
            fill(circle(158, 76, 8), C.berryLight),
            fill(ellipse(120, 116, 48, 42), FUR, EDGE, 3),
            fill(ellipse(120, 128, 26, 18), C.cream),
            fill(ellipse(120, 122, 5, 3.6), C.berry),
            line(curve([116, 128], [120, 131], [124, 128]), C.ink, 1.6),
          ],
        },
        { part: 'cheeks', shapes: face.cheeks },
        { part: 'eyes', shapes: face.eyes },
        { part: 'brows', shapes: face.brows },
        { part: 'mouth', shapes: face.mouth },
        {
          part: 'glasses',
          shapes: [
            { d: circle(104, 108, 12), stroke: C.ink, sw: 2.4 },
            { d: circle(136, 108, 12), stroke: C.ink, sw: 2.4 },
            line('M116 108L124 108', C.ink, 2.2),
          ],
        },
        {
          part: 'paws',
          shapes: [fill(ellipse(96, 226, 11, 7), C.peach, EDGE, 2.4), fill(ellipse(144, 226, 11, 7), C.peach, EDGE, 2.4)],
        },
      ],
    };
  },
};
