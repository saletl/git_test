import { curve, circle, type Shape } from '../art/shapes';
import { INK, PAPER } from './lineArt';

/** A stethoscope resting on Mochi's tummy, drawn in Mochi's own 240 x 240 space. */
export function stethoscopeShapesLocal(): Shape[] {
  const tube = (d: string): Shape => ({ d, stroke: INK, sw: 3 });
  return [
    tube(curve([150, 140], [176, 150], [176, 178])),
    tube(curve([176, 178], [176, 200], [150, 204])),
    { d: circle(140, 204, 11), fill: PAPER, stroke: INK, sw: 2.6 },
    { d: circle(140, 204, 5), fill: PAPER, stroke: INK, sw: 1.8 },
  ];
}
