/**
 * Progress view — weight chart + session history.
 */

import { ROUTES } from '../constants.js';
import { state } from '../state.js';
import { fmtDateShort, fmtDateFull, fmtDuration, round } from '../ui/format.js';
import { card, el, mount } from '../ui/dom.js';
import { navBar } from './_nav.js';

export function render(root) {
  mount(root,
    el('main.screen', {}, [
      el('header.app-header', {}, [el('h1', {}, ['Tiến trình'])]),
      weightSection(),
      historySection(),
    ]),
    navBar(ROUTES.PROGRESS),
  );
}

function weightSection() {
  if (state.weights.length === 0) {
    return card('Cân nặng', el('p.muted', {}, ['Ghi cân nặng từ Trang chính để xem biểu đồ.']));
  }
  const sorted = [...state.weights].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const delta = round(last.kg - first.kg, 1);
  const trend = delta < 0 ? `↓ ${Math.abs(delta)}kg` : delta > 0 ? `↑ ${delta}kg` : '→ 0';
  return card('Cân nặng',
    el('div.weight-summary', {}, [
      el('div.weight-current', {}, [el('span.kg', {}, [`${last.kg}`]), el('span.unit', {}, ['kg'])]),
      el('div.weight-trend', { class: delta <= 0 ? 'good' : 'bad' }, [trend, ' từ khi bắt đầu']),
    ]),
    weightChart(sorted),
  );
}

/**
 * Tiny inline canvas line chart. Replaces a chart lib for our offline-first goal.
 * @param {Array<{date:string, kg:number}>} data
 */
function weightChart(data) {
  const canvas = el('canvas.weight-chart', { width: 600, height: 220 });
  // Defer drawing until canvas is in DOM (so getBoundingClientRect works).
  setTimeout(() => drawWeightChart(canvas, data), 0);
  return el('div.chart-wrap', {}, [canvas]);
}

function drawWeightChart(canvas, data) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const w = rect.width, h = rect.height;
  const pad = { l: 32, r: 12, t: 12, b: 24 };
  const min = Math.min(...data.map((d) => d.kg)) - 0.5;
  const max = Math.max(...data.map((d) => d.kg)) + 0.5;
  const x = (i) => pad.l + ((w - pad.l - pad.r) * i) / Math.max(1, data.length - 1);
  const y = (kg) => pad.t + ((h - pad.t - pad.b) * (max - kg)) / (max - min);
  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const yy = pad.t + ((h - pad.t - pad.b) * i) / 4;
    ctx.beginPath(); ctx.moveTo(pad.l, yy); ctx.lineTo(w - pad.r, yy); ctx.stroke();
  }
  // Line
  ctx.strokeStyle = '#fb923c';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  data.forEach((d, i) => { const px = x(i), py = y(d.kg); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
  ctx.stroke();
  // Fill
  ctx.lineTo(x(data.length - 1), h - pad.b);
  ctx.lineTo(x(0), h - pad.b);
  ctx.closePath();
  ctx.fillStyle = 'rgba(251,146,60,0.15)';
  ctx.fill();
  // Dots
  ctx.fillStyle = '#fb923c';
  data.forEach((d, i) => { ctx.beginPath(); ctx.arc(x(i), y(d.kg), 3, 0, Math.PI * 2); ctx.fill(); });
  // Y labels
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '11px system-ui';
  ctx.fillText(`${round(max, 1)}`, 4, pad.t + 4);
  ctx.fillText(`${round(min, 1)}`, 4, h - pad.b - 2);
  // X labels (first + last)
  ctx.fillText(fmtDateShort(data[0].date), pad.l - 8, h - 6);
  ctx.fillText(fmtDateShort(data[data.length - 1].date), w - pad.r - 30, h - 6);
}

function historySection() {
  if (state.sessions.length === 0) {
    return card('Lịch sử buổi tập', el('p.muted', {}, ['Chưa có buổi tập nào. Đi tập đi! 💪']));
  }
  return card('Lịch sử buổi tập',
    el('ul.session-list', {},
      state.sessions.slice(0, 30).map(sessionRow),
    ),
  );
}

function sessionRow(s) {
  const completePct = s.totalBlocks > 0 ? Math.round((s.blocksDone / s.totalBlocks) * 100) : 0;
  return el('li.session-row', {}, [
    el('div.session-row-date', {}, [fmtDateFull(s.date)]),
    el('div.session-row-meta', {}, [
      `${dayTypeLabel(s.dayType)} · ${fmtDuration(s.durationSec)} · ${completePct}%`,
    ]),
  ]);
}

function dayTypeLabel(t) {
  return ({
    'cardio-core': 'Cardio + Core',
    'strength-light': 'Sức mạnh nhẹ',
    'cardio-long': 'Cardio dài',
    'recovery': 'Hồi phục',
  })[t] ?? t;
}
