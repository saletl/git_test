import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { C } from '../../../art/palette';
import { BeanieArt, BlanketArt, EarmuffsArt, Pic, ScarfArt, TissueBoxArt } from '../../../icons/ActivityIcons';
import { TissueArt } from '../../../tools/Items';
import { useDrag } from '../../../tools/useDrag';
import { MAX_SCARVES, scarfCount, waddlesTissue, waddlesWardrobe } from '../../patients/waddles';
import type { Point } from '../../types';
import { timesUsed } from '../../visit';
import { ActivityPanel, ChoiceButton } from '../ActivityPanel';
import type { ActivityApi } from '../api';

/* ---------- Scarves and cozy things. Freeform: add, remove, mix and match. ---------- */

/** Taps on Waddles' neck take a scarf off. */
const isOnScarves = ([x, y]: Point) => y > 100 && y < 162 && x > 52 && x < 188;

export function Wardrobe({ api }: { api: ActivityApi }) {
  const apiRef = useRef(api);
  apiRef.current = api;

  const scarfOff = () => {
    const out = waddlesWardrobe.scarfOff(apiRef.current.props);
    apiRef.current.act(out.key, () => out.reaction);
  };
  const scarfOn = () => {
    const out = waddlesWardrobe.scarfOn(apiRef.current.props);
    apiRef.current.act(out.key, () => out.reaction);
  };

  useEffect(() => {
    api.setPatientTap((point) => {
      if (point && isOnScarves(point) && scarfCount(apiRef.current.props) > 0) {
        scarfOff();
        return true;
      }
      return false;
    });
    api.setHighlights([[120, 132]]);
    return () => {
      api.setPatientTap(null);
      api.setHighlights(null);
    };
    // The handlers read the latest api through a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { bind, ghostRef, dragging, wasDrag } = useDrag<'scarf'>({
    onDrop: (_item, x, y) => {
      if (apiRef.current.clientToPatient(x, y)) scarfOn();
    },
  });

  const n = scarfCount(api.props);
  return (
    <ActivityPanel id="wardrobe" title="Scarves and hats" onClose={api.close}>
      <div className="pick-row pick-row--five">
        <button
          type="button"
          className={`pick-btn${dragging ? ' is-dragging' : ''}`}
          aria-label="Put on another scarf. You can also drag it onto Waddles"
          disabled={n >= MAX_SCARVES}
          {...bind('scarf')}
          onClick={() => {
            if (wasDrag()) return;
            api.sound('tap');
            scarfOn();
          }}
        >
          <span className="pick-btn__pic">
            <Pic>
              <ScarfArt color={C.blue} />
              <circle cx="52" cy="12" r="10" fill={C.mint} stroke={C.mintDeep} strokeWidth="2.4" />
              <path d="M52 6 V18 M46 12 H58" stroke={C.white} strokeWidth="3.4" />
            </Pic>
          </span>
          <span className="pick-btn__label" aria-hidden="true">
            Add scarf
          </span>
        </button>
        <ChoiceButton
          label="Take off"
          ariaLabel="Take a scarf off. You can also tap the scarves on Waddles"
          disabled={n <= 0}
          onClick={() => {
            api.sound('tap');
            scarfOff();
          }}
        >
          <Pic>
            <ScarfArt />
            <circle cx="52" cy="12" r="10" fill={C.coral} stroke={C.coralDeep} strokeWidth="2.4" />
            <path d="M46 12 H58" stroke={C.white} strokeWidth="3.4" />
          </Pic>
        </ChoiceButton>
        <ChoiceButton label="Hat" selected={api.props.hat === 'beanie'} onClick={() => api.act('act:wardrobe:hat', ({ props }) => waddlesWardrobe.hat(props))}>
          <Pic>
            <BeanieArt />
          </Pic>
        </ChoiceButton>
        <ChoiceButton label="Earmuffs" selected={api.props.earmuffs === true} onClick={() => api.act('act:wardrobe:earmuffs', ({ props }) => waddlesWardrobe.earmuffs(props))}>
          <Pic>
            <EarmuffsArt />
          </Pic>
        </ChoiceButton>
        <ChoiceButton label="Blanket" selected={api.props.blanket === true} onClick={() => api.act('act:wardrobe:blanket', ({ props }) => waddlesWardrobe.blanket(props))}>
          <Pic>
            <BlanketArt />
          </Pic>
        </ChoiceButton>
      </div>
      <div ref={ghostRef} className={`tool-ghost${dragging ? ' is-visible' : ''}`} aria-hidden="true">
        {dragging ? (
          <Pic>
            <ScarfArt color={C.blue} />
          </Pic>
        ) : null}
      </div>
    </ActivityPanel>
  );
}

/* ---------- Tissue tidy-up: a pretend sneeze leaves sparkly snowflakes to wipe away. ---------- */

const MESS_SPOTS: Point[] = [
  [96, 108],
  [150, 90],
  [60, 140],
  [184, 150],
  [120, 204],
  [44, 212],
];

interface Sparkle {
  id: number;
  at: Point;
}

