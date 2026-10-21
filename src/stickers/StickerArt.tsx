import { memo } from 'react';
import { ShapeList } from '../characters/Creature';
import { emptySlotShapes, stickerShapes } from './art';
import type { StickerId } from './catalog';

export const StickerArt = memo(function StickerArt({ id, className }: { id: StickerId; className?: string }) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} aria-hidden="true" focusable="false" overflow="visible">
      <ShapeList shapes={stickerShapes(id)} />
    </svg>
  );
});

export const EmptySticker = memo(function EmptySticker({ className }: { className?: string }) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} aria-hidden="true" focusable="false">
      <ShapeList shapes={emptySlotShapes()} />
    </svg>
  );
});
