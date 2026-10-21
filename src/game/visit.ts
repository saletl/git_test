import type { BandageStyle, CreatureProps } from '../art/creature';
import type {
  BodyRegion,
  ComfortId,
  LookTarget,
  PatientDefinition,
  PlacedBandage,
  Point,
  Reaction,
  ReactionContext,
  VisitState,
} from './types';

/** After this many meaningful interactions, the "feeling better" button appears. Finishing never requires more. */
export const FINISH_AFTER = 2;

/** Older bandages make room for new ones past this many. */
export const MAX_BANDAGES = 12;

export function startVisit(def: PatientDefinition): VisitState {
  return {
    patientId: def.id,
    interactions: 0,
    uses: {},
    pokes: 0,
    bandages: [],
    nextBandageId: 1,
    issue: def.issueStart,
    comforted: false,
    shotDone: false,
    feelsBetter: false,
    discoveries: {},
    helped: [],
  };
}

export function canFinish(visit: VisitState): boolean {
  return visit.interactions >= FINISH_AFTER;
}

/**
 * Everything a child can do during a visit. `key` values (like "tool:stethoscope" or "act:bubbles:pop")
 * count uses, fill chart discoveries, and decide what eases the patient's silly problem.
 */
export type VisitEvent =
  | { type: 'tool'; tool: 'stethoscope' | 'thermometer' }
  | { type: 'look'; target: LookTarget }
  | { type: 'comfort'; choice: ComfortId }
  | { type: 'bandage'; at: Point; style: BandageStyle }
  | { type: 'moveBandage'; id: number; at: Point }
  | { type: 'removeBandage'; id: number }
  | { type: 'setBandages'; bandages: PlacedBandage[] }
  | {
      /** A step inside a patient's mini-adventure. The activity supplies its own reaction. */
      type: 'act';
      key: string;
      reaction: (ctx: ReactionContext) => Reaction;
      /** Adds to "what helped" on the chart. */
      helped?: string;
      /** Not every step counts toward finishing (popping the tenth bubble, for example). */
      meaningful?: boolean;
      shot?: boolean;
    }
  | { type: 'poke' };