export function TissueGame({ api }: { api: ActivityApi }) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [wipes, setWipes] = useState<{ id: number; x: number; y: number }[]>([]);
  const [round, setRound] = useState(0);
  const nextId = useRef(1);
  const apiRef = useRef(api);
  apiRef.current = api;
  const sparkleRefs = useRef(new Map<number, HTMLButtonElement>());
  const doneRef = useRef(false);
  const sparklesRef = useRef<Sparkle[]>([]);

  // Each round: a big pretend sneeze, then the sparkly mess appears.
  useEffect(() => {
    doneRef.current = false;
    apiRef.current.play(waddlesTissue.sneeze());
    const t = window.setTimeout(() => {
      const count = round === 0 ? 5 : 6;
      const fresh = MESS_SPOTS.slice(0, count).map((at) => ({ id: nextId.current++, at }));
      sparklesRef.current = fresh;
      setSparkles(fresh);
    }, 1250);
    return () => window.clearTimeout(t);
  }, [round]);

  useEffect(() => {
    api.setPatientTap((point) => {
      if (point && Math.hypot(point[0] - 120, point[1] - 98) < 22) {
        apiRef.current.act('act:tissue:beak', waddlesTissue.beak, { meaningful: false });
        return true;
      }
      return false;
    });
    return () => api.setPatientTap(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wipe = (s: Sparkle) => {
    const pos = apiRef.current.toStage(s.at);
    if (pos) {
      setWipes((list) => [...list.slice(-3), { id: s.id, ...pos }]);
      window.setTimeout(() => setWipes((list) => list.filter((w) => w.id !== s.id)), 800);
    }
    const list = sparklesRef.current;
    const left = list.filter((x) => x.id !== s.id);
    if (left.length === list.length) return;
    sparklesRef.current = left;
    setSparkles(left);
    const a = apiRef.current;
    if (left.length === 0 && !doneRef.current) {
      doneRef.current = true;
      a.act('act:tissue:done', waddlesTissue.done, { helped: 'helper:tissue' });
    } else {
      a.act('act:tissue:wipe', waddlesTissue.wipe, { meaningful: timesUsed(a.visit, 'act:tissue:wipe') < 1 });
    }
  };

  // Dragging the tissue across the sparkles wipes every one it touches.
  const [carrying, setCarrying] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<number | null>(null);
  const wipeUnder = (x: number, y: number) => {
    for (const s of sparklesRef.current) {
      const el = sparkleRefs.current.get(s.id);
      const r = el?.getBoundingClientRect();
      if (r && x > r.left - 10 && x < r.right + 10 && y > r.top - 10 && y < r.bottom + 10) wipe(s);
    }
  };

  const all = sparkles.length === 0;
  const layer = api.stage
    ? createPortal(
        <div className="mess-layer">
          {sparkles.map((s) => {
            const pos = api.toStage(s.at);
            if (!pos) return null;
            return (
              <button
                key={s.id}
                ref={(el) => {
                  if (el) sparkleRefs.current.set(s.id, el);
                  else sparkleRefs.current.delete(s.id);
                }}
                type="button"
                className="mess-sparkle"
                style={{ left: pos.x, top: pos.y }}
                aria-label="Wipe the sparkly snowflake"
                onClick={() => wipe(s)}
              >
                <svg viewBox="-20 -20 40 40" aria-hidden="true">
                  <g stroke={C.blueDeep} strokeWidth="3" strokeLinecap="round">
                    <path d="M0 -14 V14 M-12 -7 L12 7 M-12 7 L12 -7" />
                  </g>
                  <circle r="4" fill={C.white} />
                </svg>
              </button>
            );
          })}
          {wipes.map((w) => (
            <div key={w.id} className="tissue-wipe" style={{ left: w.x, top: w.y }} aria-hidden="true">
              <svg viewBox="-24 -24 48 48">
                <TissueArt />
              </svg>
            </div>
          ))}
          {carrying ? (
            <div className="tissue-carry" style={{ left: carrying.x, top: carrying.y }} aria-hidden="true">
              <svg viewBox="-24 -24 48 48">
                <TissueArt />
              </svg>
            </div>
          ) : null}
        </div>,
        api.stage,
      )
    : null;

  return (
    <ActivityPanel id="tissue" title="Tissue tidy-up" onClose={api.close}>
      {layer}
      <div className="tissue-panel">
        <button
          type="button"
          className="tissue-box"
          aria-label={all ? 'All tidy. Tap for another pretend sneeze' : 'Tissue box. Drag a tissue over the sparkles, or tap each sparkle'}
          onPointerDown={(e) => {
            if (all) return;
            dragRef.current = e.pointerId;
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              // Tapping each sparkle works too.
            }
          }}
          onPointerMove={(e) => {
            if (dragRef.current !== e.pointerId || !api.stage) return;
            const r = api.stage.getBoundingClientRect();
            setCarrying({ x: e.clientX - r.left, y: e.clientY - r.top });
            wipeUnder(e.clientX, e.clientY);
          }}
          onPointerUp={() => {
            dragRef.current = null;
            setCarrying(null);
          }}
          onPointerCancel={() => {
            dragRef.current = null;
            setCarrying(null);
          }}
          onClick={() => {
            if (all) setRound((r) => r + 1);
          }}
        >
          <Pic>
            <TissueBoxArt />
          </Pic>
          <span className="pick-btn__label" aria-hidden="true">
            {all ? 'Sneeze again' : 'Tissue'}
          </span>
        </button>
        <p className="activity-hint">{all ? 'All tidy! Waddles says thank you.' : 'Tap each sparkle, or drag the tissue over them.'}</p>
      </div>
    </ActivityPanel>
  );
}
