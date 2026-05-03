/**
 * Exercise library + custom workout builder (JTBD #3).
 *
 * Layout:
 *   - Header with back button + total count + filter toggle
 *   - List grouped by exercise type
 *   - Each row: animation thumbnail · name · type badge · default reps/time
 *   - Tap row → toggle add to cart
 *   - Sticky bottom bar shows cart count + "Bắt đầu" CTA
 *   - Cart sheet: reorder, remove, view summary; "Bắt đầu" → ad-hoc session
 *
 * The cart lives in module state — survives navigation within this view but
 * intentionally not persisted across reloads (a custom workout is one-shot).
 */

import { EXERCISE_TYPE, ROUTES } from '../constants.js';
import { isFavorite, state, setAdHocDay, toggleFavorite } from '../state.js';
import { EXERCISES } from '../data/exercises.js';
import { makeAnimation } from '../data/animations.js';
import { buildCustomDay } from '../plan/builder.js';
import { navigate } from '../router.js';
import { fmtDuration } from '../ui/format.js';
import { button, el, icon, mount } from '../ui/dom.js';
import { openTutorial } from '../ui/tutorial.js';

/** @type {string[]} ordered list of exercise IDs in the current cart */
let cart = [];

/** Show all exercises (including unsafe / equipment-missing). Default: only safe + available. */
let showAll = false;

const TYPE_GROUPS = [
  { type: EXERCISE_TYPE.WARMUP,      label: 'Khởi động',     emoji: '🚶' },
  { type: EXERCISE_TYPE.CARDIO,      label: 'Cardio',         emoji: '🏃' },
  { type: EXERCISE_TYPE.LOWER,       label: 'Chân + mông',    emoji: '🦵' },
  { type: EXERCISE_TYPE.UPPER,       label: 'Tay + ngực',     emoji: '💪' },
  { type: EXERCISE_TYPE.CORE,        label: 'Bụng + lõi',     emoji: '🔥' },
  { type: EXERCISE_TYPE.FLEXIBILITY, label: 'Giãn cơ',        emoji: '🧘' },
  { type: EXERCISE_TYPE.COOLDOWN,    label: 'Hạ nhịp',        emoji: '🚶' },
];

export function render(root) {
  mount(root,
    el('main.browse', {}, [
      header(),
      filterRow(),
      el('div.browse-list', {}, TYPE_GROUPS.map(group)),
    ]),
    cart.length ? cartBar() : null,
  );
}

function header() {
  return el('header.browse-header', {}, [
    el('button.icon-btn', { type: 'button', onClick: () => navigate(ROUTES.DASHBOARD) }, [icon('arrowLeft', 22)]),
    el('div.browse-title', {}, [
      el('h1', {}, ['Thư viện bài tập']),
      el('p.muted', {}, [`${countShown()} bài hiển thị · tick để thêm vào buổi tập`]),
    ]),
  ]);
}

function filterRow() {
  return el('div.browse-filter', {}, [
    el('label.toggle-row', {}, [
      el('span', {}, ['Hiện cả bài không phù hợp với t']),
      el('input.toggle', {
        type: 'checkbox', checked: showAll,
        onchange: (e) => { showAll = e.target.checked; redraw(); },
      }),
    ]),
  ]);
}

function group({ type, label, emoji }) {
  const list = visibleByType(type);
  if (list.length === 0) return null;
  return el('section.browse-group', {}, [
    el('h2.browse-group-title', {}, [`${emoji} ${label}`, el('span.muted', {}, [` · ${list.length}`])]),
    el('ul.browse-items', {}, list.map(itemRow)),
  ]);
}

function itemRow(ex) {
  const inCart = cart.includes(ex.id);
  const unsafe = isUnsafeForUser(ex);
  const noEquip = !hasEquipment(ex);
  return el(`li.browse-item${inCart ? '.in-cart' : ''}`, {
    role: 'button', tabindex: 0,
    onClick: () => { toggleCart(ex.id); redraw(); },
    onKeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { toggleCart(ex.id); redraw(); } },
  }, [
    el('div.browse-thumb', {}, [makeAnimation(ex.id)]),
    el('div.browse-info', {}, [
      el('div.browse-name', {}, [ex.name]),
      el('div.browse-meta', {}, [defaultMeta(ex)]),
      unsafe ? el('span.tag.tag-warn', {}, ['⚠ Không phù hợp']) : null,
      noEquip ? el('span.tag.tag-muted', {}, ['Thiếu thiết bị']) : null,
    ]),
    el('div.browse-action', {}, [
      starButton(ex.id),
      el('button.icon-btn.tutorial-icon', {
        type: 'button', title: 'Hướng dẫn',
        onClick: (e) => { e.stopPropagation(); openTutorial(ex); },
      }, ['📖']),
      el(`span.cart-check${inCart ? '.is-on' : ''}`, {}, [inCart ? '✓' : '+']),
    ]),
  ]);
}

