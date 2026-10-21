import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { C } from '../../../art/palette';
import { JarArt, Pic } from '../../../icons/ActivityIcons';
import { CupArt, PinwheelArt, SillyGlassesArt } from '../../../tools/Items';
import { BUBBLE_SURPRISES, PIP_HELPERS, pipBubbleReactions, type BubbleSurprise, type PipHelper } from '../../patients/pip';
import { timesUsed } from '../../visit';
import { ActivityPanel, ChoiceButton } from '../ActivityPanel';
import type { ActivityApi } from '../api';

/* ---------- Bubble catching: tap to pop, or drag into the jar. No timer, nothing to miss. ---------- */

interface FloatingBubble {
  id: number;
  /** Start (Pip's mouth) and resting place, in stage pixels. */
  x: number;
  y: number;
  dx: number;
  dy: number;
  surprise: BubbleSurprise | null;
}

interface PopBurst {
  id: number;
  x: number;
  y: number;
  surprise: BubbleSurprise | null;
}

const MAX_BUBBLES = 4;

export function SurpriseArt({ kind }: { kind: BubbleSurprise }) {
  switch (kind) {
    case 'star':
      return <path d="M32 10 L38 25 L54 26 L42 36 L46 52 L32 43 L18 52 L22 36 L10 26 L26 25 Z" fill={C.gold} stroke={C.goldDeep} strokeWidth="3" />;
    case 'heart':
      return <path d="M32 52 C14 40 8 30 12 21 C16 12 27 12 32 20 C37 12 48 12 52 21 C56 30 50 40 32 52 Z" fill={C.berry} stroke="#c55a83" strokeWidth="3" />;
    case 'fish':
      return (
        <g>
          <path d="M44 32 L58 20 L58 44 Z" fill={C.coral} stroke={C.coralDeep} strokeWidth="2.6" />
          <ellipse cx="30" cy="32" rx="18" ry="12" fill={C.blue} stroke={C.blueDeep} strokeWidth="2.6" />
          <circle cx="22" cy="29" r="2.6" fill={C.ink} />
        </g>
      );
    case 'duck':
      return (
        <g>
          <ellipse cx="30" cy="40" rx="18" ry="11" fill={C.gold} stroke={C.goldDeep} strokeWidth="2.6" />
          <circle cx="38" cy="24" r="10" fill={C.gold} stroke={C.goldDeep} strokeWidth="2.6" />
          <path d="M47 24 L56 27 L47 30 Z" fill={C.coral} />
          <circle cx="41" cy="21" r="2" fill={C.ink} />
        </g>
      );
    case 'note':
      return (
        <g fill={C.blueDeep}>
          <ellipse cx="24" cy="44" rx="9" ry="7" transform="rotate(-20 24 44)" />
          <rect x="30" y="12" width="5" height="32" rx="2.5" />
          <path d="M32 12 C44 14 48 22 44 30 C44 22 38 20 34 19 Z" />
        </g>
      );
    case 'flower':
      return (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="32" cy="20" rx="7" ry="11" fill={C.berryLight} stroke={C.berry} strokeWidth="2" transform={`rotate(${a} 32 32)`} />
          ))}
          <circle cx="32" cy="32" r="7" fill={C.gold} stroke={C.goldDeep} strokeWidth="2" />
        </g>
      );
  }
}

