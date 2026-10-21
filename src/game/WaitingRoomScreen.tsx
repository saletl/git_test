import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { EFFECT_LIFETIME, EffectsLayer, type ActiveEffect } from '../animations/Effects';
import { useSettings } from '../app/settings';
import { Creature } from '../characters/Creature';
import { BottomBar, TopBar } from '../components/Frame';
import { PointerHint } from '../components/PointerHint';
import {
  Armchair,
  Clock,
  Door,
  FishTank,
  MAGAZINE_COVERS,
  Plant,
  ReceptionDesk,
  SideTable,
  Sofa,
  WaitingRoomBackdrop,
  WR_DOOR_POINT,
  WR_PATIENT_BOXES,
  WR_SPOTS,
  WR_VIEWBOX,
} from '../scenes/WaitingRoomArt';
import { C } from '../art/palette';
import { pxStyle, useSvgLayout } from '../utils/useSvgLayout';
import { PATIENTS } from './patients';
import { session } from './session';
import type { PatientDefinition, PatientId } from './types';

const FISH_HOME = { x: 166, y: 242 };

function WaitingPatient({
  def,
  box,
  tick,
  leaving,
  calm,
}: {
  def: PatientDefinition;
  box: (typeof WR_PATIENT_BOXES)[number];
  tick: number;
  leaving: boolean;
  calm: boolean;
}) {
  const [action, setAction] = useState<string | null>(null);
  const [actionKey, setActionKey] = useState(0);
  const [effects, setEffects] = useState<ActiveEffect[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    if (!tick) return;
    const idle = def.waitingIdle[tick % def.waitingIdle.length];
    if (!idle) return;
    setAction(idle.action);
    setActionKey((k) => k + 1);
    if (idle.effects) {
      const created = idle.effects.map((spec) => {
        const at = typeof spec.at === 'string' ? def.anchors[spec.at] ?? [120, 120] : spec.at;
        return { id: nextId.current++, kind: spec.kind, x: at[0], y: at[1], count: spec.count ?? 1, size: spec.size ?? 1 };
      });
      setEffects((list) => [...list, ...created]);
      const ids = created.map((c) => c.id);
      const timer = window.setTimeout(() => setEffects((list) => list.filter((e) => !ids.includes(e.id))), EFFECT_LIFETIME[created[0]!.kind] + 400);
      return () => window.clearTimeout(timer);
    }
  }, [tick, def]);

  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const style = {
    '--to-x': `${WR_DOOR_POINT.x - cx}px`,
    '--to-y': `${WR_DOOR_POINT.y - cy}px`,
  } as CSSProperties;

  return (
    <g className={`wr-patient${leaving ? (calm ? ' is-leaving-calm' : ' is-leaving') : ''}`} style={style}>
      <svg x={box.x} y={box.y} width={box.w} height={box.h} viewBox="0 0 240 240" overflow="visible">
        <Creature
          artist={def.artist}
          expression={leaving ? 'excited' : def.id === 'prickle' ? 'shy' : 'happy'}
          props={def.waitingProps ?? def.initialProps}
          action={leaving ? 'hop' : action}
          actionKey={leaving ? 999 : actionKey}
        />
        <EffectsLayer effects={effects} />
      </svg>
    </g>
  );
}

