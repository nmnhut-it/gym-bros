/**
 * Onboarding wizard. Collects profile in 7 steps, then generates the first plan.
 */

import {
  CONDITION, DEFAULT_PLAN_OPTIONS, EQUIPMENT, GENDER, GOAL, LEVEL, ROUTES,
} from '../constants.js';
import { setProfile } from '../state.js';
import { navigate } from '../router.js';
import { button, el, mount } from '../ui/dom.js';

const STEPS = [
  'welcome', 'body', 'goals', 'conditions', 'equipment', 'schedule', 'review',
];

/** Wizard state lives only while onboarding is active. */
const draft = {
  name: '',
  gender: GENDER.MALE,
  age: 30,
  heightCm: 168,
  weightKg: 70,
  goals: [GOAL.FAT_LOSS],
  conditions: [],
  equipment: [EQUIPMENT.TREADMILL, EQUIPMENT.YOGA_MAT],
  level: LEVEL.BEGINNER,
  daysPerWeek: DEFAULT_PLAN_OPTIONS.daysPerWeek,
  sessionMinutes: DEFAULT_PLAN_OPTIONS.sessionMinutes,
};

let stepIdx = 0;

export function render(root) {
  stepIdx = 0;
  draw(root);
}

function draw(root) {
  const step = STEPS[stepIdx];
  mount(root,
    el('div.wizard', {}, [
      progressBar(),
      el('div.wizard-body', {}, [renderStep(step)]),
      navRow(),
    ]),
  );
}

function progressBar() {
  const pct = Math.round(((stepIdx + 1) / STEPS.length) * 100);
  return el('div.progress', {}, [
    el('div.progress-fill', { style: { width: `${pct}%` } }),
    el('div.progress-label', {}, [`Bước ${stepIdx + 1}/${STEPS.length}`]),
  ]);
}

function navRow() {
  const isLast = stepIdx === STEPS.length - 1;
  const isFirst = stepIdx === 0;
  return el('div.wizard-nav', {}, [
    isFirst ? null : button('Quay lại', back, { variant: 'ghost' }),
    button(isLast ? 'Bắt đầu tập 💪' : 'Tiếp tục', next, { variant: 'primary', large: true }),
  ]);
}

function next() {
  if (stepIdx === STEPS.length - 1) finish();
  else { stepIdx++; redraw(); }
}
function back() { stepIdx = Math.max(0, stepIdx - 1); redraw(); }
function redraw() { draw(document.getElementById('app')); }

function finish() {
  setProfile({ ...draft });
  navigate(ROUTES.DASHBOARD);
}

function renderStep(name) {
  switch (name) {
    case 'welcome':    return stepWelcome();
    case 'body':       return stepBody();
    case 'goals':      return stepGoals();
    case 'conditions': return stepConditions();
    case 'equipment':  return stepEquipment();
    case 'schedule':   return stepSchedule();
    case 'review':     return stepReview();
    default:           return el('div', {}, ['?']);
  }
}

function stepWelcome() {
  return el('div', {}, [
    el('h1.h-hero', {}, ['Chào mừng đến GymBros 🔥']),
    el('p.muted', {}, ['T sẽ thiết kế bài tập riêng cho m, đếm rep + tính giờ nghỉ. Bắt đầu bằng việc cho t biết tên m gọi là gì.']),
    fieldText('Tên của m', 'name', 'VD: Nhứt'),
  ]);
}

function stepBody() {
  return el('div', {}, [
    el('h1.h-hero', {}, ['Chỉ số cơ thể']),
    el('p.muted', {}, ['Để t tính cường độ + calo cho đúng.']),
    fieldRadio('Giới tính', 'gender', [
      { value: GENDER.MALE,   label: 'Nam' },
      { value: GENDER.FEMALE, label: 'Nữ' },
      { value: GENDER.OTHER,  label: 'Khác' },
    ]),
    fieldNumber('Tuổi', 'age', 10, 99),
    fieldNumber('Chiều cao (cm)', 'heightCm', 120, 220),
    fieldNumber('Cân nặng (kg)', 'weightKg', 30, 200, 0.1),
  ]);
}

function stepGoals() {
  return el('div', {}, [
    el('h1.h-hero', {}, ['Mục tiêu của m']),
    el('p.muted', {}, ['Chọn 1 hoặc nhiều — t sẽ ưu tiên bài phù hợp.']),
    fieldMulti('goals', [
      { value: GOAL.FAT_LOSS,         label: 'Giảm mỡ',          desc: 'Đốt mỡ, giảm cân' },
      { value: GOAL.GENERAL_FITNESS,  label: 'Khoẻ chung',        desc: 'Người dẻo, đỡ mệt' },
      { value: GOAL.MUSCLE_GAIN,      label: 'Tăng cơ',           desc: 'Đẹp dáng, săn chắc' },
      { value: GOAL.ENDURANCE,        label: 'Sức bền',           desc: 'Tim mạch, chạy bộ' },
    ]),
  ]);
}

