/**
 * Tiny synthesized sound effects. No audio files are downloaded.
 * The AudioContext is only created after the player taps something (browser autoplay rules),
 * and every sound is short and quiet. Sounds never carry information that isn't also shown on screen.
 */

export type SoundId =
  | 'tap'
  | 'select'
  | 'bubble'
  | 'heartbeat'
  | 'heartbeatMusical'
  | 'heartbeatQuick'
  | 'rumble'
  | 'sneeze'
  | 'ding'
  | 'squeak'
  | 'tweet'
  | 'whoosh'
  | 'jingle'
  | 'sparkle'
  | 'beep'
  | 'pop'
  | 'boing'
  | 'song'
  | 'breath'
  | 'giggle'
  | 'stick'
  | 'page'
  | 'bonk'
  | 'toot'
  | 'quack'
  | 'drum'
  | 'gulp'
  | 'glub'
  | 'stamp'
  | 'click'
  | 'splash';

type Ctx = AudioContext;

let ctx: Ctx | null = null;
let master: GainNode | null = null;
let muted = false;
let quiet = false;

function now(): number {
  return ctx ? ctx.currentTime : 0;
}

/** Call from a user gesture (like the Play button) to allow sound on iOS and Chrome. */
export function unlockAudio(): void {
  if (typeof window === 'undefined') return;
  try {
    if (!ctx) {
      const AudioCtor: typeof AudioContext | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return;
      ctx = new AudioCtor();
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.ratio.value = 6;
      master = ctx.createGain();
      master.gain.value = quiet ? 0.28 : 0.45;
      master.connect(compressor);
      compressor.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
    master = null;
  }
}

export function setMuted(value: boolean): void {
  muted = value;
  if (muted) stopAllSounds();
}

/** Calm mode plays everything more softly. */
export function setQuiet(value: boolean): void {
  quiet = value;
  if (master && ctx) master.gain.setTargetAtTime(quiet ? 0.28 : 0.45, now(), 0.05);
}

const active = new Set<AudioScheduledSourceNode>();

export function stopAllSounds(): void {
  for (const node of active) {
    try {
      node.stop();
    } catch {
      // Already stopped.
    }
  }
  active.clear();
}

function track(node: AudioScheduledSourceNode): void {
  active.add(node);
  node.onended = () => active.delete(node);
}

interface ToneOptions {
  freq: number;
  to?: number;
  start?: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  attack?: number;
}

function tone({ freq, to, start = 0, dur, type = 'sine', gain = 0.2, attack = 0.01 }: ToneOptions): void {
  if (!ctx || !master) return;
  const t0 = now() + start;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(env);
  env.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
  track(osc);
}

let noiseBuffer: AudioBuffer | null = null;

function noise({ start = 0, dur, gain = 0.08, filter = 1200, sweepTo }: { start?: number; dur: number; gain?: number; filter?: number; sweepTo?: number }): void {
  if (!ctx || !master) return;
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const t0 = now() + start;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(filter, t0);
  if (sweepTo) bp.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
  bp.Q.value = 0.8;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + dur * 0.3);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp);
  bp.connect(env);
  env.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
  track(src);
}

const NOTE: Record<string, number> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, C6: 1046.5,
};

function melody(notes: Array<[string, number]>, step: number, type: OscillatorType = 'triangle', gain = 0.12): void {
  let t = 0;
  for (const [name, beats] of notes) {
    const freq = NOTE[name];
    if (freq) tone({ freq, start: t, dur: step * beats * 0.95, type, gain, attack: 0.02 });
    t += step * beats;
  }
}

