/**
 * Ad-hoc / quick session generator.
 *
 * Unlike the weekly planner, this builds ONE session on demand:
 *   "give me 30 min focused on core" → returns a plan day with safe + available
 *   exercises that fit the budget.
 *
 * Pure function — no state mutation.
 */

import { DAY_TYPE, LEVEL } from '../constants.js';
import { EXERCISES, getExercise } from '../data/exercises.js';

const SECONDS_PER_REP = 3;

/** Focus types user can pick from. */
export const FOCUS = Object.freeze({
  ALL: 'all',
  CARDIO: 'cardio',
  CORE: 'core',
  LOWER: 'lower',
  UPPER: 'upper',
  FLEXIBILITY: 'flexibility',
});

const FOCUS_LABEL = Object.freeze({
  [FOCUS.ALL]:         'Toàn thân',
  [FOCUS.CARDIO]:      'Cardio (đốt mỡ)',
  [FOCUS.CORE]:        'Bụng + lõi',
  [FOCUS.LOWER]:       'Chân + mông',
  [FOCUS.UPPER]:       'Tay + ngực',
  [FOCUS.FLEXIBILITY]: 'Giãn cơ',
});

/** Which exercise types belong in each focus mode. */
const FOCUS_TYPES = Object.freeze({
  [FOCUS.ALL]:         ['cardio', 'core', 'lower', 'upper', 'flexibility'],
  [FOCUS.CARDIO]:      ['cardio'],
  [FOCUS.CORE]:        ['core'],
  [FOCUS.LOWER]:       ['lower'],
  [FOCUS.UPPER]:       ['upper'],
  [FOCUS.FLEXIBILITY]: ['flexibility'],
});

const LEVEL_INTENSITY = Object.freeze({
  [LEVEL.BEGINNER]:     { sets: 0.7, reps: 0.7, duration: 0.7 },
  [LEVEL.INTERMEDIATE]: { sets: 1.0, reps: 1.0, duration: 1.0 },
  [LEVEL.ADVANCED]:     { sets: 1.2, reps: 1.3, duration: 1.3 },
});

/** Get human-readable label for a focus value. */
export function focusLabel(focus) { return FOCUS_LABEL[focus] ?? focus; }

/**
 * @param {{ focus: string, durationMin: number, profile: object, extraConditions?: string[] }} opts
 * @returns {import('./generator.js').PlanDay}
 */
export function generateQuickSession(opts) {
  const { focus, durationMin, profile, extraConditions = [] } = opts;
  const conditions = [...profile.conditions, ...extraConditions];
  const candidates = filterExercises(focus, conditions, profile.equipment);
  const blocks = pickBlocksForBudget(candidates, focus, durationMin, profile);
  return {
    weekday: new Date().getDay(),
    dayType: DAY_TYPE.CARDIO_CORE,  // generic fallback for record keeping
    name: `Tập nhanh — ${focusLabel(focus)}`,
    icon: focusEmoji(focus),
    summary: `${durationMin} phút · ${focusLabel(focus).toLowerCase()} · ad-hoc`,
    blocks,
    estimatedMinutes: durationMin,
  };
}

/** @returns {Array<object>} list of exercise objects, filtered + sorted */
function filterExercises(focus, conditions, equipment) {
  const wanted = new Set(FOCUS_TYPES[focus] ?? FOCUS_TYPES[FOCUS.ALL]);
  return Object.values(EXERCISES).filter((ex) => {
    if (!wanted.has(ex.type) && ex.type !== 'warmup' && ex.type !== 'cooldown') return false;
    if (ex.unsafeFor?.some((c) => conditions.includes(c))) return false;
    if (ex.equipment?.length && !ex.equipment.some((e) => equipment.includes(e))) return false;
    return true;
  });
}

/**
 * Build a block list that roughly fits `durationMin`. Always opens with a warmup
 * walk and closes with a cooldown walk + stretch when relevant.
 */
function pickBlocksForBudget(candidates, focus, durationMin, profile) {
  const budgetSec = durationMin * 60;
  // Reserve warm + cool proportionally — cap each at 5 min, but scale down for short sessions.
  const warmCap = Math.min(300, Math.round(budgetSec * 0.15));
  const coolCap = Math.min(300, Math.round(budgetSec * 0.15));
  const exerciseBudget = budgetSec - warmCap - coolCap;

  const blocks = [];
  const warmup = candidates.find((e) => e.id === 'walk-warmup');
  if (warmup) blocks.push({ exerciseId: warmup.id, sets: 1, duration: warmCap, restSeconds: 0 });

  if (focus === FOCUS.CARDIO) {
    pickCardio(candidates, exerciseBudget, blocks);
  } else {
    pickWorkExercises(candidates, focus, exerciseBudget, profile, blocks);
  }

  const cooldown = candidates.find((e) => e.id === 'walk-cooldown');
  if (cooldown) blocks.push({ exerciseId: cooldown.id, sets: 1, duration: coolCap, restSeconds: 0 });
  // Add a closing stretch when one is available and not already used.
  const stretch = candidates.find((e) => e.type === 'flexibility' && !blocks.some((b) => b.exerciseId === e.id));
  if (stretch && focus !== FOCUS.FLEXIBILITY) blocks.push(scale({ exerciseId: stretch.id }, profile));
  return blocks;
}

function pickCardio(candidates, exerciseBudget, blocks) {
  const main = candidates.find((e) => e.id === 'walk-zone2') ?? candidates.find((e) => e.id === 'walk-zone2-long');
  if (!main || exerciseBudget <= 60) return;
  blocks.push({ exerciseId: main.id, sets: 1, duration: exerciseBudget, restSeconds: 0 });
}

const MAX_WORK_EXERCISES = 8;

function pickWorkExercises(candidates, focus, exerciseBudget, profile, blocks) {
  const pool = candidates.filter((e) => e.type !== 'warmup' && e.type !== 'cooldown' && e.type !== 'cardio');
  if (pool.length === 0 || exerciseBudget <= 60) return;
  const shuffled = shuffle(pool);
  let usedExerciseSec = 0;
  let count = 0;
  for (const ex of shuffled) {
    if (count >= MAX_WORK_EXERCISES) break;
    const block = scale({ exerciseId: ex.id }, profile);
    const cost = blockSeconds(block, ex);
    if (usedExerciseSec + cost > exerciseBudget) continue;
    blocks.push(block);
    usedExerciseSec += cost;
    count++;
    if (usedExerciseSec >= exerciseBudget - 60) break;
  }
}

/** @returns {number} estimated total seconds for a block */
function blockSeconds(block, ex) {
  const sets = block.sets ?? 1;
  const work = ex.mode === 'time'
    ? (block.duration ?? 0) * sets
    : (block.reps ?? 0) * SECONDS_PER_REP * sets;
  const rest = (block.restSeconds ?? 0) * Math.max(0, sets - 1);
  return work + rest;
}

/** Apply level scaling to a raw block — same logic as generator.js but inline to keep this file self-contained. */
function scale(block, profile) {
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

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function focusEmoji(focus) {
  return ({
    [FOCUS.ALL]: '⚡', [FOCUS.CARDIO]: '🏃', [FOCUS.CORE]: '🔥',
    [FOCUS.LOWER]: '🦵', [FOCUS.UPPER]: '💪', [FOCUS.FLEXIBILITY]: '🧘',
  })[focus] ?? '⚡';
}
