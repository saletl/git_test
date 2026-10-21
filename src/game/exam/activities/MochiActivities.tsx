import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MochiHat } from '../../../art/mochi';
import { BowArt, CrownArt, DuckArt, PartyHatArt, Pic, SockArt, SqueakyArt, TrumpetArt } from '../../../icons/ActivityIcons';
import { ToolIcon } from '../../../icons/ToolIcons';
import { ArrowRightIcon } from '../../../icons/UiIcons';
import { useDrag } from '../../../tools/useDrag';
import { MOCHI_SOUND_INFO, MOCHI_SOUNDS, mochiMystery, mochiSock, sockTargetAt, type MochiSound } from '../../patients/mochi';
import type { Point } from '../../types';
import { timesUsed } from '../../visit';
import { ActivityPanel, ChoiceButton } from '../ActivityPanel';
import type { ActivityApi } from '../api';

/* ---------- Tummy sound mystery: listen, compare, guess. Every guess gets a giggle. ---------- */

export function SoundToyArt({ toy }: { toy: MochiSound }) {
  return <Pic>{toy === 'trumpet' ? <TrumpetArt /> : toy === 'duck' ? <DuckArt /> : <SqueakyArt />}</Pic>;
}

function pickSecret(previous: MochiSound | null, round: number): MochiSound {
  const options = MOCHI_SOUNDS.filter((s) => s !== previous);
  return options[(round * 7 + 3) % options.length]!;
}

export function SoundMystery({ api }: { api: ActivityApi }) {
  const [round, setRound] = useState(0);
  const [secret, setSecret] = useState<MochiSound>(() => pickSecret(null, 0));
  const [misses, setMisses] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wiggle, setWiggle] = useState<{ toy: MochiSound; key: number } | null>(null);
  const apiRef = useRef(api);
  apiRef.current = api;

  const listen = (s: MochiSound) => apiRef.current.act('act:sound:listen', () => mochiMystery.tummy(s), { meaningful: timesUsed(apiRef.current.visit, 'act:sound:listen') < 1 });

  useEffect(() => {
    const t = window.setTimeout(() => listen(secret), 300);
    return () => window.clearTimeout(t);
    // A new secret sound each round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const guess = (toy: MochiSound) => {
    setWiggle({ toy, key: Date.now() });
    if (solved) {
      api.act('act:sound:toy', () => mochiMystery.toy(toy), { meaningful: false });
      return;
    }
    if (toy === secret) {
      setSolved(true);
      api.act('act:sound:match', () => mochiMystery.match(toy));
      api.announce(`That's it! It sounds like a ${MOCHI_SOUND_INFO[toy].label.toLowerCase()}.`);
    } else {
      setMisses((m) => m + 1);
      api.act('act:sound:guess', () => mochiMystery.notQuite(toy), {
        meaningful: timesUsed(api.visit, 'act:sound:guess') < 1,
        onDone: () => listen(secret),
      });
    }
  };

  const thought =
    solved && api.stage
      ? createPortal(
          <ThoughtBubble api={api} toy={secret} />,
          api.stage,
        )
      : null;

  return (
    <ActivityPanel id="soundMystery" title="Tummy sound mystery" onClose={api.close}>
      {thought}
      <div className="pick-row pick-row--four">
        <ChoiceButton label="Listen" ariaLabel="Listen to Mochi's tummy again" className="pick-btn--listen" onClick={() => listen(secret)}>
          <ToolIcon tool="stethoscope" />
        </ChoiceButton>
        {MOCHI_SOUNDS.map((toy) => (
          <ChoiceButton
            key={toy}
            label={MOCHI_SOUND_INFO[toy].label}
            ariaLabel={`${MOCHI_SOUND_INFO[toy].label}. Does Mochi's tummy sound like this?`}
            selected={solved && toy === secret}
            glow={!solved && misses >= 2 && toy === secret}
            className={wiggle?.toy === toy ? 'is-wiggling' : ''}
            onClick={() => guess(toy)}
          >
            <span key={wiggle?.toy === toy ? wiggle.key : 0} className="sound-toy">
              <SoundToyArt toy={toy} />
            </span>
          </ChoiceButton>
        ))}
      </div>
      {solved ? (
        <div className="activity-actions">
          <p className="activity-hint">Mystery solved! Want another tummy sound?</p>
          <button
            type="button"
            className="go-btn"
            onClick={() => {
              api.sound('tap');
              setSecret((s) => pickSecret(s, round + 1));
              setRound((r) => r + 1);
              setSolved(false);
              setMisses(0);
            }}
          >
            <ArrowRightIcon />
            <span>Another sound</span>
          </button>
        </div>
      ) : (
        <p className="activity-hint">Which toy sounds like Mochi’s tummy? Take turns guessing!</p>
      )}
    </ActivityPanel>
  );
}

