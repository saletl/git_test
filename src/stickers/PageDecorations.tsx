import { memo } from 'react';
import { C } from '../art/palette';
import { ShapeList } from '../characters/Creature';
import { PAGE_TITLE, PAGE_TITLE_Y, pageDecorShapes } from './decor';

const DECOR = pageDecorShapes();

export const PageDecorations = memo(function PageDecorations() {
  return (
    <g>
      <ShapeList shapes={DECOR} />
      <text x="150" y={PAGE_TITLE_Y} textAnchor="middle" dominantBaseline="middle" className="book__title" fill={C.forestDeep}>
        {PAGE_TITLE}
      </text>
    </g>
  );
});
