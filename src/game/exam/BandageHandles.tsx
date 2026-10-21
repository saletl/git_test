import { useRef, useState } from 'react';
import { bandageShapes } from '../../art/creature';
import { ShapeList } from '../../characters/Creature';
import type { PlacedBandage, Point } from '../types';
import { BANDAGE_LABELS } from './Trays';

/**
 * Invisible, finger-sized handles over each bandage while the bandage tool is in hand.
 * Drag a handle to move that bandage; tap it to pick it up (then tap the patient to move it, or remove it).
 */
export function BandageHandles({
  bandages,
  selectedId,
  toStage,
  clientToPatient,
  scale,
  onSelect,
  onMove,
  onDragChange,
}: {
  bandages: readonly PlacedBandage[];
  selectedId: number | null;
  toStage: (p: Point) => { x: number; y: number } | null;
  clientToPatient: (clientX: number, clientY: number) => Point | null;
  /** Pixels per patient unit, so the dragged bandage stays the same size. */
  scale: number;
  onSelect: (id: number | null) => void;
  onMove: (id: number, to: Point) => void;
  onDragChange: (id: number | null) => void;
}) {
  const drag = useRef<{ id: number; pointer: number; x: number; y: number; active: boolean } | null>(null);
  const [preview, setPreview] = useState<{ id: number; x: number; y: number } | null>(null);

  return (
    <div className="bandage-handles">
      {bandages.map((b, i) => {
        const pos = toStage([b.x, b.y]);
        if (!pos) return null;
        const dragged = preview?.id === b.id;
        return (
          <button
            key={b.id}
            type="button"
            className={`bandage-handle${selectedId === b.id ? ' is-selected' : ''}${dragged ? ' is-dragging' : ''}`}
            style={{ left: dragged ? preview.x : pos.x, top: dragged ? preview.y : pos.y }}
            aria-label={`${BANDAGE_LABELS[b.style]} number ${i + 1}. ${selectedId === b.id ? 'Picked up. Tap the patient to move it.' : 'Tap to pick it up, or drag to move it.'}`}
            aria-pressed={selectedId === b.id}
            onPointerDown={(e) => {
              if (e.button !== 0 && e.pointerType === 'mouse') return;
              e.stopPropagation();
              drag.current = { id: b.id, pointer: e.pointerId, x: e.clientX, y: e.clientY, active: false };
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                // Tap-to-move still works.
              }
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d || d.pointer !== e.pointerId) return;
              if (!d.active && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8) {
                d.active = true;
                onDragChange(b.id);
              }
              if (d.active) {
                const parent = e.currentTarget.parentElement?.getBoundingClientRect();
                setPreview({ id: b.id, x: e.clientX - (parent?.left ?? 0), y: e.clientY - (parent?.top ?? 0) });
              }
            }}
            onPointerUp={(e) => {
              const d = drag.current;
              drag.current = null;
              if (!d || d.pointer !== e.pointerId) return;
              if (d.active) {
                setPreview(null);
                onDragChange(null);
                const to = clientToPatient(e.clientX, e.clientY);
                if (to) onMove(b.id, to);
                return;
              }
              onSelect(selectedId === b.id ? null : b.id);
            }}
            onPointerCancel={() => {
              drag.current = null;
              setPreview(null);
              onDragChange(null);
            }}
            onClick={(e) => {
              // Keyboard: Enter picks the bandage up or puts it back.
              if (e.detail === 0) onSelect(selectedId === b.id ? null : b.id);
            }}
          >
            {dragged ? (
              <svg viewBox="-36 -20 72 40" style={{ width: 72 * scale * 0.7, height: 40 * scale * 0.7 }} aria-hidden="true">
                <ShapeList shapes={bandageShapes(b.style, [0, 0], b.rotate, 1)} />
              </svg>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
