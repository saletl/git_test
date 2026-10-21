/**
 * The sticker catalog. Shared by the game, the PDF export, and the server.
 * Each patient awards exactly one sticker with the same id.
 */
export const STICKER_IDS = ['pip', 'waddles', 'prickle', 'mochi'] as const;
export type StickerId = (typeof STICKER_IDS)[number];

export interface StickerInfo {
  id: StickerId;
  /** Name printed under the sticker in the keepsake. */
  name: string;
  /** Short description for screen readers. */
  description: string;
}

export const STICKERS: Record<StickerId, StickerInfo> = {
  pip: { id: 'pip', name: 'Pip the Dragon', description: 'Pip the dragon floating inside a shiny bubble' },
  waddles: { id: 'waddles', name: 'Waddles the Penguin', description: 'Waddles the penguin wearing a giant stack of scarves' },
  prickle: { id: 'prickle', name: 'Prickle the Porcupine', description: 'Prickle the porcupine hugging a stuffed bunny' },
  mochi: { id: 'mochi', name: 'Mochi the Monster', description: 'Mochi the monster wearing an enormous silly sock hat' },
};

export function isStickerId(value: unknown): value is StickerId {
  return typeof value === 'string' && (STICKER_IDS as readonly string[]).includes(value);
}

/**
 * Spots on the scrapbook page where stickers can go.
 * Coordinates are in "page units" on a 300 x 380 page. Rotation is in degrees (clockwise).
 */
export interface BookSlot {
  x: number;
  y: number;
  rotate: number;
}

export const PAGE_WIDTH = 300;
export const PAGE_HEIGHT = 380;
export const STICKER_SIZE = 104;

export const BOOK_SLOTS: readonly BookSlot[] = [
  { x: 82, y: 100, rotate: -6 },
  { x: 218, y: 92, rotate: 5 },
  { x: 150, y: 196, rotate: 2 },
  { x: 78, y: 292, rotate: 4 },
  { x: 222, y: 296, rotate: -5 },
  { x: 150, y: 338, rotate: -2 },
];

export const BOOK_SLOT_COUNT = BOOK_SLOTS.length;

export function isSlotIndex(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < BOOK_SLOT_COUNT;
}

export interface PlacedSticker {
  id: StickerId;
  slot: number;
}

/**
 * Turns the collected stickers and saved placements into a full layout.
 * Stickers the child placed keep their spot; any unplaced stickers fill free spots in order.
 */
export function layoutStickers(
  collected: readonly StickerId[],
  placements: Partial<Record<StickerId, number>>,
): PlacedSticker[] {
  const used = new Set<number>();
  const result: PlacedSticker[] = [];
  const pending: StickerId[] = [];
  for (const id of STICKER_IDS) {
    if (!collected.includes(id)) continue;
    const slot = placements[id];
    if (isSlotIndex(slot) && !used.has(slot)) {
      used.add(slot);
      result.push({ id, slot });
    } else {
      pending.push(id);
    }
  }
  for (const id of pending) {
    for (let slot = 0; slot < BOOK_SLOT_COUNT; slot++) {
      if (!used.has(slot)) {
        used.add(slot);
        result.push({ id, slot });
        break;
      }
    }
  }
  return result.sort((a, b) => a.slot - b.slot);
}