function stepConditions() {
  const lowImpactCore = draft.conditions.some((c) => c === CONDITION.CORE_EASY || c === CONDITION.CORE_MIN);
  return el('div', {}, [
    el('h1.h-hero', {}, ['Lưu ý khi tập']),
    el('p.muted', {}, ['Chọn nếu có — t sẽ tránh các bài không phù hợp. Không có gì cứ bỏ trống.']),
    fieldMulti('conditions', [
      { value: CONDITION.CORE_EASY, label: 'Tập nhẹ vùng bụng',     desc: 'Tránh sit-up, V-up, plank lâu, deadlift, nín thở rặn' },
      { value: CONDITION.CORE_MIN,  label: 'Tập rất nhẹ vùng bụng', desc: 'Chỉ thở + đi bộ + bài cơ rất nhẹ' },
      { value: CONDITION.BACK_EASY, label: 'Lưng nhạy cảm',          desc: 'Tránh tải nặng vào lưng dưới' },
      { value: CONDITION.KNEE_EASY, label: 'Gối nhạy cảm',           desc: 'Tránh squat sâu, lunge tới' },
    ]),
    lowImpactCore ? el('div.alert.alert-warning', {}, [
      el('strong', {}, ['⚠️ Lưu ý:']),
      el('p', {}, ['App sẽ thay sit-up đầy đủ bằng dead bug, bird dog, plank gối — vẫn làm chắc bụng mà không tăng áp lực ổ bụng. Mọi bài đều nhắc thở đều, không nín thở rặn.']),
    ]) : null,
  ]);
}

function stepEquipment() {
  return el('div', {}, [
    el('h1.h-hero', {}, ['Thiết bị có sẵn']),
    el('p.muted', {}, ['Tick những thứ m có ở nhà.']),
    fieldMulti('equipment', [
      { value: EQUIPMENT.TREADMILL,         label: 'Máy chạy bộ',         desc: 'Cho cardio đi bộ' },
      { value: EQUIPMENT.TREADMILL_INCLINE, label: '...có chỉnh độ dốc',  desc: 'Quan trọng để đốt mỡ' },
      { value: EQUIPMENT.SIT_UP_BENCH,      label: 'Thanh kẹp chân',       desc: 'Để gập bụng (sẽ dùng hạn chế)' },
      { value: EQUIPMENT.AB_WHEEL,          label: 'Ab wheel',             desc: 'Bánh xe lăn tay' },
      { value: EQUIPMENT.DUMBBELLS,         label: 'Tạ tay',               desc: 'Bộ tạ rời' },
      { value: EQUIPMENT.RESISTANCE_BAND,   label: 'Dây kháng lực',        desc: 'Dây thun tập' },
      { value: EQUIPMENT.PULL_UP_BAR,       label: 'Xà đơn',               desc: 'Treo cửa hoặc cố định' },
      { value: EQUIPMENT.YOGA_MAT,          label: 'Thảm yoga',            desc: 'Tập sàn cho êm' },
    ]),
  ]);
}

function stepSchedule() {
  return el('div', {}, [
    el('h1.h-hero', {}, ['Lịch tập']),
    el('p.muted', {}, ['Bao lâu m muốn tập 1 tuần? T sẽ chia ngày tập + ngày nghỉ hợp lý.']),
    fieldRadio('Trình độ', 'level', [
      { value: LEVEL.BEGINNER,      label: 'Mới bắt đầu',     desc: 'Lâu rồi không tập' },
      { value: LEVEL.INTERMEDIATE,  label: 'Trung bình',      desc: 'Tập đều 6+ tháng' },
      { value: LEVEL.ADVANCED,      label: 'Khá',             desc: 'Tập lâu, cường độ cao' },
    ]),
    fieldRadio('Số buổi/tuần', 'daysPerWeek', [
      { value: 3, label: '3 buổi', desc: 'Cách ngày, đủ cho người mới' },
      { value: 4, label: '4 buổi', desc: 'Phổ biến nhất' },
      { value: 5, label: '5 buổi', desc: 'Nghiêm túc' },
      { value: 6, label: '6 buổi', desc: 'Tập như nghề' },
    ]),
    fieldRadio('Thời lượng/buổi', 'sessionMinutes', [
      { value: 30, label: '30 phút' },
      { value: 45, label: '45 phút' },
      { value: 60, label: '60 phút' },
    ]),
  ]);
}

