/**
 * State layer tests — setters, persistence, migration.
 *
 * Verifies the contract that views rely on:
 *   - setProfile auto-regenerates plan + persists both
 *   - recordSession is FIFO-bounded at 365
 *   - recordWeight de-duplicates same-day entries
 *   - migrateProfile maps legacy condition codes (hernia-*, back-pain, knee-pain,
 *     high-bp, pregnancy) to current ones, dropping pregnancy and dedup-ing
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { resetMocks } from './_setup.mjs';
import {
  state, load, migrateProfile, setProfile, recordSession, recordWeight,
  setAdHocDay, setSettings, resetAll, isOnboarded,
  toggleFavorite, isFavorite, getRecentExerciseIds,
  filterSafeExerciseIds, startAdHocFromExerciseIds,
} from '../js/state.js';
import { CONDITION, DEFAULT_SETTINGS, STORAGE_KEYS } from '../js/constants.js';

const BASE_PROFILE = Object.freeze({
  name: 'Tester', gender: 'male', age: 30, heightCm: 170, weightKg: 70,
  level: 'beginner', goals: ['fat-loss'], conditions: [CONDITION.CORE_EASY],
  equipment: ['treadmill', 'yoga-mat'], daysPerWeek: 3, sessionMinutes: 45,
});

function freshState() {
  resetMocks();
  state.profile = null;
  state.plan = null;
  state.sessions = [];
  state.weights = [];
  state.settings = { ...DEFAULT_SETTINGS };
  state.adHocDay = null;
  state.favorites = [];
}

beforeEach(freshState);

describe('migrateProfile', () => {
  it('returns input unchanged for null / no conditions', () => {
    assert.equal(migrateProfile(null), null);
    assert.equal(migrateProfile(undefined), undefined);
    assert.deepEqual(migrateProfile({ name: 'A' }), { name: 'A' });
  });

  it('maps every legacy code to its current equivalent', () => {
    const out = migrateProfile({
      conditions: ['hernia-healed', 'hernia-acute', 'back-pain', 'knee-pain', 'high-bp'],
    });
    assert.deepEqual(
      [...out.conditions].sort(),
      ['back-easy', 'core-easy', 'core-min', 'knee-easy'].sort(),
    );
  });

  it('drops the legacy "pregnancy" code with no replacement', () => {
    const out = migrateProfile({ conditions: ['pregnancy', 'hernia-healed'] });
    assert.deepEqual(out.conditions, ['core-easy']);
  });

  it('de-duplicates collisions (hernia-healed + high-bp both → core-easy)', () => {
    const out = migrateProfile({ conditions: ['hernia-healed', 'high-bp'] });
    assert.deepEqual(out.conditions, ['core-easy']);
  });

  it('preserves unknown codes (forward-compat)', () => {
    const out = migrateProfile({ conditions: ['custom-flag', 'core-easy'] });
    assert.deepEqual([...out.conditions].sort(), ['core-easy', 'custom-flag'].sort());
  });

  it('does NOT mutate the input profile', () => {
    const input = { conditions: ['hernia-healed'] };
    migrateProfile(input);
    assert.deepEqual(input.conditions, ['hernia-healed']);
  });

  it('survives load() — legacy stored profile auto-migrates on boot', () => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify({
      ...BASE_PROFILE, conditions: ['hernia-healed', 'pregnancy'],
    }));
    load();
    assert.deepEqual(state.profile.conditions, ['core-easy']);
  });
});

describe('setProfile', () => {
  it('persists the profile to localStorage', () => {
    setProfile(BASE_PROFILE);
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE));
    assert.equal(raw.name, 'Tester');
  });

  it('auto-regenerates the plan with 7 days', () => {
    setProfile(BASE_PROFILE);
    assert.ok(state.plan);
    assert.equal(state.plan.days.length, 7);
  });

  it('plan is also persisted', () => {
    setProfile(BASE_PROFILE);
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAN));
    assert.equal(raw.days.length, 7);
  });
});

describe('recordSession', () => {
  it('prepends the new record to the session list', () => {
    recordSession({ date: '2026-04-29', dayType: 'cardio-core', durationSec: 1800, blocksDone: 5, totalBlocks: 6 });
    recordSession({ date: '2026-04-30', dayType: 'strength-light', durationSec: 1500, blocksDone: 6, totalBlocks: 6 });
    assert.equal(state.sessions[0].date, '2026-04-30');
    assert.equal(state.sessions[1].date, '2026-04-29');
  });

  it('caps the list at 365 entries (FIFO eviction)', () => {
    for (let i = 0; i < 400; i++) {
      recordSession({ date: `2026-${String(i).padStart(3, '0')}`, dayType: 'rest', durationSec: 0, blocksDone: 0, totalBlocks: 0 });
    }
    assert.equal(state.sessions.length, 365);
  });

  it('persists to localStorage', () => {
    recordSession({ date: '2026-04-30', dayType: 'rest', durationSec: 0, blocksDone: 0, totalBlocks: 0 });
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS));
    assert.equal(raw.length, 1);
  });
});

describe('recordWeight', () => {
  it('replaces (not appends) when entry for today already exists', () => {
    recordWeight(75.0);
    recordWeight(74.5);
    assert.equal(state.weights.length, 1);
    assert.equal(state.weights[0].kg, 74.5);
  });

  it('keeps history for distinct dates sorted newest-first', () => {
    state.weights = [{ date: '2026-04-28', kg: 76 }, { date: '2026-04-29', kg: 75.5 }];
    recordWeight(75.0);
    assert.equal(state.weights[0].kg, 75.0);   // today
    assert.equal(state.weights[1].kg, 75.5);
    assert.equal(state.weights[2].kg, 76);
  });
});

describe('setAdHocDay', () => {
  it('stores the day and clears with null', () => {
    setAdHocDay({ name: 'X', blocks: [] });
    assert.equal(state.adHocDay.name, 'X');
    setAdHocDay(null);
    assert.equal(state.adHocDay, null);
  });
});

describe('setSettings', () => {
  it('merges patch into current settings + persists', () => {
    setSettings({ tvMode: true, voiceRate: 1.4 });
    assert.equal(state.settings.tvMode, true);
    assert.equal(state.settings.voiceRate, 1.4);
    assert.equal(state.settings.voiceEnabled, true);  // preserved default
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS));
    assert.equal(raw.tvMode, true);
  });
});

describe('toggleFavorite + isFavorite', () => {
  it('adds a fresh id to the front of the list', () => {
    toggleFavorite('dead-bug');
    toggleFavorite('glute-bridge');
    assert.deepEqual(state.favorites, ['glute-bridge', 'dead-bug']);
    assert.equal(isFavorite('dead-bug'), true);
    assert.equal(isFavorite('knee-pushup'), false);
  });

  it('removes when toggled twice', () => {
    toggleFavorite('dead-bug');
    toggleFavorite('dead-bug');
    assert.deepEqual(state.favorites, []);
    assert.equal(isFavorite('dead-bug'), false);
  });

  it('persists to localStorage under STORAGE_KEYS.FAVORITES', () => {
    toggleFavorite('dead-bug');
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES));
    assert.deepEqual(raw, ['dead-bug']);
  });

  it('survives load() round-trip', () => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(['a', 'b', 'c']));
    load();
    assert.deepEqual(state.favorites, ['a', 'b', 'c']);
  });

  it('ignores empty/null id (no crash, no insert)', () => {
    toggleFavorite('');
    toggleFavorite(null);
    assert.deepEqual(state.favorites, []);
  });
});

describe('getRecentExerciseIds', () => {
  it('returns [] when no sessions logged', () => {
    assert.deepEqual(getRecentExerciseIds(), []);
  });

  it('flattens session.exerciseIds newest-first and dedupes', () => {
    state.sessions = [
      { date: '2026-04-30', exerciseIds: ['dead-bug', 'glute-bridge'] },
      { date: '2026-04-29', exerciseIds: ['glute-bridge', 'knee-pushup'] },
      { date: '2026-04-28', exerciseIds: ['cat-cow'] },
    ];
    assert.deepEqual(
      getRecentExerciseIds(),
      ['dead-bug', 'glute-bridge', 'knee-pushup', 'cat-cow'],
    );
  });

  it('respects the limit argument', () => {
    state.sessions = [
      { date: '2026-04-30', exerciseIds: ['a', 'b', 'c', 'd', 'e', 'f'] },
    ];
    assert.deepEqual(getRecentExerciseIds(3), ['a', 'b', 'c']);
  });

  it('skips sessions without exerciseIds (backward compat)', () => {
    state.sessions = [
      { date: '2026-04-30' /* legacy record, no exerciseIds */ },
      { date: '2026-04-29', exerciseIds: ['dead-bug'] },
    ];
    assert.deepEqual(getRecentExerciseIds(), ['dead-bug']);
  });

  it('recordSession persists exerciseIds when caller provides them', () => {
    recordSession({
      date: '2026-04-30', dayType: 'cardio-core', durationSec: 1200,
      blocksDone: 3, totalBlocks: 3, exerciseIds: ['dead-bug', 'glute-bridge'],
    });
    assert.deepEqual(getRecentExerciseIds(), ['dead-bug', 'glute-bridge']);
  });
});

