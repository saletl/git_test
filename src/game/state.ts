import { PAGE_IDS, type PageId } from '../coloring/catalog';
import type { PatientId } from './types';

/**
 * The game's screens and overlays, as a small, predictable state machine.
 * Every transition is guarded so double taps can't trigger anything twice.
 */
export type Screen =
  | { name: 'welcome' }
  | { name: 'waitingRoom'; entering?: PatientId }
  | { name: 'exam'; patientId: PatientId; visitKey: number }
  | { name: 'visitComplete'; patientId: PatientId; pageId: PageId; firstTime: boolean }
  | { name: 'goodbye'; patientId: PatientId | null; pageId: PageId | null };

export type Overlay = null | 'coloringBook' | 'parentGate' | 'parentArea';

export interface GameState {
  screen: Screen;
  overlay: Overlay;
  /** Coloring pages earned, one per patient, in book order. */
  pages: PageId[];
  /** Increments for each new exam so a fresh visit always starts clean. */
  visitCounter: number;
  /** The newest page, so it can glow in the book. */
  newPage: PageId | null;
}

export type GameAction =
  | { type: 'START' }
  | { type: 'GO_HOME' }
  | { type: 'CHOOSE_PATIENT'; patientId: PatientId }
  | { type: 'ENTER_EXAM'; patientId: PatientId }
  | { type: 'COMPLETE_VISIT'; patientId: PatientId }
  | { type: 'BACK_TO_WAITING_ROOM' }
  | { type: 'EXIT'; patientId?: PatientId | null; earned?: boolean }
  | { type: 'FINISH_GOODBYE' }
  | { type: 'OPEN_OVERLAY'; overlay: Exclude<Overlay, null> }
  | { type: 'CLOSE_OVERLAY' }
  | { type: 'RESET_PAGES' }
  | { type: 'LOAD'; pages: PageId[] };

export function initialGameState(pages: PageId[] = []): GameState {
  return { screen: { name: 'welcome' }, overlay: null, pages, visitCounter: 0, newPage: null };
}

/** Each patient unlocks exactly one page. Replaying keeps the page and never adds a duplicate. */
function award(state: GameState, pageId: PageId): { pages: PageId[]; firstTime: boolean } {
  if (state.pages.includes(pageId)) return { pages: state.pages, firstTime: false };
  return { pages: PAGE_IDS.filter((id) => id === pageId || state.pages.includes(id)), firstTime: true };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START':
      if (state.screen.name !== 'welcome') return state;
      return { ...state, screen: { name: 'waitingRoom' }, overlay: null };

    case 'GO_HOME':
      if (state.screen.name !== 'waitingRoom' || state.screen.entering) return state;
      return { ...state, overlay: null, screen: { name: 'welcome' } };

    case 'CHOOSE_PATIENT':
      if (state.screen.name !== 'waitingRoom' || state.screen.entering || state.overlay) return state;
      return { ...state, screen: { name: 'waitingRoom', entering: action.patientId } };

    case 'ENTER_EXAM':
      if (state.screen.name !== 'waitingRoom' || state.screen.entering !== action.patientId) return state;
      return {
        ...state,
        screen: { name: 'exam', patientId: action.patientId, visitKey: state.visitCounter + 1 },
        visitCounter: state.visitCounter + 1,
      };

    case 'COMPLETE_VISIT': {
      if (state.screen.name !== 'exam' || state.screen.patientId !== action.patientId) return state;
      const pageId: PageId = action.patientId;
      const { pages, firstTime } = award(state, pageId);
      return {
        ...state,
        overlay: null,
        pages,
        newPage: firstTime ? pageId : state.newPage,
        screen: { name: 'visitComplete', patientId: action.patientId, pageId, firstTime },
      };
    }

    case 'BACK_TO_WAITING_ROOM':
      if (state.screen.name === 'welcome' || state.screen.name === 'goodbye') return state;
      return { ...state, overlay: null, screen: { name: 'waitingRoom' } };

    case 'EXIT': {
      if (state.screen.name === 'goodbye') return state;
      let pages = state.pages;
      let pageId: PageId | null = null;
      let newPage = state.newPage;
      // Leaving after a little play still keeps the page. Leaving early simply ends; nothing is lost or mentioned.
      if (action.earned && action.patientId && state.screen.name === 'exam' && state.screen.patientId === action.patientId) {
        const result = award(state, action.patientId);
        pages = result.pages;
        pageId = action.patientId;
        if (result.firstTime) newPage = action.patientId;
      }
      const patientId = action.patientId ?? (state.screen.name === 'exam' || state.screen.name === 'visitComplete' ? state.screen.patientId : null);
      return { ...state, overlay: null, pages, newPage, screen: { name: 'goodbye', patientId, pageId } };
    }

    case 'FINISH_GOODBYE':
      if (state.screen.name !== 'goodbye') return state;
      return { ...state, overlay: null, screen: { name: 'welcome' } };

    case 'OPEN_OVERLAY':
      if (state.overlay === action.overlay) return state;
      if (action.overlay === 'parentArea' && state.overlay !== 'parentGate') return state;
      if (action.overlay === 'coloringBook' && state.screen.name === 'visitComplete') {
        // Closing the book after a visit lands back in the waiting room.
        return { ...state, overlay: 'coloringBook', screen: { name: 'waitingRoom' } };
      }
      return { ...state, overlay: action.overlay };

    case 'CLOSE_OVERLAY': {
      if (!state.overlay) return state;
      return { ...state, overlay: null, newPage: state.overlay === 'coloringBook' ? null : state.newPage };
    }

    case 'RESET_PAGES':
      return { ...state, pages: [], newPage: null };

    case 'LOAD':
      return { ...state, pages: action.pages };
  }
}
