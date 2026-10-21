import { BANDAGE_STYLES, bandageShapes, type BandageStyle, type PlushKind } from '../../art/creature';
import { useSettings } from '../../app/settings';
import { ShapeList } from '../../characters/Creature';
import { ComfortArt } from '../../icons/ComfortIcons';
import { TrashIcon, UndoIcon } from '../../icons/UiIcons';
import { useDrag } from '../../tools/useDrag';
import { COMFORT_IDS, type ComfortId } from '../types';

export const BANDAGE_LABELS: Record<BandageStyle, string> = {
  stars: 'Star bandage',
  hearts: 'Heart bandage',
  stripes: 'Striped bandage',
  rainbow: 'Rainbow bandage',
};

export function BandagePic({ style }: { style: BandageStyle }) {
  return (
    <svg viewBox="-36 -20 72 40" aria-hidden="true">
      <ShapeList shapes={bandageShapes(style, [0, 0], -10, 1.1)} />
    </svg>
  );
}

/**
 * Bandage patterns, undo and remove. Pick a pattern, then tap the patient anywhere (or drag the pattern onto them).
 * Tap a bandage already on the patient to pick it up; then tap somewhere else to move it, or remove it.
 */
export function BandageTray({
  style,
  onStyle,
  onDropStyle,
  canUndo,
  onUndo,
  selectedBandage,
  onRemove,
}: {
  style: BandageStyle;
  onStyle: (style: BandageStyle) => void;
  onDropStyle: (style: BandageStyle, clientX: number, clientY: number) => void;
  canUndo: boolean;
  onUndo: () => void;
  selectedBandage: number | null;
  onRemove: () => void;
}) {
  const { play } = useSettings();
  const { bind, ghostRef, dragging, wasDrag } = useDrag<BandageStyle>({ onDrop: onDropStyle, onStart: () => play('select') });
  return (
    <div className="context-tray context-tray--bandage" role="group" aria-label="Bandages">
      <div className="context-tray__choices">
        {BANDAGE_STYLES.map((s) => (
          <button
            key={s}
            type="button"
            className={`choice-btn choice-btn--bandage${style === s ? ' is-selected' : ''}${dragging === s ? ' is-dragging' : ''}`}
            aria-label={BANDAGE_LABELS[s]}
            aria-pressed={style === s}
            {...bind(s)}
            onClick={() => {
              if (wasDrag()) return;
              play('tap');
              onStyle(s);
            }}
          >
            <BandagePic style={s} />
          </button>
        ))}
      </div>
      <div className="context-tray__actions">
        {selectedBandage !== null ? (
          <button type="button" className="tray-action tray-action--remove" onClick={onRemove}>
            <TrashIcon />
            <span>Remove</span>
          </button>
        ) : null}
        <button type="button" className="tray-action" onClick={onUndo} disabled={!canUndo}>
          <UndoIcon />
          <span>Undo</span>
        </button>
      </div>
      <div ref={ghostRef} className={`tool-ghost tool-ghost--bandage${dragging ? ' is-visible' : ''}`} aria-hidden="true">
        {dragging ? <BandagePic style={dragging} /> : null}
      </div>
    </div>
  );
}

export function ComfortTray({ labels, plush, onChoose }: { labels: Record<ComfortId, string>; plush: PlushKind; onChoose: (choice: ComfortId) => void }) {
  return (
    <div className="context-tray context-tray--comfort" role="group" aria-label="Comfort choices">
      {COMFORT_IDS.map((choice) => (
        <button key={choice} type="button" className="comfort-btn" data-comfort={choice} onClick={() => onChoose(choice)}>
          <span className="comfort-btn__pic">
            <ComfortArt choice={choice} plush={plush} />
          </span>
          <span className="comfort-btn__label">{labels[choice]}</span>
        </button>
      ))}
    </div>
  );
}
