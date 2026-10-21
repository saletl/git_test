import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BANDAGE_STYLES, bandageShapes, type BandageStyle } from '../art/creature';
import { EffectsLayer } from '../animations/Effects';
import { useSettings } from '../app/settings';
import { Creature, ShapeList, type ExtraShapes } from '../characters/Creature';
import { BottomBar, TopBar } from '../components/Frame';
import { HandArt } from '../components/PointerHint';
import { COMFORT_LABELS, ComfortArt } from '../icons/ComfortIcons';
import { TOOL_LABELS, ToolArt, ToolIcon } from '../icons/ToolIcons';
import { HeartCheckIcon } from '../icons/UiIcons';
import { EXAM_PATIENT_BOX, EXAM_TRAY_BOX, EXAM_VIEWBOX, ExamRoomBackdrop, ShotTray } from '../scenes/ExamRoomArt';
import { Popup } from '../tools/Popups';
import { DemoProp, TargetRings, ToolSprite } from '../tools/InPatient';
import { Toolbar } from '../tools/Toolbar';
import { pxStyle, useSvgLayout } from '../utils/useSvgLayout';
import { PATIENT_BY_ID } from './patients';
import { session } from './session';
import { COMFORT_IDS, type AnyToolId, type ComfortId, type PatientId, type Point, type ToolId } from './types';
import { applyEvent, canFinish, nearestBandageSpot, startVisit, type VisitEvent } from './visit';
import { useReactionPlayer } from './useReactionPlayer';

type Tray = 'none' | 'bandage' | 'comfort';

const BANDAGE_LABELS: Record<BandageStyle, string> = { stars: 'Star bandage', hearts: 'Heart bandage', stripes: 'Striped bandage' };