/** A cartoon thought bubble beside Mochi: the tummy sounds like this toy. Pretend, not inside Mochi. */
function ThoughtBubble({ api, toy }: { api: ActivityApi; toy: MochiSound }) {
  const pos = api.toStage([214, 36]);
  if (!pos) return null;
  return (
    <div className="thought-bubble" style={{ left: pos.x, top: pos.y }} aria-hidden="true">
      <SoundToyArt toy={toy} />
    </div>
  );
}

/* ---------- Sock rescue: take the sock off, put it somewhere silly, or swap in a hat. ---------- */

const HATS: { hat: Exclude<MochiHat, 'none'>; label: string }[] = [
  { hat: 'party', label: 'Party hat' },
  { hat: 'crown', label: 'Crown' },
  { hat: 'bow', label: 'Bow' },
];

const SOCK_SPOTS: Point[] = [
  [120, 66],
  [156, 52],
  [36, 112],
  [146, 224],
  [148, 118],
];

export function SockRescue({ api }: { api: ActivityApi }) {
  const [holding, setHolding] = useState(false);
  const apiRef = useRef(api);
  apiRef.current = api;
  const sock = typeof api.props.sock === 'string' ? api.props.sock : 'head';
  const onHead = sock === 'head' || sock === 'eye' || sock === 'giant';

  const putSock = (point: Point | null) => {
    const target = sockTargetAt(point);
    apiRef.current.act(`act:sock:${target}`, ({ props }) => mochiSock.place(target, props));
    setHolding(false);
  };

  useEffect(() => {
    if (!holding) {
      api.setPatientTap(null);
      api.setHighlights(null);
      return;
    }
    api.setHighlights(SOCK_SPOTS);
    api.setPatientTap((point) => {
      putSock(point);
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holding]);

  useEffect(
    () => () => {
      apiRef.current.setPatientTap(null);
      apiRef.current.setHighlights(null);
    },
    [],
  );

  const { bind, ghostRef, dragging, wasDrag } = useDrag<'sock'>({
    onStart: () => setHolding(true),
    onDrop: (_item, x, y) => {
      const point = apiRef.current.clientToPatient(x, y);
      if (point) putSock(point);
    },
  });

  return (
    <ActivityPanel id="sockRescue" title="Sock rescue" onClose={api.close}>
      <div className="pick-row pick-row--four">
        {onHead ? (
          <ChoiceButton
            label="Sock off"
            ariaLabel="Take the sock off Mochi's head"
            onClick={() => {
              api.sound('tap');
              api.act('act:sock:off', ({ props }) => mochiSock.place('off', props));
            }}
          >
            <SockArtPic />
          </ChoiceButton>
        ) : (
          <button
            type="button"
            className={`pick-btn${holding ? ' is-selected' : ''}${dragging ? ' is-dragging' : ''}`}
            aria-pressed={holding}
            aria-label={holding ? 'Holding the sock. Tap Mochi where it should go' : 'Pick up the sock, then tap Mochi where it should go'}
            {...bind('sock')}
            onClick={() => {
              if (wasDrag()) return;
              api.sound('select');
              setHolding((h) => !h);
            }}
          >
            <span className="pick-btn__pic">
              <SockArtPic />
            </span>
            <span className="pick-btn__label" aria-hidden="true">
              {holding ? 'Tap Mochi!' : 'Sock'}
            </span>
          </button>
        )}
        {HATS.map(({ hat, label }) => (
          <ChoiceButton
            key={hat}
            label={label}
            selected={api.props.hat === hat}
            onClick={() => {
              api.sound('tap');
              const next: MochiHat = api.props.hat === hat ? 'none' : hat;
              api.act(`act:hat:${next}`, ({ props }) => mochiSock.hat(next, props));
            }}
          >
            <Pic>{hat === 'party' ? <PartyHatArt /> : hat === 'crown' ? <CrownArt /> : <BowArt />}</Pic>
          </ChoiceButton>
        ))}
      </div>
      <p className="activity-hint">{onHead ? 'Rescue the sock! Then put it somewhere silly.' : holding ? 'Tap Mochi: a horn, an ear, a foot, or the head.' : 'Pick up the sock and put it somewhere silly.'}</p>
      <div ref={ghostRef} className={`tool-ghost${dragging ? ' is-visible' : ''}`} aria-hidden="true">
        {dragging ? <SockArtPic /> : null}
      </div>
    </ActivityPanel>
  );
}

function SockArtPic() {
  return (
    <Pic>
      <SockArt />
    </Pic>
  );
}
