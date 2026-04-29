/**
 * Real-people exercise photos sourced from yuhonas/free-exercise-db.
 *
 * License: Unlicense (public domain — no attribution required, but we cite
 * the source in the tutorial sheet anyway because it's the right thing to do).
 *
 * Each entry has 2 photos showing start + end position. CSS crossfades them
 * so the user sees a real person demonstrating the move instead of a stick
 * figure. For exercises without a good match in the upstream DB, the SVG
 * stick figure animation is used as fallback.
 *
 * Source: https://github.com/yuhonas/free-exercise-db
 */

const SOURCE = Object.freeze({
  url: 'https://github.com/yuhonas/free-exercise-db',
  name: 'Free Exercise DB (public domain)',
});

/**
 * @type {Object<string, {photos: [string, string], note?: string}>}
 *
 * note: optional caveat when the upstream exercise is not an exact match
 *       (e.g. the DB has "Cat Stretch" but no separate "Cow Pose" variant).
 */
export const EXERCISE_PHOTOS = Object.freeze({
  'bw-squat':           { photos: ['Bodyweight_Squat_0.jpg',           'Bodyweight_Squat_1.jpg'] },
  'reverse-lunge':      { photos: ['Crossover_Reverse_Lunge_0.jpg',    'Crossover_Reverse_Lunge_1.jpg'], note: 'biến thể crossover' },
  'incline-pushup':     { photos: ['Incline_Push-Up_0.jpg',            'Incline_Push-Up_1.jpg'] },
  'dead-bug':           { photos: ['Dead_Bug_0.jpg',                   'Dead_Bug_1.jpg'] },
  'glute-bridge':       { photos: ['Butt_Lift_Bridge_0.jpg',           'Butt_Lift_Bridge_1.jpg'] },
  'side-plank-knee':    { photos: ['Side_Bridge_0.jpg',                'Side_Bridge_1.jpg'], note: 'phiên bản full plank — m thực hiện chống gối thay vì chân duỗi' },
  'plank-knee':         { photos: ['Plank_0.jpg',                      'Plank_1.jpg'], note: 'phiên bản full plank — m chống gối thay vì chân duỗi' },
  'cat-cow':            { photos: ['Cat_Stretch_0.jpg',                'Cat_Stretch_1.jpg'] },
  'childs-pose':        { photos: ['Childs_Pose_0.jpg',                'Childs_Pose_1.jpg'] },
  'hamstring-stretch':  { photos: ['Seated_Floor_Hamstring_Stretch_0.jpg', 'Seated_Floor_Hamstring_Stretch_1.jpg'] },
  'hip-flexor-stretch': { photos: ['Kneeling_Hip_Flexor_0.jpg',        'Kneeling_Hip_Flexor_1.jpg'] },
  'shoulder-stretch':   { photos: ['Shoulder_Stretch_0.jpg',           'Shoulder_Stretch_1.jpg'] },
  'walk-warmup':        { photos: ['Walking_Treadmill_0.jpg',          'Walking_Treadmill_1.jpg'] },
  'walk-zone2':         { photos: ['Walking_Treadmill_0.jpg',          'Walking_Treadmill_1.jpg'] },
  'walk-zone2-long':    { photos: ['Walking_Treadmill_0.jpg',          'Walking_Treadmill_1.jpg'] },
  'walk-cooldown':      { photos: ['Walking_Treadmill_0.jpg',          'Walking_Treadmill_1.jpg'] },
});

const PHOTO_ROOT = './assets/photos';

/** @param {string} exerciseId */
export function hasPhotos(exerciseId) {
  return EXERCISE_PHOTOS[exerciseId] != null;
}

/** Resolve the two full URLs for an exercise's photos. */
export function getPhotoUrls(exerciseId) {
  const entry = EXERCISE_PHOTOS[exerciseId];
  if (!entry) return null;
  return entry.photos.map((p) => `${PHOTO_ROOT}/${p}`);
}

/** @returns {string|null} optional caveat for the photo match */
export function getPhotoNote(exerciseId) {
  return EXERCISE_PHOTOS[exerciseId]?.note ?? null;
}

export const PHOTO_SOURCE = SOURCE;
