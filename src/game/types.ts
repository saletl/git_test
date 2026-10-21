import type { BandageStyle, CreatureArtist, CreatureProps, PlushKind } from '../art/creature';
import type { Expression, Look } from '../art/face';
import type { Point } from '../art/shapes';
import type { SoundId } from '../audio/sound';
import type { PageId } from '../coloring/catalog';

export type PatientId = PageId;

/** The doctor tools on the toolbar. "light" looks in ears and throats. */
export const TOOL_IDS = ['stethoscope', 'thermometer', 'light', 'bandage'] as const;
export type ToolId = (typeof TOOL_IDS)[number];
export type ExamToolId = Exclude<ToolId, 'bandage'>;
export type LookTarget = 'ear' | 'throat';

export const COMFORT_IDS = ['hug', 'break', 'music', 'hand'] as const;
export type ComfortId = (typeof COMFORT_IDS)[number];

export type EffectKind =
  | 'bubble'
  | 'heartBubble'
  | 'heart'
  | 'note'
  | 'sparkle'
  | 'star'
  | 'scarf'
  | 'snowflake'
  | 'rumble'
  | 'pulse'
  | 'puff'
  | 'question'
  | 'zzz'
  | 'flame'
  | 'pinch'
  | 'breathe'
  | 'confetti';

export interface EffectSpec {
  kind: EffectKind;
  /** Anchor name or a point in the patient's 240 x 240 space. */
  at: string | Point;
  count?: number;
  /** Small/large particle variants. */
  size?: number;
}

export type GaugeReading = 'cozy' | 'chilly' | 'toasty' | 'wiggly' | 'gentle';
export type LensDiscovery =
  | 'sparkle'
  | 'heartSparkle'
  | 'snowman'
  | 'snowflake'
  | 'flower'
  | 'note'
  | 'duck'
  | 'tinySock'
  | 'campfire'
  | 'iceberg'
  | 'disco'
  | 'carrot';

export type PopupSpec = { kind: 'gauge'; reading: GaugeReading } | { kind: 'lens'; discovery: LensDiscovery; view?: LookTarget };

/** Props that appear next to a patient for a moment (a cup of water, a pinwheel...). */
export type ItemKind = 'cup' | 'pinwheel' | 'sillyGlasses' | 'musicBox' | 'helperHand' | 'tissue' | 'toyShot' | 'tongueDepressor';

/** One step of a reaction. Reactions are short timelines of beats. */
export interface Beat {
  ms: number;
  expression?: Expression;
  look?: Look | null;
  /** CSS animation applied to the character (see characters.css). */
  action?: string | null;
  effects?: EffectSpec[];
  sound?: SoundId;
  /** Opens a popup (gauge or magnified view); null closes it. */
  popup?: PopupSpec | null;
  /** Shows a tool resting on an anchor; null hides it. */
  toolAt?: { tool: ToolId | 'toyShot' | 'tongue'; at: string } | null;
  /** Shows a prop next to the patient; null hides it. */
  item?: { kind: ItemKind; at: string } | null;
  /** Persistent appearance changes (scarf count, sock position, and so on). */
  props?: CreatureProps;
  /** Description for screen readers. */
  say?: string;
}

export type Reaction = Beat[];

export interface PlacedBandage {
  id: number;
  /** Position in the patient's own 240 x 240 space, so it stays put when the screen resizes. */
  x: number;
  y: number;
  rotate: number;
  style: BandageStyle;
  /** The body part it sticks to, so it moves with that part. */
  part: string;
}

export const ACTIVITY_IDS = [
  'bubbles',
  'hiccupHelper',
  'wardrobe',
  'tissue',
  'bunnyCheck',
  'comfortPlan',
  'pretendShot',
  'soundMystery',
  'sockRescue',
] as const;
export type ActivityId = (typeof ACTIVITY_IDS)[number];

