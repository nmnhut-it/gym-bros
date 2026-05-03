/**
 * Dashboard — landing screen optimised around how the user actually trains:
 * pick 1-2 favorite exercises ad-hoc rather than follow the weekly plan.
 *
 * Layout, mobile-first thumb zone:
 *   1. compact header (name + streak chip)
 *   2. "Tập tiếp" hero — last-run exercises, big start button (or empty hint)
 *   3. "Yêu thích" — pinned exercise tiles, tap = launch session of that one bài
 *   4. "Mix nhanh" — 30-min auto session + browse library
 *   5. Plan hôm nay — 1-line collapsed row → tap opens full plan view
 *   6. Cân nặng widget
 */

import { EXERCISE_TYPE, ROUTES } from '../constants.js';
import {
  getRecentExerciseIds, recordWeight, setAdHocDay,
  startAdHocFromExerciseIds, state,
} from '../state.js';
import { findExercise } from '../data/exercises.js';
import { getTodayDay, isRestDay } from '../plan/generator.js';
import { generateQuickSession, FOCUS } from '../plan/quick.js';
import { navigate } from '../router.js';
import { todayISO } from '../ui/format.js';
import { button, card, el, mount } from '../ui/dom.js';
import { navBar } from './_nav.js';

const QUICK_DEFAULT_MINUTES = 30;
const FAVORITE_TILES_LIMIT = 6;

/** Emoji per exercise type — used on favorite/recent tiles. */
const TYPE_EMOJI = Object.freeze({
  [EXERCISE_TYPE.CARDIO]:      '🏃',
  [EXERCISE_TYPE.CORE]:        '🔥',
  [EXERCISE_TYPE.LOWER]:       '🦵',
  [EXERCISE_TYPE.UPPER]:       '💪',
  [EXERCISE_TYPE.FULL_BODY]:   '⚡',
  [EXERCISE_TYPE.FLEXIBILITY]: '🧘',
  [EXERCISE_TYPE.WARMUP]:      '🔥',
  [EXERCISE_TYPE.COOLDOWN]:    '🌿',
});

export function render(root) {
  const profile = state.profile;
  const today = getTodayDay(state.plan);
  const recentIds = getRecentExerciseIds();
  mount(root,
    el('main.screen', {}, [
      header(profile.name),
      continueCard(recentIds),
      favoritesSection(state.favorites),
      mixSection(),
      todayPlanRow(today),
      weightWidget(),
    ]),
    navBar(ROUTES.DASHBOARD),
  );
}

// ---------- header ----------

function header(name) {
  const streak = computeStreak();
  return el('header.app-header.dash-header', {}, [
    el('div.dash-name', {}, [name || 'bro']),
    streak > 0
      ? el('div.streak-chip', {}, [el('span', {}, ['🔥']), el('span', {}, [`${streak} ngày`])])
      : null,
  ]);
}

// ---------- continue (recent) hero ----------

function continueCard(recentIds) {
  if (recentIds.length === 0) return emptyContinueCard();
  const first = findExercise(recentIds[0]);
  if (!first) return emptyContinueCard();
  const primaryIds = recentIds.slice(0, 2).filter((id) => findExercise(id));
  return card(null,
    el('div.continue-card', {}, [
      el('div.eyebrow', {}, ['Tập tiếp']),
      el('h2.continue-title', {}, [first.name]),
      primaryIds.length > 1
        ? el('p.muted', {}, [`+ ${findExercise(primaryIds[1]).name}`])
        : el('p.muted', {}, ['Chạy lại bài bạn vừa tập.']),
      button('Bắt đầu 🔥', () => launchAdHoc(primaryIds), {
        variant: 'primary', large: true, full: true,
      }),
    ]),
  );
}

function emptyContinueCard() {
  return card(null,
    el('div.continue-card.empty', {}, [
      el('div.continue-emoji', {}, ['💪']),
      el('h2', {}, ['Sẵn sàng tập?']),
      el('p.muted', {}, ['Chọn 1 bài từ thư viện để khởi đầu.']),
      button('Mở thư viện 📋', () => navigate(ROUTES.BROWSE), {
        variant: 'primary', large: true, full: true,
      }),
    ]),
  );
}

// ---------- favorites ----------

