import type { CreatureArtist, CreatureProps } from './creature';
import { bandageShapes, plushShapes } from './creature';
import { faceParts, type Expression, type Look } from './face';
import { C } from './palette';
import { circle, curve, ellipse, fill, line, smooth, type Point, type Shape } from './shapes';

/** Prickle the Porcupine: thoughtful, cautious, sensitive. Never far from a stuffed bunny. */

const FUR = '#e8b98f';
const EDGE = '#a8754d';
const MASK = '#f8e3c8';
const QUILL_BACK = '#8f6d52';
const QUILL_FRONT = '#b38d6c';
const QUILL_TIP = '#e3c7a3';

/** A ring of soft, round-tipped quills fanning out around (cx, cy). */
function quillRing(cx: number, cy: number, base: number, length: number, width: number, from: number, to: number, count: number, color: string, edge: string): Shape[] {
  const shapes: Shape[] = [];
  for (let i = 0; i < count; i++) {
    const deg = from + ((to - from) * i) / (count - 1);
    const a = (deg * Math.PI) / 180;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    const bx = cx + ux * base;
    const by = cy + uy * base;
    const tip: Point = [bx + ux * length, by + uy * length];
    const left: Point = [bx - uy * width, by + ux * width];
    const right: Point = [bx + uy * width, by - ux * width];
    const inner: Point = [bx - ux * 10, by - uy * 10];
    shapes.push(fill(smooth([left, tip, right, inner], true, 0.62), color, edge, 2.6));
  }
  return shapes;
}

function quillTips(cx: number, cy: number, base: number, length: number, from: number, to: number, count: number): Shape[] {
  const shapes: Shape[] = [];
  for (let i = 0; i < count; i++) {
    const deg = from + ((to - from) * i) / (count - 1);
    const a = (deg * Math.PI) / 180;
    const x1 = cx + Math.cos(a) * (base + length - 6);
    const y1 = cy + Math.sin(a) * (base + length - 6);
    const x2 = cx + Math.cos(a) * (base + length - 15);
    const y2 = cy + Math.sin(a) * (base + length - 15);
    shapes.push(line(`M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`, QUILL_TIP, 3.4, 0.9));
  }
  return shapes;
}

export const prickleArt: CreatureArtist = {
  draw(expression: Expression, look: Look | undefined, props: CreatureProps) {
    const curl = props.curl === true;
    const headY = curl ? 10 : 0;
    const face = faceParts(
      {
        eyes: [
          [104, 108 + headY],
          [136, 108 + headY],
        ],
        eyeR: 10.5,
        eyeStretch: 1.12,
        browGap: 17,
        browLen: 12,
        mouth: [120, 138 + headY],
        mouthW: 18,
        cheeks: [
          [88, 126 + headY],
          [152, 126 + headY],
        ],
        cheekR: 7,
        skin: MASK,
        lashes: true,
      },
      expression,
      look,
    );
    const q = curl ? 8 : 0;
    const bunnyMode = typeof props.bunny === 'string' ? props.bunny : 'hug';
    const bunnyAt: Point = bunnyMode === 'lap' ? [178, 204] : [118, 194];
    const bunnyRotate = bunnyMode === 'lap' ? 10 : -10;
    const bunny: Shape[] = bunnyMode === 'away' ? [] : plushShapes('bunny', bunnyAt, bunnyMode === 'lap' ? 0.85 : 1.12, false, bunnyRotate);
    if (props.bunnyBandage && bunnyMode !== 'away') {
      const earX = bunnyAt[0] + (bunnyMode === 'lap' ? 4 : -2);
      const earY = bunnyAt[1] - (bunnyMode === 'lap' ? 22 : 30);
      bunny.push(...bandageShapes('hearts', [earX, earY], 70, 0.42));
    }
    const hugging = bunnyMode === 'hug';
    const armL: Shape[] = hugging
      ? [fill(ellipse(97, 196, 9, 17, -58), FUR, EDGE, 3)]
      : [fill(ellipse(76, 186, 9, 16, -18), FUR, EDGE, 3)];
    const armR: Shape[] = hugging
      ? [fill(ellipse(141, 196, 9, 17, 58), FUR, EDGE, 3)]
      : [fill(ellipse(164, 186, 9, 16, 18), FUR, EDGE, 3)];

    return {
      eyesOpen: face.eyesOpen,
      layers: [
        { part: 'shadow', shapes: [fill(ellipse(120, 229, 62, 8), C.shadow, undefined, 0, 0.12)] },
        {
          part: 'quills',
          pivot: [120, 160],
          shapes: [
            ...quillRing(120, 150, 52 + q, 40 + q, 12, 178, 362, 11, QUILL_BACK, '#6e5440'),
            ...quillRing(120, 154, 48 + q, 30 + q, 11, 192, 348, 8, QUILL_FRONT, '#7f6249'),
            ...quillTips(120, 154, 48 + q, 30 + q, 192, 348, 8),
          ],
        },
        {
          part: 'feet',
          shapes: [fill(ellipse(98, 224, 15, 8), '#d9a57a', EDGE, 2.6), fill(ellipse(142, 224, 15, 8), '#d9a57a', EDGE, 2.6)],
        },
        {
          part: 'body',
          pivot: [120, 226],
          shapes: [fill(ellipse(120, 180, 54, 48), FUR, EDGE, 3.2), fill(ellipse(120, 190, 36, 32), MASK)],
        },
        {
          part: 'head',
          pivot: [120, 150],
          shapes: [
            fill(circle(78, 92 + headY, 11), FUR, EDGE, 3),
            fill(circle(78, 92 + headY, 5.5), C.berryLight),
            fill(circle(162, 92 + headY, 11), FUR, EDGE, 3),
            fill(circle(162, 92 + headY, 5.5), C.berryLight),
            fill(ellipse(120, 112 + headY, 50, 42), FUR, EDGE, 3.2),
            fill(ellipse(120, 120 + headY, 39, 30), MASK),
            fill(
              smooth(
                [
                  [92, 82 + headY],
                  [100, 64 + headY],
                  [110, 76 + headY],
                  [120, 60 + headY],
                  [130, 76 + headY],
                  [140, 64 + headY],
                  [148, 82 + headY],
                  [120, 92 + headY],
                ],
                true,
                0.5,
              ),
              QUILL_FRONT,
              '#7f6249',
              2.4,
            ),
            fill(ellipse(120, 128 + headY, 13, 9), '#fdf1e2', '#dcbf9c', 2),
            fill(ellipse(120, 122 + headY, 7.5, 5.2), '#5a4033'),
            fill(ellipse(118, 120.5 + headY, 2.4, 1.5), C.white, undefined, 0, 0.8),
          ],
        },
        { part: 'cheeks', shapes: face.cheeks },
        { part: 'eyes', shapes: face.eyes },
        { part: 'brows', shapes: face.brows },
        { part: 'mouth', shapes: face.mouth },
        { part: 'bunny', pivot: [bunnyAt[0], bunnyAt[1] + 20], shapes: bunny },
        { part: 'armL', pivot: [84, 170], shapes: armL },
        { part: 'armR', pivot: [156, 170], shapes: armR },
        {
          part: 'whiskers',
          shapes: [
            line(curve([104, 128 + headY], [96, 127 + headY], [90, 130 + headY]), C.inkSoft, 1.4, 0.5),
            line(curve([136, 128 + headY], [144, 127 + headY], [150, 130 + headY]), C.inkSoft, 1.4, 0.5),
          ],
        },
      ],
    };
  },
};