/**
 * Star pin button. Stops click propagation so the surrounding row's "add to
 * cart" handler doesn't fire — pinning and selecting are independent actions.
 * @param {string} exerciseId
 */
function starButton(exerciseId) {
  const on = isFavorite(exerciseId);
  return el(`button.icon-btn.star-btn${on ? '.is-on' : ''}`, {
    type: 'button',
    title: on ? 'Bỏ yêu thích' : 'Yêu thích',
    'aria-pressed': on ? 'true' : 'false',
    onClick: (e) => { e.stopPropagation(); toggleFavorite(exerciseId); redraw(); },
  }, [on ? '★' : '☆']);
}

function defaultMeta(ex) {
  if (ex.mode === 'time') return `${ex.defaultSets ?? 1}× ${fmtDuration(ex.defaultDuration ?? 0)}`;
  const word = ex.mode === 'reps-per-side' ? 'rep/bên' : 'rep';
  return `${ex.defaultSets ?? 1}× ${ex.defaultReps ?? '?'} ${word}`;
}

function cartBar() {
  return el('footer.cart-bar', {}, [
    el('div.cart-info', {}, [
      el('span.cart-count', {}, [String(cart.length)]),
      el('span.cart-label', {}, [`bài đã chọn`]),
    ]),
    button('Xem + Bắt đầu', openCartSheet, { variant: 'primary', large: true }),
  ]);
}

// ---------- cart actions ----------

function toggleCart(id) {
  if (cart.includes(id)) cart = cart.filter((x) => x !== id);
  else cart = [...cart, id];
}

function openCartSheet() {
  const sheet = el('div.sheet-backdrop', {});
  sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.remove(); });
  function close() { sheet.remove(); }
  sheet.appendChild(el('div.sheet', {}, [
    el('div.sheet-header', {}, [
      el('h2', {}, [`Buổi tập (${cart.length} bài)`]),
      el('button.icon-btn', { type: 'button', onClick: close }, ['✕']),
    ]),
    el('p.muted', {}, ['App tự thêm khởi động + hạ nhịp đầu/cuối. Kéo thứ tự bằng cách bỏ rồi thêm lại bài.']),
    el('ul.cart-list', {}, cart.map(cartItemRow)),
    cart.length === 0 ? el('p.muted.center-text', {}, ['Chưa chọn bài nào.']) : null,
    button('Bắt đầu 🔥', () => { close(); startCustomSession(); }, {
      variant: 'primary', large: true, full: true, disabled: cart.length === 0,
    }),
  ]));
  document.body.appendChild(sheet);
}

function cartItemRow(id, idx) {
  const ex = EXERCISES[id];
  return el('li.cart-row', {}, [
    el('div.cart-row-num', {}, [String(idx + 1)]),
    el('div.cart-row-name', {}, [ex.name]),
    el('button.icon-btn.cart-remove', {
      type: 'button',
      onClick: (e) => {
        e.stopPropagation();
        cart = cart.filter((x) => x !== id);
        const sheet = e.target.closest('.sheet-backdrop');
        if (sheet) sheet.remove();
        openCartSheet();
        redraw();
      },
    }, [icon('x', 18)]),
  ]);
}

function startCustomSession() {
  if (cart.length === 0) return;
  const day = buildCustomDay({
    items: cart.map((id) => ({ exerciseId: id })),
    profile: state.profile,
  });
  setAdHocDay(day);
  cart = [];
  navigate(ROUTES.SESSION);
}

// ---------- filtering helpers ----------

function visibleByType(type) {
  return Object.values(EXERCISES)
    .filter((ex) => ex.type === type)
    .filter((ex) => showAll || (!isUnsafeForUser(ex) && hasEquipment(ex)));
}

function countShown() {
  return TYPE_GROUPS.reduce((s, g) => s + visibleByType(g.type).length, 0);
}

function isUnsafeForUser(ex) {
  return (ex.unsafeFor ?? []).some((c) => state.profile.conditions.includes(c));
}

function hasEquipment(ex) {
  if (!ex.equipment?.length) return true;
  return ex.equipment.some((e) => state.profile.equipment.includes(e));
}

function redraw() {
  const root = document.getElementById('app');
  if (root) render(root);
}
