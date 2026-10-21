import { createPortal } from 'react-dom';
import type { PageId } from '../coloring/catalog';
import { PageView } from '../coloring/PageView';

/**
 * A print-only copy of the coloring book (cover plus earned pages, one per sheet),
 * for the Print button and for devices that can't save PDFs. Hidden on screen; shown by the print stylesheet.
 */
export function PrintSheet({ pages }: { pages: PageId[] }) {
  return createPortal(
    <div className="print-sheet" aria-hidden="true">
      {(['cover', ...pages] as const).map((id) => (
        <div key={id} className="print-sheet__page">
          <PageView id={id} />
        </div>
      ))}
    </div>,
    document.body,
  );
}
