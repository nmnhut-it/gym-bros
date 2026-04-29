/**
 * Web Speech API wrapper. Reads coaching cues + counts in Vietnamese (default).
 * Falls back gracefully if browser/TV doesn't support TTS.
 */

import { state } from '../state.js';

let cachedVoice = null;

/** True when speech is supported. */
export function isSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Pick the best Vietnamese voice available. Lazy-cached. */
function pickVoice() {
  if (!isSupported()) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  const lang = state.settings.voiceLang ?? 'vi-VN';
  const exact = voices.find((v) => v.lang === lang);
  if (exact) return (cachedVoice = exact);
  const lower = voices.find((v) => v.lang?.startsWith(lang.slice(0, 2)));
  return (cachedVoice = lower ?? voices[0] ?? null);
}

/**
 * Speak a phrase. Cancels any in-progress utterance first so prompts don't queue up.
 * @param {string} text
 * @param {{ rate?: number, pitch?: number, volume?: number, urgent?: boolean }} [opts]
 */
export function speak(text, opts = {}) {
  if (!isSupported() || !state.settings.voiceEnabled || !text) return;
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice();
  if (v) u.voice = v;
  u.lang = state.settings.voiceLang ?? 'vi-VN';
  u.rate = opts.rate ?? state.settings.voiceRate ?? 1.0;
  u.pitch = opts.pitch ?? state.settings.voicePitch ?? 1.0;
  u.volume = opts.volume ?? 1.0;
  if (opts.urgent) window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

/** Cancel any in-progress speech (e.g. when user pauses or skips). */
export function cancel() {
  if (!isSupported()) return;
  window.speechSynthesis.cancel();
}

/** Vietnamese number 1–20 spoken word — small lookup avoids weird TTS pronunciations. */
const VI_NUMBERS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười',
  'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín', 'hai mươi'];

/** Speak a count number (used while counting reps). */
export function speakCount(n) {
  const word = n >= 0 && n < VI_NUMBERS.length ? VI_NUMBERS[n] : String(n);
  speak(word, { rate: 1.1 });
}

/** Refresh the voice list (called once after voiceschanged fires). */
export function init() {
  if (!isSupported()) return;
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => { cachedVoice = null; pickVoice(); };
  }
  pickVoice();
}
