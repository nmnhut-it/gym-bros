/**
 * Dashboard — main landing screen. Shows today's workout, quick stats, weight log.
 */

import { ROUTES, WEEKDAY_LABEL_VI_LONG } from '../constants.js';
import { state, recordWeight, setAdHocDay } from '../state.js';
import { getTodayDay, isRestDay } from '../plan/generator.js';
import { generateQuickSession, FOCUS, focusLabel } from '../plan/quick.js';
import { navigate } from '../router.js';
import { fmtDuration, todayISO } from '../ui/format.js';
import { button, card, el, mount } from '../ui/dom.js';
import { navBar } from './_nav.js';

export function render(root) {
  const profile = state.profile;
  const day = getTodayDay(state.plan);
  mount(root,
    el('main.screen', {}, [
      header(profile.name),
      todayCard(day),
      quickActions(),
      quickStats(),
      weightWidget(),
    ]),
    navBar(ROUTES.DASHBOARD),
  );
}

function quickActions() {
  return el('div.quick-actions', {}, [
    el('button.quick-action', { onClick: openQuickSheet, type: 'button' }, [
      el('span.qa-icon', {}, ['⚡']),
      el('span.qa-label', {}, ['Tập nhanh']),
      el('span.qa-desc', {}, ['Chọn nhóm cơ + thời lượng']),
    ]),
    el('button.quick-action', { onClick: () => navigate(ROUTES.BROWSE), type: 'button' }, [
      el('span.qa-icon', {}, ['📋']),
      el('span.qa-label', {}, ['Tự chọn bài']),
      el('span.qa-desc', {}, ['Browse + tick từ thư viện']),
    ]),
  ]);
}

/** Module-scoped so re-renders preserve user choices. */
const quickDraft = { focus: FOCUS.ALL, durationMin: 30 };
let quickSheetEl = null;

function openQuickSheet() {
  if (quickSheetEl) quickSheetEl.remove();
  quickSheetEl = buildQuickSheet();
  document.body.appendChild(quickSheetEl);
}

function closeQuickSheet() {
  if (quickSheetEl) { quickSheetEl.remove(); quickSheetEl = null; }
}

function buildQuickSheet() {
  const root = el('div.sheet-backdrop', {});
  root.addEventListener('click', (e) => { if (e.target === root) closeQuickSheet(); });
  root.appendChild(el('div.sheet', {}, [
    el('div.sheet-header', {}, [
      el('h2', {}, ['Tập nhanh']),
      el('button.icon-btn', { type: 'button', onClick: closeQuickSheet }, ['✕']),
    ]),
    el('p.muted', {}, ['App sẽ tự lên 1 buổi vừa với thời gian m có.']),
    focusField(),
    durationField(),
    button('Bắt đầu 🔥', startQuickSession, { variant: 'primary', large: true, full: true }),
  ]));
  return root;
}

function focusField() {
  const opts = [FOCUS.ALL, FOCUS.CARDIO, FOCUS.CORE, FOCUS.LOWER, FOCUS.UPPER, FOCUS.FLEXIBILITY];
  return el('div.field', {}, [
    el('span.field-label', {}, ['Tập trung vào']),
    el('div.option-grid', {}, opts.map((f) =>
      el(`button.option${quickDraft.focus === f ? '.selected' : ''}`,
        { type: 'button', onClick: () => { quickDraft.focus = f; openQuickSheet(); } },
        [el('div.option-label', {}, [focusLabel(f)])],
      ),
    )),
  ]);
}

function durationField() {
  const opts = [15, 20, 30, 45, 60];
  return el('div.field', {}, [
    el('span.field-label', {}, ['Thời lượng']),
    el('div.option-grid', {}, opts.map((m) =>
      el(`button.option${quickDraft.durationMin === m ? '.selected' : ''}`,
        { type: 'button', onClick: () => { quickDraft.durationMin = m; openQuickSheet(); } },
        [el('div.option-label', {}, [`${m} phút`])],
      ),
    )),
  ]);
}

function startQuickSession() {
  const day = generateQuickSession({
    focus: quickDraft.focus,
    durationMin: quickDraft.durationMin,
    profile: state.profile,
  });
  setAdHocDay(day);
  closeQuickSheet();
  navigate(ROUTES.SESSION);
}

