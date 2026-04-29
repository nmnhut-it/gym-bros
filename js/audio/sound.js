/**
 * Web Audio API beeps. Used for set start, rest countdown ticks, and rest end bell.
 * No external audio files — synthesized so the app stays single-deploy.
 */

import { state } from '../state.js';

let ctx = null;
function audio() {
  if (ctx) return ctx;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

/** Resume the audio context — must be called from a user gesture (browser policy). */
export function unlock() {
  const c = audio();
  if (c && c.state === 'suspended') c.resume();
}

/**
 * Synthesize a short beep.
 * @param {{ freq?: number, duration?: number, type?: OscillatorType, volume?: number }} [opts]
 */
export function beep(opts = {}) {
  if (!state.settings.soundEnabled) return;
  const c = audio();
  if (!c) return;
  const { freq = 880, duration = 0.12, type = 'sine', volume = 0.25 } = opts;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

/** Single low tick (for rest countdown 3..2..1). */
export function tick() { beep({ freq: 660, duration: 0.08, volume: 0.18 }); }

/** Two-tone bell (rest finished, time to go). */
export function bell() {
  beep({ freq: 880, duration: 0.18, volume: 0.3 });
  setTimeout(() => beep({ freq: 1320, duration: 0.22, volume: 0.3 }), 130);
}

/** Triple chime (workout complete). */
export function chime() {
  beep({ freq: 880, duration: 0.18 });
  setTimeout(() => beep({ freq: 1108, duration: 0.18 }), 150);
  setTimeout(() => beep({ freq: 1320, duration: 0.32 }), 300);
}