export function WaitingRoomScreen({
  entering,
  onChoose,
  onEnterExam,
  onHome,
  onBook,
  onGrownUps,
  onExit,
  bookKey,
}: {
  entering: PatientId | undefined;
  onChoose: (id: PatientId) => void;
  onEnterExam: (id: PatientId) => void;
  onHome: () => void;
  onBook: () => void;
  onGrownUps: () => void;
  onExit: () => void;
  bookKey: number;
}) {
  const { play, announce, calm } = useSettings();
  const svgRef = useRef<SVGSVGElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const toPx = useSvgLayout(svgRef, stageRef);

  const [hamster, setHamster] = useState({ key: 0, mood: 0 });
  const [bellKey, setBellKey] = useState(0);
  const [plantKey, setPlantKey] = useState(0);
  const [clockKey, setClockKey] = useState(0);
  const [cover, setCover] = useState(0);
  const [fish, setFish] = useState({ ...FISH_HOME, flip: false });
  const [idle, setIdle] = useState({ who: -1, tick: 0 });
  const [showHint, setShowHint] = useState(false);
  const following = useRef(false);
  const fishReturn = useRef<number | undefined>(undefined);
  const touched = useRef(false);

  const markTouched = useCallback(() => {
    touched.current = true;
    setShowHint(false);
  }, []);

  // One waiting patient at a time does a little idle animation, so the room feels alive but calm.
  useEffect(() => {
    if (entering) return;
    const id = window.setInterval(() => setIdle((s) => ({ who: (s.who + 1) % PATIENTS.length, tick: s.tick + 1 })), calm ? 5200 : 3400);
    return () => window.clearInterval(id);
  }, [entering, calm]);

  // A single gentle "tap here" hint, only the first time and only if nobody has tapped yet.
  useEffect(() => {
    if (session.waitingHintShown) return;
    const t = window.setTimeout(() => {
      if (!touched.current) {
        session.waitingHintShown = true;
        setShowHint(true);
      }
    }, 5000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!entering) return;
    const t = window.setTimeout(() => onEnterExam(entering), calm ? 700 : 1250);
    return () => window.clearTimeout(t);
  }, [entering, onEnterExam, calm]);

  useEffect(() => () => window.clearTimeout(fishReturn.current), []);

  const choose = (def: PatientDefinition) => {
    markTouched();
    if (entering) return;
    play('select');
    announce(`${def.name} hops up and heads to the exam room.`);
    onChoose(def.id);
  };

  const toSvgPoint = (clientX: number, clientY: number) => {
    const m = svgRef.current?.getScreenCTM();
    if (!m) return null;
    return new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
  };

  const moveFish = (clientX: number, clientY: number) => {
    const p = toSvgPoint(clientX, clientY);
    if (!p) return;
    const x = Math.max(148, Math.min(202, p.x));
    const y = Math.max(226, Math.min(262, p.y));
    setFish((f) => ({ x, y, flip: x > f.x + 1 ? true : x < f.x - 1 ? false : f.flip }));
  };

  const releaseFish = () => {
    following.current = false;
    window.clearTimeout(fishReturn.current);
    fishReturn.current = window.setTimeout(() => setFish((f) => ({ ...FISH_HOME, flip: f.x < FISH_HOME.x })), 2400);
  };

  const spots = {
    door: toPx(WR_SPOTS.door),
    clock: toPx(WR_SPOTS.clock),
    bell: toPx(WR_SPOTS.bell),
    hamster: toPx(WR_SPOTS.hamster),
    plant: toPx(WR_SPOTS.plant),
    tank: toPx(WR_SPOTS.tank),
    magazine: toPx(WR_SPOTS.magazine),
  };
  const patientBoxes = WR_PATIENT_BOXES.map((b) => toPx({ x: b.x + b.w * 0.12, y: b.y + b.h * 0.05, w: b.w * 0.76, h: b.h * 0.9 }));

  const ringBell = () => {
    markTouched();
    play('ding');
    window.setTimeout(() => play('squeak'), 260);
    setBellKey((k) => k + 1);
    setHamster((h) => ({ key: h.key + 1, mood: h.mood + 1 }));
    announce('Ding! The hamster receptionist pops up and looks very important.');
  };

  return (
    <div className="screen waiting">
      <TopBar onHome={onHome} homeLabel="Back to the start" onBook={onBook} onGrownUps={onGrownUps} bookKey={bookKey} />
      <main className="scene-wrap">
        <div className="scene waiting__scene" ref={stageRef}>
          <svg ref={svgRef} viewBox={WR_VIEWBOX} preserveAspectRatio="xMidYMid slice" className="scene__svg" aria-hidden="true">
            <WaitingRoomBackdrop />
            <Door open={Boolean(entering)} />
            <Clock birdKey={clockKey} />
            <FishTank fish={fish} />
            <ReceptionDesk hamsterKey={hamster.key} hamsterMood={hamster.mood} bellKey={bellKey} />
            <Plant danceKey={plantKey} />
            <Sofa />
            <SideTable cover={cover} />
            <Armchair x={20} color={C.sage} edge={C.forest} />
            <Armchair x={196} color={C.peach} edge={C.coralDeep} />
            {PATIENTS.map((def, i) => (
              <WaitingPatient
                key={def.id}
                def={def}
                box={WR_PATIENT_BOXES[i]!}
                tick={idle.who === i ? idle.tick : 0}
                leaving={entering === def.id}
                calm={calm}
              />
            ))}
          </svg>

          {PATIENTS.map((def, i) => (
            <button
              key={def.id}
              type="button"
              className="hotspot hotspot--patient"
              style={pxStyle(patientBoxes[i] ?? null)}
              aria-label={`${def.summary} Tap to see ${def.name.split(' ')[0]}.`}
              onClick={() => choose(def)}
              disabled={Boolean(entering)}
            />
          ))}
          <button type="button" className="hotspot" style={pxStyle(spots.bell, 6)} aria-label="Ring the reception bell" onClick={ringBell} />
          <button type="button" className="hotspot" style={pxStyle(spots.hamster)} aria-label="Say hi to the hamster receptionist" onClick={ringBell} />
          <button
            type="button"
            className="hotspot"
            style={pxStyle(spots.plant, 4)}
            aria-label="Tickle the plant"
            onClick={() => {
              markTouched();
              play('boing');
              setPlantKey((k) => k + 1);
              announce('The plant does a little dance!');
            }}
          />
          <button
            type="button"
            className="hotspot"
            style={pxStyle(spots.clock, 4)}
            aria-label="Tap the clock"
            onClick={() => {
              markTouched();
              play('tweet');
              setClockKey((k) => k + 1);
              announce('A tiny bird peeks out of the clock. Tweet tweet!');
            }}
          />
          <button
            type="button"
            className="hotspot hotspot--tank"
            style={pxStyle(spots.tank, 4)}
            aria-label="Tap the fish tank. The fish follows your finger."
            onPointerDown={(e) => {
              markTouched();
              following.current = true;
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                // Some browsers refuse capture for synthetic events; following still works without it.
              }
              moveFish(e.clientX, e.clientY);
              play('bubble');
            }}
            onPointerMove={(e) => {
              if (following.current) moveFish(e.clientX, e.clientY);
            }}
            onPointerUp={releaseFish}
            onPointerCancel={releaseFish}
            onClick={(e) => {
              if (e.detail === 0) {
                markTouched();
                play('bubble');
                setFish((f) => ({ x: f.x < 175 ? 198 : 150, y: 236, flip: f.x < 175 }));
                announce('The fish swims to the other side.');
                releaseFish();
              }
            }}
          />
          <button
            type="button"
            className="hotspot"
            style={pxStyle(spots.magazine, 4)}
            aria-label="Flip the magazine"
            onClick={() => {
              markTouched();
              play('page');
              const next = (cover + 1) % MAGAZINE_COVERS.length;
              setCover(next);
              announce(`The magazine now shows a ${MAGAZINE_COVERS[next]}!`);
            }}
          />
          <button
            type="button"
            className="hotspot"
            style={pxStyle(spots.door)}
            aria-label="The exam room door. Tap a patient to go in."
            onClick={() => {
              markTouched();
              play('tap');
              setShowHint(true);
              announce('Tap a patient to bring them to the exam room.');
            }}
          />
          {showHint && patientBoxes[0] ? <PointerHint box={patientBoxes[0]} onDone={() => setShowHint(false)} /> : null}
        </div>
      </main>
      <BottomBar onExit={onExit} />
    </div>
  );
}
