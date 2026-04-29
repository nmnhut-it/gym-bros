/**
 * Profile bootstrap — temporary helper for v0.1 personal use.
 *
 * Ships a hardcoded profile matching the primary user so we can skip the
 * onboarding wizard while iterating UX. To be removed once onboarding is
 * redesigned (Phase A in IMPLEMENTATION_PLAN.md).
 */

import { CONDITION, EQUIPMENT, GENDER, GOAL, LEVEL } from './constants.js';

export const SEED_PROFILE = Object.freeze({
  name: 'Nhứt',
  gender: GENDER.MALE,
  age: 32,
  heightCm: 168,
  weightKg: 75,
  level: LEVEL.BEGINNER,
  goals: [GOAL.FAT_LOSS, GOAL.GENERAL_FITNESS],
  conditions: [CONDITION.HERNIA_HEALED],
  equipment: [EQUIPMENT.TREADMILL, EQUIPMENT.TREADMILL_INCLINE, EQUIPMENT.SIT_UP_BENCH, EQUIPMENT.YOGA_MAT],
  daysPerWeek: 3,
  sessionMinutes: 45,
});