function favoritesSection(favorites) {
  const valid = favorites.map(findExercise).filter(Boolean).slice(0, FAVORITE_TILES_LIMIT);
  if (valid.length === 0) return favoritesEmpty();
  return el('section.fav-section', {}, [
    el('div.fav-head', {}, [
      el('h2.card-title', {}, ['Yêu thích ⭐']),
      el('button.fav-edit', {
        type: 'button', onClick: () => navigate(ROUTES.BROWSE),
      }, ['+ thêm']),
    ]),
    el('div.fav-grid', {}, valid.map(favoriteTile)),
  ]);
}

function favoritesEmpty() {
  return el('section.fav-section.empty', {}, [
    el('h2.card-title', {}, ['Yêu thích ⭐']),
    el('p.muted', {}, ['Vào thư viện rồi pin bài bạn hay tập — để bấm 1 phát là chạy luôn.']),
  ]);
}

function favoriteTile(ex) {
  return el('button.fav-tile', {
    type: 'button',
    onClick: () => launchAdHoc([ex.id]),
  }, [
    el('span.fav-emoji', {}, [TYPE_EMOJI[ex.type] ?? '⚡']),
    el('span.fav-name', {}, [ex.name]),
  ]);
}

// ---------- mix nhanh ----------

function mixSection() {
  return el('div.mix-row', {}, [
    el('button.mix-tile', { type: 'button', onClick: launchQuickAuto }, [
      el('span.mix-emoji', {}, ['⚡']),
      el('span.mix-label', {}, [`Tập ${QUICK_DEFAULT_MINUTES} phút`]),
      el('span.mix-desc', {}, ['Auto pick toàn thân']),
    ]),
    el('button.mix-tile', { type: 'button', onClick: () => navigate(ROUTES.BROWSE) }, [
      el('span.mix-emoji', {}, ['📋']),
      el('span.mix-label', {}, ['Chọn bài']),
      el('span.mix-desc', {}, ['Browse thư viện']),
    ]),
  ]);
}

function launchQuickAuto() {
  const day = generateQuickSession({
    focus: FOCUS.ALL,
    durationMin: QUICK_DEFAULT_MINUTES,
    profile: state.profile,
  });
  setAdHocDay(day);
  navigate(ROUTES.SESSION);
}

// ---------- plan today (collapsed) ----------

function todayPlanRow(day) {
  if (isRestDay(day)) {
    return el('button.plan-row.rest', { type: 'button', onClick: () => navigate(ROUTES.PLAN) }, [
      el('span.plan-row-icon', {}, ['😴']),
      el('span.plan-row-text', {}, [
        el('span.plan-row-title', {}, ['Hôm nay nghỉ']),
        el('span.plan-row-meta', {}, ['Plan của tuần · xem chi tiết']),
      ]),
      el('span.plan-row-arrow', {}, ['›']),
    ]);
  }
  return el('button.plan-row', { type: 'button', onClick: () => navigate(ROUTES.PLAN) }, [
    el('span.plan-row-icon', {}, [day.icon]),
    el('span.plan-row-text', {}, [
      el('span.plan-row-title', {}, [`Hôm nay: ${day.name}`]),
      el('span.plan-row-meta', {}, [`${day.blocks.length} bài · ~${day.estimatedMinutes} phút`]),
    ]),
    el('span.plan-row-arrow', {}, ['›']),
  ]);
}

// ---------- weight widget ----------

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
        button(isToday ? 'Cập nhật' : 'Lưu',
          () => { recordWeight(val); render(document.getElementById('app')); },
          { variant: 'secondary' }),
      ]),
      latest
        ? el('div.muted', {}, [`Lần cuối: ${latest.date} — ${latest.kg}kg`])
        : el('div.muted', {}, ['Chưa có dữ liệu']),
    ]),
  );
}

// ---------- ad-hoc launch ----------

function launchAdHoc(exerciseIds) {
  const ok = startAdHocFromExerciseIds(exerciseIds);
  if (!ok) {
    // Every ID was filtered out as unsafe for the current profile — fall
    // back to browse so the user can pick something else rather than
    // getting silently stuck.
    navigate(ROUTES.BROWSE);
    return;
  }
  navigate(ROUTES.SESSION);
}

// ---------- streak helper ----------

function computeStreak() {
  if (state.sessions.length === 0) return 0;
  const dates = new Set(state.sessions.map((s) => s.date));
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (dates.has(iso)) { streak++; cursor.setDate(cursor.getDate() - 1); continue; }
    if (streak === 0 && iso === todayISO()) { cursor.setDate(cursor.getDate() - 1); continue; }
    break;
  }
  return streak;
}
