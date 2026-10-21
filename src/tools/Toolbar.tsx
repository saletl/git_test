import type { PlushKind } from '../art/creature';
import { useSettings } from '../app/settings';
import { TOOL_IDS, type ToolId } from '../game/types';
import { PlushIcon } from '../icons/ComfortIcons';
import { TOOL_LABELS, TOOL_NAMES, ToolIcon } from '../icons/ToolIcons';
import { useDrag } from './useDrag';

/**
 * The doctor tools, each with a picture and a short word, plus the patient's own toy for comfort.
 * Tap a tool to pick it up (then tap the patient), or drag it straight onto the patient.
 */
export function Toolbar({
  selected,
  comfortOpen,
  comfortGlow,
  hintTool,
  plush,
  onSelect,
  onComfort,
  onDragStart,
  onDragEnd,
  onDrop,
  registerButton,
}: {
  selected: ToolId | null;
  comfortOpen: boolean;
  comfortGlow: boolean;
  hintTool: ToolId | null;
  plush: PlushKind;
  onSelect: (tool: ToolId) => void;
  onComfort: () => void;
  onDragStart: (tool: ToolId) => void;
  onDragEnd: () => void;
  onDrop: (tool: ToolId, clientX: number, clientY: number) => void;
  registerButton: (tool: ToolId, el: HTMLButtonElement | null) => void;
}) {
  const { play } = useSettings();
  const { bind, ghostRef, dragging, wasDrag } = useDrag<ToolId>({
    onStart: (tool) => {
      play('select');
      onDragStart(tool);
    },
    onEnd: onDragEnd,
    onDrop,
  });

  return (
    <nav className="toolbar" aria-label="Doctor tools">
      {TOOL_IDS.map((tool) => (
        <button
          key={tool}
          ref={(el) => registerButton(tool, el)}
          type="button"
          className={`tool-btn${selected === tool ? ' is-selected' : ''}${dragging === tool ? ' is-dragging' : ''}${hintTool === tool ? ' is-hinted' : ''}`}
          aria-label={TOOL_NAMES[tool]}
          aria-pressed={selected === tool}
          data-tool={tool}
          {...bind(tool)}
          onClick={() => {
            if (wasDrag()) return;
            onSelect(tool);
          }}
        >
          <ToolIcon tool={tool} className="tool-btn__icon" />
          <span className="tool-btn__label" aria-hidden="true">
            {TOOL_LABELS[tool]}
          </span>
        </button>
      ))}
      <button
        type="button"
        className={`tool-btn tool-btn--comfort${comfortOpen ? ' is-selected' : ''}${comfortGlow ? ' is-glowing' : ''}`}
        aria-label="Comfort choices"
        aria-expanded={comfortOpen}
        data-tool="comfort"
        onClick={onComfort}
      >
        <PlushIcon plush={plush} className="tool-btn__icon" />
        <span className="tool-btn__label" aria-hidden="true">
          Comfort
        </span>
      </button>
      <div ref={ghostRef} className={`tool-ghost${dragging ? ' is-visible' : ''}`} aria-hidden="true">
        {dragging ? <ToolIcon tool={dragging} /> : null}
      </div>
    </nav>
  );
}
