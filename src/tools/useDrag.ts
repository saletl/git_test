import { useCallback, useRef, useState } from 'react';

const DRAG_THRESHOLD = 12;

/**
 * Lets a button be tapped or dragged. A tap still fires the button's click;
 * a drag moves a floating ghost under the finger and reports where it was dropped.
 * Pointer capture keeps the page from scrolling while dragging, and a tap always works as a fallback.
 */
export function useDrag<T>({
  onStart,
  onDrop,
  onEnd,
}: {
  onStart?: (item: T) => void;
  onDrop: (item: T, clientX: number, clientY: number) => void;
  onEnd?: () => void;
}) {
  const ghostRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ item: T; id: number; x: number; y: number; active: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState<T | null>(null);

  const moveGhost = (x: number, y: number) => {
    const ghost = ghostRef.current;
    if (ghost) ghost.style.transform = `translate(${x - 40}px, ${y - 40}px)`;
  };

  const finish = (e: React.PointerEvent, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.active) return;
    suppressClick.current = true;
    setDragging(null);
    onEnd?.();
    if (!cancelled) onDrop(d.item, e.clientX, e.clientY);
  };

  const bind = (item: T) => ({
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      drag.current = { item, id: e.pointerId, x: e.clientX, y: e.clientY, active: false };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Dragging still works through normal pointer events.
      }
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      if (!d.active && Math.hypot(e.clientX - d.x, e.clientY - d.y) > DRAG_THRESHOLD) {
        d.active = true;
        setDragging(() => item);
        onStart?.(item);
      }
      if (d.active) moveGhost(e.clientX, e.clientY);
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => finish(e, false),
    onPointerCancel: (e: React.PointerEvent<HTMLElement>) => finish(e, true),
  });

  /** Call at the top of onClick: returns true when the click came from the end of a drag. */
  const wasDrag = useCallback(() => {
    if (!suppressClick.current) return false;
    suppressClick.current = false;
    return true;
  }, []);

  return { bind, ghostRef, dragging, wasDrag };
}