function header(name) {
  const hour = new Date().getHours();
  const greet = hour < 11 ? 'Chào buổi sáng' : hour < 18 ? 'Chiều rồi' : 'Tối rồi';
  return el('header.app-header', {}, [
    el('div.greeting', {}, [`${greet},`]),
    el('div.greeting-name', {}, [name || 'bro']),
    el('div.date-label', {}, [WEEKDAY_LABEL_VI_LONG[new Date().getDay()] + ' · ' + new Date().toLocaleDateString('vi-VN')]),
  ]);
}

function todayCard(day) {
  if (isRestDay(day)) {
    return card(null,
      el('div.today-card.rest', {}, [
        el('div.today-icon', {}, ['😴']),
        el('h2', {}, ['Hôm nay nghỉ']),
        el('p.muted', {}, ['Cơ thể cần nghỉ để hồi phục. Ngủ sớm + uống đủ nước.']),
        button('Vẫn muốn tập nhẹ?', () => navigate(ROUTES.PLAN), { variant: 'ghost' }),
      ]),
    );
  }
  return card(null,
    el('div.today-card', {}, [
      el('div.today-icon', {}, [day.icon]),
      el('div.today-meta', {}, [
        el('div.eyebrow', {}, ['Hôm nay']),
        el('h2', {}, [day.name]),
        el('p.muted', {}, [day.summary]),
        el('div.today-stats', {}, [
          stat(`${day.blocks.length}`, 'bài'),
          stat(`~${day.estimatedMinutes}`, 'phút'),
        ]),
      ]),
      button('Bắt đầu tập 🔥', () => navigate(ROUTES.SESSION), { variant: 'primary', large: true, full: true }),
    ]),
  );
}

function quickStats() {
  const weekSessions = sessionsThisWeek();
  const streak = computeStreak();
  return el('div.stat-grid', {}, [
    statCard(`${streak}`, 'ngày streak 🔥'),
    statCard(`${weekSessions}`, 'buổi tuần này'),
    statCard(fmtDuration(totalMinThisWeek() * 60), 'tổng tuần'),
  ]);
}

function statCard(num, label) {
  return el('div.stat-card', {}, [el('div.stat-num', {}, [num]), el('div.stat-label', {}, [label])]);
}
function stat(num, label) {
  return el('div.stat', {}, [el('span.stat-num-inline', {}, [num]), el('span.stat-label-inline', {}, [label])]);
}

function weightWidget() {
  const latest = state.weights[0];
  const today = todayISO();
  const isToday = latest?.date === today;
  let val = latest?.kg ?? state.profile.weightKg;
  return card('Cân nặng',
    el('div.weight-widget', {}, [
      el('div.weight-row', {}, [
        el('input.input.weight-input', {
          type: 'number', step: '0.1', min: '30', max: '200', value: val,
          inputmode: 'decimal',
          oninput: (e) => { val = Number(e.target.value); },
        }),
        el('span.weight-unit', {}, ['kg']),
        button(isToday ? 'Cập nhật' : 'Lưu', () => { recordWeight(val); render(document.getElementById('app')); }, { variant: 'secondary' }),
      ]),
      latest ? el('div.muted', {}, [`Lần cuối: ${latest.date} — ${latest.kg}kg`]) : el('div.muted', {}, ['Chưa có dữ liệu']),
    ]),
  );
}

// ---------- stats helpers ----------

function sessionsThisWeek() {
  const start = startOfWeek();
  return state.sessions.filter((s) => s.date >= start).length;
}

function totalMinThisWeek() {
  const start = startOfWeek();
  return state.sessions
    .filter((s) => s.date >= start)
    .reduce((sum, s) => sum + Math.round(s.durationSec / 60), 0);
}

function startOfWeek() {
  const d = new Date();
  const dow = d.getDay();
  const offset = (dow + 6) % 7;  // Monday = 0
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}

function computeStreak() {
  if (state.sessions.length === 0) return 0;
  const dates = new Set(state.sessions.map((s) => s.date));
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (dates.has(iso)) { streak++; cursor.setDate(cursor.getDate() - 1); continue; }
    // allow skipping today if not yet trained
    if (streak === 0 && iso === todayISO()) { cursor.setDate(cursor.getDate() - 1); continue; }
    break;
  }
  return streak;
}
