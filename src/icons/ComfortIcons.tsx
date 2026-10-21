import { plushShapes, type PlushKind } from '../art/creature';
import { C } from '../art/palette';
import type { AnyToolId, ComfortId } from '../game/types';
import { ShapeList } from '../characters/Creature';
import { ToolArt } from './ToolIcons';

/** Pictures for the comfort choices, drawn in a 96 x 96 box so children can tell them apart at a glance. */

export function ComfortArt({ choice, plush, tool }: { choice: ComfortId; plush: PlushKind; tool: AnyToolId }) {
  switch (choice) {
    case 'cuddle':
      return (
        <svg viewBox="-48 -48 96 96" aria-hidden="true" focusable="false">
          <ShapeList shapes={plushShapes(plush, [0, plush === 'bunny' ? 8 : 2], plush === 'star' ? 1.15 : 1.05)} />
          <path d="M28 -30 C22 -34 18 -30 20 -26 C22 -22 28 -20 28 -20 C28 -20 34 -22 36 -26 C38 -30 34 -34 28 -30 Z" fill={C.berry} />
        </svg>
      );
    case 'song':
      return (
        <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
          <g strokeLinecap="round" strokeLinejoin="round">
            <path d="M34 66 V26 L70 18 V58" fill="none" stroke={C.blueDeep} strokeWidth="6" />
            <path d="M34 30 L70 22" stroke={C.blueDeep} strokeWidth="9" />
            <ellipse cx="27" cy="68" rx="10" ry="8" fill={C.coral} stroke={C.coralDeep} strokeWidth="3" transform="rotate(-18 27 68)" />
            <ellipse cx="63" cy="60" rx="10" ry="8" fill={C.gold} stroke={C.goldDeep} strokeWidth="3" transform="rotate(-18 63 60)" />
            <path d="M14 30 C10 34 10 40 14 44" fill="none" stroke={C.sage} strokeWidth="4" />
            <path d="M82 38 C86 42 86 48 82 52" fill="none" stroke={C.sage} strokeWidth="4" />
          </g>
        </svg>
      );
    case 'pause':
      return (
        <svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">
          <g strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M30 52 V30 C30 26.5 36 26.5 36 30 V46 V20 C36 16.5 42 16.5 42 20 V44 V16 C42 12.5 48 12.5 48 16 V44 V20 C48 16.5 54 16.5 54 20 V50 L60 42 C62.5 39 67 41.5 65 45 L56 62 C52 72 46 78 38 78 C32 78 28 72 28 64 Z"
              fill={C.peach}
              stroke={C.coralDeep}
              strokeWidth="3.2"
            />
            <path d="M70 22 C76 24 80 28 80 34" fill="none" stroke={C.blue} strokeWidth="4" opacity="0.8" />
            <path d="M72 12 C82 15 88 22 89 31" fill="none" stroke={C.blue} strokeWidth="4" opacity="0.5" />
          </g>
        </svg>
      );
    case 'showTool':
      return (
        <svg viewBox="-48 -48 96 96" aria-hidden="true" focusable="false">
          <ShapeList shapes={plushShapes(plush, [-8, 10], 0.85)} />
          <g transform="translate(-4 -44) scale(0.85)">
            <ToolArt tool={tool} />
          </g>
          <path d="M30 18 l3 6 6.5.8-4.8 4.4 1.3 6.4-6-3.3-6 3.3 1.3-6.4-4.8-4.4 6.5-.8z" fill={C.gold} stroke={C.goldDeep} strokeWidth="1.6" />
        </svg>
      );
  }
}

export const COMFORT_LABELS: Record<ComfortId, string> = {
  cuddle: 'Cuddle toy',
  song: 'Gentle song',
  pause: 'Take a pause',
  showTool: 'Show it on the toy first',
};
