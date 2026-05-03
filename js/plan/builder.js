/**
 * Custom workout builder — turn a hand-picked list of exercises into a plan day
 * runnable by the session player.
 *
 * Pure function. No state mutation. Unlike the auto plan generator, this does
 * NOT scale by user level — when the user picks an exercise themselves, they
 * get the exercise's natural defaults, not a beginner-scaled version. Level
 * scaling is for auto-generated weekly plans only.
 *
 * Warm-up + cool-down are also opt-in (default off) — ad-hoc sessions launched
 * from a single favorite/recent exercise shouldn't force a 5-min treadmill walk.
 */

import { DAY_TYPE } from '../constants.js';
import { getExercise } from '../data/exercises.js';

/**
 * @typedef {Object} BuilderItem
 * @property {string} exerciseId
 * @property {number} [sets]      override default
 * @property {number} [reps]      override default (rep mode)
 * @property {number} [duration]  override default seconds (time mode)
 */

/**
 * @param {{ items: BuilderItem[], profile: object, customizations?: Record<string, object>, includeWarmup?: boolean, includeCooldown?: boolean }} opts
 * @returns {import('./generator.js').PlanDay}
 */
export function buildCustomDay(opts) {
  const { items, customizations = {}, includeWarmup = false, includeCooldown = false } = opts;
  const blocks = [];
  if (includeWarmup) blocks.push(materializeBlock({ exerciseId: 'walk-warmup' }, customizations));
  for (const item of items) blocks.push(materializeBlock(item, customizations));
  if (includeCooldown) blocks.push(materializeBlock({ exerciseId: 'walk-cooldown' }, customizations));
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

/**
 * Resolution order per field (sets / reps / duration / restSeconds):
 *   1. explicit override on the BuilderItem (one-shot, this session only)
 *   2. user's persisted customization for this exerciseId
 *   3. exercise default from data/exercises.js
 */
function materializeBlock(item, customizations) {
  const ex = getExercise(item.exerciseId);
  const cust = customizations[item.exerciseId] ?? {};
  const pick = (field, exDefault) => item[field] ?? cust[field] ?? exDefault;
  const sets = pick('sets', ex.defaultSets);
  const restSeconds = pick('restSeconds', ex.defaultRest);
  if (ex.mode === 'time') {
    return { exerciseId: item.exerciseId, sets, duration: pick('duration', ex.defaultDuration), restSeconds };
  }
  return { exerciseId: item.exerciseId, sets, reps: pick('reps', ex.defaultReps), restSeconds };
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
