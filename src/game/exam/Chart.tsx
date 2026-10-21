import { useEffect, useRef, useState } from 'react';
import { plushShapes } from '../../art/creature';
import { C } from '../../art/palette';
import { useSettings } from '../../app/settings';
import { Creature, ShapeList } from '../../characters/Creature';
import { BeanieArt, Pic, SockArt, TissueBoxArt } from '../../icons/ActivityIcons';
import { ComfortArt } from '../../icons/ComfortIcons';
import { ClipboardIcon, CloseIcon, StampIcon } from '../../icons/UiIcons';
import { CupArt, PinwheelArt, SillyGlassesArt } from '../../tools/Items';
import { COMFORT_IDS, type ChartIcon, type ComfortId, type PatientDefinition, type VisitState } from '../types';

/**
 * The patient's chart: why they came, three things to discover, and what helped.
 * It fills itself in as the child plays; nothing needs reading or typing, and nothing needs to be complete.
 */

function ChartIconArt({ icon }: { icon: ChartIcon }) {
  switch (icon) {
    case 'heartbeat':
      return (
        <Pic>
          <path d="M32 54 C14 42 8 32 12 22 C16 12 27 12 32 20 C37 12 48 12 52 22 C56 32 50 42 32 54 Z" fill={C.berry} stroke="#c55a83" strokeWidth="2.6" />
          <path d="M14 33 H24 L28 25 L33 41 L37 31 H50" fill="none" stroke={C.white} strokeWidth="3.4" />
        </Pic>
      );
    case 'bubbles':
      return (
        <Pic>
          <circle cx="24" cy="38" r="14" fill={C.blueLight} fillOpacity="0.6" stroke={C.blue} strokeWidth="2.4" />
          <circle cx="44" cy="22" r="10" fill={C.blueLight} fillOpacity="0.6" stroke={C.blue} strokeWidth="2.4" />
          <circle cx="46" cy="46" r="6" fill={C.blueLight} fillOpacity="0.6" stroke={C.blue} strokeWidth="2" />
          <path d="M24 32 L26 37 L31 37.5 L27 41 L28 46 L24 43.5 L20 46 L21 41 L17 37.5 L22 37 Z" fill={C.gold} />
          <circle cx="19" cy="32" r="2.6" fill={C.white} />
        </Pic>
      );
    case 'helper':
      return (
        <Pic box="-32 -32 64 64">
          <PinwheelArt />
        </Pic>
      );
    case 'tools':
      return (
        <Pic>
          <circle cx="32" cy="32" r="22" fill={C.mintLight} stroke={C.mintDeep} strokeWidth="2.6" />
          <path d="M22 32 L29 39 L42 25" fill="none" stroke={C.mintDeep} strokeWidth="4" />
        </Pic>
      );
    case 'bowtie':
      return (
        <Pic>
          <path d="M32 32 L10 18 L10 46 Z" fill={C.berry} stroke={C.ink} strokeWidth="2.4" />
          <path d="M32 32 L54 18 L54 46 Z" fill={C.berry} stroke={C.ink} strokeWidth="2.4" />
          <ellipse cx="32" cy="32" rx="7" ry="8" fill={C.coral} stroke={C.ink} strokeWidth="2.2" />
        </Pic>
      );
    case 'tissue':
      return (
        <Pic>
          <TissueBoxArt />
        </Pic>
      );
    case 'bunny':
      return (
        <Pic box="-32 -40 64 72">
          <ShapeList shapes={plushShapes('bunny', [0, 4], 0.85)} />
        </Pic>
      );
    case 'plan':
      return (
        <Pic>
          <rect x="12" y="8" width="40" height="50" rx="6" fill={C.wood} stroke={C.woodDeep} strokeWidth="2.6" />
          <rect x="17" y="14" width="30" height="38" rx="3" fill={C.white} />
          <path d="M26 24 C24 22 21 23 21 26 C21 29 26 32 26 32 C26 32 31 29 31 26 C31 23 28 22 26 24 Z" fill={C.berry} />
          <path d="M22 42 L27 47 L42 34" fill="none" stroke={C.mintDeep} strokeWidth="3.4" />
        </Pic>
      );
    case 'bandage':
      return (
        <Pic>
          <rect x="6" y="24" width="52" height="16" rx="8" fill={C.berryLight} stroke={C.berry} strokeWidth="3" transform="rotate(-25 32 32)" />
          <rect x="24" y="25.5" width="16" height="13" rx="3" fill={C.paper} transform="rotate(-25 32 32)" />
        </Pic>
      );
    case 'rumble':
      return (
        <Pic>
          <ellipse cx="32" cy="34" rx="18" ry="16" fill={C.lilacLight} stroke={C.lilacDeep} strokeWidth="2.6" />
          <path d="M8 22 C4 30 4 38 8 46 M56 22 C60 30 60 38 56 46" fill="none" stroke={C.lilacDeep} strokeWidth="3" />
          <path d="M24 34 C27 30 29 38 32 34 C35 30 37 38 40 34" fill="none" stroke={C.lilacDeep} strokeWidth="2.6" />
        </Pic>
      );
    case 'mystery':
      return (
        <Pic>
          <circle cx="32" cy="32" r="22" fill={C.goldLight} stroke={C.goldDeep} strokeWidth="2.6" />
          <path d="M25 26 C25 18 39 18 39 26 C39 32 32 32 32 39" fill="none" stroke={C.goldDeep} strokeWidth="4.4" />
          <circle cx="32" cy="46" r="2.8" fill={C.goldDeep} />
        </Pic>
      );
    case 'sock':
      return (
        <Pic>
          <SockArt />
        </Pic>
      );
  }
}

