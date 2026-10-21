import type { ToolId } from './types';

/**
 * In-memory flags for this page visit only (never saved), so gentle hints appear at most once.
 */
export const session = {
  waitingHintShown: false,
  /** Tools whose quick "here's how" has already played. */
  toolDemos: new Set<ToolId>(),
};
