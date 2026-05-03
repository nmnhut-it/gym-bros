/**
 * Global app state. Single in-memory snapshot of everything persisted.
 *
 * Read directly: `state.profile`, `state.plan`, etc.
 * Write only via the setter functions — they auto-persist + emit a 'state:change' event.
 */

import {
  CONDITION_MIGRATIONS, DEFAULT_SETTINGS, RECENT_EXERCISES_LIMIT,
  STORAGE_KEYS, STORAGE_PREFIX,
} from './constants.js';
import { findExercise } from './data/exercises.js';
import { buildCustomDay } from './plan/builder.js';
import { generatePlan } from './plan/generator.js';
import * as Storage from './storage.js';

/**
 * Map legacy condition codes on a stored profile to current ones.
 * Returns the same shape; safe to call with null/undefined.
 */
export function migrateProfile(p) {
  if (!p || !Array.isArray(p.conditions)) return p;
  const next = [];
  for (const c of p.conditions) {
    if (Object.prototype.hasOwnProperty.call(CONDITION_MIGRATIONS, c)) {
      const mapped = CONDITION_MIGRATIONS[c];
      if (mapped === null) continue;
      next.push(mapped);
    } else {
      next.push(c);
    }
  }
  return { ...p, conditions: [...new Set(next)] };
}

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
  /**
   * Pinned exerciseIds the user wants 1-tap access to from the dashboard.
   * Order = pin order (first pinned shows first).
   * @type {string[]}
   */
  favorites: [],
};

/** Load everything from localStorage into memory. Call once at app boot. */
export function load() {
  state.profile  = migrateProfile(Storage.load(STORAGE_KEYS.PROFILE, null));
  state.plan     = Storage.load(STORAGE_KEYS.PLAN, null);
  state.sessions = Storage.load(STORAGE_KEYS.SESSIONS, []);
  state.weights  = Storage.load(STORAGE_KEYS.WEIGHTS, []);
  state.settings = { ...DEFAULT_SETTINGS, ...Storage.load(STORAGE_KEYS.SETTINGS, {}) };
  state.favorites = Storage.load(STORAGE_KEYS.FAVORITES, []);
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
  state.favorites = [];
  emit('reset');
}

/**
 * Toggle pin/unpin of an exerciseId in favorites. New pins go to the front.
 * @param {string} exerciseId
 */
export function toggleFavorite(exerciseId) {
  if (!exerciseId) return;
  const i = state.favorites.indexOf(exerciseId);
  state.favorites = i >= 0
    ? state.favorites.filter((id) => id !== exerciseId)
    : [exerciseId, ...state.favorites];
  Storage.save(STORAGE_KEYS.FAVORITES, state.favorites);
  emit('favorites');
}

/** @param {string} exerciseId */
export function isFavorite(exerciseId) {
  return state.favorites.includes(exerciseId);
}

/**
 * Distinct exerciseIds the user has run recently — most recent first.
 * Reads from session history; sessions without exerciseIds are skipped silently
 * (backward compat for records written before that field existed).
 * @param {number} [limit]
 * @returns {string[]}
 */
export function getRecentExerciseIds(limit = RECENT_EXERCISES_LIMIT) {
  const seen = new Set();
  const out = [];
  for (const s of state.sessions) {
    if (!Array.isArray(s.exerciseIds)) continue;
    for (const id of s.exerciseIds) {
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(id);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

/**
 * Drop exerciseIds whose `unsafeFor` intersects the profile's conditions.
 * This is a hard floor: even if the user pinned an unsafe move, we refuse
 * to schedule it.
 * @param {string[]} ids
 * @returns {string[]}
 */
export function filterSafeExerciseIds(ids) {
  if (!state.profile) return [];
  const conds = state.profile.conditions ?? [];
  return ids.filter((id) => {
    const ex = findExercise(id);
    if (!ex) return false;
    return !ex.unsafeFor?.some((c) => conds.includes(c));
  });
}

/**
 * Build an ad-hoc day from a list of exerciseIds and stage it for the session
 * player. Caller is expected to navigate to the session route afterwards.
 * IDs are passed through `filterSafeExerciseIds` first — even user-pinned
 * exercises that became unsafe after a profile change are dropped.
 * @param {string[]} exerciseIds
 * @returns {boolean} true if a day was staged, false if no safe IDs left
 */
export function startAdHocFromExerciseIds(exerciseIds) {
  if (!state.profile || !exerciseIds?.length) return false;
  const safe = filterSafeExerciseIds(exerciseIds);
  if (safe.length === 0) return false;
  const day = buildCustomDay({
    items: safe.map((id) => ({ exerciseId: id })),
    profile: state.profile,
  });
  setAdHocDay(day);
  return true;
}

/** True if user has finished onboarding (= has a profile). */
export function isOnboarded() {
  return state.profile !== null;
}
