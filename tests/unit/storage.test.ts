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
  it('saves and reloads coloring pages and settings', () => {
    const store = new FakeStore();
    new ProgressStore(store).save({ pages: ['pip', 'mochi'], muted: true, calm: true });
    const loaded = new ProgressStore(store).load();
    expect(loaded).toEqual({ pages: ['pip', 'mochi'], muted: true, calm: true });
  });

  it('only ever stores the allowed, non-identifying fields', () => {
    const store = new FakeStore();
    new ProgressStore(store).save({ pages: ['pip'], muted: false, calm: false, ...({ name: 'Ava', age: 5, email: 'a@b.co' } as object) } as never);
    const saved = JSON.parse(store.getItem(STORAGE_KEY)!);
    expect(Object.keys(saved).sort()).toEqual(['calm', 'muted', 'pages']);
  });

  it('drops unknown or repeated pages and keeps book order', () => {
    expect(sanitizeProgress({ pages: ['mochi', 'pip', 'dragonfly', 3, 'pip'], muted: 'yes' })).toEqual({ pages: ['pip', 'mochi'], muted: false, calm: false });
  });

  it('turns stickers saved by the first version into coloring pages', () => {
    const store = new FakeStore();
    store.setItem(STORAGE_KEY, JSON.stringify({ stickers: ['waddles', 'pip'], placements: { pip: 2 }, muted: true, calm: false }));
    const progress = new ProgressStore(store);
    expect(progress.load()).toEqual({ pages: ['pip', 'waddles'], muted: true, calm: false });
    progress.save(progress.load());
    expect(JSON.parse(store.getItem(STORAGE_KEY)!)).toEqual({ pages: ['pip', 'waddles'], muted: true, calm: false });
  });

  it('keeps working in memory when storage is blocked', () => {
    const progress = new ProgressStore(new BrokenStore());
    progress.save({ pages: ['waddles'], muted: false, calm: false });
    expect(progress.load().pages).toEqual(['waddles']);
    expect(() => progress.clear()).not.toThrow();
  });

  it('works with no storage at all', () => {
    const progress = new ProgressStore(null);
    expect(progress.persistent).toBe(false);
    expect(progress.load().pages).toEqual([]);
  });

  it('survives corrupted saved data', () => {
    const store = new FakeStore();
    store.setItem(STORAGE_KEY, '{not json');
    expect(new ProgressStore(store).load().pages).toEqual([]);
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
