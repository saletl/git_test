import { describe, expect, it } from 'vitest';
import { PATIENTS, PATIENT_BY_ID } from '../../src/game/patients';
import { prickleShot } from '../../src/game/patients/prickle';
import { waddlesWardrobe } from '../../src/game/patients/waddles';
import { mochiSock, sockTargetAt } from '../../src/game/patients/mochi';
import { COMFORT_IDS, type PatientDefinition, type Reaction, type VisitState } from '../../src/game/types';
import { applyEvent, canFinish, discoveryFor, FINISH_AFTER, MAX_BANDAGES, placeOnBody, startVisit, type VisitEvent } from '../../src/game/visit';

const fingerprint = (r: Reaction) => JSON.stringify(r.map((b) => [b.action, b.expression, b.say, b.popup, b.effects, b.item]));
const run = (def: PatientDefinition, visit: VisitState, event: VisitEvent, point: [number, number] | null = null) => applyEvent(def, visit, event, def.initialProps, point);
const allSay = (r: Reaction) => r.map((b) => b.say ?? '').join(' ');

describe('patient visits', () => {
  it('can finish after a couple of interactions, without using every tool or activity', () => {
    const def = PATIENT_BY_ID.pip;
    let visit = startVisit(def);
    expect(canFinish(visit)).toBe(false);
    for (let i = 0; i < FINISH_AFTER; i++) visit = run(def, visit, { type: 'tool', tool: 'stethoscope' }).visit;
    expect(canFinish(visit)).toBe(true);
  });

  it('pokes, bandage moves and undo are fun but do not count toward finishing', () => {
    const def = PATIENT_BY_ID.mochi;
    let visit = startVisit(def);
    for (let i = 0; i < 10; i++) visit = run(def, visit, { type: 'poke' }, [120, 190]).visit;
    visit = run(def, visit, { type: 'setBandages', bandages: [] }).visit;
    expect(visit.interactions).toBe(0);
  });

  it('every tool, look and comfort choice produces a visible reaction for every patient', () => {
    for (const def of PATIENTS) {
      for (const tool of ['stethoscope', 'thermometer'] as const) {
        expect(run(def, startVisit(def), { type: 'tool', tool }).reaction.length, `${def.id} ${tool}`).toBeGreaterThan(0);
      }
      for (const target of ['ear', 'throat'] as const) {
        const r = run(def, startVisit(def), { type: 'look', target }).reaction;
        expect(r.some((b) => b.popup?.kind === 'lens'), `${def.id} ${target}`).toBe(true);
      }
      for (const choice of COMFORT_IDS) {
        const out = run(def, startVisit(def), { type: 'comfort', choice });
        // A comfort choice always changes something you can see: an animation, a prop, or an effect.
        expect(out.reaction.some((b) => b.action || b.item || b.props || b.effects?.length), `${def.id} ${choice}`).toBe(true);
        expect(out.visit.comforted).toBe(true);
        expect(out.visit.helped).toEqual([`comfort:${choice}`]);
      }
    }
  });

  it('labels comfort choices with short words, using each patient’s own toy', () => {
    expect(PATIENT_BY_ID.prickle.comfortLabels).toEqual({ hug: 'Hug bunny', break: 'Take a break', music: 'Play music', hand: 'Hold a hand' });
    for (const def of PATIENTS) for (const label of Object.values(def.comfortLabels)) expect(label.split(' ').length).toBeLessThanOrEqual(3);
  });

  it('each patient reacts differently to the same tool', () => {
    for (const event of [
      { type: 'tool', tool: 'stethoscope' },
      { type: 'tool', tool: 'thermometer' },
      { type: 'look', target: 'ear' },
      { type: 'look', target: 'throat' },
    ] as const) {
      const prints = PATIENTS.map((def) => fingerprint(run(def, startVisit(def), event).reaction));
      expect(new Set(prints).size).toBe(PATIENTS.length);
    }
  });

  it('gives every patient a clear story, two or more activities of its own, and three discoveries', () => {
    const activities = new Set<string>();
    for (const def of PATIENTS) {
      expect(def.story.intro.length).toBeGreaterThan(20);
      expect(def.story.reason.length).toBeGreaterThan(3);
      expect(def.story.prompts.length).toBeGreaterThanOrEqual(2);
      expect(def.activities.length).toBeGreaterThanOrEqual(2);
      for (const a of def.activities) {
        expect(activities.has(a.id), `${a.id} is shared`).toBe(false);
        activities.add(a.id);
      }
      expect(def.chart.discoveries).toHaveLength(3);
    }
    expect(PATIENT_BY_ID.pip.story.intro).toBe('Oh no! Pip keeps hiccuping bubbles! Can you help?');
  });

  it('Mochi’s tummy sounds different in different places', () => {
    const def = PATIENT_BY_ID.mochi;
    const sounds = (
      [
        [100, 188],
        [142, 188],
        [120, 214],
        [120, 150],
      ] as const
    ).map(([x, y]) => run(def, startVisit(def), { type: 'tool', tool: 'stethoscope' }, [x, y]).reaction.map((b) => b.sound).filter(Boolean).join());
    expect(new Set(sounds).size).toBe(4);
  });

  it('fills the chart as the child plays, each discovery once', () => {
    const def = PATIENT_BY_ID.pip;
    let out = run(def, startVisit(def), { type: 'tool', tool: 'stethoscope' });
    expect(out.discovered).toBe('heartbeat');
    out = run(def, out.visit, { type: 'tool', tool: 'stethoscope' });
    expect(out.discovered).toBeNull();
    out = run(def, out.visit, { type: 'act', key: 'act:bubbles:pop', reaction: () => [] });
    expect(out.discovered).toBe('bubbles');
    out = run(def, out.visit, { type: 'act', key: 'act:helper:pinwheel', reaction: () => [], helped: 'helper:pinwheel' });
    expect(out.discovered).toBe('helper');
    expect(out.visit.discoveries).toEqual({ heartbeat: 'tool:stethoscope', bubbles: 'act:bubbles:pop', helper: 'act:helper:pinwheel' });
    expect(out.visit.helped).toEqual(['helper:pinwheel']);
  });

  it('matches chart discoveries by exact key first, then by wildcard', () => {
    const def = PATIENT_BY_ID.prickle;
    expect(discoveryFor(def, 'act:bunny:light')).toBe('bunny');
    expect(discoveryFor(def, 'act:plan:hug')).toBe('plan');
    expect(discoveryFor(def, 'act:shot:give')).toBeUndefined();
    expect(discoveryFor(PATIENT_BY_ID.mochi, 'act:sound:guess')).toBeUndefined();
    expect(discoveryFor(PATIENT_BY_ID.mochi, 'act:sound:match')).toBe('mystery');
  });

  it('repeating a tool can show a different surprise', () => {
    const def = PATIENT_BY_ID.pip;
    const first = run(def, startVisit(def), { type: 'look', target: 'ear' });
    const second = run(def, first.visit, { type: 'look', target: 'ear' });
    expect(fingerprint(first.reaction)).not.toBe(fingerprint(second.reaction));
  });

  it('plays the "feels better" moment exactly once', () => {
    const def = PATIENT_BY_ID.mochi;
    let visit = startVisit(def);
    let times = 0;
    for (let i = 0; i < 6; i++) {
      const out = run(def, visit, { type: 'comfort', choice: 'music' });
      if (out.justFeltBetter) times++;
      visit = out.visit;
    }
    expect(times).toBe(1);
    expect(visit.feelsBetter).toBe(true);
  });

  it("Prickle's worry eases with comfort and practice, never by pushing through, and the shot is optional", () => {
    const def = PATIENT_BY_ID.prickle;
    let visit = startVisit(def);
    for (let i = 0; i < 3; i++) visit = run(def, visit, { type: 'tool', tool: 'stethoscope' }).visit;
    expect(visit.issue).toBe(def.issueStart);
    expect(canFinish(visit)).toBe(true);
    expect(visit.shotDone).toBe(false);
    visit = run(def, visit, { type: 'act', key: 'act:bunny:stethoscope', reaction: () => [] }).visit;
    expect(visit.issue).toBe(def.issueStart - 1);
  });

  it('keeps the pretend shot honest and gentle', () => {
    const text = [prickleShot.intro(), prickleShot.shot(), prickleShot.skip(), prickleShot.finished(), prickleShot.after('hug')].map(allSay).join(' ');
    expect(text).toContain('Shots can pinch for a moment. You can ask for help.');
    expect(text).not.toMatch(/won.?t hurt|doesn.?t hurt|no pain|big kids don.?t|don.?t cry|be brave|stop crying/i);
    // Skipping is always offered and always fine.
    expect(allSay(prickleShot.skip())).toMatch(/okay/);
  });

  it('records a pretend shot only when the child chooses it', () => {
    const def = PATIENT_BY_ID.prickle;
    const out = run(def, startVisit(def), { type: 'act', key: 'act:shot:give', reaction: () => prickleShot.shot(), shot: true });
    expect(out.visit.shotDone).toBe(true);
  });

  it("Prickle's heartbeat reflects how supported Prickle feels", () => {
    const def = PATIENT_BY_ID.prickle;
    const before = run(def, startVisit(def), { type: 'tool', tool: 'stethoscope' });
    const comforted = run(def, startVisit(def), { type: 'comfort', choice: 'music' }).visit;
    const after = run(def, comforted, { type: 'tool', tool: 'stethoscope' });
    expect(before.reaction.some((b) => b.sound === 'heartbeatQuick')).toBe(true);
    expect(after.reaction.some((b) => b.sound === 'heartbeat')).toBe(true);
  });

  it('never uses failure language in reactions', () => {
    for (const def of PATIENTS) {
      const all: Reaction[] = [def.intro, def.farewell, def.goodbye, def.feelsBetter];
      const text = all.flat().map((b) => b.say ?? '').join(' ');
      expect(text).not.toMatch(/wrong|fail|bad job|try harder|oops you/i);
    }
  });
});