export function BubbleGame({ api }: { api: ActivityApi }) {
  const [bubbles, setBubbles] = useState<FloatingBubble[]>([]);
  const [bursts, setBursts] = useState<PopBurst[]>([]);
  const [jar, setJar] = useState(0);
  const [jarBump, setJarBump] = useState(0);
  const jarRef = useRef<HTMLButtonElement>(null);
  const nextId = useRef(1);
  const surpriseIndex = useRef(0);
  const apiRef = useRef(api);
  apiRef.current = api;
  const countRef = useRef(0);
  countRef.current = bubbles.length;

  // Pip hiccups a new bubble every few seconds while there is room for one.
  useEffect(() => {
    const blow = () => {
      const a = apiRef.current;
      if (countRef.current >= MAX_BUBBLES || !a.stage) return;
      const mouth = a.toStage(a.def.anchors.mouth ?? [120, 124]);
      if (!mouth) return;
      const w = a.stage.clientWidth;
      const h = a.stage.clientHeight;
      const id = nextId.current++;
      const withSurprise = id % 2 === 1;
      const surprise = withSurprise ? BUBBLE_SURPRISES[surpriseIndex.current++ % BUBBLE_SURPRISES.length]! : null;
      const restX = w * (0.14 + ((id * 0.29) % 0.72));
      const restY = h * (0.1 + ((id * 0.17) % 0.3));
      a.play(pipBubbleReactions.hiccup());
      setBubbles((list) => [...list, { id, x: mouth.x, y: mouth.y, dx: restX - mouth.x, dy: restY - mouth.y, surprise }]);
    };
    const first = window.setTimeout(blow, 500);
    const timer = window.setInterval(blow, api.calm ? 3600 : 2400);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [api.calm]);

  const burst = (b: FloatingBubble, x: number, y: number) => {
    setBursts((list) => [...list.slice(-4), { id: b.id, x, y, surprise: b.surprise }]);
    window.setTimeout(() => setBursts((list) => list.filter((p) => p.id !== b.id)), 1600);
  };

  const pop = (b: FloatingBubble, el: HTMLElement | null) => {
    setBubbles((list) => list.filter((x) => x.id !== b.id));
    const stage = api.stage?.getBoundingClientRect();
    const r = el?.getBoundingClientRect();
    if (stage && r) burst(b, r.left + r.width / 2 - stage.left, r.top + r.height / 2 - stage.top);
    api.sound('pop');
    api.act('act:bubbles:pop', () => pipBubbleReactions.pop(b.surprise), { meaningful: timesUsed(api.visit, 'act:bubbles:pop') < 2 });
    if (b.surprise) api.announce(`A tiny ${b.surprise} was inside!`);
  };

  const catchBubble = (b: FloatingBubble) => {
    setBubbles((list) => list.filter((x) => x.id !== b.id));
    const count = jar + 1;
    setJar(count);
    setJarBump((k) => k + 1);
    api.sound('bubble');
    api.act('act:bubbles:jar', () => pipBubbleReactions.jar(count), { meaningful: timesUsed(api.visit, 'act:bubbles:jar') < 2 });
  };

  const overJar = (x: number, y: number) => {
    const r = jarRef.current?.getBoundingClientRect();
    if (!r) return false;
    const pad = 24;
    return x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad;
  };

  const jarButton = (
    <button
      ref={jarRef}
      type="button"
      className="bubble-jar"
      aria-label={`Pip's bubble jar, with ${jar} ${jar === 1 ? 'bubble' : 'bubbles'}. Put a bubble in the jar`}
      onClick={() => {
        const b = bubbles[0];
        if (b) catchBubble(b);
      }}
    >
      <svg key={jarBump} viewBox="0 0 64 64" className={jarBump ? 'bubble-jar__art is-bumping' : 'bubble-jar__art'} aria-hidden="true">
        <JarArt fill={jar} />
      </svg>
      {jar > 6 ? <span className="bubble-jar__more">+{jar - 6}</span> : null}
    </button>
  );

  const layer = api.stage
    ? createPortal(
        <div className="bubble-layer">
          {jarButton}
          {bubbles.map((b) => (
            <BubbleButton key={b.id} bubble={b} onPop={pop} onDropAt={(x, y) => (overJar(x, y) ? (catchBubble(b), true) : false)} />
          ))}
          {bursts.map((p) => (
            <div key={p.id} className="bubble-burst" style={{ left: p.x, top: p.y }} aria-hidden="true">
              {p.surprise ? (
                <svg viewBox="0 0 64 64" className="bubble-burst__surprise">
                  <SurpriseArt kind={p.surprise} />
                </svg>
              ) : null}
              <span className="bubble-burst__ring" />
            </div>
          ))}
        </div>,
        api.stage,
      )
    : null;

  return (
    <ActivityPanel id="bubbles" title="Catch the bubbles" onClose={api.close}>
      {layer}
      <div className="bubble-panel">
        <svg viewBox="0 0 64 64" className="bubble-panel__jar" aria-hidden="true">
          <JarArt fill={jar} />
        </svg>
        <p className="activity-hint">Tap a bubble to pop it and find a surprise, or drag it into Pip&rsquo;s jar.</p>
      </div>
    </ActivityPanel>
  );
}

function BubbleButton({
  bubble,
  onPop,
  onDropAt,
}: {
  bubble: FloatingBubble;
  onPop: (b: FloatingBubble, el: HTMLElement | null) => void;
  onDropAt: (clientX: number, clientY: number) => boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; ox: number; oy: number; active: boolean } | null>(null);
  const [held, setHeld] = useState<{ x: number; y: number } | null>(null);

  const style = {
    left: held ? held.x : bubble.x,
    top: held ? held.y : bubble.y,
    ['--dx' as string]: `${bubble.dx}px`,
    ['--dy' as string]: `${bubble.dy}px`,
  } as React.CSSProperties;

  return (
    <button
      ref={ref}
      type="button"
      className={`float-bubble${held ? ' is-held' : ''}`}
      style={style}
      aria-label={bubble.surprise ? 'A bubble with something inside. Pop it' : 'A bubble. Pop it'}
      onPointerDown={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const parent = e.currentTarget.offsetParent?.getBoundingClientRect();
        drag.current = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          ox: r.left + r.width / 2 - (parent?.left ?? 0) - e.clientX,
          oy: r.top + r.height / 2 - (parent?.top ?? 0) - e.clientY,
          active: false,
        };
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // Tapping still pops the bubble.
        }
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        if (!d.active && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10) d.active = true;
        if (d.active) setHeld({ x: e.clientX + d.ox, y: e.clientY + d.oy });
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        if (!d || d.id !== e.pointerId) return;
        if (!d.active) {
          onPop(bubble, ref.current);
          return;
        }
        if (!onDropAt(e.clientX, e.clientY)) setHeld({ x: e.clientX + d.ox, y: e.clientY + d.oy });
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onClick={(e) => {
        // Keyboard and screen readers: Enter or a double tap pops the bubble.
        if (e.detail === 0) onPop(bubble, ref.current);
      }}
    >
      <svg viewBox="-34 -34 68 68" aria-hidden="true" className="float-bubble__art">
        <circle r="30" fill={C.blueLight} fillOpacity="0.4" stroke={C.blue} strokeWidth="2.4" />
        {bubble.surprise ? (
          <g transform="translate(-17 -17) scale(0.53)" opacity="0.85">
            <SurpriseArt kind={bubble.surprise} />
          </g>
        ) : null}
        <ellipse cx="-12" cy="-13" rx="7" ry="4" fill={C.white} opacity="0.9" transform="rotate(-35 -12 -13)" />
      </svg>
    </button>
  );
}

