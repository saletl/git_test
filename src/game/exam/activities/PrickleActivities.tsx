import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BANDAGE_STYLES, bandageShapes, type BandageStyle } from '../../../art/creature';
import { ShapeList } from '../../../characters/Creature';
import { ComfortArt } from '../../../icons/ComfortIcons';
import { ToolIcon } from '../../../icons/ToolIcons';
import { ArrowRightIcon, CloseIcon } from '../../../icons/UiIcons';
import { HelperArt } from '../../../tools/Items';
import { prickleBunny, prickleShot } from '../../patients/prickle';
import { COMFORT_IDS, type ComfortId, type Point, type Reaction } from '../../types';
import { timesUsed } from '../../visit';
import { ActivityPanel, ChoiceButton } from '../ActivityPanel';
import type { ActivityApi } from '../api';

const duration = (r: Reaction) => r.reduce((t, b) => t + b.ms, 0);

/* ---------- Check the bunny first ---------- */

const BUNNY_TOOLS = [
  { tool: 'stethoscope', label: 'Listen' },
  { tool: 'thermometer', label: 'Temperature' },
  { tool: 'light', label: 'Look' },
] as const;

export function BunnyCheck({ api }: { api: ActivityApi }) {
  const apiRef = useRef(api);
  apiRef.current = api;

  useEffect(() => {
    apiRef.current.play(prickleBunny.start());
    apiRef.current.setHighlights([[178, 200]]);
    return () => {
      // The bunny goes back into Prickle's arms when the check is over.
      apiRef.current.setHighlights(null);
      apiRef.current.play(prickleBunny.done());
    };
  }, []);

  const checked = BUNNY_TOOLS.filter((t) => timesUsed(api.visit, `act:bunny:${t.tool}`) > 0).length;

  return (
    <ActivityPanel id="bunnyCheck" title="Check the bunny first" onClose={api.close}>
      <div className="pick-row">
        {BUNNY_TOOLS.map(({ tool, label }) => (
          <ChoiceButton
            key={tool}
            label={label}
            ariaLabel={`${label}: use it on the bunny`}
            selected={timesUsed(api.visit, `act:bunny:${tool}`) > 0}
            onClick={() => {
              api.sound('select');
              const first = timesUsed(api.visit, `act:bunny:${tool}`) === 0;
              const ready = first && checked === 1;
              api.act(`act:bunny:${tool}`, () => [...prickleBunny[tool](), ...(ready ? prickleBunny.ready() : [])]);
            }}
          >
            <ToolIcon tool={tool} />
          </ChoiceButton>
        ))}
      </div>
      <p className="activity-hint">Prickle watches the bunny’s checkup. It helps to see it first!</p>
    </ActivityPanel>
  );
}

/* ---------- Make a comfort plan ---------- */

export const PLAN_LABELS: Record<ComfortId, string> = {
  hug: 'Hold bunny',
  music: 'Listen to music',
  break: 'Take a break',
  hand: 'Ask for help',
};

const PLAN_ORDER: ComfortId[] = ['hug', 'music', 'break', 'hand'];

export function planOf(visit: ActivityApi['visit']): ComfortId[] {
  return PLAN_ORDER.filter((id) => timesUsed(visit, `act:plan:${id}`) > 0);
}

export function ComfortPlan({ api }: { api: ActivityApi }) {
  const plan = planOf(api.visit);
  return (
    <ActivityPanel id="comfortPlan" title="Prickle’s comfort plan" onClose={api.close}>
      <div className="plan-card" aria-label={plan.length ? `Prickle's plan: ${plan.map((p) => PLAN_LABELS[p]).join(', ')}` : "Prickle's plan is empty so far"}>
        {PLAN_ORDER.map((id, i) => (
          <span key={id} className={`plan-card__slot${plan[i] ? ' is-filled' : ''}`} aria-hidden="true">
            {plan[i] ? <ComfortArt choice={plan[i]} plush="bunny" /> : null}
          </span>
        ))}
      </div>
      <div className="pick-row pick-row--four">
        {PLAN_ORDER.map((id) => (
          <ChoiceButton
            key={id}
            label={PLAN_LABELS[id]}
            selected={plan.includes(id)}
            onClick={() => {
              api.sound('tap');
              api.act(`act:plan:${id}`, (ctx) => api.def.comfort[id](ctx), { helped: `comfort:${id}` });
            }}
          >
            <ComfortArt choice={id} plush="bunny" />
          </ChoiceButton>
        ))}
      </div>
    </ActivityPanel>
  );
}

