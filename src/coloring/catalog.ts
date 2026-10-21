/**
 * The coloring book: exactly one page per patient, four pages in all.
 * Shared by the game, the PDF builder and the (future) server.
 */
export const PAGE_IDS = ['pip', 'waddles', 'prickle', 'mochi'] as const;
export type PageId = (typeof PAGE_IDS)[number];

export interface PageInfo {
  id: PageId;
  /** The patient's name. */
  name: string;
  /** The adventure's title, printed on the page. */
  title: string;
  /** Short description for screen readers. */
  description: string;
}

export const PAGES: Record<PageId, PageInfo> = {
  pip: {
    id: 'pip',
    name: 'Pip the Dragon',
    title: 'The Case of the Bubble Hiccups',
    description: 'Coloring page: Pip the dragon on the exam table, surrounded by bubbles and doctor tools',
  },
  waddles: {
    id: 'waddles',
    name: 'Waddles the Penguin',
    title: 'The Great Sneezing Mystery',
    description: 'Coloring page: Waddles the penguin on the exam table with a tower of scarves and a surprised hamster',
  },
  prickle: {
    id: 'prickle',
    name: 'Prickle the Porcupine',
    title: 'The Brave Little Checkup',
    description: 'Coloring page: Prickle the porcupine hugging a bunny next to a friendly nurse',
  },
  mochi: {
    id: 'mochi',
    name: 'Mochi the Monster',
    title: 'The Mysterious Tummy',
    description: 'Coloring page: Mochi the monster at a tummy check as the sock hat falls off',
  },
};

export function isPageId(value: unknown): value is PageId {
  return typeof value === 'string' && (PAGE_IDS as readonly string[]).includes(value);
}

/** Keeps pages in book order and drops anything unknown or repeated. */
export function sortPages(pages: readonly unknown[]): PageId[] {
  return PAGE_IDS.filter((id) => pages.includes(id));
}