export interface VisitState {
  patientId: PatientId;
  /** Meaningful interactions (tools, comfort choices, activities). */
  interactions: number;
  uses: Partial<Record<string, number>>;
  pokes: number;
  bandages: PlacedBandage[];
  nextBandageId: number;
  /** How much of the patient's silly problem remains (hiccups, sneezes...). Never shown as a number. */
  issue: number;
  comforted: boolean;
  shotDone: boolean;
  /** The patient has said they feel better. */
  feelsBetter: boolean;
  /** Chart discoveries: id -> detail (for example "pinwheel"). */
  discoveries: Partial<Record<string, string>>;
  /** Comfort choices and helpers used, in order, for the chart. */
  helped: string[];
}

export interface ReactionContext {
  visit: VisitState;
  props: CreatureProps;
  /** How many times this tool or choice has been used before, including this time (1 = first). */
  use: number;
  /** Where the child tapped, in the patient's 240 x 240 space, if known. */
  point: Point | null;
}

export type ReactionFn = (ctx: ReactionContext) => Reaction;

/** Places that get a special reaction when a bandage lands near them. Bandages never snap to these. */
export interface BandageZone {
  id: string;
  at: Point;
  radius: number;
  reaction: ReactionFn;
}

/** Rough ellipses covering the character, so bandages always land on the patient and stick to the right part. */
export interface BodyRegion {
  part: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export type ChartIcon =
  | 'heartbeat'
  | 'bubbles'
  | 'helper'
  | 'tools'
  | 'bowtie'
  | 'tissue'
  | 'bunny'
  | 'plan'
  | 'bandage'
  | 'rumble'
  | 'mystery'
  | 'sock';

export interface DiscoveryDef {
  id: string;
  icon: ChartIcon;
  /** Short label for grown-ups reading the chart. */
  label: string;
}

export interface ActivityDef {
  id: ActivityId;
  /** Short label under the picture. */
  label: string;
}

export interface PatientDefinition {
  id: PatientId;
  name: string;
  /** Read aloud by screen readers in the waiting room. */
  summary: string;
  artist: CreatureArtist;
  plush: PlushKind;
  initialProps: CreatureProps;
  /** Room tint for the exam room. */
  roomTint: string;
  anchors: Record<string, Point>;
  /** Where each tool rests when used. */
  toolTarget: Record<ExamToolId, string>;
  /** Extra glowing spots to try a tool on (Mochi's tummy has several). Defaults to the tool's target. */
  toolZones?: Partial<Record<ExamToolId, Point[]>>;
  story: {
    /** Shown in a speech bubble when the visit starts. */
    intro: string;
    /** The reason for the visit, on the chart. */
    reason: string;
    /** Optional conversation starters for a grown-up and child. */
    prompts: string[];
  };
  chart: { discoveries: readonly [DiscoveryDef, DiscoveryDef, DiscoveryDef] };
  /** Which events fill which chart discovery, for example "tool:stethoscope" -> "heartbeat". */
  discoverOn: Partial<Record<string, string>>;
  activities: ActivityDef[];
  comfortLabels: Record<ComfortId, string>;
  bodyRegions: BodyRegion[];
  bandageZones: BandageZone[];
  /** A bandage somewhere unexpected. */
  bandageSurprise: ReactionFn;
  pokes: { at: Point; radius: number; reaction: ReactionFn }[];
  defaultPoke: ReactionFn;
  restingExpression: (visit: VisitState) => Expression;
  /** Starting amount of the silly problem. */
  issueStart: number;
  /** Which event keys ease the silly problem a little. */
  eases: (key: string) => boolean;
  intro: Reaction;
  /** Played now and then when nobody is tapping. */
  idle: (visit: VisitState, props: CreatureProps) => Reaction | null;
  tools: Record<'stethoscope' | 'thermometer', ReactionFn>;
  look: Record<LookTarget, ReactionFn>;
  comfort: Record<ComfortId, ReactionFn>;
  /** Played once when the silly problem is all better. */
  feelsBetter: Reaction;
  /** End of a completed visit. */
  farewell: Reaction;
  /** When the player leaves with the exit button. */
  goodbye: Reaction;
  /** Waiting-room idle animation names, played one at a time. */
  waitingIdle: { action: string; effects?: EffectSpec[]; sound?: SoundId }[];
  waitingProps?: CreatureProps;
}

export type { BandageStyle, Expression, Look, Point, SoundId };
