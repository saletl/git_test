import type { LensDiscovery, Reaction } from '../types';

/**
 * Small reaction building blocks shared by every patient. Each patient still decides
 * the words, faces and animations, so the four visits look and feel different.
 */

/** Take a break: the tools go away and a soft breathing circle grows and shrinks. */
export function breakReaction(say: string, after: Reaction = []): Reaction {
  return [
    { ms: 500, toolAt: null, item: null, popup: null, expression: 'calm', say },
    { ms: 2000, sound: 'breath', action: 'breathe', expression: 'calm', look: 'up', effects: [{ kind: 'breathe', at: 'chest' }] },
    { ms: 400, look: null },
    ...after,
  ];
}

/** Play music: a little music box appears beside the patient and plays. */
export function musicReaction(say: string, action: string, after: Reaction = []): Reaction {
  return [
    { ms: 400, item: { kind: 'musicBox', at: 'side' }, expression: 'curious', look: 'downRight' },
    { ms: 2800, sound: 'song', action, look: null, expression: 'calm', effects: [{ kind: 'note', at: 'side', count: 4 }], say },
    { ms: 400, item: null, expression: 'happy' },
    ...after,
  ];
}

/** Hold a hand: a friendly hand reaches in and holds the patient's hand. */
export function handReaction(say: string, after: Reaction = []): Reaction {
  return [
    { ms: 500, item: { kind: 'helperHand', at: 'hand' }, expression: 'surprised', look: 'right' },
    { ms: 1600, expression: 'happy', look: null, action: 'smallBounce', effects: [{ kind: 'heart', at: 'hand', count: 3 }], say },
    { ms: 500, item: null, expression: 'calm' },
    ...after,
  ];
}

/** Say "ahh": a pretend tongue depressor and the light, then a magnified, clearly made-up surprise. */
export function throatReaction(discovery: LensDiscovery, say: string, after: Reaction = []): Reaction {
  return [
    { ms: 450, toolAt: { tool: 'tongue', at: 'mouth' }, expression: 'ahh', say: 'Say ahh!' },
    { ms: 1900, popup: { kind: 'lens', discovery, view: 'throat' }, expression: 'ahh', sound: 'sparkle', say },
    { ms: 600, popup: null, toolAt: null, expression: 'giggle' },
    ...after,
  ];
}

/** Look in an ear with the light. */
export function earReaction(discovery: LensDiscovery, say: string, action = 'tiltR', after: Reaction = []): Reaction {
  return [
    { ms: 400, toolAt: { tool: 'light', at: 'ear' }, action, expression: 'curious' },
    { ms: 1800, popup: { kind: 'lens', discovery, view: 'ear' }, sound: 'sparkle', say },
    { ms: 600, popup: null, toolAt: null, expression: 'excited' },
    ...after,
  ];
}

/** The quick "stick" moment every bandage gets before the patient's own reaction. */
export const stick = (expression: Reaction[number]['expression'] = 'surprised', look?: Reaction[number]['look']): Reaction[number] => ({
  ms: 380,
  expression,
  look,
  sound: 'stick',
});