/** Profile with CORE_MIN — the strictest core flag — so that exercises
 *  whose unsafeFor includes CORE_MIN (knee-pushup, incline-pushup, plank, ...)
 *  are dropped by the filter. Used for the safety-filter tests. */
const STRICT_PROFILE = Object.freeze({
  ...BASE_PROFILE, conditions: [CONDITION.CORE_MIN],
});

describe('filterSafeExerciseIds', () => {
  it('returns [] when no profile loaded', () => {
    assert.deepEqual(filterSafeExerciseIds(['dead-bug']), []);
  });

  it('keeps exercises whose unsafeFor does not match profile conditions', () => {
    setProfile(STRICT_PROFILE);
    const out = filterSafeExerciseIds(['dead-bug', 'walk-warmup']);
    assert.ok(out.includes('walk-warmup'));
    assert.ok(out.includes('dead-bug'));
  });

  it('drops unsafe ids — knee-pushup is unsafeFor CORE_MIN in the data layer', () => {
    setProfile(STRICT_PROFILE);
    const out = filterSafeExerciseIds(['knee-pushup', 'dead-bug']);
    assert.ok(!out.includes('knee-pushup'),
      'knee-pushup should be filtered out under CORE_MIN');
    assert.ok(out.includes('dead-bug'));
  });

  it('drops unknown ids (defensive)', () => {
    setProfile(BASE_PROFILE);
    assert.deepEqual(filterSafeExerciseIds(['nope-not-a-real-id']), []);
  });
});