/* ---------- Hiccup helpers: three pretend ideas, each with its own funny result. ---------- */

const HELPER_ORDER: PipHelper[] = ['water', 'pinwheel', 'silly'];

function HelperPic({ kind }: { kind: PipHelper }) {
  return (
    <Pic box="-32 -36 64 72">
      {kind === 'water' ? <CupArt /> : kind === 'pinwheel' ? <g transform="translate(0 -10)"><PinwheelArt /></g> : <g transform="scale(1.1)"><SillyGlassesArt /></g>}
    </Pic>
  );
}

export function HiccupHelpers({ api }: { api: ActivityApi }) {
  return (
    <ActivityPanel id="hiccupHelper" title="Hiccup helpers" onClose={api.close}>
      <div className="pick-row">
        {HELPER_ORDER.map((kind) => (
          <ChoiceButton
            key={kind}
            label={PIP_HELPERS[kind].label}
            selected={timesUsed(api.visit, `act:helper:${kind}`) > 0}
            onClick={() => {
              api.sound('tap');
              api.act(`act:helper:${kind}`, PIP_HELPERS[kind].reaction, { helped: `helper:${kind}` });
            }}
          >
            <HelperPic kind={kind} />
          </ChoiceButton>
        ))}
      </div>
      <p className="activity-hint">Pretend ideas to try. Pick one and watch what happens!</p>
    </ActivityPanel>
  );
}