const recipes: Record<SoundId, () => void> = {
  tap: () => tone({ freq: 620, to: 820, dur: 0.08, gain: 0.08 }),
  select: () => {
    tone({ freq: 520, dur: 0.09, gain: 0.09, type: 'triangle' });
    tone({ freq: 780, start: 0.07, dur: 0.12, gain: 0.09, type: 'triangle' });
  },
  bubble: () => tone({ freq: 320, to: 980, dur: 0.14, gain: 0.14 }),
  heartbeat: () => {
    tone({ freq: 80, to: 55, dur: 0.16, gain: 0.35 });
    tone({ freq: 70, to: 50, start: 0.22, dur: 0.18, gain: 0.28 });
  },
  heartbeatMusical: () => {
    tone({ freq: 80, to: 55, dur: 0.14, gain: 0.25 });
    tone({ freq: NOTE.E5!, start: 0.02, dur: 0.18, gain: 0.1, type: 'triangle' });
    tone({ freq: 70, to: 50, start: 0.24, dur: 0.16, gain: 0.22 });
    tone({ freq: NOTE.G5!, start: 0.26, dur: 0.22, gain: 0.1, type: 'triangle' });
    tone({ freq: NOTE.C6!, start: 0.56, dur: 0.3, gain: 0.08, type: 'triangle' });
  },
  heartbeatQuick: () => {
    for (let i = 0; i < 3; i++) {
      tone({ freq: 90, to: 60, start: i * 0.22, dur: 0.1, gain: 0.25 });
    }
  },
  rumble: () => {
    tone({ freq: 70, to: 110, dur: 0.35, gain: 0.18, type: 'sawtooth' });
    tone({ freq: 110, to: 60, start: 0.3, dur: 0.35, gain: 0.16, type: 'sawtooth' });
    tone({ freq: 180, to: 320, start: 0.62, dur: 0.18, gain: 0.08, type: 'triangle' });
  },
  sneeze: () => {
    tone({ freq: 380, to: 520, dur: 0.3, gain: 0.05, type: 'triangle' });
    noise({ start: 0.32, dur: 0.28, gain: 0.12, filter: 2400, sweepTo: 800 });
  },
  ding: () => {
    tone({ freq: 1320, dur: 0.9, gain: 0.12 });
    tone({ freq: 2640, dur: 0.5, gain: 0.04 });
  },
  squeak: () => {
    tone({ freq: 1250, to: 1700, dur: 0.08, gain: 0.07 });
    tone({ freq: 1500, to: 1900, start: 0.1, dur: 0.07, gain: 0.06 });
  },
  tweet: () => {
    for (let i = 0; i < 3; i++) tone({ freq: 2200, to: 3100, start: i * 0.11, dur: 0.07, gain: 0.05 });
  },
  whoosh: () => noise({ dur: 0.45, gain: 0.1, filter: 400, sweepTo: 2400 }),
  jingle: () => melody([['C5', 1], ['E5', 1], ['G5', 1], ['C6', 2]], 0.11, 'triangle', 0.11),
  sparkle: () => {
    tone({ freq: 1760, dur: 0.18, gain: 0.05, type: 'triangle' });
    tone({ freq: 2349, start: 0.08, dur: 0.2, gain: 0.04, type: 'triangle' });
  },
  beep: () => {
    tone({ freq: 880, dur: 0.08, gain: 0.07, type: 'square' });
    tone({ freq: 880, start: 0.14, dur: 0.08, gain: 0.07, type: 'square' });
  },
  pop: () => tone({ freq: 700, to: 200, dur: 0.07, gain: 0.12 }),
  boing: () => {
    tone({ freq: 220, to: 440, dur: 0.12, gain: 0.12, type: 'triangle' });
    tone({ freq: 440, to: 260, start: 0.12, dur: 0.2, gain: 0.1, type: 'triangle' });
  },
  song: () =>
    melody(
      [['E4', 1], ['G4', 1], ['A4', 2], ['G4', 1], ['E4', 1], ['D4', 2], ['E4', 1], ['G4', 1], ['C5', 3]],
      0.24,
      'sine',
      0.11,
    ),
  breath: () => noise({ dur: 1.4, gain: 0.04, filter: 500, sweepTo: 300 }),
  giggle: () => {
    for (let i = 0; i < 4; i++) tone({ freq: 700 - i * 40, to: 900 - i * 40, start: i * 0.09, dur: 0.07, gain: 0.06, type: 'triangle' });
  },
  stick: () => {
    noise({ dur: 0.12, gain: 0.06, filter: 3000 });
    tone({ freq: 500, to: 700, start: 0.08, dur: 0.08, gain: 0.06 });
  },
  page: () => noise({ dur: 0.25, gain: 0.05, filter: 1800, sweepTo: 3500 }),
  bonk: () => tone({ freq: 300, to: 140, dur: 0.16, gain: 0.14, type: 'triangle' }),
  toot: () => {
    tone({ freq: NOTE.G4!, dur: 0.16, gain: 0.08, type: 'sawtooth', attack: 0.03 });
    tone({ freq: NOTE.C5!, start: 0.18, dur: 0.32, gain: 0.08, type: 'sawtooth', attack: 0.03 });
  },
  quack: () => {
    tone({ freq: 420, to: 300, dur: 0.12, gain: 0.1, type: 'square' });
    tone({ freq: 400, to: 280, start: 0.16, dur: 0.14, gain: 0.09, type: 'square' });
  },
  drum: () => {
    tone({ freq: 140, to: 60, dur: 0.18, gain: 0.3 });
    tone({ freq: 140, to: 60, start: 0.2, dur: 0.18, gain: 0.26 });
    noise({ start: 0.4, dur: 0.12, gain: 0.08, filter: 3000 });
  },
  gulp: () => {
    tone({ freq: 260, to: 180, dur: 0.12, gain: 0.12 });
    tone({ freq: 220, to: 150, start: 0.18, dur: 0.12, gain: 0.1 });
  },
  glub: () => {
    for (let i = 0; i < 4; i++) tone({ freq: 240 + (i % 2) * 120, to: 700 + i * 60, start: i * 0.16, dur: 0.1, gain: 0.1 });
  },
  stamp: () => {
    tone({ freq: 160, to: 70, dur: 0.14, gain: 0.3, type: 'triangle' });
    noise({ start: 0.02, dur: 0.1, gain: 0.08, filter: 900 });
    melody([['G5', 1], ['C6', 2]], 0.09, 'triangle', 0.08);
  },
  click: () => tone({ freq: 1400, to: 900, dur: 0.04, gain: 0.08, type: 'square' }),
  splash: () => {
    noise({ dur: 0.5, gain: 0.08, filter: 1600, sweepTo: 600 });
    tone({ freq: 500, to: 1200, start: 0.1, dur: 0.12, gain: 0.06 });
  },
};

export function playSound(id: SoundId): void {
  if (muted || !ctx || !master) return;
  if (ctx.state === 'suspended') void ctx.resume();
  try {
    recipes[id]();
  } catch {
    // Sound is a bonus; never let it break play.
  }
}
