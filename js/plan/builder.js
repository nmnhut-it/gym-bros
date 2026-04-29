/**
 * Custom workout builder — turn a hand-picked list of exercises into a plan day
 * runnable by the session player.
 *
 * Pure function. No state mutation. Reuses level-scaling logic from quick.js
 * for consistency.
 */

import { DAY_TYPE, LEVEL } from '../constants.js';
import { getExercise } from '../data/exercises.js';

const LEVEL_INTENSITY = Object.freeze({
  [LEVEL.BEGINNER]:     { sets: 0.7, reps: 0.7, duration: 0.7 },
  [LEVEL.INTERMEDIATE]: { sets: 1.0, reps: 1.0, duration: 1.0 },
  [LEVEL.ADVANCED]:     { sets: 1.2, reps: 1.3, duration: 1.3 },
});

/**
 * @typedef {Object} BuilderItem
 * @property {string} exerciseId
 * @property {number} [sets]      override default
 * @property {number} [reps]      override default (rep mode)
 * @property {number} [duration]  override default seconds (time mode)
 */

/**
 * @param {{ items: BuilderItem[], profile: object, includeWarmup?: boolean, includeCooldown?: boolean }} opts
 * @returns {import('./generator.js').PlanDay}
 */
export function buildCustomDay(opts) {
  const { items, profile, includeWarmup = true, includeCooldown = true } = opts;
  const blocks = [];
  if (includeWarmup) blocks.push(scaleBlock({ exerciseId: 'walk-warmup' }, profile));
  for (const item of items) blocks.push(scaleBlock(item, profile));
  if (includeCooldown) blocks.push(scaleBlock({ exerciseId: 'walk-cooldown' }, profile));
  return {
    weekday: new Date().getDay(),
    dayType: DAY_TYPE.CARDIO_CORE,
    name: 'Buổi tự chọn',
    icon: '🎯',
    summary: `${items.length} bài tự chọn`,
    blocks,
    estimatedMinutes: estimateMinutes(blocks),
  };
}

function scaleBlock(item, profile) {
  const ex = getExercise(item.exerciseId);
  const m = LEVEL_INTENSITY[profile.level] ?? LEVEL_INTENSITY[LEVEL.BEGINNER];
  const sets = Math.max(1, Math.round((item.sets ?? ex.defaultSets) * m.sets));
  const restSeconds = ex.defaultRest;
  if (ex.mode === 'time') {
    const duration = Math.max(10, Math.round((item.duration ?? ex.defaultDuration) * m.duration));
    return { exerciseId: item.exerciseId, sets, duration, restSeconds };
  }
  const reps = Math.max(4, Math.round((item.reps ?? ex.defaultReps) * m.reps));
  return { exerciseId: item.exerciseId, sets, reps, restSeconds };
}

function estimateMinutes(blocks) {
  let s = 0;
  for (const b of blocks) {
    const ex = getExercise(b.exerciseId);
    const sets = b.sets ?? 1;
    s += ex.mode === 'time' ? (b.duration ?? 0) * sets : (b.reps ?? 0) * 3 * sets;
    s += (b.restSeconds ?? 0) * Math.max(0, sets - 1);
  }
  return Math.round(s / 60);
}
