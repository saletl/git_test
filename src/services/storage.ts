import { STICKER_IDS, isSlotIndex, isStickerId, type StickerId } from '../stickers/catalog';

/**
 * Everything the game saves on the device. Nothing here identifies a child:
 * only which stickers exist in the book, where they sit, and two display settings.
 */
export interface SavedProgress {
  stickers: StickerId[];
  placements: Partial<Record<StickerId, number>>;
  muted: boolean;
  calm: boolean;
}

export const STORAGE_KEY = 'curious-creature-clinic.v1';

export const DEFAULT_PROGRESS: SavedProgress = { stickers: [], placements: {}, muted: false, calm: false };

/** Minimal Storage shape so tests and browsers without storage can supply their own. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function browserStore(): KeyValueStore | null {
  try {
    const store = globalThis.localStorage;
    if (!store) return null;
    const probe = '__ccc_probe__';
    store.setItem(probe, '1');
    store.removeItem(probe);
    return store;
  } catch {
    return null;
  }
}

/** Validates whatever was in storage and drops anything unexpected. */
export function sanitizeProgress(raw: unknown): SavedProgress {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PROGRESS, placements: {} };
  const value = raw as Record<string, unknown>;
  const stickers = Array.isArray(value.stickers)
    ? STICKER_IDS.filter((id) => (value.stickers as unknown[]).includes(id))
    : [];
  const placements: Partial<Record<StickerId, number>> = {};
  const usedSlots = new Set<number>();
  if (value.placements && typeof value.placements === 'object') {
    for (const [id, slot] of Object.entries(value.placements as Record<string, unknown>)) {
      if (isStickerId(id) && stickers.includes(id) && isSlotIndex(slot) && !usedSlots.has(slot)) {
        placements[id] = slot;
        usedSlots.add(slot);
      }
    }
  }
  return {
    stickers,
    placements,
    muted: value.muted === true,
    calm: value.calm === true,
  };
}

export class ProgressStore {
  private memory: SavedProgress;
  private readonly store: KeyValueStore | null;

  constructor(store: KeyValueStore | null = browserStore()) {
    this.store = store;
    this.memory = this.read();
  }

  /** True when progress will survive a page reload. */
  get persistent(): boolean {
    return this.store !== null;
  }

  private read(): SavedProgress {
    if (!this.store) return { ...DEFAULT_PROGRESS, placements: {} };
    try {
      const text = this.store.getItem(STORAGE_KEY);
      return sanitizeProgress(text ? JSON.parse(text) : null);
    } catch {
      return { ...DEFAULT_PROGRESS, placements: {} };
    }
  }

  load(): SavedProgress {
    return { ...this.memory, stickers: [...this.memory.stickers], placements: { ...this.memory.placements } };
  }

  save(progress: SavedProgress): void {
    this.memory = sanitizeProgress(progress);
    if (!this.store) return;
    try {
      this.store.setItem(STORAGE_KEY, JSON.stringify(this.memory));
    } catch {
      // Storage can be full or blocked (private browsing). The game keeps working from memory.
    }
  }

  clear(): void {
    this.memory = { ...DEFAULT_PROGRESS, placements: {} };
    if (!this.store) return;
    try {
      this.store.removeItem(STORAGE_KEY);
    } catch {
      // Ignore: nothing else to do.
    }
  }
}
