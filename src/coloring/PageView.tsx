import { memo } from 'react';
import { ShapeList } from '../characters/Creature';
import { INK, PAPER } from './lineArt';
import { PAGE_H, PAGE_W, pageArt } from './scenes';
import type { PageId } from './catalog';

/** One coloring page as an SVG. Used for thumbnails, the big preview, and the print view. */
export const PageView = memo(function PageView({ id, className, title }: { id: PageId | 'cover'; className?: string; title?: string }) {
  const art = pageArt(id);
  return (
    <svg
      viewBox={`0 0 ${PAGE_W} ${PAGE_H}`}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <rect width={PAGE_W} height={PAGE_H} fill={PAPER} />
      <ShapeList shapes={art.shapes} />
      {art.texts.map((t, i) => (
        <text
          key={i}
          x={t.x}
          y={t.y}
          textAnchor="middle"
          fontSize={t.size}
          fontFamily="Helvetica, Arial, sans-serif"
          fontWeight="700"
          fill={t.style === 'outline' ? PAPER : INK}
          stroke={t.style === 'outline' ? INK : undefined}
          strokeWidth={t.style === 'outline' ? 1.4 : undefined}
        >
          {t.text}
        </text>
      ))}
    </svg>
  );
});
