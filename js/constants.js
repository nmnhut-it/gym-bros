/**
 * App-wide constants. Single source of truth — no string/number hardcoded elsewhere.
 */

export const APP_NAME = 'GymBros';
export const APP_VERSION = '0.1.0';
export const STORAGE_PREFIX = 'gymbros';

export const STORAGE_KEYS = Object.freeze({
  PROFILE: `${STORAGE_PREFIX}:profile`,
  PLAN: `${STORAGE_PREFIX}:plan`,
  SESSIONS: `${STORAGE_PREFIX}:sessions`,
  WEIGHTS: `${STORAGE_PREFIX}:weights`,
  SETTINGS: `${STORAGE_PREFIX}:settings`,
  CURRENT_SESSION: `${STORAGE_PREFIX}:currentSession`,
});

export const ROUTES = Object.freeze({
  ONBOARDING: '#/onboarding',
  DASHBOARD: '#/',
  PLAN: '#/plan',
  SESSION: '#/session',
  PROGRESS: '#/progress',
  SETTINGS: '#/settings',
  BROWSE: '#/browse',
});

export const GENDER = Object.freeze({ MALE: 'male', FEMALE: 'female', OTHER: 'other' });

export const GOAL = Object.freeze({
  FAT_LOSS: 'fat-loss',
  GENERAL_FITNESS: 'general-fitness',
  MUSCLE_GAIN: 'muscle-gain',
  ENDURANCE: 'endurance',
});

export const LEVEL = Object.freeze({
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
});

/**
 * Profile flags that constrain exercise selection. Names describe the
 * RESTRICTION (what the program avoids), not the underlying cause.
 *
 *   CORE_EASY — avoid bài tăng áp lực ổ bụng (sit-up, V-up, deadlift, heavy squat,
 *               nín thở rặn / Valsalva). Most beginners + recovery users.
 *   CORE_MIN  — even stricter than CORE_EASY (no plank-lâu, no full pushup).
 *   BACK_EASY — avoid heavy spinal loading.
 *   KNEE_EASY — avoid deep knee flexion + impact (deep squat, jumping lunge).
 *
 * Adding a new flag: add the enum, declare which exercises are unsafe via
 * `unsafeFor` in data/exercises.js, add an option in onboarding.
 */
export const CONDITION = Object.freeze({
  CORE_EASY: 'core-easy',
  CORE_MIN: 'core-min',
  BACK_EASY: 'back-easy',
  KNEE_EASY: 'knee-easy',
});

/**
 * Legacy → current condition codes. Used by state.load() to migrate profiles
 * persisted under older flag names without forcing the user to redo onboarding.
 * Map to `null` to drop a code with no replacement.
 */
export const CONDITION_MIGRATIONS = Object.freeze({
  'hernia-healed': 'core-easy',
  'hernia-acute':  'core-min',
  'back-pain':     'back-easy',
  'knee-pain':     'knee-easy',
  'high-bp':       'core-easy',
  'pregnancy':     null,
});

export const EQUIPMENT = Object.freeze({
  TREADMILL: 'treadmill',
  TREADMILL_INCLINE: 'treadmill-incline',
  SIT_UP_BENCH: 'sit-up-bench',
  AB_WHEEL: 'ab-wheel',
  DUMBBELLS: 'dumbbells',
  RESISTANCE_BAND: 'resistance-band',
  PULL_UP_BAR: 'pull-up-bar',
  YOGA_MAT: 'yoga-mat',
  NONE: 'none',
});

export const EXERCISE_TYPE = Object.freeze({
  CARDIO: 'cardio',
  CORE: 'core',
  LOWER: 'lower',
  UPPER: 'upper',
  FULL_BODY: 'full-body',
  FLEXIBILITY: 'flexibility',
  WARMUP: 'warmup',
  COOLDOWN: 'cooldown',
});

export const DAY_TYPE = Object.freeze({
  CARDIO_CORE: 'cardio-core',
  STRENGTH_LIGHT: 'strength-light',
  CARDIO_LONG: 'cardio-long',
  RECOVERY: 'recovery',
  REST: 'rest',
});

export const WEEKDAY = Object.freeze({
  MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6, SUN: 0,
});

export const WEEKDAY_LABEL_VI = Object.freeze({
  0: 'CN', 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7',
});

export const WEEKDAY_LABEL_VI_LONG = Object.freeze({
  0: 'Chủ Nhật', 1: 'Thứ Hai', 2: 'Thứ Ba', 3: 'Thứ Tư',
  4: 'Thứ Năm', 5: 'Thứ Sáu', 6: 'Thứ Bảy',
});

export const DEFAULT_SETTINGS = Object.freeze({
  tvMode: false,
  voiceEnabled: true,
  voiceLang: 'vi-VN',
  voiceRate: 1.0,
  voicePitch: 1.0,
  soundEnabled: true,
  countdownBeep: true,
  restBellSeconds: 3,
});

export const DEFAULT_PLAN_OPTIONS = Object.freeze({
  daysPerWeek: 3,
  sessionMinutes: 45,
});

export const SESSION_LIMITS = Object.freeze({
  MIN_MINUTES: 15,
  MAX_MINUTES: 90,
});

export const DEFAULT_REST_SECONDS = 45;
export const WARMUP_DURATION = 300;
export const COOLDOWN_DURATION = 300;
export const TICK_MS = 100;