export function ExamScreen({
  patientId,
  onComplete,
  onExit,
  onWaitingRoom,
  onStickers,
  onGrownUps,
  bookKey,
  paused,
}: {
  patientId: PatientId;
  onComplete: (id: PatientId) => void;
  onExit: (id: PatientId, earnedSticker: boolean) => void;
  onWaitingRoom: () => void;
  onStickers: () => void;
  onGrownUps: () => void;
  bookKey: number;
  paused: boolean;
}) {
  const def = PATIENT_BY_ID[patientId];
  const { play: playSound, announce, calm } = useSettings();
  const [visit, setVisit] = useState(() => startVisit(def));
  const player = useReactionPlayer(def);
  const [selected, setSelected] = useState<AnyToolId | null>(null);
  const [dragging, setDragging] = useState<ToolId | null>(null);
  const [tray, setTray] = useState<Tray>('none');
  const [bandageStyle, setBandageStyle] = useState<BandageStyle>('stars');
  const [chartKey, setChartKey] = useState(0);
  const [demoHint, setDemoHint] = useState<{ from: Point; to: Point } | null>(null);
  const [hintTool, setHintTool] = useState<ToolId | null>(null);
  const [pulseTargets, setPulseTargets] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<SVGSVGElement>(null);
  const toPx = useSvgLayout(roomRef, stageRef);
  const toolButtons = useRef<Partial<Record<ToolId, HTMLButtonElement | null>>>({});
  const lastTouch = useRef(0);
  const interacted = useRef(false);
  const introDone = useRef(false);
  const visitRef = useRef(visit);
  visitRef.current = visit;
  const propsRef = useRef(player.props);
  propsRef.current = player.props;
  const finishAnnounced = useRef(false);

  const patientPx = toPx(EXAM_PATIENT_BOX);
  const trayPx = def.special ? toPx(EXAM_TRAY_BOX) : null;
  const chartPx = toPx({ x: 282, y: 44, w: 100, h: 136 });

  // The patient's introduction plays as soon as the room opens; any tap interrupts it.
  useEffect(() => {
    player.play(def.intro, () => {
      introDone.current = true;
    });
    lastTouch.current = Date.now();
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Now and then, while nobody is tapping, the patient does their idle thing (a hiccup, a sneeze...).
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      if (player.busyRef.current) return;
      if (Date.now() - lastTouch.current < 4500) return;
      const idle = def.idle(visitRef.current, propsRef.current);
      if (idle) player.play(idle);
    }, calm ? 7000 : 5200);
    return () => window.clearInterval(id);
  }, [def, player, calm, paused]);

  // A one-time demonstration: the stethoscope floats to the patient and back, then a soft glow if still needed.
  useEffect(() => {
    if (session.examDemoShown || paused) return;
    const showDemo = window.setTimeout(() => {
      if (interacted.current || session.examDemoShown) return;
      const button = toolButtons.current.stethoscope;
      const patientSvg = roomRef.current?.querySelector<SVGSVGElement>('.exam__patient');
      if (!button || !patientSvg) return;
      session.examDemoShown = true;
      const b = button.getBoundingClientRect();
      const p = patientSvg.getBoundingClientRect();
      const chest = def.anchors[def.toolTarget.stethoscope] ?? [120, 160];
      setDemoHint({
        from: [b.left + b.width / 2, b.top + b.height / 2],
        to: [p.left + (chest[0] / 240) * p.width, p.top + (chest[1] / 240) * p.height],
      });
    }, 6500);
    const glow = window.setTimeout(() => {
      if (!interacted.current) setHintTool('stethoscope');
    }, 17000);
    return () => {
      window.clearTimeout(showDemo);
      window.clearTimeout(glow);
    };
  }, [def, paused]);

  const touch = () => {
    lastTouch.current = Date.now();
    interacted.current = true;
    setHintTool(null);
    setDemoHint(null);
  };

  const finishReady = canFinish(visit);
  useEffect(() => {
    if (finishReady && !finishAnnounced.current) {
      finishAnnounced.current = true;
      announce(`${def.name.split(' ')[0]} is feeling better. The heart button at the bottom finishes the visit.`);
    }
  }, [finishReady, announce, def]);

  const run = useCallback(
    (event: VisitEvent, point: Point | null = null) => {
      const out = applyEvent(def, visitRef.current, event, propsRef.current, selected, point);
      visitRef.current = out.visit;
      setVisit(out.visit);
      player.play(out.reaction);
    },
    [def, player, selected],
  );

  const applyTool = (tool: AnyToolId, point: Point | null) => {
    touch();
    if (tool === 'bandage') {
      const spot = nearestBandageSpot(def.bandageSpots, point);
      run({ type: 'bandage', spot: spot.id, style: bandageStyle }, point);
    } else if (tool === 'pretendShot') {
      run({ type: 'special' }, point);
      setSelected(null);
      setTray('none');
    } else {
      run({ type: 'tool', tool }, point);
    }
  };

  const onPatientTap = (point: Point | null) => {
    if (selected) applyTool(selected, point);
    else {
      touch();
      run({ type: 'poke' }, point);
    }
  };

  const onSelectTool = (tool: ToolId) => {
    touch();
    if (selected === tool) {
      setSelected(null);
      setTray('none');
      playSound('tap');
      return;
    }
    playSound('select');
    setSelected(tool);
    setTray(tool === 'bandage' ? 'bandage' : 'none');
    setPulseTargets(true);
    announce(`${TOOL_LABELS[tool]} picked up. Tap ${def.name.split(' ')[0]} to use it.`);
  };

  const onSelectSpecial = () => {
    if (!def.special) return;
    touch();
    if (selected === def.special.tool) {
      setSelected(null);
      setTray('none');
      return;
    }
    playSound('select');
    setSelected(def.special.tool);
    setTray('comfort');
    player.play(def.special.onSelect({ visit: visitRef.current, props: propsRef.current, selectedTool: def.special.tool, use: 1 }));
  };

  const onComfortChoice = (choice: ComfortId) => {
    touch();
    playSound('tap');
    run({ type: 'comfort', choice });
    setTray('none');
    if (choice === 'pause') setSelected(null);
  };

  const onDrop = (tool: ToolId, clientX: number, clientY: number): boolean => {
    const svg = roomRef.current?.querySelector<SVGSVGElement>('.exam__patient');
    if (!svg) return false;
    const r = svg.getBoundingClientRect();
    const pad = r.width * 0.12;
    if (clientX < r.left - pad || clientX > r.right + pad || clientY < r.top - pad || clientY > r.bottom + pad) {
      playSound('tap');
      return false;
    }
    const point: Point = [((clientX - r.left) / r.width) * 240, ((clientY - r.top) / r.height) * 240];
    if (tool === 'bandage') setTray('bandage');
    applyTool(tool, point);
    return true;
  };

  const stopAll = () => {
    player.stop();
    setSelected(null);
    setTray('none');
  };

  const bandageExtras = useMemo<ExtraShapes[]>(
    () =>
      visit.bandages.map((b) => {
        const spot = def.bandageSpots.find((s) => s.id === b.spot) ?? def.bandageSpots[0]!;
        return { part: spot.part, shapes: bandageShapes(b.style, spot.at, spot.rotate, spot.scale ?? 0.7) };
      }),
    [visit.bandages, def],
  );

  const activeTool: AnyToolId | null = dragging ?? selected;
  const targetPoints: Point[] = useMemo(() => {
    if (!activeTool) return [];
    if (activeTool === 'bandage') return def.bandageSpots.map((s) => s.at);
    if (activeTool === 'pretendShot') return [def.anchors.arm ?? [150, 190]];
    const anchor = def.anchors[def.toolTarget[activeTool]];
    return anchor ? [anchor] : [];
  }, [activeTool, def]);

  useEffect(() => {
    if (!pulseTargets) return;
    const t = window.setTimeout(() => setPulseTargets(false), 1800);
    return () => window.clearTimeout(t);
  }, [pulseTargets]);

  const expression = player.visual.expression ?? def.restingExpression(visit);
  const firstName = def.name.split(' ')[0];
  const comfortGlow = (def.id === 'prickle' && !visit.comforted) || selected === 'pretendShot';

  return (
    <div className="screen exam" style={{ ['--room-tint' as string]: def.roomTint }}>
      <TopBar
        onHome={() => {
          stopAll();
          onWaitingRoom();
        }}
        homeLabel="Back to the waiting room"
        onStickers={onStickers}
        onGrownUps={onGrownUps}
        bookKey={bookKey}
      />
      <main className="exam__stage" ref={stageRef}>
        <svg ref={roomRef} viewBox={EXAM_VIEWBOX} preserveAspectRatio="xMidYMid slice" className="scene__svg" aria-hidden="true">
          <ExamRoomBackdrop tint={def.roomTint} chartKey={chartKey} />
          {def.special ? (
            <g>
              <ShotTray empty={selected === def.special.tool} />
              {selected === def.special.tool ? null : (
                <g transform="translate(4 410) scale(0.8)" className="tray-shot">
                  <ToolArt tool={def.special.tool} />
                </g>
              )}
            </g>
          ) : null}
          <svg
            className="exam__patient"
            x={EXAM_PATIENT_BOX.x}
            y={EXAM_PATIENT_BOX.y}
            width={EXAM_PATIENT_BOX.w}
            height={EXAM_PATIENT_BOX.h}
            viewBox="0 0 240 240"
            overflow="visible"
          >
            <Creature
              artist={def.artist}
              expression={expression}
              look={player.visual.look}
              props={player.props}
              action={player.visual.action}
              actionKey={player.visual.actionKey}
              extras={bandageExtras}
            />
            {targetPoints.length && !player.visual.toolAt ? <TargetRings points={targetPoints} pulse={pulseTargets} /> : null}
            {player.visual.toolAt ? (
              <ToolSprite tool={player.visual.toolAt.tool} at={def.anchors[player.visual.toolAt.at] ?? [120, 140]} />
            ) : null}
            {player.visual.demo ? (
              def.id === 'prickle' ? (
                <ToolSprite tool={player.visual.demo.tool} at={def.anchors[player.visual.demo.at] ?? [120, 180]} />
              ) : (
                <DemoProp plush={def.plush} tool={player.visual.demo.tool} at={def.anchors[player.visual.demo.at] ?? [214, 212]} />
              )
            ) : null}
            <EffectsLayer effects={player.effects} />
          </svg>
        </svg>

        <button
          type="button"
          className={`patient-hit${selected ? ' has-tool' : ''}`}
          style={pxStyle(patientPx)}
          aria-label={selected ? `Use the ${TOOL_LABELS[selected].toLowerCase()} on ${firstName}` : `Say hi to ${firstName}`}
          onClick={(e) => {
            if (e.detail === 0) {
              onPatientTap(null);
              return;
            }
            const r = e.currentTarget.getBoundingClientRect();
            onPatientTap([((e.clientX - r.left) / r.width) * 240, ((e.clientY - r.top) / r.height) * 240]);
          }}
        />
        {def.special && trayPx ? (
          <button
            type="button"
            className={`hotspot hotspot--tray${selected === def.special.tool ? ' is-selected' : ''}`}
            style={pxStyle(trayPx, 10)}
            aria-label={selected === def.special.tool ? 'Put the pretend shot back on the tray' : 'Pick up the pretend shot. Prickle can finish the visit without it.'}
            aria-pressed={selected === def.special.tool}
            onClick={onSelectSpecial}
          />
        ) : null}
        <button
          type="button"
          className="hotspot"
          style={pxStyle(chartPx)}
          aria-label="Tap the shape chart"
          onClick={() => {
            touch();
            playSound('boing');
            setChartKey((k) => k + 1);
            announce('The shapes on the chart wiggle!');
          }}
        />

        {player.visual.popup ? (
          <div className={`popup popup--${player.visual.popup.kind}`} aria-hidden="true">
            <Popup spec={player.visual.popup} />
          </div>
        ) : null}

        {tray === 'bandage' ? (
          <div className="context-tray" role="group" aria-label="Choose a bandage">
            {BANDAGE_STYLES.map((style) => (
              <button
                key={style}
                type="button"
                className={`choice-btn choice-btn--bandage${bandageStyle === style ? ' is-selected' : ''}`}
                aria-label={BANDAGE_LABELS[style]}
                aria-pressed={bandageStyle === style}
                onClick={() => {
                  touch();
                  playSound('tap');
                  setBandageStyle(style);
                  setPulseTargets(true);
                }}
              >
                <svg viewBox="-36 -20 72 40" aria-hidden="true">
                  <ShapeList shapes={bandageShapes(style, [0, 0], -10, 1.1)} />
                </svg>
              </button>
            ))}
          </div>
        ) : null}
        {tray === 'comfort' ? (
          <div className="context-tray context-tray--comfort" role="group" aria-label="Comfort choices">
            {COMFORT_IDS.map((choice) => (
              <button key={choice} type="button" className="choice-btn" aria-label={COMFORT_LABELS[choice]} onClick={() => onComfortChoice(choice)}>
                <ComfortArt choice={choice} plush={def.plush} tool={selected ?? 'stethoscope'} />
              </button>
            ))}
          </div>
        ) : null}

      </main>
      {demoHint ? <DemoGhost from={demoHint.from} to={demoHint.to} calm={calm} onDone={() => setDemoHint(null)} /> : null}
      <Toolbar
        selected={selected}
        comfortOpen={tray === 'comfort'}
        comfortGlow={comfortGlow}
        hintTool={hintTool}
        onSelect={onSelectTool}
        onComfort={() => {
          touch();
          playSound('tap');
          setTray((t) => (t === 'comfort' ? 'none' : 'comfort'));
        }}
        onDragStart={(tool) => {
          touch();
          setDragging(tool);
        }}
        onDragEnd={() => setDragging(null)}
        onDrop={onDrop}
        registerButton={(tool, el) => {
          toolButtons.current[tool] = el;
        }}
      />
      <BottomBar
        onExit={() => {
          stopAll();
          onExit(patientId, canFinish(visitRef.current));
        }}
        right={
          finishReady ? (
            <button
              type="button"
              className="finish-btn"
              onClick={() => {
                stopAll();
                playSound('jingle');
                onComplete(patientId);
              }}
            >
              <HeartCheckIcon className="finish-btn__icon" />
              <span className="finish-btn__text">Feeling better!</span>
            </button>
          ) : null
        }
      />
    </div>
  );
}