/** A picture for something that helped (a comfort choice, a hiccup helper...). */
function HelpedArt({ id, def }: { id: string; def: PatientDefinition }) {
  const [kind, value] = id.split(':') as [string, string];
  if (kind === 'comfort' && (COMFORT_IDS as readonly string[]).includes(value)) return <ComfortArt choice={value as ComfortId} plush={def.plush} />;
  if (kind === 'after') return <ComfortArt choice={value === 'dance' ? 'music' : value === 'rest' ? 'break' : 'hug'} plush={def.plush} />;
  if (id === 'helper:water') return <Pic box="-30 -34 60 68"><CupArt /></Pic>;
  if (id === 'helper:pinwheel') return <Pic box="-32 -32 64 80"><PinwheelArt /></Pic>;
  if (id === 'helper:silly') return <Pic box="-32 -20 64 40"><SillyGlassesArt /></Pic>;
  if (id === 'helper:tissue') return <Pic><TissueBoxArt /></Pic>;
  return <Pic><BeanieArt /></Pic>;
}

function helpedLabel(id: string, def: PatientDefinition): string {
  const [kind, value] = id.split(':') as [string, string];
  if (kind === 'comfort') return def.comfortLabels[value as ComfortId] ?? 'Comfort';
  const names: Record<string, string> = {
    'helper:water': 'Sip of water',
    'helper:pinwheel': 'Pinwheel breaths',
    'helper:silly': 'Silly glasses',
    'helper:tissue': 'A tissue',
    'after:hug': 'Bunny hug',
    'after:dance': 'Happy dance',
    'after:rest': 'Quiet rest',
  };
  return names[id] ?? 'Help';
}

export function ChartButton({ def, visit, bumpKey, onOpen }: { def: PatientDefinition; visit: VisitState; bumpKey: number; onOpen: () => void }) {
  const found = def.chart.discoveries.filter((d) => visit.discoveries[d.id]).length;
  return (
    <button
      type="button"
      className={`chart-btn${bumpKey ? ' is-bumping' : ''}`}
      key={bumpKey}
      aria-label={`${def.name.split(' ')[0]}'s chart. ${found} of 3 discoveries found`}
      onClick={onOpen}
    >
      <ClipboardIcon className="chart-btn__icon" />
      <span className="chart-btn__label" aria-hidden="true">
        Chart
      </span>
      <span className="chart-btn__dots" aria-hidden="true">
        {def.chart.discoveries.map((d) => (
          <span key={d.id} className={visit.discoveries[d.id] ? 'is-found' : ''} />
        ))}
      </span>
    </button>
  );
}

