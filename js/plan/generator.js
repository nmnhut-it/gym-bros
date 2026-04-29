/**
 * Plan generator. Pure function: profile → weekly plan.
 *
 * The generator's job:
 *  1. Pick a weekly schedule (daysPerWeek → which day = which DAY_TYPE)
 *  2. For each non-rest day, materialize the day template into concrete blocks
 *     with sets/reps/duration scaled by user level
 *  3. Filter out exercises unsafe for the user's conditions
 *  4. Filter out exercises requiring equipment the user doesn't have, swap with alternatives
 */

import { DAY_TYPE, LEVEL } from '../constants.js';
import { getExercise } from '../data/exercises.js';
import { getDayTemplate, WEEK_SCHEDULES } from '../data/templates.js';

/** Multipliers applied to default sets/reps/duration based on user level. */
const LEVEL_INTENSITY = Object.freeze({
  [LEVEL.BEGINNER]:     { sets: 0.7, reps: 0.7, duration: 0.7 },
  [LEVEL.INTERMEDIATE]: { sets: 1.0, reps: 1.0, duration: 1.0 },
  [LEVEL.ADVANCED]:     { sets: 1.2, reps: 1.3, duration: 1.3 },
});

/** Equipment-based fallback: if user lacks equipment X, swap exercise A → B. */
const EQUIPMENT_FALLBACKS = Object.freeze({
  'incline-pushup': 'wall-pushup',  // no bench/chair → wall
  'knee-pushup': 'wall-pushup',     // floor too hard → wall
});

/**
 * @typedef {Object} Profile
 * @property {string} name
 * @property {string} gender
 * @property {number} age
 * @property {number} heightCm
 * @property {number} weightKg
 * @property {string} level
 * @property {string[]} goals
 * @property {string[]} conditions
 * @property {string[]} equipment
 * @property {number} daysPerWeek
 * @property {number} sessionMinutes
 */

/**
 * @typedef {Object} PlanBlock
 * @property {string} exerciseId
 * @property {number} [sets]
 * @property {number} [reps]
 * @property {number} [duration]   seconds
 * @property {number} [restSeconds]
 */

/**
 * @typedef {Object} PlanDay
 * @property {number} weekday      0=Sun..6=Sat
 * @property {string} dayType
 * @property {string} name
 * @property {string} icon
 * @property {string} summary
 * @property {PlanBlock[]} blocks
 * @property {number} estimatedMinutes
 */

/**
 * Generate a weekly plan from a profile.
 * @param {Profile} profile
 * @returns {{ generatedAt: number, days: PlanDay[] }}
 */
export function generatePlan(profile) {
  const schedule = WEEK_SCHEDULES[profile.daysPerWeek] ?? WEEK_SCHEDULES[3];
  const days = [];
  for (let weekday = 0; weekday < 7; weekday++) {
    const dayType = schedule[weekday];
    days.push(buildDay(weekday, dayType, profile));
  }
  return { generatedAt: Date.now(), days };
}

/**
 * @param {number} weekday
 * @param {string} dayType
 * @param {Profile} profile
 * @returns {PlanDay}
 */
function buildDay(weekday, dayType, profile) {
  const template = getDayTemplate(dayType);
  const blocks = template.blocks
    .map((b) => resolveBlockExercise(b, profile))
    .filter((b) => b !== null)
    .map((b) => scaleBlock(b, profile));
  const estimatedMinutes = estimateMinutes(blocks);
  return {
    weekday,
    dayType,
    name: template.name,
    icon: template.icon,
    summary: template.summary,
    blocks,
    estimatedMinutes,
  };
}

/**
 * Resolve exercise: filter unsafe, swap by equipment fallback. Returns null to drop.
 * @param {{exerciseId: string}} block
 * @param {Profile} profile
 * @returns {{exerciseId: string} | null}
 */
function resolveBlockExercise(block, profile) {
  let id = block.exerciseId;
  if (EQUIPMENT_FALLBACKS[id] && !hasRequiredEquipment(id, profile)) {
    id = EQUIPMENT_FALLBACKS[id];
  }
  const ex = getExercise(id);
  if (isUnsafe(ex, profile)) return null;
  if (!hasRequiredEquipment(id, profile)) return null;
  return { ...block, exerciseId: id };
}

/** @param {string} exerciseId @param {Profile} profile */
function hasRequiredEquipment(exerciseId, profile) {
  const ex = getExercise(exerciseId);
  if (!ex.equipment || ex.equipment.length === 0) return true;
  return ex.equipment.some((needed) => profile.equipment.includes(needed));
}

/** @param {object} ex @param {Profile} profile */
function isUnsafe(ex, profile) {
  if (!ex.unsafeFor || ex.unsafeFor.length === 0) return false;
  return ex.unsafeFor.some((c) => profile.conditions.includes(c));
}

/**
 * Apply level-based intensity scaling to a raw block.
 * @param {{exerciseId: string} & Partial<PlanBlock>} block
 * @param {Profile} profile
 * @returns {PlanBlock}
 */
function scaleBlock(block, profile) {
  const ex = getExercise(block.exerciseId);
  const m = LEVEL_INTENSITY[profile.level] ?? LEVEL_INTENSITY[LEVEL.BEGINNER];
  const sets = Math.max(1, Math.round((block.sets ?? ex.defaultSets) * m.sets));
  const restSeconds = block.restSeconds ?? ex.defaultRest;
  if (ex.mode === 'time') {
    const duration = Math.max(10, Math.round((block.duration ?? ex.defaultDuration) * m.duration));
    return { exerciseId: block.exerciseId, sets, duration, restSeconds };
  }
  const reps = Math.max(4, Math.round((block.reps ?? ex.defaultReps) * m.reps));
  return { exerciseId: block.exerciseId, sets, reps, restSeconds };
}

/**
 * Rough estimate of total minutes for a day based on its blocks.
 * @param {PlanBlock[]} blocks
 * @returns {number}
 */
function estimateMinutes(blocks) {
  let totalSec = 0;
  for (const b of blocks) {
    const ex = getExercise(b.exerciseId);
    if (ex.mode === 'time') {
      totalSec += (b.duration ?? 0) * (b.sets ?? 1);
    } else {
      const repsPerSet = b.reps ?? ex.defaultReps;
      const secPerRep = 3;
      totalSec += repsPerSet * secPerRep * (b.sets ?? 1);
    }
    totalSec += (b.restSeconds ?? 0) * Math.max(0, (b.sets ?? 1) - 1);
  }
  return Math.round(totalSec / 60);
}

/** Find today's plan day from a generated plan. */
export function getTodayDay(plan) {
  const weekday = new Date().getDay();
  return plan.days.find((d) => d.weekday === weekday) ?? plan.days[0];
}

/** Whether today is a rest day (no blocks). */
export function isRestDay(planDay) {
  return planDay.dayType === DAY_TYPE.REST || planDay.blocks.length === 0;
}
