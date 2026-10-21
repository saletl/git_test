import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { bandageShapes, type BandageStyle } from '../art/creature';
import { EffectsLayer } from '../animations/Effects';
import { useSettings } from '../app/settings';
import { Creature, type ExtraShapes } from '../characters/Creature';
import { BottomBar, TopBar } from '../components/Frame';
import { HandArt } from '../components/PointerHint';
import { TOOL_NAMES, ToolIcon } from '../icons/ToolIcons';
import { HeartCheckIcon } from '../icons/UiIcons';
import {
  EXAM_PATIENT_BOX,
  EXAM_VIEWBOX,
  ExamRoomBackdrop,
  LampLight,
  POSTER_COUNT,
  ROOM_PROP_BOXES,
  RoomProps,
  type RoomProp,
  type RoomState,
} from '../scenes/ExamRoomArt';
import { TargetRings, ToolSprite } from '../tools/InPatient';
import { ItemSprite } from '../tools/Items';
import { Popup } from '../tools/Popups';
import { Toolbar } from '../tools/Toolbar';
import { pxStyle, useSvgLayout } from '../utils/useSvgLayout';
import { ACTIVITY_COMPONENTS } from './exam/activities';
import { AdventureShelf } from './exam/AdventureShelf';
import type { ActivityApi } from './exam/api';
import { BandageHandles } from './exam/BandageHandles';
import { ChartButton, ChartPanel } from './exam/Chart';
import { StoryBubble, type BubbleMessage } from './exam/StoryBubble';
import { BandageTray, ComfortTray } from './exam/Trays';
import { PATIENT_BY_ID } from './patients';
import { session } from './session';
import type { ActivityId, ComfortId, LookTarget, PatientId, PlacedBandage, Point, Reaction, ToolId } from './types';
import { applyEvent, canFinish, distance, startVisit, timesUsed, type VisitEvent } from './visit';
import { useReactionPlayer } from './useReactionPlayer';

const PROMPT_FIRST_MS = 24000;
const PROMPT_EVERY_MS = 38000;

const ROOM_LABELS: Record<RoomProp, string> = {
  lamp: 'Exam lamp. Tap to turn it on or off',
  poster: 'Poster. Tap to change it',
  sink: 'Sink. Tap for bubbles',
  cabinet: 'Cabinet. Tap to open or close it',
};