describe('startAdHocFromExerciseIds', () => {
  it('returns false when no profile', () => {
    assert.equal(startAdHocFromExerciseIds(['dead-bug']), false);
    assert.equal(state.adHocDay, null);
  });

  it('returns false when ids list is empty', () => {
    setProfile(BASE_PROFILE);
    assert.equal(startAdHocFromExerciseIds([]), false);
    assert.equal(state.adHocDay, null);
  });

  it('returns false when every id is filtered out as unsafe', () => {
    setProfile(STRICT_PROFILE);
    assert.equal(startAdHocFromExerciseIds(['knee-pushup']), false);
    assert.equal(state.adHocDay, null);
  });

  it('stages a custom day in state.adHocDay when at least one id is safe', () => {
    setProfile(BASE_PROFILE);
    const ok = startAdHocFromExerciseIds(['dead-bug']);
    assert.equal(ok, true);
    assert.ok(state.adHocDay);
    assert.ok(state.adHocDay.blocks.length > 0);
    // Block list should include warmup + the picked exercise + cooldown.
    const ids = state.adHocDay.blocks.map((b) => b.exerciseId);
    assert.ok(ids.includes('dead-bug'));
  });
});

describe('resetAll + isOnboarded', () => {
  it('isOnboarded reflects profile presence', () => {
    assert.equal(isOnboarded(), false);
    setProfile(BASE_PROFILE);
    assert.equal(isOnboarded(), true);
  });

  it('resetAll wipes profile + plan + sessions + weights from memory and storage', () => {
    setProfile(BASE_PROFILE);
    recordSession({ date: '2026-04-30', dayType: 'rest', durationSec: 0, blocksDone: 0, totalBlocks: 0 });
    recordWeight(72);

    resetAll();

    assert.equal(state.profile, null);
    assert.equal(state.plan, null);
    assert.equal(state.sessions.length, 0);
    assert.equal(state.weights.length, 0);
    assert.equal(localStorage.getItem(STORAGE_KEYS.PROFILE), null);
    assert.equal(localStorage.getItem(STORAGE_KEYS.PLAN), null);
  });
});
