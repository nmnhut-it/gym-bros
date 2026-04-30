/**
 * Shared test environment for jsdom-based tests (storage, state, session, views).
 *
 * Imports of this file MUST come BEFORE imports of any app module that touches
 * window / document / localStorage. ES module imports are evaluated top-down so
 * placing this import first is enough.
 *
 * Stubs Web Speech + Web Audio APIs because jsdom does not implement them.
 * Spies (speechCalls, soundCalls) are exposed on globalThis so individual tests
 * can assert on TTS / sound side-effects without re-importing the audio modules.
 */

import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
  url: 'http://localhost/',
});

const w = dom.window;

// Forward jsdom globals that app code expects to exist on the global scope.
// `navigator` is read-only on globalThis in Node, so it's skipped — code that
// needs it should access window.navigator directly.
const FORWARD = [
  'window', 'document', 'localStorage',
  'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'Node', 'Element',
  'DOMParser', 'CustomEvent', 'Event', 'EventTarget',
  'getComputedStyle',
];
for (const k of FORWARD) {
  if (k in w) {
    try { globalThis[k] = w[k]; } catch { /* read-only on this Node — skip */ }
  }
}

// Spy buffers — flushed by resetMocks().
export const speechCalls = [];
export const soundCalls = [];

w.speechSynthesis = {
  speak(u) { speechCalls.push({ type: 'speak', text: u?.text ?? '' }); },
  cancel() { speechCalls.push({ type: 'cancel' }); },
  getVoices() { return []; },
  onvoiceschanged: null,
};
class StubUtterance {
  constructor(text) { this.text = text; this.lang = ''; this.rate = 1; this.pitch = 1; this.volume = 1; }
}
w.SpeechSynthesisUtterance = StubUtterance;
globalThis.SpeechSynthesisUtterance = StubUtterance;

class FakeGainNode {
  constructor() {
    this.gain = {
      setValueAtTime() {},
      linearRampToValueAtTime() {},
      exponentialRampToValueAtTime() {},
    };
  }
  connect(node) { return node; }
}
class FakeOscNode {
  constructor() {
    this.frequency = { value: 0 };
    this.type = 'sine';
  }
  connect(node) { return node; }
  start() { soundCalls.push({ type: 'osc-start', freq: this.frequency.value }); }
  stop() {}
}
class FakeAudioCtx {
  constructor() {
    this.state = 'suspended';
    this.currentTime = 0;
    this.destination = {};
  }
  createOscillator() { return new FakeOscNode(); }
  createGain() { return new FakeGainNode(); }
  resume() { this.state = 'running'; }
}
w.AudioContext = FakeAudioCtx;
globalThis.AudioContext = FakeAudioCtx;

// confirm() defaults to true — most session tests want skip/exit to proceed.
w.confirm = () => true;
globalThis.confirm = w.confirm;

// jsdom does not implement HTMLCanvasElement.getContext('2d'). Stub a no-op
// 2D context so the progress chart can call drawing methods harmlessly.
const noop = () => {};
const fakeCtx = new Proxy({}, {
  get(_, key) {
    if (key === 'canvas') return null;
    if (key === 'fillStyle' || key === 'strokeStyle' || key === 'font' || key === 'lineWidth' || key === 'textAlign' || key === 'textBaseline') return '';
    if (key === 'measureText') return () => ({ width: 0 });
    return noop;
  },
  set() { return true; },
});
w.HTMLCanvasElement.prototype.getContext = function () { return fakeCtx; };

/** Reset spies + storage between tests. Call from beforeEach (or top of test). */
export function resetMocks() {
  speechCalls.length = 0;
  soundCalls.length = 0;
  localStorage.clear();
}

/** Reset just the #app root — useful for view smoke tests. */
export function resetAppRoot() {
  const app = document.getElementById('app');
  if (app) app.replaceChildren();
}