export function pick<T>(variants: readonly T[], use: number): T {
  return variants[(Math.max(1, use) - 1) % variants.length]!;
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function timesUsed(visit: VisitState, key: string): number {
  return visit.uses[key] ?? 0;
}

/** How far a point is inside an ellipse: 0 at the center, 1 on the edge. */
function ellipseDepth(r: BodyRegion, [x, y]: Point): number {
  return Math.hypot((x - r.cx) / r.rx, (y - r.cy) / r.ry);
}

/**
 * Finds where a bandage should stick. Points on the patient stay exactly where they were tapped;
 * points just off the patient slide onto the nearest edge, so nothing ever lands in thin air.
 */
export function placeOnBody(regions: readonly BodyRegion[], point: Point): { at: Point; part: string } {
  let inside: BodyRegion | null = null;
  let nearest = regions[0]!;
  let nearestDepth = Infinity;
  for (const r of regions) {
    const depth = ellipseDepth(r, point);
    // Regions are listed back to front, so the last one containing the point is the one on top.
    if (depth <= 1) inside = r;
    if (depth < nearestDepth) {
      nearest = r;
      nearestDepth = depth;
    }
  }
  if (inside) return { at: [round(point[0]), round(point[1])], part: inside.part };
  // Slide onto the edge of the nearest region, slightly inside so it looks stuck on.
  const scale = 0.92 / nearestDepth;
  const at: Point = [round(nearest.cx + (point[0] - nearest.cx) * scale), round(nearest.cy + (point[1] - nearest.cy) * scale)];
  return { at, part: nearest.part };
}

const round = (n: number) => Math.round(n * 10) / 10;

/** Small, playful tilt so bandages look hand-placed. Deterministic, so tests and replays match. */
function tiltFor(id: number, at: Point): number {
  return (((id * 37 + Math.round(at[0] + at[1])) % 41) - 20) * 1.1;
}

/** Looks up the chart discovery for an event key: exact match first, then wildcards like "comfort:*". */
export function discoveryFor(def: PatientDefinition, key: string): string | undefined {
  if (def.discoverOn[key]) return def.discoverOn[key];
  const parts = key.split(':');
  for (let n = parts.length - 1; n >= 1; n--) {
    const wild = `${parts.slice(0, n).join(':')}:*`;
    if (def.discoverOn[wild]) return def.discoverOn[wild];
  }
  return undefined;
}

export interface Outcome {
  visit: VisitState;
  reaction: Reaction;
  /** True the moment the patient's silly problem is all better. */
  justFeltBetter: boolean;
  /** The chart discovery filled by this event, if it was new. */
  discovered: string | null;
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
  point: Point | null = null,
): Outcome {
  const next: VisitState = {
    ...visit,
    uses: { ...visit.uses },
    bandages: [...visit.bandages],
    discoveries: { ...visit.discoveries },
    helped: [...visit.helped],
  };
  let reaction: Reaction = [];
  let meaningful = true;
  let key: string;

  const count = (k: string) => {
    const use = (next.uses[k] ?? 0) + 1;
    next.uses[k] = use;
    return use;
  };
  const ctx = (use: number, at: Point | null = point): ReactionContext => ({ visit: next, props, use, point: at });

  switch (event.type) {
    case 'tool': {
      key = `tool:${event.tool}`;
      reaction = def.tools[event.tool](ctx(count(key)));
      break;
    }
    case 'look': {
      key = `look:${event.target}`;
      reaction = def.look[event.target](ctx(count(key)));
      break;
    }
    case 'comfort': {
      key = `comfort:${event.choice}`;
      reaction = def.comfort[event.choice](ctx(count(key)));
      next.comforted = true;
      if (!next.helped.includes(key)) next.helped.push(key);
      break;
    }
    case 'bandage': {
      key = 'bandage';
      const use = count(key);
      const { at, part } = placeOnBody(def.bodyRegions, event.at);
      const id = next.nextBandageId;
      next.nextBandageId += 1;
      next.bandages.push({ id, x: at[0], y: at[1], rotate: tiltFor(id, at), style: event.style, part });
      if (next.bandages.length > MAX_BANDAGES) next.bandages.shift();
      reaction = bandageReaction(def, at, ctx(use, at));
      break;
    }
    case 'moveBandage': {
      key = 'bandage:move';
      meaningful = false;
      const index = next.bandages.findIndex((b) => b.id === event.id);
      if (index < 0) return { visit, reaction: [], justFeltBetter: false, discovered: null };
      const { at, part } = placeOnBody(def.bodyRegions, event.at);
      next.bandages[index] = { ...next.bandages[index]!, x: at[0], y: at[1], part };
      reaction = bandageReaction(def, at, ctx(count(key), at));
      break;
    }
    case 'removeBandage': {
      key = 'bandage:remove';
      meaningful = false;
      next.bandages = next.bandages.filter((b) => b.id !== event.id);
      count(key);
      reaction = [{ ms: 500, expression: 'surprised', sound: 'pop' }];
      break;
    }
    case 'setBandages': {
      // Undo: restores an earlier set of bandages exactly.
      key = 'bandage:undo';
      meaningful = false;
      next.bandages = event.bandages.map((b) => ({ ...b }));
      count(key);
      reaction = [{ ms: 400, expression: 'curious', sound: 'pop' }];
      break;
    }
    case 'act': {
      key = event.key;
      meaningful = event.meaningful !== false;
      reaction = event.reaction(ctx(count(key)));
      if (event.helped && !next.helped.includes(event.helped)) next.helped.push(event.helped);
      if (event.shot) next.shotDone = true;
      break;
    }
    case 'poke': {
      key = 'poke';
      meaningful = false;
      next.pokes += 1;
      const zone = point
        ? def.pokes
            .filter((z) => distance(z.at, point) <= z.radius)
            .sort((a, b) => distance(a.at, point) - distance(b.at, point))[0]
        : undefined;
      reaction = (zone?.reaction ?? def.defaultPoke)(ctx(next.pokes));
      break;
    }
  }

  let discovered: string | null = null;
  const discovery = discoveryFor(def, key);
  if (discovery && !next.discoveries[discovery]) {
    next.discoveries[discovery] = key;
    discovered = discovery;
  }

  let justFeltBetter = false;
  if (meaningful) {
    next.interactions += 1;
    if (next.issue > 0 && def.eases(key)) next.issue -= 1;
    if (next.issue === 0 && !next.feelsBetter) {
      next.feelsBetter = true;
      justFeltBetter = true;
      reaction = [...reaction, ...def.feelsBetter];
    }
  }
  return { visit: next, reaction, justFeltBetter, discovered };
}

function bandageReaction(def: PatientDefinition, at: Point, ctx: ReactionContext): Reaction {
  const zone = def.bandageZones
    .filter((z) => distance(z.at, at) <= z.radius)
    .sort((a, b) => distance(a.at, at) - distance(b.at, at))[0];
  return (zone?.reaction ?? def.bandageSurprise)(ctx);
}

/** Total comfort choices made this visit. */
export function comfortCount(visit: VisitState): number {
  return Object.entries(visit.uses).reduce((sum, [k, n]) => (k.startsWith('comfort:') ? sum + (n ?? 0) : sum), 0);
}
