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

  it('awards the coloring page once, even if "finish" is tapped twice', () => {
    const exam = toExam();
    const done = gameReducer(exam, { type: 'COMPLETE_VISIT', patientId: 'pip' });
    expect(done.pages).toEqual(['pip']);
    expect(done.screen).toMatchObject({ name: 'visitComplete', pageId: 'pip', firstTime: true });
    const doubleTap = gameReducer(done, { type: 'COMPLETE_VISIT', patientId: 'pip' });
    expect(doubleTap).toBe(done);
  });

  it('does not duplicate a page earned again on a later visit', () => {
    const first = gameReducer(toExam(), { type: 'COMPLETE_VISIT', patientId: 'pip' });
    const back = gameReducer(first, { type: 'BACK_TO_WAITING_ROOM' });
    let s = gameReducer(back, { type: 'CHOOSE_PATIENT', patientId: 'pip' });
    s = gameReducer(s, { type: 'ENTER_EXAM', patientId: 'pip' });
    const second = gameReducer(s, { type: 'COMPLETE_VISIT', patientId: 'pip' });
    expect(second.pages).toEqual(['pip']);
    expect(second.screen).toMatchObject({ firstTime: false });
  });

  it('keeps pages in book order', () => {
    const s = initialGameState(['mochi']);
    let x = gameReducer(s, { type: 'START' });
    x = gameReducer(x, { type: 'CHOOSE_PATIENT', patientId: 'pip' });
    x = gameReducer(x, { type: 'ENTER_EXAM', patientId: 'pip' });
    x = gameReducer(x, { type: 'COMPLETE_VISIT', patientId: 'pip' });
    expect(x.pages).toEqual(['pip', 'mochi']);
  });

  it('exits from every child screen straight to goodbye, with no page when leaving early', () => {
    const fromWelcome = gameReducer(initialGameState(), { type: 'EXIT' });
    expect(fromWelcome.screen.name).toBe('goodbye');
    const fromWaiting = gameReducer(gameReducer(initialGameState(), { type: 'START' }), { type: 'EXIT' });
    expect(fromWaiting.screen).toEqual({ name: 'goodbye', patientId: null, pageId: null });
    const early = gameReducer(toExam(), { type: 'EXIT', patientId: 'pip', earned: false });
    expect(early.screen).toEqual({ name: 'goodbye', patientId: 'pip', pageId: null });
    expect(early.pages).toEqual([]);
    const withBook = gameReducer({ ...toExam(), overlay: 'coloringBook' }, { type: 'EXIT', patientId: 'pip' });
    expect(withBook.overlay).toBeNull();
    expect(withBook.screen.name).toBe('goodbye');
  });

  it('keeps the page when leaving after a little play', () => {
    const s = gameReducer(toExam(), { type: 'EXIT', patientId: 'pip', earned: true });
    expect(s.pages).toEqual(['pip']);
    expect(s.screen).toEqual({ name: 'goodbye', patientId: 'pip', pageId: 'pip' });
  });

  it('only opens the parent area through the gate', () => {
    const s = initialGameState();
    expect(gameReducer(s, { type: 'OPEN_OVERLAY', overlay: 'parentArea' })).toBe(s);
    const gate = gameReducer(s, { type: 'OPEN_OVERLAY', overlay: 'parentGate' });
    expect(gameReducer(gate, { type: 'OPEN_OVERLAY', overlay: 'parentArea' }).overlay).toBe('parentArea');
  });

  it('opening the book after a visit returns to the waiting room when closed', () => {
    const done = gameReducer(toExam(), { type: 'COMPLETE_VISIT', patientId: 'pip' });
    const book = gameReducer(done, { type: 'OPEN_OVERLAY', overlay: 'coloringBook' });
    expect(book.overlay).toBe('coloringBook');
    const closed = gameReducer(book, { type: 'CLOSE_OVERLAY' });
    expect(closed.screen.name).toBe('waitingRoom');
    expect(closed.newPage).toBeNull();
  });

  it('unlocks exactly one page per patient, and four pages fill the book', () => {
    let s: GameState = initialGameState();
    for (const id of ['mochi', 'pip', 'prickle', 'waddles', 'pip'] as const) {
      s = gameReducer(s, { type: 'START' });
      s = gameReducer({ ...s, screen: { name: 'waitingRoom' } }, { type: 'CHOOSE_PATIENT', patientId: id });
      s = gameReducer(s, { type: 'ENTER_EXAM', patientId: id });
      s = gameReducer(s, { type: 'COMPLETE_VISIT', patientId: id });
      expect(s.screen).toMatchObject({ name: 'visitComplete', pageId: id });
    }
    expect(s.pages).toEqual(['pip', 'waddles', 'prickle', 'mochi']);
  });

  it('starts a fresh book when a grown-up resets it', () => {
    const s = gameReducer(initialGameState(['pip', 'mochi']), { type: 'RESET_PAGES' });
    expect(s.pages).toEqual([]);
    expect(s.newPage).toBeNull();
  });

  it('goodbye always returns to the start screen', () => {
    const bye = gameReducer(toExam(), { type: 'EXIT' });
    expect(gameReducer(bye, { type: 'FINISH_GOODBYE' }).screen.name).toBe('welcome');
  });
});
