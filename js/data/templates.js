/**
 * Day templates — ordered lists of exercise IDs that the plan generator stitches
 * together to form a day's workout. Each template targets a different stimulus.
 *
 * The generator may swap individual entries based on profile (conditions, equipment,
 * level), but templates define the *shape* of a session.
 */

import { DAY_TYPE } from '../constants.js';

export const DAY_TEMPLATES = Object.freeze({
  [DAY_TYPE.CARDIO_CORE]: Object.freeze({
    id: DAY_TYPE.CARDIO_CORE,
    name: 'Cardio + Core',
    icon: '🔥',
    summary: 'Đốt mỡ + làm chắc bụng (an toàn)',
    blocks: Object.freeze([
      { exerciseId: 'walk-warmup' },
      { exerciseId: 'walk-zone2' },
      { exerciseId: 'dead-bug' },
      { exerciseId: 'bird-dog' },
      { exerciseId: 'pelvic-tilt' },
      { exerciseId: 'side-plank-knee' },
      { exerciseId: 'walk-cooldown' },
      { exerciseId: 'childs-pose' },
    ]),
  }),

  [DAY_TYPE.STRENGTH_LIGHT]: Object.freeze({
    id: DAY_TYPE.STRENGTH_LIGHT,
    name: 'Sức mạnh nhẹ',
    icon: '💪',
    summary: 'Toàn thân không tạ — an toàn, không nín thở',
    blocks: Object.freeze([
      { exerciseId: 'walk-warmup' },
      { exerciseId: 'bw-squat' },
      { exerciseId: 'glute-bridge' },
      { exerciseId: 'incline-pushup' },
      { exerciseId: 'reverse-lunge' },
      { exerciseId: 'standing-calf' },
      { exerciseId: 'bird-dog' },
      { exerciseId: 'walk-cooldown' },
      { exerciseId: 'hip-flexor-stretch' },
    ]),
  }),

  [DAY_TYPE.CARDIO_LONG]: Object.freeze({
    id: DAY_TYPE.CARDIO_LONG,
    name: 'Cardio dài',
    icon: '🏃',
    summary: 'Buổi đốt mỡ dài, đi bộ là chính',
    blocks: Object.freeze([
      { exerciseId: 'walk-warmup' },
      { exerciseId: 'walk-zone2-long' },
      { exerciseId: 'walk-cooldown' },
      { exerciseId: 'hamstring-stretch' },
      { exerciseId: 'shoulder-stretch' },
    ]),
  }),

  [DAY_TYPE.RECOVERY]: Object.freeze({
    id: DAY_TYPE.RECOVERY,
    name: 'Hồi phục + giãn cơ',
    icon: '🧘',
    summary: 'Nhẹ nhàng, giúp người dẻo + nghỉ ngơi tích cực',
    blocks: Object.freeze([
      { exerciseId: 'walk-warmup' },
      { exerciseId: 'cat-cow' },
      { exerciseId: 'childs-pose' },
      { exerciseId: 'hamstring-stretch' },
      { exerciseId: 'hip-flexor-stretch' },
      { exerciseId: 'shoulder-stretch' },
    ]),
  }),

  [DAY_TYPE.REST]: Object.freeze({
    id: DAY_TYPE.REST,
    name: 'Nghỉ',
    icon: '😴',
    summary: 'Cơ thể cần nghỉ để hồi phục',
    blocks: Object.freeze([]),
  }),
});

/**
 * Weekly schedule templates by daysPerWeek.
 * Maps weekday index (0=Sun..6=Sat) → DAY_TYPE.
 */
export const WEEK_SCHEDULES = Object.freeze({
  3: Object.freeze({
    0: DAY_TYPE.REST,
    1: DAY_TYPE.CARDIO_CORE,
    2: DAY_TYPE.REST,
    3: DAY_TYPE.STRENGTH_LIGHT,
    4: DAY_TYPE.REST,
    5: DAY_TYPE.CARDIO_LONG,
    6: DAY_TYPE.RECOVERY,
  }),
  4: Object.freeze({
    0: DAY_TYPE.RECOVERY,
    1: DAY_TYPE.CARDIO_CORE,
    2: DAY_TYPE.STRENGTH_LIGHT,
    3: DAY_TYPE.REST,
    4: DAY_TYPE.CARDIO_LONG,
    5: DAY_TYPE.REST,
    6: DAY_TYPE.STRENGTH_LIGHT,
  }),
  5: Object.freeze({
    0: DAY_TYPE.RECOVERY,
    1: DAY_TYPE.CARDIO_CORE,
    2: DAY_TYPE.STRENGTH_LIGHT,
    3: DAY_TYPE.CARDIO_LONG,
    4: DAY_TYPE.REST,
    5: DAY_TYPE.STRENGTH_LIGHT,
    6: DAY_TYPE.CARDIO_CORE,
  }),
  6: Object.freeze({
    0: DAY_TYPE.STRENGTH_LIGHT,
    1: DAY_TYPE.CARDIO_CORE,
    2: DAY_TYPE.STRENGTH_LIGHT,
    3: DAY_TYPE.CARDIO_LONG,
    4: DAY_TYPE.STRENGTH_LIGHT,
    5: DAY_TYPE.REST,
    6: DAY_TYPE.CARDIO_CORE,
  }),
});

/** @param {string} dayType */
export function getDayTemplate(dayType) {
  const t = DAY_TEMPLATES[dayType];
  if (!t) throw new Error(`Unknown day type: ${dayType}`);
  return t;
}
