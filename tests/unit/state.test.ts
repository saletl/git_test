import { describe, expect, it } from 'vitest';
import { gameReducer, initialGameState, type GameState } from '../../src/game/state';

const toExam = (state: GameState = initialGameState()) => {
  let s = gameReducer(state, { type: 'START' });
  s = gameReducer(s, { type: 'CHOOSE_PATIENT', patientId: 'pip' });
  s = gameReducer(s, { type: 'ENTER_EXAM', patientId: 'pip' });
  return s;
};

describe('game state transitions', () => {
  it('goes welcome -> waiting room -> exam', () => {
    const s = toExam();
    expect(s.screen).toMatchObject({ name: 'exam', patientId: 'pip' });
  });

  it('ignores a second patient tap while one is already walking to the exam room', () => {
    let s = gameReducer(initialGameState(), { type: 'START' });
    s = gameReducer(s, { type: 'CHOOSE_PATIENT', patientId: 'pip' });
    const again = gameReducer(s, { type: 'CHOOSE_PATIENT', patientId: 'mochi' });
    expect(again).toBe(s);
    expect(gameReducer(s, { type: 'ENTER_EXAM', patientId: 'mochi' })).toBe(s);
  });

  it('awards the sticker once, even if "finish" is tapped twice', () => {
    const exam = toExam();
    const done = gameReducer(exam, { type: 'COMPLETE_VISIT', patientId: 'pip' });
    expect(done.stickers).toEqual(['pip']);
    expect(done.screen).toMatchObject({ name: 'visitComplete', stickerId: 'pip', firstTime: true });
    const doubleTap = gameReducer(done, { type: 'COMPLETE_VISIT', patientId: 'pip' });
    expect(doubleTap).toBe(done);
  });

  it('does not duplicate a sticker collected again on a later visit', () => {
    const first = gameReducer(toExam(), { type: 'COMPLETE_VISIT', patientId: 'pip' });
    const back = gameReducer(first, { type: 'BACK_TO_WAITING_ROOM' });
    let s = gameReducer(back, { type: 'CHOOSE_PATIENT', patientId: 'pip' });
    s = gameReducer(s, { type: 'ENTER_EXAM', patientId: 'pip' });
    const second = gameReducer(s, { type: 'COMPLETE_VISIT', patientId: 'pip' });
    expect(second.stickers).toEqual(['pip']);
    expect(second.screen).toMatchObject({ firstTime: false });
  });

  it('keeps stickers in catalog order', () => {
    const s = initialGameState(['mochi']);
    let x = gameReducer(s, { type: 'START' });
    x = gameReducer(x, { type: 'CHOOSE_PATIENT', patientId: 'pip' });
    x = gameReducer(x, { type: 'ENTER_EXAM', patientId: 'pip' });
    x = gameReducer(x, { type: 'COMPLETE_VISIT', patientId: 'pip' });
    expect(x.stickers).toEqual(['pip', 'mochi']);
  });

  it('exits from every child screen straight to goodbye, with no sticker when leaving early', () => {
    const fromWelcome = gameReducer(initialGameState(), { type: 'EXIT' });
    expect(fromWelcome.screen.name).toBe('goodbye');
    const fromWaiting = gameReducer(gameReducer(initialGameState(), { type: 'START' }), { type: 'EXIT' });
    expect(fromWaiting.screen).toEqual({ name: 'goodbye', patientId: null, stickerId: null });
    const early = gameReducer(toExam(), { type: 'EXIT', patientId: 'pip', earnedSticker: false });
    expect(early.screen).toEqual({ name: 'goodbye', patientId: 'pip', stickerId: null });
    expect(early.stickers).toEqual([]);
    const withBook = gameReducer({ ...toExam(), overlay: 'stickerBook' }, { type: 'EXIT', patientId: 'pip' });
    expect(withBook.overlay).toBeNull();
    expect(withBook.screen.name).toBe('goodbye');
  });

  it('keeps the sticker when leaving after enough play', () => {
    const s = gameReducer(toExam(), { type: 'EXIT', patientId: 'pip', earnedSticker: true });
    expect(s.stickers).toEqual(['pip']);
    expect(s.screen).toEqual({ name: 'goodbye', patientId: 'pip', stickerId: 'pip' });
  });

  it('only opens the parent area through the gate', () => {
    const s = initialGameState();
    expect(gameReducer(s, { type: 'OPEN_OVERLAY', overlay: 'parentArea' })).toBe(s);
    const gate = gameReducer(s, { type: 'OPEN_OVERLAY', overlay: 'parentGate' });
    expect(gameReducer(gate, { type: 'OPEN_OVERLAY', overlay: 'parentArea' }).overlay).toBe('parentArea');
  });

  it('opening stickers after a visit returns to the waiting room when closed', () => {
    const done = gameReducer(toExam(), { type: 'COMPLETE_VISIT', patientId: 'pip' });
    const book = gameReducer(done, { type: 'OPEN_OVERLAY', overlay: 'stickerBook' });
    expect(book.overlay).toBe('stickerBook');
    const closed = gameReducer(book, { type: 'CLOSE_OVERLAY' });
    expect(closed.screen.name).toBe('waitingRoom');
    expect(closed.newSticker).toBeNull();
  });

  it('places, swaps and removes stickers', () => {
    let s = initialGameState(['pip', 'mochi']);
    s = gameReducer(s, { type: 'PLACE_STICKER', stickerId: 'pip', slot: 1 });
    s = gameReducer(s, { type: 'PLACE_STICKER', stickerId: 'mochi', slot: 3 });
    expect(s.placements).toEqual({ pip: 1, mochi: 3 });
    s = gameReducer(s, { type: 'PLACE_STICKER', stickerId: 'mochi', slot: 1 });
    expect(s.placements).toEqual({ pip: 3, mochi: 1 });
    s = gameReducer(s, { type: 'PLACE_STICKER', stickerId: 'pip', slot: null });
    expect(s.placements).toEqual({ mochi: 1 });
    expect(gameReducer(s, { type: 'PLACE_STICKER', stickerId: 'waddles', slot: 0 })).toBe(s);
  });

  it('goodbye always returns to the start screen', () => {
    const bye = gameReducer(toExam(), { type: 'EXIT' });
    expect(gameReducer(bye, { type: 'FINISH_GOODBYE' }).screen.name).toBe('welcome');
  });
});