export function ChartPanel({
  def,
  visit,
  onClose,
  onStamp,
}: {
  def: PatientDefinition;
  visit: VisitState;
  onClose: () => void;
  /** Called after the stamp lands. */
  onStamp: () => void;
}) {
  const { play, announce, calm } = useSettings();
  const [stamped, setStamped] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onStampRef = useRef(onStamp);
  onStampRef.current = onStamp;
  const first = def.name.split(' ')[0];

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!stamped) return;
    const t = window.setTimeout(() => onStampRef.current(), calm ? 900 : 1500);
    return () => window.clearTimeout(t);
  }, [stamped, calm]);

  return (
    <div className="chart-overlay" role="dialog" aria-modal="false" aria-label={`${first}'s chart`}>
      <div className="chart-board">
        <div className="chart-board__clip" aria-hidden="true" />
        <div className="chart-paper">
          <button ref={closeRef} type="button" className="chart-paper__close" aria-label="Close the chart" onClick={onClose}>
            <CloseIcon />
          </button>
          <div className="chart-head">
            <div className="chart-head__portrait" aria-hidden="true">
              <Creature artist={def.artist} expression="happy" props={def.initialProps} idle={false} />
            </div>
            <div>
              <p className="chart-head__name">{def.name}</p>
              <p className="chart-head__reason">
                <span className="chart-label">Here for: </span>
                {def.story.reason}
              </p>
            </div>
          </div>

          <p className="chart-label chart-label--row">Discoveries</p>
          <ul className="chart-discoveries">
            {def.chart.discoveries.map((d) => {
              const detail = visit.discoveries[d.id];
              const showHelper = d.icon === 'helper' && detail && (detail.startsWith('comfort:') || detail.startsWith('act:helper:'));
              return (
                <li key={d.id} className={`chart-slot${detail ? ' is-found' : ''}`} aria-label={`${d.label}: ${detail ? 'found' : 'not yet'}`}>
                  <span className="chart-slot__pic" aria-hidden="true">
                    {showHelper ? <HelpedArt id={detail.replace('act:helper:', 'helper:')} def={def} /> : <ChartIconArt icon={d.icon} />}
                    {detail ? <span className="chart-slot__check" /> : null}
                  </span>
                  <span className="chart-slot__label" aria-hidden="true">
                    {d.label}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="chart-label chart-label--row">What helped</p>
          <ul className="chart-helped" aria-label={visit.helped.length ? 'What helped' : 'Nothing picked yet'}>
            {visit.helped.length ? (
              visit.helped.slice(0, 5).map((id) => (
                <li key={id} className="chart-helped__item" aria-label={helpedLabel(id, def)}>
                  <HelpedArt id={id} def={def} />
                </li>
              ))
            ) : (
              <li className="chart-helped__empty" aria-hidden="true" />
            )}
          </ul>

          <div className="chart-stamp-row">
            {stamped ? (
              <div className="chart-stamp" role="status">
                <svg viewBox="-60 -60 120 120" aria-hidden="true">
                  <circle r="54" fill="none" stroke={C.berry} strokeWidth="6" />
                  <circle r="44" fill="none" stroke={C.berry} strokeWidth="2.4" strokeDasharray="4 5" />
                  <path d="M0 -30 L9 -10 L31 -8 L14 6 L19 28 L0 16 L-19 28 L-14 6 L-31 -8 L-9 -10 Z" fill={C.berry} />
                </svg>
                <span className="chart-stamp__text">Visit done!</span>
              </div>
            ) : (
              <button
                type="button"
                className="stamp-btn"
                onClick={() => {
                  play('stamp');
                  setStamped(true);
                  announce(`Stamp! ${first}'s visit is done.`);
                }}
              >
                <StampIcon className="stamp-btn__icon" />
                <span>Stamp the chart</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

