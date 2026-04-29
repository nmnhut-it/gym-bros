/**
 * Settings — edit profile, app preferences, reset.
 */

import { ROUTES } from '../constants.js';
import { state, setProfile, setSettings, resetAll } from '../state.js';
import { navigate } from '../router.js';
import { button, card, el, mount } from '../ui/dom.js';
import { navBar } from './_nav.js';

export function render(root) {
  mount(root,
    el('main.screen', {}, [
      el('header.app-header', {}, [el('h1', {}, ['Cài đặt'])]),
      profileCard(),
      planCard(),
      audioCard(),
      displayCard(),
      dangerCard(),
    ]),
    navBar(ROUTES.SETTINGS),
  );
}

function profileCard() {
  const p = state.profile;
  let draft = { ...p };
  const save = () => { setProfile(draft); render(document.getElementById('app')); };
  return card('Hồ sơ',
    fieldRow('Tên', el('input.input', {
      type: 'text', value: draft.name,
      oninput: (e) => { draft.name = e.target.value; },
    })),
    fieldRow('Tuổi', numberInput(draft, 'age', 10, 99)),
    fieldRow('Cao (cm)', numberInput(draft, 'heightCm', 120, 220)),
    fieldRow('Nặng (kg)', numberInput(draft, 'weightKg', 30, 200, 0.1)),
    button('Lưu hồ sơ', save, { variant: 'primary', full: true }),
  );
}

function planCard() {
  const p = state.profile;
  let draft = { daysPerWeek: p.daysPerWeek, sessionMinutes: p.sessionMinutes, level: p.level };
  const save = () => {
    setProfile({ ...p, ...draft });   // setProfile auto-regenerates plan
    render(document.getElementById('app'));
  };
  return card('Kế hoạch tập',
    fieldRow('Số buổi/tuần', selectInput(draft, 'daysPerWeek', [
      { v: 3, l: '3 buổi' }, { v: 4, l: '4 buổi' }, { v: 5, l: '5 buổi' }, { v: 6, l: '6 buổi' },
    ])),
    fieldRow('Phút/buổi', selectInput(draft, 'sessionMinutes', [
      { v: 30, l: '30 phút' }, { v: 45, l: '45 phút' }, { v: 60, l: '60 phút' },
    ])),
    fieldRow('Trình độ', selectInput(draft, 'level', [
      { v: 'beginner', l: 'Mới bắt đầu' }, { v: 'intermediate', l: 'Trung bình' }, { v: 'advanced', l: 'Khá' },
    ])),
    button('Lưu + tạo lại plan', save, { variant: 'primary', full: true }),
  );
}

function audioCard() {
  const s = state.settings;
  return card('Âm thanh + giọng nói',
    toggleRow('Giọng đọc tiếng Việt', s.voiceEnabled, (v) => setSettings({ voiceEnabled: v })),
    toggleRow('Chuông + tiếng beep', s.soundEnabled, (v) => setSettings({ soundEnabled: v })),
    toggleRow('Đếm ngược 3-2-1 cuối set', s.countdownBeep, (v) => setSettings({ countdownBeep: v })),
    fieldRow('Tốc độ giọng đọc', el('input', {
      type: 'range', min: 0.6, max: 1.6, step: 0.1, value: s.voiceRate,
      oninput: (e) => setSettings({ voiceRate: Number(e.target.value) }),
    })),
  );
}

function displayCard() {
  const s = state.settings;
  return card('Hiển thị',
    toggleRow('Chế độ TV (chữ to)', s.tvMode, (v) => {
      setSettings({ tvMode: v });
      document.body.classList.toggle('tv-mode', v);
    }),
  );
}

function dangerCard() {
  return card('Vùng nguy hiểm',
    el('p.muted', {}, ['Xoá hết dữ liệu sẽ làm mất profile, lịch sử, cân nặng. Không khôi phục được.']),
    button('Xoá hết dữ liệu', () => {
      if (!confirm('Chắc chắn xoá tất cả?')) return;
      resetAll();
      navigate(ROUTES.ONBOARDING);
    }, { variant: 'danger', full: true }),
  );
}

// ---------- helpers ----------

function fieldRow(label, control) {
  return el('label.field-row', {}, [el('span.field-row-label', {}, [label]), control]);
}

function numberInput(obj, key, min, max, step = 1) {
  return el('input.input', {
    type: 'number', value: obj[key], min, max, step, inputmode: 'decimal',
    oninput: (e) => { obj[key] = Number(e.target.value); },
  });
}

function selectInput(obj, key, options) {
  const sel = el('select.input', {
    onchange: (e) => { obj[key] = isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value); },
  });
  options.forEach((o) => {
    const opt = document.createElement('option');
    opt.value = String(o.v);
    opt.textContent = o.l;
    if (obj[key] === o.v) opt.selected = true;
    sel.appendChild(opt);
  });
  return sel;
}

function toggleRow(label, value, onChange) {
  const id = `t-${label.replace(/\W/g, '')}`;
  return el('label.toggle-row', { for: id }, [
    el('span', {}, [label]),
    el('input.toggle', {
      id, type: 'checkbox', checked: value,
      onchange: (e) => onChange(e.target.checked),
    }),
  ]);
}
