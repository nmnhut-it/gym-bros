/**
 * Weekly plan view — preview all 7 days, see exercise breakdown per day.
 */

import { ROUTES, WEEKDAY_LABEL_VI_LONG } from '../constants.js';
import { state, regeneratePlan } from '../state.js';
import { isRestDay } from '../plan/generator.js';
import { getExercise } from '../data/exercises.js';
import { fmtDuration } from '../ui/format.js';
import { button, card, el, mount } from '../ui/dom.js';
import { navBar } from './_nav.js';

export function render(root) {
  const today = new Date().getDay();
  mount(root,
    el('main.screen', {}, [
      el('header.app-header', {}, [
        el('h1', {}, ['Lịch tuần']),
        el('p.muted', {}, [`${state.profile.daysPerWeek} buổi/tuần · ~${state.profile.sessionMinutes} phút/buổi`]),
      ]),
      el('div.plan-list', {},
        state.plan.days.map((d) => dayCard(d, d.weekday === today)),
      ),
      card(null,
        el('div.regen-block', {}, [
          el('p.muted', {}, ['Muốn đổi cấu trúc lịch? Vào Cài đặt → chỉnh số buổi/tuần. Hoặc tạo lại plan với data hiện tại:']),
          button('Tạo lại plan', () => { regeneratePlan(); render(document.getElementById('app')); }, { variant: 'secondary' }),
        ]),
      ),
    ]),
    navBar(ROUTES.PLAN),
  );
}

function dayCard(day, isToday) {
  return el(`div.plan-day${isToday ? '.is-today' : ''}${isRestDay(day) ? '.is-rest' : ''}`, {}, [
    el('div.plan-day-head', {}, [
      el('div.plan-day-name', {}, [
        el('span.plan-day-icon', {}, [day.icon]),
        el('span', {}, [WEEKDAY_LABEL_VI_LONG[day.weekday]]),
        isToday ? el('span.badge', {}, ['Hôm nay']) : null,
      ]),
      el('div.plan-day-meta', {}, [
        isRestDay(day) ? null : el('span.muted', {}, [`${day.blocks.length} bài · ~${day.estimatedMinutes}p`]),
      ]),
    ]),
    el('div.plan-day-summary', {}, [day.summary]),
    isRestDay(day) ? null : el('ul.exercise-list', {},
      day.blocks.map((b) => exerciseLine(b)),
    ),
  ]);
}

function exerciseLine(block) {
  const ex = getExercise(block.exerciseId);
  return el('li.exercise-line', {}, [
    el('span.ex-name', {}, [ex.name]),
    el('span.ex-meta', {}, [blockMeta(block, ex)]),
  ]);
}

function blockMeta(block, ex) {
  if (ex.mode === 'time') return `${block.sets}× ${fmtDuration(block.duration)}`;
  const repWord = ex.mode === 'reps-per-side' ? 'rep/bên' : 'rep';
  return `${block.sets}× ${block.reps} ${repWord}`;
}