/** The one-time "here's how" demonstration: a stethoscope floats to the patient and back. */
function DemoGhost({ from, to, calm, onDone }: { from: Point; to: Point; calm: boolean; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const [fx, fy] = from;
    const [tx, ty] = to;
    const at = (x: number, y: number, s = 1) => `translate(${x - 36}px, ${y - 36}px) scale(${s})`;
    let anim: Animation | null = null;
    if (calm || !el.animate) {
      el.style.transform = at(tx, ty);
      anim = el.animate?.([{ opacity: 0 }, { opacity: 0.9 }, { opacity: 0.9 }, { opacity: 0 }], { duration: 2200 }) ?? null;
    } else {
      anim = el.animate(
        [
          { transform: at(fx, fy, 0.9), opacity: 0 },
          { transform: at(fx, fy - 30, 1.05), opacity: 0.95, offset: 0.15 },
          { transform: at(tx, ty, 1), opacity: 0.95, offset: 0.5 },
          { transform: at(tx, ty, 1), opacity: 0.95, offset: 0.68 },
          { transform: at(fx, fy, 0.9), opacity: 0 },
        ],
        { duration: 2600, easing: 'ease-in-out' },
      );
    }
    const t = window.setTimeout(onDone, calm ? 2300 : 2700);
    return () => {
      anim?.cancel();
      window.clearTimeout(t);
    };
  }, [from, to, calm, onDone]);
  return (
    <div ref={ref} className="demo-ghost" aria-hidden="true">
      <ToolIcon tool="stethoscope" />
      <span className="demo-ghost__hand">
        <HandArt />
      </span>
    </div>
  );
}
