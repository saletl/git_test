import { describe, expect, it } from 'vitest';
import { ProgressStore, sanitizeProgress, STORAGE_KEY, type KeyValueStore } from '../../src/services/storage';
import { resolveOffice } from '../../src/config/office';

class FakeStore implements KeyValueStore {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}

class BrokenStore implements KeyValueStore {
  getItem(): string | null {
    throw new Error('blocked');
  }
  setItem(): void {
    throw new Error('blocked');
  }
  removeItem(): void {
    throw new Error('blocked');
  }
}

describe('local progress', () => {
  it('saves and reloads stickers, placements and settings', () => {
    const store = new FakeStore();
    new ProgressStore(store).save({ stickers: ['pip', 'mochi'], placements: { pip: 2 }, muted: true, calm: true });
    const loaded = new ProgressStore(store).load();
    expect(loaded).toEqual({ stickers: ['pip', 'mochi'], placements: { pip: 2 }, muted: true, calm: true });
  });

  it('only ever stores the allowed, non-identifying fields', () => {
    const store = new FakeStore();
    new ProgressStore(store).save({ stickers: ['pip'], placements: {}, muted: false, calm: false, ...({ name: 'Ava', age: 5 } as object) } as never);
    const saved = JSON.parse(store.getItem(STORAGE_KEY)!);
    expect(Object.keys(saved).sort()).toEqual(['calm', 'muted', 'placements', 'stickers']);
  });

  it('drops unknown stickers, bad spots and placements for stickers not earned', () => {
    expect(
      sanitizeProgress({ stickers: ['pip', 'dragonfly', 3], placements: { pip: 9, mochi: 1, dragonfly: 0 }, muted: 'yes' }),
    ).toEqual({ stickers: ['pip'], placements: {}, muted: false, calm: false });
  });

  it('keeps working in memory when storage is blocked', () => {
    const progress = new ProgressStore(new BrokenStore());
    progress.save({ stickers: ['waddles'], placements: { waddles: 0 }, muted: false, calm: false });
    expect(progress.load().stickers).toEqual(['waddles']);
    expect(() => progress.clear()).not.toThrow();
  });

  it('works with no storage at all', () => {
    const progress = new ProgressStore(null);
    expect(progress.persistent).toBe(false);
    expect(progress.load().stickers).toEqual([]);
  });

  it('survives corrupted saved data', () => {
    const store = new FakeStore();
    store.setItem(STORAGE_KEY, '{not json');
    expect(new ProgressStore(store).load().stickers).toEqual([]);
  });
});

describe('office links', () => {
  const registry = { 'sunny-kids': { displayName: 'Sunny Kids Pediatrics', welcomeMessage: 'Hi!', logoSrc: '/offices/sunny.svg' } };
  it('shows only offices from the registry', () => {
    expect(resolveOffice('?office=sunny-kids', registry)?.displayName).toBe('Sunny Kids Pediatrics');
    expect(resolveOffice('?office=SUNNY-KIDS', registry)?.displayName).toBe('Sunny Kids Pediatrics');
    expect(resolveOffice('?office=someone-else', registry)).toBeNull();
    expect(resolveOffice('?office=<script>', registry)).toBeNull();
    expect(resolveOffice('?office=__proto__', registry)).toBeNull();
    expect(resolveOffice('', registry)).toBeNull();
  });
  it('rejects unsafe logo paths', () => {
    const bad = { x1: { displayName: 'X', logoSrc: 'https://evil.example/logo.svg' }, x2: { displayName: 'Y', logoSrc: '/../../etc' } };
    expect(resolveOffice('?office=x1', bad)?.logoSrc).toBeUndefined();
    expect(resolveOffice('?office=x2', bad)?.logoSrc).toBeUndefined();
  });
});
