import { sortPages, type PageId } from '../coloring/catalog';

/**
 * Everything the game saves on the device. Nothing here identifies a child:
 * only which coloring pages have been earned, and two display settings.
 */
export interface SavedProgress {
  pages: PageId[];
  muted: boolean;
  calm: boolean;
}

export const STORAGE_KEY = 'curious-creature-clinic.v1';

export const DEFAULT_PROGRESS: SavedProgress = { pages: [], muted: false, calm: false };

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

/**
 * Validates whatever was in storage and drops anything unexpected.
 * Saves from the first version kept "stickers"; each sticker becomes the same patient's coloring page.
 */
export function sanitizeProgress(raw: unknown): SavedProgress {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PROGRESS, pages: [] };
  const value = raw as Record<string, unknown>;
  const source = Array.isArray(value.pages) ? value.pages : Array.isArray(value.stickers) ? value.stickers : [];
  return {
    pages: sortPages(source),
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
    if (!this.store) return { ...DEFAULT_PROGRESS, pages: [] };
    try {
      const text = this.store.getItem(STORAGE_KEY);
      return sanitizeProgress(text ? JSON.parse(text) : null);
    } catch {
      return { ...DEFAULT_PROGRESS, pages: [] };
    }
  }

  load(): SavedProgress {
    return { ...this.memory, pages: [...this.memory.pages] };
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
    this.memory = { ...DEFAULT_PROGRESS, pages: [] };
    if (!this.store) return;
    try {
      this.store.removeItem(STORAGE_KEY);
    } catch {
      // Ignore: nothing else to do.
    }
  }
}