/* ---------- Pretend shot practice: gentle, honest, and skippable at every step ---------- */

type ShotStep = 'intro' | 'comfort' | 'bandage' | 'shot' | 'giving' | 'place' | 'after' | 'done';

const BANDAGE_NAMES: Record<BandageStyle, string> = { stars: 'Stars', hearts: 'Hearts', stripes: 'Stripes', rainbow: 'Rainbows' };

const AFTER_CHOICES = [
  { id: 'hug', label: 'Bunny hug' },
  { id: 'dance', label: 'Happy dance' },
  { id: 'rest', label: 'Quiet rest' },
] as const;

const ARM: Point = [158, 190];

export function PretendShot({ api }: { api: ActivityApi }) {
  const [step, setStep] = useState<ShotStep>('intro');
  const [style, setStyle] = useState<BandageStyle>('hearts');
  const apiRef = useRef(api);
  apiRef.current = api;
  const stepRef = useRef(step);
  stepRef.current = step;
  const styleRef = useRef(style);
  styleRef.current = style;

  useEffect(() => {
    apiRef.current.play(prickleShot.intro());
    return () => {
      const a = apiRef.current;
      a.setPatientTap(null);
      a.setHighlights(null);
      // Stopping early is always fine.
      if (stepRef.current !== 'done') a.play(prickleShot.skip());
    };
  }, []);

  const place = (point: Point | null) => {
    const a = apiRef.current;
    const at: Point = point && Math.hypot(point[0] - ARM[0], point[1] - ARM[1]) < 46 ? point : ARM;
    a.placeBandage(at, styleRef.current);
    a.play(prickleShot.bandage());
    a.setPatientTap(null);
    a.setHighlights(null);
    setStep('after');
  };

  useEffect(() => {
    if (step !== 'place') return;
    api.setHighlights([ARM]);
    api.setPatientTap((point) => {
      place(point);
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const helper =
    api.stage && (step === 'shot' || step === 'giving' || step === 'place')
      ? createPortal(
          <ShotHelper api={api} />,
          api.stage,
        )
      : null;

  let body: React.ReactNode = null;
  switch (step) {
    case 'intro':
      body = (
        <>
          <p className="shot-note">Prickle’s visit has a pretend shot. Shots can pinch for a moment. You can ask for help.</p>
          <div className="pick-row">
            <ChoiceButton
              label="Get ready"
              className="pick-btn--go"
              onClick={() => {
                api.sound('select');
                setStep('comfort');
              }}
            >
              <ArrowRightIcon />
            </ChoiceButton>
            <ChoiceButton
              label="Not today"
              ariaLabel="Not today. Skip the pretend shot"
              onClick={() => {
                api.sound('tap');
                api.close();
              }}
            >
              <CloseIcon />
            </ChoiceButton>
          </div>
        </>
      );
      break;
    case 'comfort':
      body = (
        <>
          <p className="activity-hint">First, pick something that helps.</p>
          <div className="pick-row pick-row--four">
            {COMFORT_IDS.map((id) => (
              <ChoiceButton
                key={id}
                label={PLAN_LABELS[id]}
                glow={planOf(api.visit).includes(id)}
                onClick={() => {
                  api.sound('tap');
                  api.act('act:shot:comfort', (ctx) => api.def.comfort[id](ctx), { helped: `comfort:${id}` });
                  setStep('bandage');
                }}
              >
                <ComfortArt choice={id} plush="bunny" />
              </ChoiceButton>
            ))}
          </div>
        </>
      );
      break;
    case 'bandage':
      body = (
        <>
          <p className="activity-hint">Pick a bandage for afterward.</p>
          <div className="pick-row pick-row--four">
            {BANDAGE_STYLES.map((s) => (
              <ChoiceButton
                key={s}
                label={BANDAGE_NAMES[s]}
                ariaLabel={`${BANDAGE_NAMES[s]} bandage`}
                selected={style === s}
                onClick={() => {
                  api.sound('tap');
                  setStyle(s);
                  api.play(prickleShot.helperArrives());
                  setStep('shot');
                }}
              >
                <svg viewBox="-34 -20 68 40" aria-hidden="true">
                  <ShapeList shapes={bandageShapes(s, [0, 0], -10, 1.05)} />
                </svg>
              </ChoiceButton>
            ))}
          </div>
        </>
      );
      break;
    case 'shot':
      body = (
        <>
          <p className="activity-hint">The helper is ready. Tap for the pretend shot.</p>
          <div className="pick-row">
            <ChoiceButton
              label="Pretend shot"
              className="pick-btn--go"
              onClick={() => {
                const r = prickleShot.shot();
                setStep('giving');
                const next = () => {
                  if (stepRef.current !== 'giving') return;
                  setStep('place');
                  apiRef.current.announce('Now put the bandage on the glowing spot on Prickle’s arm.');
                };
                api.act('act:shot:give', () => r, { shot: true, onDone: next });
                // In case the reaction is interrupted, move on anyway.
                window.setTimeout(next, duration(r) + 300);
              }}
            >
              <ToolIcon tool="toyShot" />
            </ChoiceButton>
          </div>
        </>
      );
      break;
    case 'giving':
      body = <p className="activity-hint">Boop! A quick little pinch. The bunny is right there.</p>;
      break;
    case 'place':
      body = (
        <>
          <p className="activity-hint">Put the bandage on the glowing spot.</p>
          <div className="pick-row">
            <ChoiceButton label="Put it on" ariaLabel="Put the bandage on Prickle's arm" onClick={() => place(null)}>
              <svg viewBox="-34 -20 68 40" aria-hidden="true">
                <ShapeList shapes={bandageShapes(style, [0, 0], -10, 1.05)} />
              </svg>
            </ChoiceButton>
          </div>
        </>
      );
      break;
    case 'after':
      body = (
        <>
          <p className="activity-hint">What would help now?</p>
          <div className="pick-row">
            {AFTER_CHOICES.map((c) => (
              <ChoiceButton
                key={c.id}
                label={c.label}
                onClick={() => {
                  api.sound('tap');
                  api.act('act:shot:after', () => [...prickleShot.after(c.id), ...prickleShot.finished()], { helped: `after:${c.id}` });
                  setStep('done');
                }}
              >
                {c.id === 'hug' ? <ComfortArt choice="hug" plush="bunny" /> : c.id === 'dance' ? <ComfortArt choice="music" plush="bunny" /> : <ComfortArt choice="break" plush="bunny" />}
              </ChoiceButton>
            ))}
          </div>
        </>
      );
      break;
    case 'done':
      body = (
        <>
          <p className="activity-hint">All done! Pretend shot practice is finished.</p>
          <div className="pick-row">
            <ChoiceButton label="Back to checkup" className="pick-btn--go" onClick={api.close}>
              <ArrowRightIcon />
            </ChoiceButton>
          </div>
        </>
      );
      break;
  }

  return (
    <ActivityPanel id="pretendShot" title="Pretend shot practice" onClose={api.close} closeLabel="Stop the pretend shot">
      {helper}
      <ol className="shot-steps" aria-hidden="true">
        {(['comfort', 'bandage', 'shot', 'place', 'after'] as const).map((s) => (
          <li key={s} className={stepIndex(step) > stepIndex(s) ? 'is-done' : stepIndex(step) === stepIndex(s) ? 'is-now' : ''} />
        ))}
      </ol>
      {body}
    </ActivityPanel>
  );
}

const ORDER: ShotStep[] = ['intro', 'comfort', 'bandage', 'shot', 'giving', 'place', 'after', 'done'];
const stepIndex = (s: ShotStep) => ORDER.indexOf(s);

/** The friendly helper stands beside Prickle, a little way off, holding the toy shot. */
function ShotHelper({ api }: { api: ActivityApi }) {
  const pos = api.toStage([228, 150]);
  if (!pos) return null;
  return (
    <div className="shot-helper" style={{ left: pos.x, top: pos.y }} aria-hidden="true">
      <svg viewBox="-34 -34 68 96">
        <HelperArt />
      </svg>
    </div>
  );
}