describe('freeform bandages', () => {
  const def = PATIENT_BY_ID.pip;

  it('sticks exactly where the patient was tapped, not on a fixed spot', () => {
    const a = run(def, startVisit(def), { type: 'bandage', at: [101, 187], style: 'stars' }).visit.bandages[0]!;
    const b = run(def, startVisit(def), { type: 'bandage', at: [109, 173], style: 'stars' }).visit.bandages[0]!;
    expect([a.x, a.y]).toEqual([101, 187]);
    expect([b.x, b.y]).toEqual([109, 173]);
    expect(a.part).toBe('body');
  });

  it('slides a tap just off the patient onto the nearest edge', () => {
    const { at } = placeOnBody(def.bodyRegions, [2, 230]);
    const inside = def.bodyRegions.some((r) => Math.hypot((at[0] - r.cx) / r.rx, (at[1] - r.cy) / r.ry) <= 1);
    expect(inside).toBe(true);
  });

  it('attaches each bandage to the body part under it, so it moves with that part', () => {
    expect(placeOnBody(def.bodyRegions, [210, 170]).part).toBe('tail');
    expect(placeOnBody(def.bodyRegions, [120, 90]).part).toBe('head');
    expect(placeOnBody(PATIENT_BY_ID.waddles.bodyRegions, [50, 150]).part).toBe('flipperL');
  });

  it('gives fun reactions in surprising places and a friendly one anywhere else', () => {
    const nose = run(def, startVisit(def), { type: 'bandage', at: [120, 108], style: 'hearts' }).reaction;
    const plain = run(def, startVisit(def), { type: 'bandage', at: [96, 214], style: 'hearts' }).reaction;
    expect(allSay(nose)).toMatch(/cross-eyed/);
    expect(plain.length).toBeGreaterThan(0);
    expect(fingerprint(nose)).not.toBe(fingerprint(plain));
  });

  it('moves, removes and restores bandages', () => {
    let visit = run(def, startVisit(def), { type: 'bandage', at: [100, 180], style: 'stars' }).visit;
    visit = run(def, visit, { type: 'bandage', at: [140, 180], style: 'rainbow' }).visit;
    const before = visit.bandages;
    const [first, second] = before;
    visit = run(def, visit, { type: 'moveBandage', id: first!.id, at: [205, 170] }).visit;
    expect(visit.bandages[0]).toMatchObject({ id: first!.id, x: 205, y: 170, part: 'tail' });
    visit = run(def, visit, { type: 'removeBandage', id: second!.id }).visit;
    expect(visit.bandages.map((b) => b.id)).toEqual([first!.id]);
    visit = run(def, visit, { type: 'setBandages', bandages: before }).visit;
    expect(visit.bandages).toEqual(before);
  });

  it('allows lots of bandages, letting the oldest go past the limit', () => {
    let visit = startVisit(def);
    for (let i = 0; i < MAX_BANDAGES + 3; i++) visit = run(def, visit, { type: 'bandage', at: [100 + i, 180], style: 'hearts' }).visit;
    expect(visit.bandages).toHaveLength(MAX_BANDAGES);
    expect(new Set(visit.bandages.map((b) => b.id)).size).toBe(MAX_BANDAGES);
  });
});

describe('patient mini-adventures', () => {
  it('Waddles’ scarves hide a fish pin and then a bow tie', () => {
    let props = { scarves: 3 };
    const pin = waddlesWardrobe.scarfOff(props);
    expect(pin.key).toBe('act:wardrobe:pin');
    props = { scarves: 1 };
    expect(waddlesWardrobe.scarfOff(props).key).toBe('act:wardrobe:bowtie');
    expect(waddlesWardrobe.scarfOff({ scarves: 0 }).key).toBe('act:wardrobe:none');
    expect(waddlesWardrobe.scarfOn({ scarves: 7 }).key).toBe('act:wardrobe:full');
  });

  it('Mochi’s sock goes wherever it is tapped, with a different reaction each place', () => {
    expect(sockTargetAt([156, 60])).toBe('horn');
    expect(sockTargetAt([30, 112])).toBe('ear');
    expect(sockTargetAt([146, 222])).toBe('foot');
    expect(sockTargetAt([120, 66])).toBe('head');
    const says = (['head', 'eye', 'horn', 'ear', 'foot', 'off'] as const).map((t) => allSay(mochiSock.place(t, {})));
    expect(new Set(says).size).toBe(6);
  });
});
