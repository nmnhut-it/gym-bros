import { hasPhotos, getPhotoUrls } from './photos.js';

/**
 * Stick-figure animations v2 — multi-pose fade for clearer motion.
 *
 * Each animation packs 2 or 3 full-body poses into one SVG. CSS cycles
 * opacity through them so the user sees distinct positions instead of
 * an interpolated blob — much easier to follow along.
 *
 * Why multi-pose-fade over joint-rigging:
 *   - Each pose is hand-drawn → hits the exact target body position
 *   - No nested SVG transform math
 *   - Browser-friendly (just opacity transitions)
 *   - 1-3KB per animation
 *
 * Tradeoff: motion looks a bit teleporty rather than smooth. For a
 * how-to-follow tool that's actually a feature — discrete poses are
 * clearer than a blur of motion.
 *
 * Scale: viewBox -60 0 120 200, side view, head at top.
 *   y=14  head center (r=10)
 *   y=24  shoulder
 *   y=95  hip
 *   y=175 ankle
 */

const STROKE_W = 5;

/** Inline shorthand: head circle. */
const head = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="10" fill="currentColor" stroke="none"/>`;

/** Compose a pose group with arbitrary SVG body content. */
const pose = (cls, body) => `<g class="${cls}">${body}</g>`;

const SVG_BODY = {
  // ===== walk: alternating leg + arm swing =====
  walk: pose('p p1', `
    ${head(0, 14)}
    <path d="M0 24 L0 95"/>
    <path d="M0 38 L-22 70"/>
    <path d="M0 38 L22 78"/>
    <path d="M0 95 L-22 175"/>
    <path d="M0 95 L22 178"/>
    <path d="M-25 178 L-15 178"/>
    <path d="M19 181 L29 181"/>
  `) + pose('p p2', `
    ${head(0, 14)}
    <path d="M0 24 L0 95"/>
    <path d="M0 38 L22 70"/>
    <path d="M0 38 L-22 78"/>
    <path d="M0 95 L22 175"/>
    <path d="M0 95 L-22 178"/>
    <path d="M19 178 L29 178"/>
    <path d="M-25 181 L-15 181"/>
  `),

  // ===== squat: standing → squatting (hip back, knees bent, body slight lean) =====
  squat: pose('p p1', `
    ${head(0, 14)}
    <path d="M0 24 L0 95"/>
    <path d="M0 38 L-12 78"/>
    <path d="M0 38 L12 78"/>
    <path d="M0 95 L-12 175"/>
    <path d="M0 95 L12 175"/>
    <path d="M-18 178 L-6 178"/>
    <path d="M6 178 L18 178"/>
  `) + pose('p p2', `
    ${head(8, 38)}
    <path d="M8 48 Q8 70 -2 100"/>
    <path d="M10 60 L34 75"/>
    <path d="M10 60 L34 60"/>
    <path d="M-2 100 L-32 130 L-22 175"/>
    <path d="M-2 100 L26 130 L20 175"/>
    <path d="M14 178 L26 178"/>
    <path d="M-28 178 L-16 178"/>
  `),

  // ===== lunge: standing → rear leg back, front knee bent =====
  lunge: pose('p p1', `
    ${head(0, 14)}
    <path d="M0 24 L0 95"/>
    <path d="M0 38 L-12 78"/>
    <path d="M0 38 L12 78"/>
    <path d="M0 95 L-12 175"/>
    <path d="M0 95 L12 175"/>
  `) + pose('p p2', `
    ${head(0, 24)}
    <path d="M0 34 L0 105"/>
    <path d="M0 48 L-10 88"/>
    <path d="M0 48 L10 88"/>
    <path d="M0 105 L26 140 L24 175"/>
    <path d="M0 105 L-32 165 L-12 175"/>
    <path d="M-18 178 L-6 178"/>
    <path d="M22 178 L34 178"/>
  `),

  // ===== supine (dead-bug, pelvic-tilt): lying with limbs alternating =====
  supine: pose('p p1', `
    ${head(-90, 130)}
    <path d="M-78 130 L40 130"/>
    <path d="M-30 130 L-30 78"/>
    <path d="M40 130 L40 78"/>
    <path d="M40 78 L24 78"/>
  `) + pose('p p2', `
    ${head(-90, 130)}
    <path d="M-78 130 L40 130"/>
    <path d="M-30 130 L-30 78"/>
    <path d="M-30 78 L-66 78"/>
    <path d="M40 130 L80 130"/>
  `) + pose('p p3', `
    ${head(-90, 130)}
    <path d="M-78 130 L40 130"/>
    <path d="M-30 130 L-30 78"/>
    <path d="M40 130 L40 78"/>
    <path d="M40 78 L24 78"/>
  `),

  // ===== bridge: lying flat → hips lifted =====
  bridge: pose('p p1', `
    ${head(-90, 135)}
    <path d="M-78 135 L20 135"/>
    <path d="M20 135 L-10 135"/>
    <path d="M20 135 L60 135"/>
    <path d="M60 135 L60 165"/>
  `) + pose('p p2', `
    ${head(-90, 135)}
    <path d="M-78 135 Q-30 105 20 105"/>
    <path d="M20 105 L60 135"/>
    <path d="M60 135 L60 165"/>
  `),

  // ===== quadruped (bird-dog): rest → opposite limbs extended =====
  quadruped: pose('p p1', `
    ${head(-65, 80)}
    <path d="M-52 88 L40 88"/>
    <path d="M-40 88 L-40 155"/>
    <path d="M30 88 L30 155"/>
  `) + pose('p p2', `
    ${head(-65, 80)}
    <path d="M-52 88 L40 88"/>
    <path d="M-40 88 L-40 155"/>
    <path d="M30 88 L30 155"/>
    <path d="M-50 84 L-110 56"/>
    <path d="M40 88 L100 56"/>
  `) + pose('p p3', `
    ${head(-65, 80)}
    <path d="M-52 88 L40 88"/>
    <path d="M-40 88 L-40 155"/>
    <path d="M30 88 L30 155"/>
  `),

  // ===== cat-cow: cat (rounded up) → cow (sagged down) =====
  catCow: pose('p p1', `
    ${head(-65, 95)}
    <path d="M-52 100 Q-5 70 40 100"/>
    <path d="M-42 100 L-42 155"/>
    <path d="M30 100 L30 155"/>
  `) + pose('p p2', `
    ${head(-65, 75)}
    <path d="M-52 78 Q-5 110 40 78"/>
    <path d="M-42 78 L-42 155"/>
    <path d="M30 78 L30 155"/>
  `),

  // ===== plank (and shoulder-tap fallback): hold steady, slight pulse =====
  plank: pose('p p1', `
    ${head(-65, 105)}
    <path d="M-52 110 L60 130"/>
    <path d="M-25 110 L-25 160"/>
    <path d="M55 130 L55 160"/>
  `),

  // ===== sidePlank: hips lifted variant =====
  sidePlank: pose('p p1', `
    ${head(-90, 115)}
    <path d="M-77 117 L50 138"/>
    <path d="M-30 124 L-30 160"/>
    <path d="M40 130 L0 160"/>
  `),

  // ===== childPose: static, breathing scale (driven by CSS) =====
  childPose: pose('p p1', `
    ${head(-30, 110)}
    <path d="M-18 115 L40 90"/>
    <path d="M40 90 L40 160"/>
    <path d="M-18 115 L-90 95"/>
  `),

  // ===== pushup (incline): arms straight → arms bent (chest down) =====
  pushup: pose('p p1', `
    ${head(-65, 90)}
    <path d="M-52 95 L60 125"/>
    <path d="M-30 95 L-30 155"/>
    <path d="M50 125 L50 155"/>
  `) + pose('p p2', `
    ${head(-50, 110)}
    <path d="M-38 115 L60 135"/>
    <path d="M-30 115 L-22 135 L-30 155"/>
    <path d="M50 135 L50 155"/>
  `),

  // ===== calfRaise: feet flat → heels lifted =====
  calfRaise: pose('p p1', `
    ${head(0, 14)}
    <path d="M0 24 L0 95"/>
    <path d="M0 38 L-12 78"/>
    <path d="M0 38 L12 78"/>
    <path d="M0 95 L-12 175"/>
    <path d="M0 95 L12 175"/>
    <path d="M-22 178 L-2 178"/>
    <path d="M2 178 L22 178"/>
  `) + pose('p p2', `
    ${head(0, 4)}
    <path d="M0 14 L0 85"/>
    <path d="M0 28 L-12 68"/>
    <path d="M0 28 L12 68"/>
    <path d="M0 85 L-12 165"/>
    <path d="M0 85 L12 165"/>
    <path d="M-22 168 L-12 165"/>
    <path d="M12 165 L22 168"/>
  `),

  // ===== seated stretch: static =====
  stretchSeated: pose('p p1', `
    ${head(0, 55)}
    <path d="M0 65 Q5 105 60 130"/>
    <path d="M0 85 L60 130"/>
    <path d="M60 130 L60 175"/>
  `),
};

export const EXERCISE_TO_ANIM = Object.freeze({
  'walk-warmup': 'walk',
  'walk-zone2': 'walk',
  'walk-zone2-long': 'walk',
  'walk-cooldown': 'walk',

  'bw-squat': 'squat',
  'wall-sit': 'squat',
  'reverse-lunge': 'lunge',
  'standing-calf': 'calfRaise',

  'dead-bug': 'supine',
  'pelvic-tilt': 'supine',
  'glute-bridge': 'bridge',

  'bird-dog': 'quadruped',
  'cat-cow': 'catCow',

  'plank-knee': 'plank',
  'side-plank-knee': 'sidePlank',
  'childs-pose': 'childPose',

  'wall-pushup': 'pushup',
  'knee-pushup': 'pushup',
  'incline-pushup': 'pushup',
  'shoulder-tap': 'plank',

  'hamstring-stretch': 'stretchSeated',
  'hip-flexor-stretch': 'lunge',
  'shoulder-stretch': 'stretchSeated',
});

/**
 * Build an animation node for a given exercise.
 *
 * Priority:
 *   1. If photos exist (real-people from free-exercise-db) → 2-image crossfade
 *   2. Otherwise fall back to the SVG stick figure with multi-pose fade
 *
 * @param {string} exerciseId
 * @returns {HTMLElement}
 */
export function makeAnimation(exerciseId) {
  if (hasPhotos(exerciseId)) return makePhotoAnimation(exerciseId);
  return makeSvgAnimation(exerciseId);
}

function makePhotoAnimation(exerciseId) {
  const urls = getPhotoUrls(exerciseId);
  const wrap = document.createElement('div');
  wrap.className = 'anim anim-photo';
  for (let i = 0; i < urls.length; i++) {
    const img = document.createElement('img');
    img.className = `photo-frame frame-${i}`;
    img.src = urls[i];
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    wrap.appendChild(img);
  }
  return wrap;
}

function makeSvgAnimation(exerciseId) {
  const kind = EXERCISE_TO_ANIM[exerciseId] ?? 'plank';
  const body = SVG_BODY[kind] ?? SVG_BODY.plank;
  const src = `<svg xmlns="http://www.w3.org/2000/svg" class="anim anim-${kind}" viewBox="-110 0 220 200" stroke="currentColor" stroke-width="${STROKE_W}" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  return new DOMParser().parseFromString(src, 'image/svg+xml').documentElement;
}
