import type { BandageStyle, CreatureProps } from '../../art/creature';
import type { SoundId } from '../../audio/sound';
import type { PatientDefinition, Point, Reaction, ReactionContext, VisitState } from '../types';

/**
 * What a mini-adventure can do. Activities are small components that borrow the exam room:
 * they record steps on the visit (which fills the chart), play reactions on the patient,
 * and can take over taps on the patient while they are open.
 */
export interface ActivityApi {
  def: PatientDefinition;
  visit: VisitState;
  props: CreatureProps;
  /** Records a step of the activity and plays the patient's reaction. */
  act: (key: string, reaction: (ctx: ReactionContext) => Reaction, options?: { helped?: string; meaningful?: boolean; shot?: boolean; onDone?: () => void }) => void;
  /** Plays a reaction without recording anything. */
  play: (reaction: Reaction, onDone?: () => void) => void;
  /** Sticks a bandage on the patient (used after the pretend shot). */
  placeBandage: (at: Point, style: BandageStyle) => void;
  close: () => void;
  /** Maps a point in the patient's 240 x 240 space to pixels inside the stage. */
  toStage: (p: Point) => { x: number; y: number } | null;
  /** Maps a screen point to the patient's space, or null when it is well outside the patient. */
  clientToPatient: (clientX: number, clientY: number) => Point | null;
  /** While set, taps on the patient go to the activity first. Return true when handled. */
  setPatientTap: (handler: ((point: Point | null) => boolean) | null) => void;
  /** Glowing rings on the patient, in the patient's space. */
  setHighlights: (points: Point[] | null) => void;
  /** The stage element, for pictures that float over the room (bubbles, a helper). */
  stage: HTMLElement | null;
  sound: (id: SoundId) => void;
  announce: (text: string) => void;
  calm: boolean;
}
