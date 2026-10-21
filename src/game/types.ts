import type { BandageStyle, CreatureArtist, CreatureProps, PlushKind } from '../art/creature';
import type { Expression, Look } from '../art/face';
import type { Point } from '../art/shapes';
import type { SoundId } from '../audio/sound';
import type { StickerId } from '../stickers/catalog';

export type PatientId = StickerId;

export const TOOL_IDS = ['stethoscope', 'thermometer', 'otoscope', 'bandage'] as const;
export type ToolId = (typeof TOOL_IDS)[number];

/** Prickle's toy shot appears only in Prickle's room. */
export type SpecialToolId = 'pretendShot';
export type AnyToolId = ToolId | SpecialToolId;

export const COMFORT_IDS = ['cuddle', 'song', 'pause', 'showTool'] as const;
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
  | 'pinch';

export interface EffectSpec {
  kind: EffectKind;
  /** Anchor name or a point in the patient's 240 x 240 space. */
  at: string | Point;
  count?: number;
  /** Small/large particle variants. */
  size?: number;
}

export type GaugeReading = 'cozy' | 'chilly' | 'toasty' | 'wiggly' | 'gentle';
export type LensDiscovery = 'sparkle' | 'heartSparkle' | 'snowman' | 'snowflake' | 'flower' | 'note' | 'duck' | 'tinySock';

export type PopupSpec = { kind: 'gauge'; reading: GaugeReading } | { kind: 'lens'; discovery: LensDiscovery };

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
  /** Shows the tool resting on an anchor; null hides it. */
  toolAt?: { tool: AnyToolId; at: string } | null;
  /** Shows the comfort toy demo; null hides it. */
  demo?: { tool: AnyToolId; at: string } | null;
  /** Persistent appearance changes (scarf count, sock position, and so on). */
  props?: CreatureProps;
  /** Description for screen readers. */
  say?: string;
}

export type Reaction = Beat[];

export interface BandageOnPatient {
  spot: string;
  style: BandageStyle;
}

export interface VisitState {
  patientId: PatientId;
  /** Meaningful interactions (tools and comfort choices). */
  interactions: number;
  toolUses: Partial<Record<AnyToolId, number>>;
  comfortUses: Partial<Record<ComfortId, number>>;
  pokes: number;
  bandages: BandageOnPatient[];
  /** How much of the patient's silly problem remains (hiccups, sneezes...). Never shown as a number. */
  issue: number;
  comforted: boolean;
  /** Prickle's pretend shot. */
  shotDone: boolean;
  /** The patient has said they feel better. */
  feelsBetter: boolean;
}

export interface ReactionContext {
  visit: VisitState;
  props: CreatureProps;
  selectedTool: AnyToolId | null;
  /** How many times this tool or choice has been used before, including this time (1 = first). */
  use: number;
}

export type ReactionFn = (ctx: ReactionContext) => Reaction;

export interface BandageSpot {
  id: string;
  at: Point;
  /** Which art part the bandage sticks to. */
  part: string;
  rotate: number;
  scale?: number;
  reaction: ReactionFn;
}

export interface PokeZone {
  at: Point;
  radius: number;
  reaction: ReactionFn;
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
  /** Where each tool goes when used. */
  toolTarget: Record<ToolId, string>;
  bandageSpots: BandageSpot[];
  pokes: PokeZone[];
  defaultPoke: ReactionFn;
  restingExpression: (visit: VisitState) => Expression;
  /** Starting amount of the silly problem. */
  issueStart: number;
  intro: Reaction;
  /** Played now and then when nobody is tapping. */
  idle: (visit: VisitState, props: CreatureProps) => Reaction | null;
  tools: Record<ToolId, ReactionFn>;
  comfort: Record<ComfortId, ReactionFn>;
  special?: {
    tool: SpecialToolId;
    onSelect: ReactionFn;
    apply: ReactionFn;
    /** A bandage that appears after the pretend shot. */
    bandageAfter?: { spot: string; style: BandageStyle };
  };
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
