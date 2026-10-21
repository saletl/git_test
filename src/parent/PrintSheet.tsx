import { createPortal } from 'react-dom';
import { ShapeList } from '../characters/Creature';
import { stickerShapes } from '../stickers/art';
import { BOOK_SLOTS, PAGE_HEIGHT, PAGE_WIDTH, STICKERS, STICKER_SIZE, type PlacedSticker } from '../stickers/catalog';
import { PageDecorations } from '../stickers/PageDecorations';

/**
 * A print-only copy of the sticker book, for "Print" and for devices that can't save PDFs.
 * Hidden on screen; shown by the print stylesheet.
 */
export function PrintSheet({ stickers }: { stickers: PlacedSticker[] }) {
  const names = stickers.map((s) => STICKERS[s.id].name).join(', ');
  return createPortal(
    <div className="print-sheet" aria-hidden="true">
      <h1>My Curious Creature Clinic</h1>
      <h2>Sticker Book</h2>
      <p className="print-sheet__owner">
        This sticker book belongs to: <span />
      </p>
      <div className="print-sheet__page">
        <svg viewBox={`0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}`}>
          <PageDecorations />
          {stickers.map(({ id, slot }) => {
            const s = BOOK_SLOTS[slot]!;
            return (
              <g key={id} transform={`translate(${s.x} ${s.y}) rotate(${s.rotate}) scale(${STICKER_SIZE / 200})`}>
                <ShapeList shapes={stickerShapes(id)} />
              </g>
            );
          })}
        </svg>
      </div>
      <p className="print-sheet__names">{stickers.length === 1 ? 'Sticker collected' : 'Stickers collected'}: {names}</p>
      <p className="print-sheet__credit">Created with care by The Burrow Parenting · theburrowparenting.com</p>
    </div>,
    document.body,
  );
}
