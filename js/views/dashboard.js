/**
 * Dashboard — main landing screen. Shows today's workout, quick stats, weight log.
 */

import { ROUTES, WEEKDAY_LABEL_VI_LONG } from '../constants.js';
import { state, recordWeight } from '../state.js';
import { getTodayDay, isRestDay } from '../plan/generator.js';
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
      quickStats(),
      weightWidget(),
    ]),
    navBar(ROUTES.DASHBOARD),
  );
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