export function ExamScreen({
  patientId,
  onComplete,
  onExit,
  onWaitingRoom,
  onBook,
  onGrownUps,
  bookKey,
  paused,
}: {
  patientId: PatientId;
  onComplete: (id: PatientId) => void;
  onExit: (id: PatientId, earned: boolean) => void;
  onWaitingRoom: () => void;
  onBook: () => void;
  onGrownUps: () => void;
  bookKey: number;
  paused: boolean;
}) {
  const def = PATIENT_BY_ID[patientId];
  const firstName = def.name.split(' ')[0]!;
  const { play: playSound, announce, calm } = useSettings();
  const [visit, setVisit] = useState(() => startVisit(def));
  const player = useReactionPlayer(def);
  const [selected, setSelected] = useState<ToolId | null>(null);
  const [dragging, setDragging] = useState<ToolId | null>(null);
  const [comfortOpen, setComfortOpen] = useState(false);
  const [bandageStyle, setBandageStyle] = useState<BandageStyle>('stars');
  const [selectedBandage, setSelectedBandage] = useState<number | null>(null);
  const [draggedBandage, setDraggedBandage] = useState<number | null>(null);
  const [history, setHistory] = useState<PlacedBandage[][]>([]);
  const [activity, setActivity] = useState<ActivityId | null>(null);
  const [chartOpen, setChartOpen] = useState(false);
  const [chartBump, setChartBump] = useState(0);
  const [room, setRoom] = useState<RoomState>({ lamp: false, poster: 0, cabinet: false, sink: 0 });
  const [bubble, setBubble] = useState<BubbleMessage | null>({ kind: 'story', text: def.story.intro, key: 0 });
  const [highlights, setHighlights] = useState<Point[] | null>(null);
  const [demo, setDemo] = useState<{ tool: ToolId; from: Point; to: Point } | null>(null);
  const [hintTool, setHintTool] = useState<ToolId | null>(null);
  const [pulseTargets, setPulseTargets] = useState(false);
  const [stageEl, setStageEl] = useState<HTMLElement | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<SVGSVGElement>(null);
  const toPx = useSvgLayout(roomRef, stageRef);
  const toolButtons = useRef<Partial<Record<ToolId, HTMLButtonElement | null>>>({});
  const lastTouch = useRef(Date.now());
  const interacted = useRef(false);
  const visitRef = useRef(visit);
  visitRef.current = visit;
  const propsRef = useRef(player.props);
  propsRef.current = player.props;
  const activityRef = useRef(activity);
  activityRef.current = activity;
  const patientTap = useRef<((point: Point | null) => boolean) | null>(null);
  const finishAnnounced = useRef(false);
  const promptIndex = useRef(0);

  const patientPx = toPx(EXAM_PATIENT_BOX);
  const unit = patientPx ? patientPx.width / 240 : 1;

  const setStage = useCallback((el: HTMLDivElement | null) => {
    stageRef.current = el;
    setStageEl(el);
  }, []);

  /** Patient space (240 x 240) to pixels in the stage. */
  const toStage = useCallback(
    (p: Point) => {
      const box = toPx({
        x: EXAM_PATIENT_BOX.x + (p[0] / 240) * EXAM_PATIENT_BOX.w,
        y: EXAM_PATIENT_BOX.y + (p[1] / 240) * EXAM_PATIENT_BOX.h,
        w: 0,
        h: 0,
      });
      return box ? { x: box.left, y: box.top } : null;
    },
    [toPx],
  );

  /** A screen point to patient space; null when it lands well away from the patient. */
  const clientToPatient = useCallback((clientX: number, clientY: number): Point | null => {
    const svg = roomRef.current?.querySelector<SVGSVGElement>('.exam__patient');
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    const pad = r.width * 0.1;
    if (clientX < r.left - pad || clientX > r.right + pad || clientY < r.top - pad || clientY > r.bottom + pad) return null;
    return [((clientX - r.left) / r.width) * 240, ((clientY - r.top) / r.height) * 240];
  }, []);

  // The patient's introduction plays as soon as the room opens; any tap interrupts it.
  useEffect(() => {
    player.play(def.intro);
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Now and then, while nobody is tapping, the patient does their idle thing (a hiccup, a sneeze...).
  useEffect(() => {
    if (paused || chartOpen) return;
    const id = window.setInterval(
      () => {
        if (player.busyRef.current || activityRef.current) return;
        if (Date.now() - lastTouch.current < 4500) return;
        const idle = def.idle(visitRef.current, propsRef.current);
        if (idle) player.play(idle);
      },
      calm ? 7000 : 5200,
    );
    return () => window.clearInterval(id);
  }, [def, player, calm, paused, chartOpen]);

  // Optional conversation starters for a grown-up and child, now and then. Easy to ignore.
  useEffect(() => {
    if (paused || chartOpen) return;
    let timer = 0;
    const schedule = (delay: number) => {
      timer = window.setTimeout(() => {
        if (promptIndex.current >= def.story.prompts.length) return;
        const text = def.story.prompts[promptIndex.current]!;
        promptIndex.current += 1;
        setBubble({ kind: 'prompt', text, key: promptIndex.current });
        schedule(PROMPT_EVERY_MS);
      }, delay);
    };
    schedule(promptIndex.current === 0 ? PROMPT_FIRST_MS : PROMPT_EVERY_MS);
    return () => window.clearTimeout(timer);
  }, [def, paused, chartOpen]);

  // If nobody has tapped anything for a while, the Listen button lifts gently.
  useEffect(() => {
    if (paused) return;
    const glow = window.setTimeout(() => {
      if (!interacted.current) setHintTool('stethoscope');
    }, 14000);
    return () => window.clearTimeout(glow);
  }, [paused]);

  const touch = () => {
    lastTouch.current = Date.now();
    interacted.current = true;
    setHintTool(null);
  };

  const finishReady = canFinish(visit);
  useEffect(() => {
    if (finishReady && !finishAnnounced.current) {
      finishAnnounced.current = true;
      announce(`${firstName} is feeling better. The "Feeling better" button finishes the visit whenever you like.`);
    }
  }, [finishReady, announce, firstName]);

  const run = useCallback(
    (event: VisitEvent, point: Point | null = null, onDone?: () => void) => {
      const out = applyEvent(def, visitRef.current, event, propsRef.current, point);
      visitRef.current = out.visit;
      setVisit(out.visit);
      player.play(out.reaction, onDone);
      if (out.discovered) {
        setChartBump((k) => k + 1);
        const found = def.chart.discoveries.find((d) => d.id === out.discovered);
        if (found) announce(`New on ${firstName}'s chart: ${found.label}.`);
      }
    },
    [def, player, announce, firstName],
  );

  const pushHistory = () => {
    // Capture now: by the time React applies the update, the visit has already changed.
    const before = visitRef.current.bandages;
    setHistory((h) => [...h.slice(-19), before]);
  };

  const lookTarget = (point: Point | null): LookTarget => {
    if (!point) return timesUsed(visitRef.current, 'look:ear') > timesUsed(visitRef.current, 'look:throat') ? 'throat' : 'ear';
    const ear = def.anchors.ear ?? [180, 90];
    const mouth = def.anchors.mouth ?? [120, 130];
    return distance(point, mouth) < distance(point, ear) ? 'throat' : 'ear';
  };

  const applyToolAt = (tool: ToolId, point: Point | null) => {
    touch();
    setBubble((b) => (b?.kind === 'story' ? null : b));
    switch (tool) {
      case 'bandage': {
        const at = point ?? def.anchors.chest ?? [120, 160];
        pushHistory();
        if (selectedBandage !== null) {
          run({ type: 'moveBandage', id: selectedBandage, at }, at);
          setSelectedBandage(null);
        } else {
          run({ type: 'bandage', at, style: bandageStyle }, at);
        }
        return;
      }
      case 'light':
        run({ type: 'look', target: lookTarget(point) }, point);
        return;
      default:
        run({ type: 'tool', tool }, point);
    }
  };

  const onPatientTap = (point: Point | null) => {
    touch();
    if (patientTap.current?.(point)) return;
    if (selected) applyToolAt(selected, point);
    else run({ type: 'poke' }, point);
  };

  const showDemo = (tool: ToolId) => {
    if (session.toolDemos.has(tool) || calm) return;
    session.toolDemos.add(tool);
    const button = toolButtons.current[tool];
    const patientSvg = roomRef.current?.querySelector<SVGSVGElement>('.exam__patient');
    if (!button || !patientSvg) return;
    const b = button.getBoundingClientRect();
    const p = patientSvg.getBoundingClientRect();
    const target = def.toolZones?.[tool as Exclude<ToolId, 'bandage'>]?.[0] ?? (tool === 'bandage' ? def.anchors.chest : def.anchors[def.toolTarget[tool as Exclude<ToolId, 'bandage'>]]) ?? [120, 160];
    setDemo({ tool, from: [b.left + b.width / 2, b.top + b.height / 2], to: [p.left + (target[0] / 240) * p.width, p.top + (target[1] / 240) * p.height] });
  };

  const onSelectTool = (tool: ToolId) => {
    touch();
    setComfortOpen(false);
    setSelectedBandage(null);
    if (selected === tool) {
      setSelected(null);
      playSound('tap');
      return;
    }
    playSound('select');
    setSelected(tool);
    setPulseTargets(true);
    showDemo(tool);
    announce(
      tool === 'bandage'
        ? `Bandages. Pick a pattern, then tap ${firstName} anywhere to stick one on.`
        : tool === 'light'
          ? `Light picked up. Tap ${firstName}'s ear or mouth.`
          : `${TOOL_NAMES[tool]} picked up. Tap ${firstName} to use it.`,
    );
  };

  const onComfortChoice = (choice: ComfortId) => {
    touch();
    playSound('tap');
    setComfortOpen(false);
    setSelected(null);
    run({ type: 'comfort', choice });
  };

  const onDropTool = (tool: ToolId, clientX: number, clientY: number) => {
    const point = clientToPatient(clientX, clientY);
    if (!point) {
      playSound('tap');
      return;
    }
    setSelected(tool);
    applyToolAt(tool, point);
  };

  const onDropBandageStyle = (style: BandageStyle, clientX: number, clientY: number) => {
    const point = clientToPatient(clientX, clientY);
    setBandageStyle(style);
    if (!point) return;
    touch();
    pushHistory();
    run({ type: 'bandage', at: point, style }, point);
  };

  const undoBandage = () => {
    touch();
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory((h) => h.slice(0, -1));
    setSelectedBandage(null);
    run({ type: 'setBandages', bandages: previous });
    announce('Undone.');
  };

  const removeBandage = () => {
    if (selectedBandage === null) return;
    touch();
    pushHistory();
    run({ type: 'removeBandage', id: selectedBandage });
    setSelectedBandage(null);
  };

  const openActivity = (id: ActivityId) => {
    touch();
    playSound('select');
    player.stop();
    setSelected(null);
    setComfortOpen(false);
    setSelectedBandage(null);
    setBubble((b) => (b?.kind === 'story' ? null : b));
    setActivity(id);
  };

  const clearDemo = useCallback(() => setDemo(null), []);
  const hideBubble = useCallback(() => setBubble(null), []);

  const closeActivity = useCallback(() => {
    patientTap.current = null;
    setHighlights(null);
    setActivity(null);
  }, []);

  const tapRoom = (prop: RoomProp) => {
    touch();
    switch (prop) {
      case 'lamp': {
        const on = !room.lamp;
        setRoom((r) => ({ ...r, lamp: on }));
        playSound('click');
        if (on && !activityRef.current) player.play([{ ms: 700, expression: 'calm', look: 'up' }, { ms: 500, expression: 'happy', look: null }]);
        announce(on ? 'The lamp is on.' : 'The lamp is off.');
        break;
      }
      case 'poster':
        setRoom((r) => ({ ...r, poster: (r.poster + 1) % POSTER_COUNT }));
        playSound('page');
        announce('A new poster!');
        break;
      case 'sink':
        setRoom((r) => ({ ...r, sink: r.sink + 1 }));
        playSound('splash');
        announce('Bubbles float up from the sink!');
        break;
      case 'cabinet':
        setRoom((r) => ({ ...r, cabinet: !r.cabinet }));
        playSound(room.cabinet ? 'bonk' : 'boing');
        announce(room.cabinet ? 'The cabinet is closed.' : 'The cabinet is open: cotton balls, a rubber duck, and spare bandages.');
        break;
    }
  };

  /** Stops everything at once: used by every exit. */
  const stopAll = () => {
    player.stop();
    patientTap.current = null;
    setActivity(null);
    setChartOpen(false);
    setSelected(null);
    setComfortOpen(false);
    setBubble(null);
  };

  const finish = () => {
    stopAll();
    playSound('jingle');
    onComplete(patientId);
  };

  const api: ActivityApi = {
    def,
    visit,
    props: player.props,
    act: (key, reaction, options) => {
      touch();
      run({ type: 'act', key, reaction, helped: options?.helped, meaningful: options?.meaningful, shot: options?.shot }, null, options?.onDone);
    },
    play: (reaction: Reaction, onDone?: () => void) => player.play(reaction, onDone),
    placeBandage: (at, style) => {
      pushHistory();
      run({ type: 'bandage', at, style }, at);
    },
    close: closeActivity,
    toStage,
    clientToPatient,
    setPatientTap: (handler) => {
      patientTap.current = handler;
    },
    setHighlights,
    stage: stageEl,
    sound: playSound,
    announce,
    calm,
  };

  const bandageExtras = useMemo<ExtraShapes[]>(
    () =>
      visit.bandages
        .filter((b) => b.id !== draggedBandage)
        .map((b) => ({ part: b.part, shapes: bandageShapes(b.style, [b.x, b.y], b.rotate, 0.7) })),
    [visit.bandages, draggedBandage],
  );

  const activeTool = dragging ?? selected;
  const targetPoints: Point[] = useMemo(() => {
    if (highlights) return highlights;
    if (!activeTool) return [];
    if (activeTool === 'bandage') return pulseTargets ? def.bandageZones.map((z) => z.at) : [];
    const zones = def.toolZones?.[activeTool];
    if (zones) return zones;
    const anchor = def.anchors[def.toolTarget[activeTool]];
    return anchor ? [anchor] : [];
  }, [activeTool, def, highlights, pulseTargets]);

  useEffect(() => {
    if (!pulseTargets) return;
    const t = window.setTimeout(() => setPulseTargets(false), 1800);
    return () => window.clearTimeout(t);
  }, [pulseTargets]);

  const expression = player.visual.expression ?? def.restingExpression(visit);
  const ActivityView = activity ? ACTIVITY_COMPONENTS[activity] : null;
  const comfortGlow = def.id === 'prickle' && !visit.comforted && visit.interactions > 0;
  const suggested: ActivityId | null = interacted.current ? null : def.activities[0]?.id ?? null;

  return (
    <div className="screen exam" style={{ ['--room-tint' as string]: def.roomTint }} data-patient={def.id}>
      <TopBar
        onHome={() => {
          stopAll();
          onWaitingRoom();
        }}
        homeLabel="Back to the waiting room"
        onBook={onBook}
        onGrownUps={onGrownUps}
        bookKey={bookKey}
      />
      <main className={`exam__stage${selected === 'bandage' ? ' is-decorating' : ''}`} ref={setStage}>
        <svg ref={roomRef} viewBox={EXAM_VIEWBOX} preserveAspectRatio="xMidYMid slice" className="scene__svg" aria-hidden="true">
          <ExamRoomBackdrop tint={def.roomTint} />
          <RoomProps room={room} />
          <LampLight on={room.lamp} />
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
            {targetPoints.length && !player.visual.toolAt ? <TargetRings points={targetPoints} pulse={pulseTargets} small={activeTool === 'bandage'} /> : null}
            {player.visual.item ? <ItemSprite kind={player.visual.item.kind} at={def.anchors[player.visual.item.at] ?? [210, 200]} /> : null}
            {player.visual.toolAt ? <ToolSprite tool={player.visual.toolAt.tool} at={def.anchors[player.visual.toolAt.at] ?? [120, 140]} /> : null}
            <EffectsLayer effects={player.effects} />
          </svg>
        </svg>

        {(Object.keys(ROOM_PROP_BOXES) as RoomProp[]).map((prop) => (
          <button
            key={prop}
            type="button"
            className={`hotspot hotspot--room hotspot--${prop}`}
            style={pxStyle(toPx(ROOM_PROP_BOXES[prop]))}
            aria-label={ROOM_LABELS[prop]}
            aria-pressed={prop === 'lamp' ? room.lamp : prop === 'cabinet' ? room.cabinet : undefined}
            onClick={() => tapRoom(prop)}
          />
        ))}

        <button
          type="button"
          className={`patient-hit${selected ? ' has-tool' : ''}`}
          style={pxStyle(patientPx)}
          aria-label={
            selected === 'bandage'
              ? selectedBandage !== null
                ? `Move the picked-up bandage on ${firstName}`
                : `Stick a bandage on ${firstName}`
              : selected
                ? `Use the ${TOOL_NAMES[selected].toLowerCase()} on ${firstName}`
                : `Say hi to ${firstName}`
          }
          onClick={(e) => {
            if (e.detail === 0) {
              onPatientTap(null);
              return;
            }
            const r = e.currentTarget.getBoundingClientRect();
            onPatientTap([((e.clientX - r.left) / r.width) * 240, ((e.clientY - r.top) / r.height) * 240]);
          }}
        />

        {selected === 'bandage' && !activity ? (
          <BandageHandles
            bandages={visit.bandages}
            selectedId={selectedBandage}
            toStage={toStage}
            clientToPatient={clientToPatient}
            scale={unit}
            onSelect={(id) => {
              touch();
              playSound(id === null ? 'tap' : 'select');
              setSelectedBandage(id);
              if (id !== null) announce('Bandage picked up. Tap the patient where it should go, or remove it.');
            }}
            onMove={(id, to) => {
              touch();
              pushHistory();
              run({ type: 'moveBandage', id, at: to }, to);
              setSelectedBandage(null);
            }}
            onDragChange={setDraggedBandage}
          />
        ) : null}

        <ChartButton
          def={def}
          visit={visit}
          bumpKey={chartBump}
          onOpen={() => {
            touch();
            playSound('page');
            setChartOpen(true);
          }}
        />

        {bubble ? <StoryBubble message={bubble} onDone={hideBubble} /> : null}

        {player.visual.popup ? (
          <div className={`popup popup--${player.visual.popup.kind}`} aria-hidden="true">
            <Popup spec={player.visual.popup} />
          </div>
        ) : null}

        {!activity && selected !== 'bandage' && !comfortOpen ? (
          <AdventureShelf activities={def.activities} onOpen={openActivity} glow={suggested} />
        ) : null}

        {selected === 'bandage' && !activity ? (
          <BandageTray
            style={bandageStyle}
            onStyle={(s) => {
              touch();
              setBandageStyle(s);
              setPulseTargets(true);
            }}
            onDropStyle={onDropBandageStyle}
            canUndo={history.length > 0}
            onUndo={undoBandage}
            selectedBandage={selectedBandage}
            onRemove={removeBandage}
          />
        ) : null}
        {comfortOpen && !activity ? <ComfortTray labels={def.comfortLabels} plush={def.plush} onChoose={onComfortChoice} /> : null}
      </main>

      {demo ? <DemoGhost tool={demo.tool} from={demo.from} to={demo.to} calm={calm} onDone={clearDemo} /> : null}

      <div className="exam__controls">
        {ActivityView ? (
          <ActivityView key={activity} api={api} />
        ) : (
          <Toolbar
            selected={selected}
            comfortOpen={comfortOpen}
            comfortGlow={comfortGlow}
            hintTool={hintTool}
            plush={def.plush}
            onSelect={onSelectTool}
            onComfort={() => {
              touch();
              playSound('tap');
              setSelected(null);
              setComfortOpen((open) => !open);
            }}
            onDragStart={(tool) => {
              touch();
              setDragging(tool);
            }}
            onDragEnd={() => setDragging(null)}
            onDrop={onDropTool}
            registerButton={(tool, el) => {
              toolButtons.current[tool] = el;
            }}
          />
        )}
      </div>

      {chartOpen ? (
        <ChartPanel
          def={def}
          visit={visit}
          onClose={() => {
            playSound('tap');
            setChartOpen(false);
          }}
          onStamp={finish}
        />
      ) : null}

      <BottomBar
        onExit={() => {
          stopAll();
          onExit(patientId, canFinish(visitRef.current));
        }}
        right={
          finishReady ? (
            <button type="button" className="finish-btn" onClick={finish}>
              <HeartCheckIcon className="finish-btn__icon" />
              <span className="finish-btn__text">Feeling better!</span>
            </button>
          ) : null
        }
      />
    </div>
  );
}

/** A quick "here's how": the tool floats from its button to the patient and back, once per tool. */
function DemoGhost({ tool, from, to, calm, onDone }: { tool: ToolId; from: Point; to: Point; calm: boolean; onDone: () => void }) {
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
      anim = el.animate?.([{ opacity: 0 }, { opacity: 0.9 }, { opacity: 0.9 }, { opacity: 0 }], { duration: 1600 }) ?? null;
    } else {
      anim = el.animate(
        [
          { transform: at(fx, fy, 0.9), opacity: 0 },
          { transform: at(fx, fy - 24, 1.05), opacity: 0.95, offset: 0.15 },
          { transform: at(tx, ty, 1), opacity: 0.95, offset: 0.5 },
          { transform: at(tx, ty, 1), opacity: 0.95, offset: 0.7 },
          { transform: at(tx, ty, 0.9), opacity: 0 },
        ],
        { duration: 1700, easing: 'ease-in-out' },
      );
    }
    const t = window.setTimeout(onDone, 1800);
    return () => {
      anim?.cancel();
      window.clearTimeout(t);
    };
  }, [from, to, calm, onDone]);
  return (
    <div ref={ref} className="demo-ghost" aria-hidden="true">
      <ToolIcon tool={tool} />
      <span className="demo-ghost__hand">
        <HandArt />
      </span>
    </div>
  );
}
