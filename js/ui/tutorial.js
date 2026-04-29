/**
 * Tutorial sheet — shared component opening detailed exercise guidance.
 * Used by session player (intro phase) and browse view.
 *
 * Reads from the exercise's enriched fields (detailedSteps, musclesWorked,
 * commonMistakes, safetyNotes, sources). Falls back gracefully when fields
 * are missing — older exercises that haven't been enriched yet still render
 * with just the basic instructions.
 */

import { makeAnimation } from '../data/animations.js';
import { hasPhotos, getPhotoNote, PHOTO_SOURCE } from '../data/photos.js';
import { el } from './dom.js';

/**
 * Open a bottom-sheet showing the full tutorial for an exercise.
 * @param {object} ex — exercise object from data/exercises.js
 */
export function openTutorial(ex) {
  const sheet = el('div.sheet-backdrop', {});
  sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.remove(); });
  sheet.appendChild(el('div.sheet.tutorial-sheet', {}, [
    el('div.sheet-header', {}, [
      el('h2', {}, [ex.name]),
      el('button.icon-btn', { type: 'button', onClick: () => sheet.remove() }, ['✕']),
    ]),
    el('div.tutorial-anim', {}, [makeAnimation(ex.id)]),
    photoNote(ex),
    ex.benefits ? section('Vì sao bài này tốt', el('p', {}, [ex.benefits])) : null,
    musclesWorkedSection(ex),
    detailedStepsSection(ex),
    commonMistakesSection(ex),
    safetyNotesSection(ex),
    sourcesSection(ex),
  ]));
  document.body.appendChild(sheet);
  return sheet;
}

function section(title, ...children) {
  return el('section.tut-section', {}, [
    el('h3.tut-section-title', {}, [title]),
    ...children,
  ]);
}

function musclesWorkedSection(ex) {
  if (!ex.musclesWorked?.length) return null;
  return section('Cơ tham gia',
    el('div.muscle-pills', {}, ex.musclesWorked.map((m) => el('span.muscle-pill', {}, [m]))),
  );
}

function detailedStepsSection(ex) {
  const steps = ex.detailedSteps?.length ? ex.detailedSteps : [ex.instructions];
  return section('Cách tập',
    el('ol.tut-steps', {}, steps.map((s, i) => el('li.tut-step', {}, [
      el('span.tut-step-num', {}, [String(i + 1)]),
      el('span.tut-step-text', {}, [s]),
    ]))),
  );
}

function commonMistakesSection(ex) {
  if (!ex.commonMistakes?.length) return null;
  return section('Lỗi thường gặp',
    el('ul.tut-mistakes', {}, ex.commonMistakes.map((m) => el('li', {}, ['⚠ ', m]))),
  );
}

function safetyNotesSection(ex) {
  if (!ex.safetyNotes) return null;
  return section('Lưu ý an toàn',
    el('div.alert.alert-warning', {}, [el('p', {}, [ex.safetyNotes])]),
  );
}

function sourcesSection(ex) {
  const docSources = ex.sources ?? [];
  const photoSrc = hasPhotos(ex.id) ? [PHOTO_SOURCE] : [];
  const all = [...docSources, ...photoSrc];
  if (all.length === 0) return null;
  return section('Nguồn tham khảo',
    el('ul.tut-sources', {}, all.map((s) => el('li', {}, [
      el('a', { href: s.url, target: '_blank', rel: 'noopener' }, [s.name]),
    ]))),
  );
}

function photoNote(ex) {
  const note = getPhotoNote(ex.id);
  if (!note) return null;
  return el('p.muted.photo-note', {}, [`📷 Lưu ý: ảnh minh hoạ là ${note}.`]);
}
