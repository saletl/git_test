import { ActivityArt } from '../../icons/ActivityIcons';
import type { ActivityDef, ActivityId } from '../types';

/** The patient's own mini-adventures, as big picture buttons on the front of the exam table. */
export function AdventureShelf({ activities, onOpen, glow }: { activities: readonly ActivityDef[]; onOpen: (id: ActivityId) => void; glow: ActivityId | null }) {
  return (
    <div className="adventure-shelf" role="group" aria-label="Things to do">
      {activities.map((a) => (
        <button key={a.id} type="button" className={`adventure-btn${glow === a.id ? ' is-glowing' : ''}`} data-activity={a.id} onClick={() => onOpen(a.id)}>
          <ActivityArt id={a.id} className="adventure-btn__pic" />
          <span className="adventure-btn__label">{a.label}</span>
        </button>
      ))}
    </div>
  );
}
