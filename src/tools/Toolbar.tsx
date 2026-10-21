import { useRef, useState } from 'react';
import { useSettings } from '../app/settings';
import { TOOL_IDS, type AnyToolId, type ToolId } from '../game/types';
import { HeartIcon } from '../icons/UiIcons';
import { TOOL_LABELS, ToolIcon } from '../icons/ToolIcons';

const DRAG_THRESHOLD = 12;

/**
 * The four big tools plus the comfort heart.
 * Tap a tool to pick it up (then tap the patient), or drag it straight onto the patient.
 */
export function Toolbar({
  selected,
  comfortOpen,
  comfortGlow,
  hintTool,
  onSelect,
  onComfort,
  onDragStart,
  onDragEnd,
  onDrop,
  registerButton,
}: {
  selected: AnyToolId | null;
  comfortOpen: boolean;
  comfortGlow: boolean;
  hintTool: ToolId | null;
  onSelect: (tool: ToolId) => void;
  onComfort: () => void;
  onDragStart: (tool: ToolId) => void;
  onDragEnd: () => void;
  onDrop: (tool: ToolId, clientX: number, clientY: number) => boolean;
  registerButton: (tool: ToolId, el: HTMLButtonElement | null) => void;
}) {
  const { play } = useSettings();
  const ghostRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ tool: ToolId; id: number; x: number; y: number; active: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState<ToolId | null>(null);

  const moveGhost = (x: number, y: number) => {
    const ghost = ghostRef.current;
    if (ghost) ghost.style.transform = `translate(${x - 40}px, ${y - 40}px)`;
  };

  const end = (e: React.PointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId) return;
    if (d.active) {
      suppressClick.current = true;
      setDragging(null);
      onDragEnd();
      if (!cancelled) onDrop(d.tool, e.clientX, e.clientY);
    }
  };

  return (
    <nav className="toolbar" aria-label="Doctor tools">
      <div className="toolbar__tools">
        {TOOL_IDS.map((tool) => (
          <button
            key={tool}
            ref={(el) => registerButton(tool, el)}
            type="button"
            className={`tool-btn${selected === tool ? ' is-selected' : ''}${dragging === tool ? ' is-dragging' : ''}${hintTool === tool ? ' is-hinted' : ''}`}
            aria-label={TOOL_LABELS[tool]}
            aria-pressed={selected === tool}
            onPointerDown={(e) => {
              if (e.button !== 0 && e.pointerType === 'mouse') return;
              drag.current = { tool, id: e.pointerId, x: e.clientX, y: e.clientY, active: false };
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                // Dragging still works through normal pointer events.
              }
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d || d.id !== e.pointerId) return;
              if (!d.active && Math.hypot(e.clientX - d.x, e.clientY - d.y) > DRAG_THRESHOLD) {
                d.active = true;
                setDragging(tool);
                onDragStart(tool);
                play('select');
              }
              if (d.active) moveGhost(e.clientX, e.clientY);
            }}
            onPointerUp={(e) => end(e, false)}
            onPointerCancel={(e) => end(e, true)}
            onClick={() => {
              if (suppressClick.current) {
                suppressClick.current = false;
                return;
              }
              onSelect(tool);
            }}
          >
            <ToolIcon tool={tool} className="tool-btn__icon" />
          </button>
        ))}
      </div>
      <button
        type="button"
        className={`tool-btn tool-btn--comfort${comfortOpen ? ' is-selected' : ''}${comfortGlow ? ' is-glowing' : ''}`}
        aria-label="Comfort choices"
        aria-expanded={comfortOpen}
        onClick={onComfort}
      >
        <HeartIcon className="tool-btn__icon" />
      </button>
      <div ref={ghostRef} className={`tool-ghost${dragging ? ' is-visible' : ''}`} aria-hidden="true">
        {dragging ? <ToolIcon tool={dragging} /> : null}
      </div>
    </nav>
  );
}
