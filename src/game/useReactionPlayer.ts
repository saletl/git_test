import { useCallback, useEffect, useRef, useState } from 'react';
import type { CreatureProps } from '../art/creature';
import type { Expression, Look } from '../art/face';
import { EFFECT_LIFETIME, type ActiveEffect } from '../animations/Effects';
import { useSettings } from '../app/settings';
import type { Beat, EffectSpec, PatientDefinition, PopupSpec, Reaction } from './types';

export interface PlayerVisual {
  /** null means "use the resting expression". */
  expression: Expression | null;
  look: Look | undefined;
  action: string | null;
  actionKey: number;
  popup: PopupSpec | null;
  toolAt: NonNullable<Beat['toolAt']> | null;
  item: NonNullable<Beat['item']> | null;
}

const IDLE_VISUAL: Omit<PlayerVisual, 'actionKey'> = {
  expression: null,
  look: undefined,
  action: null,
  popup: null,
  toolAt: null,
  item: null,
};

/**
 * Plays a patient's reactions: short timelines of expressions, animations, effects and sounds.
 * Starting a new reaction instantly replaces the current one, so every tap gets immediate feedback.
 */
export function useReactionPlayer(def: PatientDefinition, initialProps?: CreatureProps) {
  const { play: playSound, announce, calm } = useSettings();
  const [visual, setVisual] = useState<PlayerVisual>({ ...IDLE_VISUAL, actionKey: 0 });
  const [props, setProps] = useState<CreatureProps>(initialProps ?? def.initialProps);
  const [effects, setEffects] = useState<ActiveEffect[]>([]);
  const timers = useRef<number[]>([]);
  const effectTimers = useRef<number[]>([]);
  const busyRef = useRef(false);
  const nextId = useRef(1);
  const calmRef = useRef(calm);
  calmRef.current = calm;

  const clearTimers = useCallback(() => {
    for (const t of timers.current) window.clearTimeout(t);
    timers.current = [];
  }, []);

  const spawn = useCallback(
    (specs: EffectSpec[]) => {
      const created: ActiveEffect[] = specs.map((spec) => {
        const point = typeof spec.at === 'string' ? def.anchors[spec.at] ?? def.anchors.chest ?? [120, 120] : spec.at;
        const count = calmRef.current ? Math.min(spec.count ?? 1, 2) : spec.count ?? 1;
        return { id: nextId.current++, kind: spec.kind, x: point[0], y: point[1], count, size: spec.size ?? 1 };
      });
      setEffects((list) => [...list.slice(-12), ...created]);
      for (const fx of created) {
        const lifetime = EFFECT_LIFETIME[fx.kind] + fx.count * 160;
        effectTimers.current.push(
          window.setTimeout(() => setEffects((list) => list.filter((e) => e.id !== fx.id)), lifetime),
        );
      }
    },
    [def],
  );

  const applyBeat = useCallback(
    (beat: Beat) => {
      setVisual((v) => ({
        expression: beat.expression ?? v.expression,
        look: beat.look === undefined ? v.look : beat.look ?? undefined,
        action: beat.action === undefined ? v.action : beat.action,
        actionKey: beat.action ? v.actionKey + 1 : v.actionKey,
        popup: beat.popup === undefined ? v.popup : beat.popup,
        toolAt: beat.toolAt === undefined ? v.toolAt : beat.toolAt,
        item: beat.item === undefined ? v.item : beat.item,
      }));
      if (beat.props) setProps((p) => ({ ...p, ...beat.props }));
      if (beat.effects?.length) spawn(beat.effects);
      if (beat.sound) playSound(beat.sound);
      if (beat.say) announce(beat.say);
    },
    [announce, playSound, spawn],
  );

  const play = useCallback(
    (reaction: Reaction, onDone?: () => void) => {
      clearTimers();
      setVisual((v) => ({ ...IDLE_VISUAL, actionKey: v.actionKey }));
      busyRef.current = reaction.length > 0;
      let t = 0;
      reaction.forEach((beat, i) => {
        if (i === 0) applyBeat(beat);
        else timers.current.push(window.setTimeout(() => applyBeat(beat), t));
        t += beat.ms;
      });
      timers.current.push(
        window.setTimeout(() => {
          setVisual((v) => ({ ...IDLE_VISUAL, actionKey: v.actionKey }));
          busyRef.current = false;
          onDone?.();
        }, t),
      );
    },
    [applyBeat, clearTimers],
  );

  /** Stops everything at once (used by the exit button). */
  const stop = useCallback(() => {
    clearTimers();
    busyRef.current = false;
    setVisual((v) => ({ ...IDLE_VISUAL, actionKey: v.actionKey }));
    setEffects([]);
  }, [clearTimers]);

  useEffect(
    () => () => {
      clearTimers();
      for (const t of effectTimers.current) window.clearTimeout(t);
    },
    [clearTimers],
  );

  return { visual, props, setProps, effects, play, stop, busyRef };
}