function stepReview() {
  return el('div', {}, [
    el('h1.h-hero', {}, [`Sẵn sàng chưa, ${draft.name || 'bạn'}?`]),
    el('p.muted', {}, ['T sẽ tạo lịch tuần dựa trên thông tin này. M có thể sửa bất cứ lúc nào trong Settings.']),
    el('div.review-grid', {}, [
      reviewRow('👤', 'Profile', `${draft.gender === 'male' ? 'Nam' : draft.gender === 'female' ? 'Nữ' : 'Khác'}, ${draft.age} tuổi, ${draft.heightCm}cm, ${draft.weightKg}kg`),
      reviewRow('🎯', 'Mục tiêu', draft.goals.map(goalLabel).join(', ') || '—'),
      reviewRow('🩺', 'Lưu ý', draft.conditions.length ? draft.conditions.map(condLabel).join(', ') : 'Không có'),
      reviewRow('🏋️', 'Thiết bị', draft.equipment.map(equipLabel).join(', ') || 'Không'),
      reviewRow('📅', 'Lịch', `${draft.daysPerWeek} buổi/tuần, ${draft.sessionMinutes} phút/buổi, ${levelLabel(draft.level)}`),
    ]),
  ]);
}

// ---------- field helpers ----------

function fieldText(label, key, placeholder) {
  return el('label.field', {}, [
    el('span.field-label', {}, [label]),
    el('input.input', {
      type: 'text', value: draft[key], placeholder,
      oninput: (e) => { draft[key] = e.target.value; },
    }),
  ]);
}

function fieldNumber(label, key, min, max, step = 1) {
  return el('label.field', {}, [
    el('span.field-label', {}, [label]),
    el('input.input', {
      type: 'number', value: draft[key], min, max, step, inputmode: 'decimal',
      oninput: (e) => { draft[key] = Number(e.target.value); },
    }),
  ]);
}

function fieldRadio(label, key, options) {
  return el('div.field', {}, [
    el('span.field-label', {}, [label]),
    el('div.option-grid', {},
      options.map((opt) => optionCard(opt, draft[key] === opt.value, () => { draft[key] = opt.value; redraw(); })),
    ),
  ]);
}

function fieldMulti(key, options) {
  return el('div.field', {}, [
    el('div.option-grid', {},
      options.map((opt) => {
        const selected = draft[key].includes(opt.value);
        return optionCard(opt, selected, () => {
          if (selected) draft[key] = draft[key].filter((v) => v !== opt.value);
          else draft[key] = [...draft[key], opt.value];
          redraw();
        });
      }),
    ),
  ]);
}

function optionCard(opt, selected, onClick) {
  return el(`button.option${selected ? '.selected' : ''}`, { type: 'button', onClick }, [
    el('div.option-label', {}, [opt.label]),
    opt.desc ? el('div.option-desc', {}, [opt.desc]) : null,
  ]);
}

function reviewRow(emoji, label, value) {
  return el('div.review-row', {}, [
    el('div.review-icon', {}, [emoji]),
    el('div.review-content', {}, [
      el('div.review-label', {}, [label]),
      el('div.review-value', {}, [value]),
    ]),
  ]);
}

// ---------- label maps ----------

function goalLabel(g) {
  return ({ [GOAL.FAT_LOSS]: 'Giảm mỡ', [GOAL.GENERAL_FITNESS]: 'Khoẻ chung',
    [GOAL.MUSCLE_GAIN]: 'Tăng cơ', [GOAL.ENDURANCE]: 'Sức bền' })[g] ?? g;
}
function condLabel(c) {
  return ({ [CONDITION.CORE_EASY]: 'Tập nhẹ vùng bụng', [CONDITION.CORE_MIN]: 'Tập rất nhẹ vùng bụng',
    [CONDITION.BACK_EASY]: 'Lưng nhạy cảm', [CONDITION.KNEE_EASY]: 'Gối nhạy cảm' })[c] ?? c;
}
function equipLabel(e) {
  return ({ [EQUIPMENT.TREADMILL]: 'Máy chạy bộ', [EQUIPMENT.TREADMILL_INCLINE]: 'Máy có dốc',
    [EQUIPMENT.SIT_UP_BENCH]: 'Thanh kẹp chân', [EQUIPMENT.AB_WHEEL]: 'Ab wheel',
    [EQUIPMENT.DUMBBELLS]: 'Tạ tay', [EQUIPMENT.RESISTANCE_BAND]: 'Dây kháng lực',
    [EQUIPMENT.PULL_UP_BAR]: 'Xà đơn', [EQUIPMENT.YOGA_MAT]: 'Thảm yoga' })[e] ?? e;
}
function levelLabel(l) {
  return ({ [LEVEL.BEGINNER]: 'Mới bắt đầu', [LEVEL.INTERMEDIATE]: 'Trung bình', [LEVEL.ADVANCED]: 'Khá' })[l] ?? l;
}
