/**
 * Stick-figure animations for exercises.
 *
 * Approach: each kind is an inline SVG with CSS classes. main.css drives the
 * animation via @keyframes targeting `.anim-<kind>` and inner `<g>` parts.
 *
 * Why SVG (not GIF, not video, not YouTube):
 *  - <2KB per animation vs 500KB-2MB GIFs
 *  - Works fully offline
 *  - Owned content — no platform/ad surprises
 *  - Easy to retheme via stroke color
 *
 * Tradeoff: cartoon-y, won't replace real demo videos for finer technique cues.
 *
 * Map exercises to a kind via EXERCISE_TO_ANIM. Generic-looking exercises
 * (e.g. all stretches) share a kind.
 */

const STROKE = 'currentColor';

/** SVG body markup per animation kind. Wrapped by makeAnimation(). */
const SVG_BODY = {
  walk: `
    <g class="figure">
      <circle cx="0" cy="22" r="14" fill="${STROKE}" stroke="none"/>
      <path d="M0 36 L0 110"/>
      <g class="arm-front"><path d="M0 56 L26 92"/></g>
      <g class="arm-back"><path d="M0 56 L-26 92"/></g>
      <g class="leg-front"><path d="M0 110 L22 178"/></g>
      <g class="leg-back"><path d="M0 110 L-22 178"/></g>
    </g>`,

  squat: `
    <g class="figure">
      <circle class="sq-head" cx="0" cy="22" r="14" fill="${STROKE}" stroke="none"/>
      <g class="sq-body">
        <path d="M0 36 L0 110"/>
        <path d="M0 56 L-32 100"/>
        <path d="M0 56 L32 100"/>
      </g>
      <g class="sq-leg-l"><path d="M0 110 L-22 175"/></g>
      <g class="sq-leg-r"><path d="M0 110 L22 175"/></g>
    </g>`,

  lunge: `
    <g class="figure">
      <circle class="ln-head" cx="0" cy="22" r="14" fill="${STROKE}" stroke="none"/>
      <g class="ln-body">
        <path d="M0 36 L0 105"/>
        <path d="M0 55 L-28 90"/>
        <path d="M0 55 L28 90"/>
      </g>
      <g class="ln-leg-front"><path d="M0 105 L30 175"/></g>
      <g class="ln-leg-back"><path d="M0 105 L-30 175"/></g>
    </g>`,

  /* Supine = nằm ngửa, side view (head left). Body horizontal at y=130. */
  supine: `
    <g class="figure">
      <circle cx="-90" cy="130" r="13" fill="${STROKE}" stroke="none"/>
      <path d="M-77 130 L40 130"/>
      <g class="su-arm"><path d="M-30 130 L-30 80"/></g>
      <g class="su-leg"><path d="M40 130 L40 80"/></g>
    </g>`,

  bridge: `
    <g class="figure">
      <circle cx="-90" cy="135" r="13" fill="${STROKE}" stroke="none"/>
      <g class="br-body">
        <path d="M-77 135 L20 135"/>
        <path d="M-50 135 L-50 165"/>
      </g>
      <path d="M20 135 L60 135"/>
      <path d="M60 135 L60 165"/>
    </g>`,

  /* Quadruped = chống tay + gối, side view */
  quadruped: `
    <g class="figure">
      <circle cx="-65" cy="80" r="13" fill="${STROKE}" stroke="none"/>
      <path class="q-spine" d="M-52 88 L40 88"/>
      <g class="q-arm-front"><path d="M-40 88 L-40 155"/></g>
      <g class="q-leg-back"><path d="M30 88 L30 155"/></g>
      <g class="q-arm-extend"><path d="M-50 88 L-105 60"/></g>
      <g class="q-leg-extend"><path d="M40 88 L95 60"/></g>
    </g>`,

  pushup: `
    <g class="figure">
      <circle class="pu-head" cx="-65" cy="100" r="13" fill="${STROKE}" stroke="none"/>
      <g class="pu-body">
        <path d="M-52 105 L60 130"/>
      </g>
      <path d="M-30 105 L-30 160"/>
      <path d="M50 130 L50 160"/>
    </g>`,

  plank: `
    <g class="figure">
      <circle class="pk-head" cx="-65" cy="105" r="12" fill="${STROKE}" stroke="none"/>
      <path d="M-52 110 L60 130"/>
      <path d="M-25 110 L-25 160"/>
      <path d="M55 130 L55 160"/>
    </g>`,

  sidePlank: `
    <g class="figure">
      <circle cx="-90" cy="115" r="12" fill="${STROKE}" stroke="none"/>
      <g class="sp-body">
        <path d="M-77 117 L50 138"/>
      </g>
      <path d="M-30 124 L-30 160"/>
      <path d="M40 130 L0 160"/>
    </g>`,

  childPose: `
    <g class="figure">
      <circle cx="-30" cy="110" r="12" fill="${STROKE}" stroke="none"/>
      <path d="M-18 115 L40 90"/>
      <path d="M40 90 L40 160"/>
      <path d="M-18 115 L-90 95"/>
    </g>`,

  catCow: `
    <g class="figure">
      <circle cx="-65" cy="80" r="13" fill="${STROKE}" stroke="none"/>
      <path class="cc-spine" d="M-52 88 Q-5 70 40 88"/>
      <path d="M-42 88 L-42 155"/>
      <path d="M30 88 L30 155"/>
    </g>`,

  stretchSeated: `
    <g class="figure">
      <circle cx="0" cy="55" r="13" fill="${STROKE}" stroke="none"/>
      <path d="M0 68 Q5 110 60 130"/>
      <path d="M0 90 L60 130"/>
      <path d="M60 130 L60 175"/>
    </g>`,

  calfRaise: `
    <g class="figure">
      <circle class="cr-head" cx="0" cy="22" r="14" fill="${STROKE}" stroke="none"/>
      <path d="M0 36 L0 110"/>
      <path d="M0 56 L-26 92"/>
      <path d="M0 56 L26 92"/>
      <g class="cr-legs">
        <path d="M0 110 L-15 170"/>
        <path d="M0 110 L15 170"/>
      </g>
    </g>`,
};

/** Map every exercise id → animation kind. */
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
 * Build an animated SVG node for a given exercise.
 * @param {string} exerciseId
 * @returns {HTMLElement}
 */
export function makeAnimation(exerciseId) {
  const kind = EXERCISE_TO_ANIM[exerciseId] ?? 'plank';
  const body = SVG_BODY[kind] ?? SVG_BODY.plank;
  const src = `<svg xmlns="http://www.w3.org/2000/svg" class="anim anim-${kind}" viewBox="-110 0 220 200" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  return new DOMParser().parseFromString(src, 'image/svg+xml').documentElement;
}
