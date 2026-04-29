/**
 * Global app state. Single in-memory snapshot of everything persisted.
 *
 * Read directly: `state.profile`, `state.plan`, etc.
 * Write only via the setter functions — they auto-persist + emit a 'state:change' event.
 */

import { DEFAULT_SETTINGS, STORAGE_KEYS, STORAGE_PREFIX } from './constants.js';
import { generatePlan } from './plan/generator.js';
import * as Storage from './storage.js';

/** @type {EventTarget} */
const bus = new EventTarget();

export const state = {
  /** @type {import('./plan/generator.js').Profile | null} */
  profile: null,
  /** @type {{generatedAt:number, days: any[]} | null} */
  plan: null,
  /** @type {Array<{date:string, dayType:string, durationSec:number, blocksDone:number, totalBlocks:number}>} */
  sessions: [],
  /** @type {Array<{date:string, kg:number}>} */
  weights: [],
  /** @type {object} */
  settings: { ...DEFAULT_SETTINGS },
  /**
   * Ad-hoc session plan from "Quick Session" or custom builder.
   * When set, the session player uses this instead of today's scheduled day.
   * Cleared after the session finishes or user exits.
   * @type {import('./plan/generator.js').PlanDay | null}
   */
  adHocDay: null,
};

/** Load everything from localStorage into memory. Call once at app boot. */
export function load() {
  state.profile  = Storage.load(STORAGE_KEYS.PROFILE, null);
  state.plan     = Storage.load(STORAGE_KEYS.PLAN, null);
  state.sessions = Storage.load(STORAGE_KEYS.SESSIONS, []);
  state.weights  = Storage.load(STORAGE_KEYS.WEIGHTS, []);
  state.settings = { ...DEFAULT_SETTINGS, ...Storage.load(STORAGE_KEYS.SETTINGS, {}) };
}

/** @param {(e: Event) => void} fn */
export function onChange(fn) { bus.addEventListener('state:change', fn); }
function emit(reason) { bus.dispatchEvent(new CustomEvent('state:change', { detail: { reason } })); }

/** Save profile + regenerate plan from it. */
export function setProfile(profile) {
  state.profile = profile;
  Storage.save(STORAGE_KEYS.PROFILE, profile);
  regeneratePlan();
  emit('profile');
}

/** Force-regenerate plan from current profile. */
export function regeneratePlan() {
  if (!state.profile) return;
  state.plan = generatePlan(state.profile);
  Storage.save(STORAGE_KEYS.PLAN, state.plan);
  emit('plan');
}

/** Append a completed session record. */
export function recordSession(record) {
  state.sessions = [record, ...state.sessions].slice(0, 365);
  Storage.save(STORAGE_KEYS.SESSIONS, state.sessions);
  emit('sessions');
}

/** Add or replace today's weight entry. */
export function recordWeight(kg) {
  const date = new Date().toISOString().slice(0, 10);
  const existing = state.weights.findIndex((w) => w.date === date);
  const next = [...state.weights];
  if (existing >= 0) next[existing] = { date, kg };
  else next.unshift({ date, kg });
  state.weights = next.sort((a, b) => b.date.localeCompare(a.date));
  Storage.save(STORAGE_KEYS.WEIGHTS, state.weights);
  emit('weights');
}

/** Set the ad-hoc plan day used by the session player. Pass null to clear. */
export function setAdHocDay(day) {
  state.adHocDay = day;
  emit('adHocDay');
}

/** Patch settings (merges into current). */
export function setSettings(patch) {
  state.settings = { ...state.settings, ...patch };
  Storage.save(STORAGE_KEYS.SETTINGS, state.settings);
  emit('settings');
}

/** Wipe everything — used by Settings → Reset. */
export function resetAll() {
  Storage.clearAll(STORAGE_PREFIX);
  state.profile = null;
  state.plan = null;
  state.sessions = [];
  state.weights = [];
  state.settings = { ...DEFAULT_SETTINGS };
  emit('reset');
}

/** True if user has finished onboarding (= has a profile). */
export function isOnboarded() {
  return state.profile !== null;
}
