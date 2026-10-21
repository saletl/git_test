import { describe, expect, it } from 'vitest';
import { PATIENTS, PATIENT_BY_ID } from '../../src/game/patients';
import { COMFORT_IDS, TOOL_IDS, type Reaction } from '../../src/game/types';
import { applyEvent, canFinish, FINISH_AFTER, nearestBandageSpot, startVisit } from '../../src/game/visit';

const fingerprint = (r: Reaction) => JSON.stringify(r.map((b) => [b.action, b.expression, b.say, b.popup, b.effects]));

describe('patient visits', () => {
  it('can finish after a few interactions, without using every tool', () => {
    const def = PATIENT_BY_ID.pip;
    let visit = startVisit(def);
    expect(canFinish(visit)).toBe(false);
    for (let i = 0; i < FINISH_AFTER; i++) {
      visit = applyEvent(def, visit, { type: 'tool', tool: 'stethoscope' }, def.initialProps, 'stethoscope').visit;
    }
    expect(canFinish(visit)).toBe(true);
  });

  it('pokes are fun but do not count toward finishing', () => {
    const def = PATIENT_BY_ID.mochi;
    let visit = startVisit(def);
    for (let i = 0; i < 10; i++) visit = applyEvent(def, visit, { type: 'poke' }, def.initialProps, null, [120, 190]).visit;
    expect(visit.interactions).toBe(0);
    expect(canFinish(visit)).toBe(false);
  });

  it('every tool and comfort choice produces a reaction for every patient', () => {
    for (const def of PATIENTS) {
      for (const tool of TOOL_IDS) {
        if (tool === 'bandage') continue;
        const out = applyEvent(def, startVisit(def), { type: 'tool', tool }, def.initialProps, tool);
        expect(out.reaction.length, `${def.id} ${tool}`).toBeGreaterThan(0);
      }
      for (const spot of def.bandageSpots) {
        const out = applyEvent(def, startVisit(def), { type: 'bandage', spot: spot.id, style: 'stars' }, def.initialProps, 'bandage');
        expect(out.reaction.length).toBeGreaterThan(0);
        expect(out.visit.bandages).toEqual([{ spot: spot.id, style: 'stars' }]);
      }
      for (const choice of COMFORT_IDS) {
        const out = applyEvent(def, startVisit(def), { type: 'comfort', choice }, def.initialProps, null);
        expect(out.reaction.length, `${def.id} ${choice}`).toBeGreaterThan(0);
        expect(out.visit.comforted).toBe(true);
      }
    }
  });

  it('each patient reacts differently to the same tool', () => {
    for (const tool of ['stethoscope', 'thermometer', 'otoscope'] as const) {
      const prints = PATIENTS.map((def) => fingerprint(applyEvent(def, startVisit(def), { type: 'tool', tool }, def.initialProps, tool).reaction));
      expect(new Set(prints).size).toBe(PATIENTS.length);
    }
  });

  it('repeating a tool can show a different surprise', () => {
    const def = PATIENT_BY_ID.pip;
    const first = applyEvent(def, startVisit(def), { type: 'tool', tool: 'otoscope' }, def.initialProps, 'otoscope');
    const second = applyEvent(def, first.visit, { type: 'tool', tool: 'otoscope' }, def.initialProps, 'otoscope');
    expect(fingerprint(first.reaction)).not.toBe(fingerprint(second.reaction));
  });

  it('plays the "feels better" moment exactly once', () => {
    const def = PATIENT_BY_ID.waddles;
    let visit = startVisit(def);
    let times = 0;
    for (let i = 0; i < 6; i++) {
      const out = applyEvent(def, visit, { type: 'tool', tool: 'thermometer' }, def.initialProps, 'thermometer');
      if (out.justFeltBetter) times++;
      visit = out.visit;
    }
    expect(times).toBe(1);
    expect(visit.feelsBetter).toBe(true);
  });

  it("Prickle's worry eases only with comfort, and the pretend shot is optional", () => {
    const def = PATIENT_BY_ID.prickle;
    let visit = startVisit(def);
    for (let i = 0; i < 3; i++) visit = applyEvent(def, visit, { type: 'tool', tool: 'stethoscope' }, def.initialProps, 'stethoscope').visit;
    expect(visit.issue).toBe(def.issueStart);
    expect(canFinish(visit)).toBe(true);
    expect(visit.shotDone).toBe(false);
    visit = applyEvent(def, visit, { type: 'comfort', choice: 'cuddle' }, def.initialProps, null).visit;
    expect(visit.issue).toBe(def.issueStart - 1);
  });

  it('the pretend shot works without comfort first and adds a bandage', () => {
    const def = PATIENT_BY_ID.prickle;
    const out = applyEvent(def, startVisit(def), { type: 'special' }, def.initialProps, 'pretendShot');
    expect(out.visit.shotDone).toBe(true);
    expect(out.visit.bandages.map((b) => b.spot)).toContain('arm');
    const text = out.reaction.map((b) => b.say ?? '').join(' ');
    expect(text).not.toMatch(/won.?t hurt|doesn.?t hurt|no pain/i);
  });

  it("Prickle's heartbeat reflects comfort", () => {
    const def = PATIENT_BY_ID.prickle;
    const before = applyEvent(def, startVisit(def), { type: 'tool', tool: 'stethoscope' }, def.initialProps, 'stethoscope');
    const comforted = applyEvent(def, startVisit(def), { type: 'comfort', choice: 'song' }, def.initialProps, null).visit;
    const after = applyEvent(def, comforted, { type: 'tool', tool: 'stethoscope' }, def.initialProps, 'stethoscope');
    expect(before.reaction.some((b) => b.sound === 'heartbeatQuick')).toBe(true);
    expect(after.reaction.some((b) => b.sound === 'heartbeat')).toBe(true);
  });

  it('snaps a bandage to the nearest safe spot, wherever the tap lands', () => {
    const spots = PATIENT_BY_ID.pip.bandageSpots;
    expect(nearestBandageSpot(spots, [118, 100]).id).toBe('nose');
    expect(nearestBandageSpot(spots, [230, 160]).id).toBe('tail');
    expect(nearestBandageSpot(spots, [0, 0]).id).toBeDefined();
    expect(nearestBandageSpot(spots, null).id).toBe('nose');
  });

  it('keeps at most four bandages', () => {
    const def = PATIENT_BY_ID.pip;
    let visit = startVisit(def);
    for (const spot of [...def.bandageSpots, ...def.bandageSpots]) {
      visit = applyEvent(def, visit, { type: 'bandage', spot: spot.id, style: 'hearts' }, def.initialProps, 'bandage').visit;
    }
    expect(visit.bandages.length).toBeLessThanOrEqual(4);
  });

  it('never uses failure language in reactions', () => {
    for (const def of PATIENTS) {
      const all: Reaction[] = [def.intro, def.farewell, def.goodbye, def.feelsBetter];
      const text = all.flat().map((b) => b.say ?? '').join(' ');
      expect(text).not.toMatch(/wrong|fail|bad job|try harder|oops you/i);
    }
  });
});
