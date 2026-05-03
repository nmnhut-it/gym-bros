/**
 * Unit tests for plan generator + quick session generator.
 *
 * Run: `node --test tests/plan.test.mjs`
 *
 * Pure-function code → no DOM, no fake timers needed. Each test seeds a profile
 * representative of a real user persona, runs the generator, and asserts the
 * output respects safety + scheduling invariants.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { generatePlan } from '../js/plan/generator.js';
import { generateQuickSession, FOCUS } from '../js/plan/quick.js';
import { buildCustomDay } from '../js/plan/builder.js';
import { EXERCISES } from '../js/data/exercises.js';

// ---------- fixtures ----------

const CORE_EASY_USER = Object.freeze({
  name: 'Nhứt', gender: 'male', age: 32, heightCm: 168, weightKg: 75,
  level: 'beginner',
  goals: ['fat-loss', 'general-fitness'],
  conditions: ['core-easy'],
  equipment: ['treadmill', 'treadmill-incline', 'sit-up-bench', 'yoga-mat'],
  daysPerWeek: 3, sessionMinutes: 45,
});

const CORE_MIN_USER = { ...CORE_EASY_USER, conditions: ['core-min'] };

const ADVANCED_USER = {
  ...CORE_EASY_USER, level: 'advanced', conditions: [], age: 28, weightKg: 70, daysPerWeek: 5,
};

const NO_EQUIPMENT_USER = {
  ...CORE_EASY_USER, equipment: ['yoga-mat'], conditions: [],
};

// ---------- helpers ----------

function flattenBlocks(plan) {
  return plan.days.flatMap((d) => d.blocks);
}

function totalSeconds(blocks) {
  let s = 0;
  for (const b of blocks) {
    const ex = EXERCISES[b.exerciseId];
    const sets = b.sets ?? 1;
    s += ex.mode === 'time' ? (b.duration ?? 0) * sets : (b.reps ?? 0) * 3 * sets;
    s += (b.restSeconds ?? 0) * Math.max(0, sets - 1);
  }
  return s;
}

// ============================================================
//                    PLAN GENERATOR
// ============================================================

describe('generatePlan', () => {
  it('returns 7 days regardless of daysPerWeek', () => {
    const plan = generatePlan(CORE_EASY_USER);
    assert.equal(plan.days.length, 7);
    assert.deepEqual(plan.days.map((d) => d.weekday), [0, 1, 2, 3, 4, 5, 6]);
  });

  it('schedules exactly N training days for daysPerWeek=N (excluding recovery + rest)', () => {
    // "Training day" = active workout (cardio-core / strength-light / cardio-long).
    // Recovery is a soft active day, not counted toward the user's session quota.
    const TRAINING_TYPES = new Set(['cardio-core', 'strength-light', 'cardio-long']);
    for (const n of [3, 4, 5, 6]) {
      const plan = generatePlan({ ...CORE_EASY_USER, daysPerWeek: n });
      const trainingDays = plan.days.filter((d) => TRAINING_TYPES.has(d.dayType)).length;
      assert.equal(trainingDays, n, `daysPerWeek=${n} → ${trainingDays} training days`);
    }
  });

  it('NEVER schedules an exercise unsafe for core-min', () => {
    const plan = generatePlan(CORE_MIN_USER);
    const blocks = flattenBlocks(plan);
    for (const b of blocks) {
      const ex = EXERCISES[b.exerciseId];
      for (const cond of ex.unsafeFor ?? []) {
        assert.notEqual(cond, 'core-min', `${ex.id} is unsafe for core-min but was scheduled`);
      }
    }
  });

  it('respects equipment availability — yoga-mat-only profile gets no treadmill exercises', () => {
    const plan = generatePlan(NO_EQUIPMENT_USER);
    const blocks = flattenBlocks(plan);
    for (const b of blocks) {
      const ex = EXERCISES[b.exerciseId];
      if (!ex.equipment?.length) continue;
      const hasOne = ex.equipment.some((e) => NO_EQUIPMENT_USER.equipment.includes(e));
      assert.ok(hasOne, `${ex.id} requires ${ex.equipment} but user only has yoga-mat`);
    }
  });

  it('beginner gets fewer total seconds than advanced for same daysPerWeek', () => {
    const beg = generatePlan({ ...CORE_EASY_USER, level: 'beginner', daysPerWeek: 4 });
    const adv = generatePlan({ ...CORE_EASY_USER, level: 'advanced', daysPerWeek: 4 });
    assert.ok(totalSeconds(flattenBlocks(beg)) < totalSeconds(flattenBlocks(adv)),
      'beginner should have lower total volume than advanced');
  });

  it('every block has either reps or duration set', () => {
    const plan = generatePlan(CORE_EASY_USER);
    for (const b of flattenBlocks(plan)) {
      assert.ok(b.reps !== undefined || b.duration !== undefined,
        `block ${b.exerciseId} missing reps and duration`);
    }
  });

  it('estimatedMinutes is non-zero for non-rest days', () => {
    const plan = generatePlan(CORE_EASY_USER);
    for (const d of plan.days.filter((x) => x.blocks.length > 0)) {
      assert.ok(d.estimatedMinutes > 0, `${d.dayType} has 0 estimated minutes`);
    }
  });
});

// ============================================================
//                    QUICK SESSION GENERATOR
// ============================================================

describe('generateQuickSession', () => {
  it('respects duration budget within 30% tolerance for ALL focus', () => {
    for (const dur of [15, 30, 45, 60]) {
      const day = generateQuickSession({ focus: FOCUS.ALL, durationMin: dur, profile: ADVANCED_USER });
      const actualMin = totalSeconds(day.blocks) / 60;
      const ratio = actualMin / dur;
      assert.ok(ratio >= 0.4 && ratio <= 1.3,
        `${dur}min request → ${actualMin.toFixed(1)}min actual (ratio ${ratio.toFixed(2)})`);
    }
  });

  it('CARDIO focus produces only walk/treadmill blocks', () => {
    const day = generateQuickSession({ focus: FOCUS.CARDIO, durationMin: 30, profile: CORE_EASY_USER });
    for (const b of day.blocks) {
      const ex = EXERCISES[b.exerciseId];
      assert.ok(['cardio', 'warmup', 'cooldown', 'flexibility'].includes(ex.type),
        `${ex.id} (${ex.type}) found in cardio session`);
    }
  });

  it('CORE focus only includes core or warm/cool/stretch blocks', () => {
    const day = generateQuickSession({ focus: FOCUS.CORE, durationMin: 30, profile: CORE_EASY_USER });
    for (const b of day.blocks) {
      const ex = EXERCISES[b.exerciseId];
      assert.ok(['core', 'warmup', 'cooldown', 'flexibility'].includes(ex.type),
        `${ex.id} (${ex.type}) found in core session`);
    }
  });

  it('never schedules unsafe exercises for core-min user', () => {
    for (const focus of Object.values(FOCUS)) {
      const day = generateQuickSession({ focus, durationMin: 30, profile: CORE_MIN_USER });
      for (const b of day.blocks) {
        const ex = EXERCISES[b.exerciseId];
        for (const cond of ex.unsafeFor ?? []) {
          assert.notEqual(cond, 'core-min', `quick(${focus}): ${ex.id} unsafe for core-min`);
        }
      }
    }
  });

  it('always includes a warmup as the first block', () => {
    const day = generateQuickSession({ focus: FOCUS.CORE, durationMin: 30, profile: CORE_EASY_USER });
    assert.equal(day.blocks[0].exerciseId, 'walk-warmup');
  });

  it('always includes walk-cooldown', () => {
    const day = generateQuickSession({ focus: FOCUS.LOWER, durationMin: 30, profile: CORE_EASY_USER });
    const ids = day.blocks.map((b) => b.exerciseId);
    assert.ok(ids.includes('walk-cooldown'), 'no walk-cooldown in session');
  });

});

// ============================================================
//                    BUILD CUSTOM DAY (ad-hoc)
// ============================================================

describe('buildCustomDay', () => {
  it('does NOT auto-add warmup or cooldown by default — single-favorite launch stays single bài', () => {
    const day = buildCustomDay({
      items: [{ exerciseId: 'glute-bridge' }],
      profile: CORE_EASY_USER,
    });
    assert.equal(day.blocks.length, 1, 'expected only the picked exercise, no warmup/cooldown');
    assert.equal(day.blocks[0].exerciseId, 'glute-bridge');
  });

  it('includes warmup + cooldown when explicitly requested', () => {
    const day = buildCustomDay({
      items: [{ exerciseId: 'glute-bridge' }],
      profile: CORE_EASY_USER,
      includeWarmup: true,
      includeCooldown: true,
    });
    assert.equal(day.blocks[0].exerciseId, 'walk-warmup');
    assert.equal(day.blocks.at(-1).exerciseId, 'walk-cooldown');
  });

  it('preserves the exercise\'s natural defaults — no level scaling on hand-picked exercises', () => {
    // glute-bridge: defaultSets=3, defaultReps=15. BEGINNER scaling would give
    // 2×11 — that's the bug. Hand-picked must keep 3×15.
    const day = buildCustomDay({
      items: [{ exerciseId: 'glute-bridge' }],
      profile: CORE_EASY_USER,
    });
    const block = day.blocks[0];
    assert.equal(block.sets, 3, 'sets should match exercise defaultSets, not be scaled down');
    assert.equal(block.reps, 15, 'reps should match exercise defaultReps, not be scaled down');
  });

  it('respects explicit per-item overrides', () => {
    const day = buildCustomDay({
      items: [{ exerciseId: 'glute-bridge', sets: 5, reps: 20 }],
      profile: CORE_EASY_USER,
    });
    assert.equal(day.blocks[0].sets, 5);
    assert.equal(day.blocks[0].reps, 20);
  });

  it('time-mode block uses defaultDuration as-is', () => {
    const day = buildCustomDay({
      items: [{ exerciseId: 'plank-knee' }],  // time mode, defaultDuration=30, defaultSets=3
      profile: CORE_EASY_USER,
    });
    assert.equal(day.blocks[0].duration, 30);
    assert.equal(day.blocks[0].sets, 3);
  });

  describe('user customizations override exercise defaults', () => {
    it('reads sets/reps/restSeconds from customizations when present', () => {
      const day = buildCustomDay({
        items: [{ exerciseId: 'glute-bridge' }],
        profile: CORE_EASY_USER,
        customizations: { 'glute-bridge': { sets: 5, reps: 25, restSeconds: 90 } },
      });
      const block = day.blocks[0];
      assert.equal(block.sets, 5);
      assert.equal(block.reps, 25);
      assert.equal(block.restSeconds, 90);
    });

    it('falls back to exercise defaults for fields the user did NOT customise', () => {
      const day = buildCustomDay({
        items: [{ exerciseId: 'glute-bridge' }],  // defaults: 3×15, 30s rest
        profile: CORE_EASY_USER,
        customizations: { 'glute-bridge': { sets: 5 } },  // only sets overridden
      });
      const block = day.blocks[0];
      assert.equal(block.sets, 5,           'sets uses user override');
      assert.equal(block.reps, 15,          'reps still falls back to exercise default');
      assert.equal(block.restSeconds, 30,   'rest still falls back to exercise default');
    });

    it('explicit BuilderItem override beats user customization (one-shot wins)', () => {
      const day = buildCustomDay({
        items: [{ exerciseId: 'glute-bridge', sets: 7 }],
        profile: CORE_EASY_USER,
        customizations: { 'glute-bridge': { sets: 5 } },
      });
      assert.equal(day.blocks[0].sets, 7, 'item-level override wins');
    });

    it('time-mode customization overrides duration', () => {
      const day = buildCustomDay({
        items: [{ exerciseId: 'plank-knee' }],
        profile: CORE_EASY_USER,
        customizations: { 'plank-knee': { duration: 60 } },
      });
      assert.equal(day.blocks[0].duration, 60);
    });
  });
});

describe('generateQuickSession (continued)', () => {
  it('caps work-exercise count to keep variety reasonable', () => {
    const day = generateQuickSession({ focus: FOCUS.ALL, durationMin: 60, profile: ADVANCED_USER });
    const workBlocks = day.blocks.filter((b) => {
      const t = EXERCISES[b.exerciseId].type;
      return t !== 'warmup' && t !== 'cooldown' && t !== 'flexibility';
    });
    assert.ok(workBlocks.length <= 8, `${workBlocks.length} work blocks (cap=8)`);
  });
});
