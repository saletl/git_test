import type { BandageStyle, CreatureProps } from '../art/creature';
import type {
  AnyToolId,
  BandageSpot,
  ComfortId,
  PatientDefinition,
  Point,
  Reaction,
  ReactionContext,
  ToolId,
  VisitState,
} from './types';

/** After this many meaningful interactions, the "feeling better" button appears. */
export const FINISH_AFTER = 3;

export const MAX_BANDAGES = 4;

export function startVisit(def: PatientDefinition): VisitState {
  return {
    patientId: def.id,
    interactions: 0,
    toolUses: {},
    comfortUses: {},
    pokes: 0,
    bandages: [],
    issue: def.issueStart,
    comforted: false,
    shotDone: false,
    feelsBetter: false,
  };
}

export function canFinish(visit: VisitState): boolean {
  return visit.interactions >= FINISH_AFTER;
}

export type VisitEvent =
  | { type: 'tool'; tool: Exclude<ToolId, 'bandage'> }
  | { type: 'bandage'; spot: string; style: BandageStyle }
  | { type: 'special' }
  | { type: 'comfort'; choice: ComfortId }
  | { type: 'poke' };

export function pick<T>(variants: readonly T[], use: number): T {
  return variants[(Math.max(1, use) - 1) % variants.length]!;
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function nearestBandageSpot(spots: readonly BandageSpot[], point: Point | null): BandageSpot {
  if (!point) return spots[0]!;
  let best = spots[0]!;
  let bestDistance = Infinity;
  for (const spot of spots) {
    const d = distance(spot.at, point);
    if (d < bestDistance) {
      best = spot;
      bestDistance = d;
    }
  }
  return best;
}

interface Outcome {
  visit: VisitState;
  reaction: Reaction;
  /** True the moment the patient's silly problem is all better. */
  justFeltBetter: boolean;
}

/**
 * The single place where play changes a visit. Pure: returns the next visit state and the reaction to play.
 * Nothing here can fail or punish; every event leads to a reaction.
 */
export function applyEvent(
  def: PatientDefinition,
  visit: VisitState,
  event: VisitEvent,
  props: CreatureProps,
  selectedTool: AnyToolId | null,
  point: Point | null = null,
): Outcome {
  const next: VisitState = {
    ...visit,
    toolUses: { ...visit.toolUses },
    comfortUses: { ...visit.comfortUses },
    bandages: [...visit.bandages],
  };
  let reaction: Reaction;
  let meaningful = true;
  let use: number;

  switch (event.type) {
    case 'tool': {
      use = (next.toolUses[event.tool] ?? 0) + 1;
      next.toolUses[event.tool] = use;
      reaction = def.tools[event.tool](ctx(next, props, selectedTool, use));
      break;
    }
    case 'bandage': {
      use = (next.toolUses.bandage ?? 0) + 1;
      next.toolUses.bandage = use;
      const spot = def.bandageSpots.find((s) => s.id === event.spot) ?? def.bandageSpots[0]!;
      next.bandages = next.bandages.filter((b) => b.spot !== spot.id);
      next.bandages.push({ spot: spot.id, style: event.style });
      if (next.bandages.length > MAX_BANDAGES) next.bandages.shift();
      reaction = spot.reaction(ctx(next, props, selectedTool, use));
      break;
    }
    case 'special': {
      if (!def.special) return { visit, reaction: [], justFeltBetter: false };
      use = (next.toolUses[def.special.tool] ?? 0) + 1;
      next.toolUses[def.special.tool] = use;
      reaction = def.special.apply(ctx(next, props, selectedTool, use));
      next.shotDone = true;
      const after = def.special.bandageAfter;
      if (after) {
        next.bandages = next.bandages.filter((b) => b.spot !== after.spot);
        next.bandages.push({ spot: after.spot, style: after.style });
        if (next.bandages.length > MAX_BANDAGES) next.bandages.shift();
      }
      break;
    }
    case 'comfort': {
      use = (next.comfortUses[event.choice] ?? 0) + 1;
      next.comfortUses[event.choice] = use;
      reaction = def.comfort[event.choice](ctx(next, props, selectedTool, use));
      next.comforted = true;
      break;
    }
    case 'poke': {
      meaningful = false;
      next.pokes += 1;
      const zone = point
        ? def.pokes
            .filter((z) => distance(z.at, point) <= z.radius)
            .sort((a, b) => distance(a.at, point) - distance(b.at, point))[0]
        : undefined;
      reaction = (zone?.reaction ?? def.defaultPoke)(ctx(next, props, selectedTool, next.pokes));
      break;
    }
  }

  let justFeltBetter = false;
  if (meaningful) {
    next.interactions += 1;
    if (next.issue > 0) {
      // Prickle's worry only eases with comfort; everyone else's silly problem eases with any care.
      const eases = def.id !== 'prickle' || event.type === 'comfort';
      if (eases) next.issue -= 1;
    }
    if (next.issue === 0 && !next.feelsBetter) {
      next.feelsBetter = true;
      justFeltBetter = true;
      reaction = [...reaction, ...def.feelsBetter];
    }
  }
  return { visit: next, reaction, justFeltBetter };
}

function ctx(visit: VisitState, props: CreatureProps, selectedTool: AnyToolId | null, use: number): ReactionContext {
  return { visit, props, selectedTool, use };
}

/** Total comfort choices made this visit. */
export function comfortCount(visit: VisitState): number {
  return Object.values(visit.comfortUses).reduce((sum, n) => sum + (n ?? 0), 0);
}
