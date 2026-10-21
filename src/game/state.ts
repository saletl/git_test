import { STICKER_IDS, type StickerId } from '../stickers/catalog';
import type { PatientId } from './types';

/**
 * The game's screens and overlays, as a small, predictable state machine.
 * Every transition is guarded so double taps can't trigger anything twice.
 */
export type Screen =
  | { name: 'welcome' }
  | { name: 'waitingRoom'; entering?: PatientId }
  | { name: 'exam'; patientId: PatientId; visitKey: number }
  | { name: 'visitComplete'; patientId: PatientId; stickerId: StickerId; firstTime: boolean }
  | { name: 'goodbye'; patientId: PatientId | null; stickerId: StickerId | null };

export type Overlay = null | 'stickerBook' | 'parentGate' | 'parentArea';

export interface GameState {
  screen: Screen;
  overlay: Overlay;
  stickers: StickerId[];
  placements: Partial<Record<StickerId, number>>;
  /** Increments for each new exam so a fresh visit always starts clean. */
  visitCounter: number;
  /** The newest sticker, to make it glow in the book. */
  newSticker: StickerId | null;
}

export type GameAction =
  | { type: 'START' }
  | { type: 'GO_HOME' }
  | { type: 'CHOOSE_PATIENT'; patientId: PatientId }
  | { type: 'ENTER_EXAM'; patientId: PatientId }
  | { type: 'COMPLETE_VISIT'; patientId: PatientId }
  | { type: 'BACK_TO_WAITING_ROOM' }
  | { type: 'EXIT'; patientId?: PatientId | null; earnedSticker?: boolean }
  | { type: 'FINISH_GOODBYE' }
  | { type: 'OPEN_OVERLAY'; overlay: Exclude<Overlay, null> }
  | { type: 'CLOSE_OVERLAY' }
  | { type: 'PLACE_STICKER'; stickerId: StickerId; slot: number | null }
  | { type: 'RESET_STICKERS' }
  | { type: 'LOAD'; stickers: StickerId[]; placements: Partial<Record<StickerId, number>> };

export function initialGameState(stickers: StickerId[] = [], placements: Partial<Record<StickerId, number>> = {}): GameState {
  return { screen: { name: 'welcome' }, overlay: null, stickers, placements, visitCounter: 0, newSticker: null };
}

function award(state: GameState, stickerId: StickerId): { stickers: StickerId[]; firstTime: boolean } {
  if (state.stickers.includes(stickerId)) return { stickers: state.stickers, firstTime: false };
  return { stickers: STICKER_IDS.filter((id) => id === stickerId || state.stickers.includes(id)), firstTime: true };
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
      const stickerId: StickerId = action.patientId;
      const { stickers, firstTime } = award(state, stickerId);
      return {
        ...state,
        overlay: null,
        stickers,
        newSticker: firstTime ? stickerId : state.newSticker,
        screen: { name: 'visitComplete', patientId: action.patientId, stickerId, firstTime },
      };
    }

    case 'BACK_TO_WAITING_ROOM':
      if (state.screen.name === 'welcome' || state.screen.name === 'goodbye') return state;
      return { ...state, overlay: null, screen: { name: 'waitingRoom' } };

    case 'EXIT': {
      if (state.screen.name === 'goodbye') return state;
      let stickers = state.stickers;
      let stickerId: StickerId | null = null;
      let newSticker = state.newSticker;
      // Leaving after enough play still keeps the sticker. Leaving early simply ends; nothing is lost or mentioned.
      if (action.earnedSticker && action.patientId && state.screen.name === 'exam' && state.screen.patientId === action.patientId) {
        const result = award(state, action.patientId);
        stickers = result.stickers;
        stickerId = action.patientId;
        if (result.firstTime) newSticker = action.patientId;
      }
      const patientId = action.patientId ?? (state.screen.name === 'exam' || state.screen.name === 'visitComplete' ? state.screen.patientId : null);
      return { ...state, overlay: null, stickers, newSticker, screen: { name: 'goodbye', patientId, stickerId } };
    }

    case 'FINISH_GOODBYE':
      if (state.screen.name !== 'goodbye') return state;
      return { ...state, overlay: null, screen: { name: 'welcome' } };

    case 'OPEN_OVERLAY':
      if (state.overlay === action.overlay) return state;
      if (action.overlay === 'parentArea' && state.overlay !== 'parentGate') return state;
      if (action.overlay === 'stickerBook' && state.screen.name === 'visitComplete') {
        // Closing the book after a visit lands back in the waiting room.
        return { ...state, overlay: 'stickerBook', screen: { name: 'waitingRoom' } };
      }
      return { ...state, overlay: action.overlay };

    case 'CLOSE_OVERLAY': {
      if (!state.overlay) return state;
      return { ...state, overlay: null, newSticker: state.overlay === 'stickerBook' ? null : state.newSticker };
    }

    case 'PLACE_STICKER': {
      if (!state.stickers.includes(action.stickerId)) return state;
      const placements = { ...state.placements };
      if (action.slot === null) {
        delete placements[action.stickerId];
      } else {
        // Dropping onto a taken spot swaps the two stickers.
        const previous = placements[action.stickerId];
        for (const [id, slot] of Object.entries(placements)) {
          if (slot === action.slot && id !== action.stickerId) {
            if (previous === undefined) delete placements[id as StickerId];
            else placements[id as StickerId] = previous;
          }
        }
        placements[action.stickerId] = action.slot;
      }
      return { ...state, placements };
    }

    case 'RESET_STICKERS':
      return { ...state, stickers: [], placements: {}, newSticker: null };

    case 'LOAD':
      return { ...state, stickers: action.stickers, placements: action.placements };
  }
}
