/**
 * Per-exercise customize sheet — reusable bottom sheet for tweaking
 * sets/reps/duration/rest before launch. Persists via setCustomization so
 * tweaks stick across sessions. See docs/evidence-base.md §5 — personalisation
 * drives retention.
 *
 * Open via `openCustomizeSheet(exerciseId, opts?)`. The sheet handles its own
 * lifecycle and DOM cleanup; callers don't need to await it.
 */

import { CUSTOMIZE_BOUNDS } from '../constants.js';
import { findExercise } from '../data/exercises.js';
import { getCustomization, setCustomization } from '../state.js';
import { fmtDuration } from './format.js';
import { button, el } from './dom.js';

/**
 * @param {string} exerciseId
 * @param {{ onChange?: () => void }} [opts] callback fired after every save
 */
export function openCustomizeSheet(exerciseId, opts = {}) {
  const ex = findExercise(exerciseId);
  if (!ex) return;
  const sheet = el('div.sheet-backdrop');
  sheet.addEventListener('click', (e) => { if (e.target === sheet) close(); });
  function close() { sheet.remove(); }
  function rerender() {
    sheet.replaceChildren();
    sheet.appendChild(buildSheet(ex, close, opts));
  }
  rerender();
  // Re-render on save so the displayed values reflect the new customization.
  // We piggyback on the simple pattern of calling rerender from each stepper.
  document.body.appendChild(sheet);
  function buildSheet(ex, close, opts) {
    return innerSheet(ex, close, () => { rerender(); opts.onChange?.(); });
  }
}

/**
 * Read the EFFECTIVE value of a field — user customization wins over the
 * exercise default. Used by callers that want to display the current target
 * without launching the full sheet.
 * @param {string} exerciseId
 * @param {'sets'|'reps'|'duration'|'restSeconds'} field
 */
export function effectiveValue(exerciseId, field) {
  const ex = findExercise(exerciseId);
  if (!ex) return undefined;
  const cust = getCustomization(exerciseId);
  if (cust[field] !== undefined) return cust[field];
  if (field === 'sets')        return ex.defaultSets;
  if (field === 'reps')        return ex.defaultReps;
  if (field === 'duration')    return ex.defaultDuration;
  if (field === 'restSeconds') return ex.defaultRest;
  return undefined;
}

// ---------- internal ----------

function innerSheet(ex, close, onSave) {
  const isTime = ex.mode === 'time';
  const cust = getCustomization(ex.id);
  return el('div.sheet.customize-sheet', {}, [
    el('div.sheet-header', {}, [
      el('h2', {}, ['Tùy chỉnh: ', ex.name]),
      el('button.icon-btn', { type: 'button', onClick: close }, ['✕']),
    ]),
    el('p.muted.customize-hint', {}, [
      'Default theo evidence base. Đổi gì cũng tự lưu — lần sau mở lại đúng số m chỉnh.',
    ]),
    stepperRow(ex, cust, 'sets', 'Số set', '', onSave),
    isTime
      ? stepperRow(ex, cust, 'duration', 'Thời lượng / set', 's', onSave, fmtDuration)
      : stepperRow(ex, cust, 'reps',
          ex.mode === 'reps-per-side' ? 'Reps mỗi bên' : 'Reps / set',
          ex.mode === 'reps-per-side' ? 'rep/bên' : 'rep',
          onSave),
    stepperRow(ex, cust, 'restSeconds', 'Nghỉ giữa set', 's', onSave, fmtDuration),
    el('div.customize-actions', {}, [
      Object.keys(cust).length === 0
        ? null
        : button('Reset về default', () => { setCustomization(ex.id, null); onSave(); },
            { variant: 'ghost' }),
      button('Xong', close, { variant: 'primary', large: true, full: true }),
    ]),
  ]);
}

/**
 * One stepper row: label + (-, value, +) controls. Bounds come from
 * CUSTOMIZE_BOUNDS so the user can't accidentally save 0 sets or 999 reps.
 */
function stepperRow(ex, cust, field, label, unit, onSave, formatter = String) {
  const bounds = CUSTOMIZE_BOUNDS[field];
  const exDefault = exerciseDefaultFor(ex, field);
  const cur = cust[field] ?? exDefault;
  const overridden = cust[field] !== undefined && cust[field] !== exDefault;
  function clamp(n) { return Math.max(bounds.min, Math.min(bounds.max, n)); }
  function step(delta) {
    const next = clamp(cur + delta);
    if (next === exDefault) setCustomization(ex.id, { [field]: null });
    else setCustomization(ex.id, { [field]: next });
    onSave();
  }
  return el('div.field.customize-field', {}, [
    el('div.customize-field-head', {}, [
      el('span.field-label', {}, [label]),
      overridden
        ? el('span.tag.tag-edited', {}, [`đã chỉnh — default: ${formatter(exDefault)}`])
        : el('span.muted.customize-default', {}, [`default: ${formatter(exDefault)}`]),
    ]),
    el('div.stepper', {}, [
      stepBtn('−', () => step(-bounds.step), cur <= bounds.min),
      el('div.stepper-value', {}, [
        el('span.stepper-num', {}, [formatter(cur)]),
        unit ? el('span.stepper-unit', {}, [unit]) : null,
      ]),
      stepBtn('+', () => step(bounds.step), cur >= bounds.max),
    ]),
  ]);
}

function stepBtn(label, onClick, disabled) {
  return el('button.icon-btn.stepper-btn',
    { type: 'button', onClick, disabled: disabled || undefined },
    [label]);
}

function exerciseDefaultFor(ex, field) {
  if (field === 'sets')        return ex.defaultSets;
  if (field === 'reps')        return ex.defaultReps;
  if (field === 'duration')    return ex.defaultDuration;
  if (field === 'restSeconds') return ex.defaultRest;
  return undefined;
}
