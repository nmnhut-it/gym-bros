/**
 * Session player — full-screen workout walkthrough.
 *
 * State machine per block:
 *   intro  → user presses Start (or 3-2-1 auto)
 *   active → counting down (time-mode) or counting up (rep-mode)
 *   rest   → rest timer between sets
 *   done   → set complete, advance
 *
 * On last block + last set: finish, persist session record.
 */

import { DEFAULT_REST_SECONDS, ROUTES, TICK_MS } from '../constants.js';
import { state, recordSession } from '../state.js';
import { getTodayDay } from '../plan/generator.js';
import { getExercise } from '../data/exercises.js';
import { navigate } from '../router.js';
import { fmtTime } from '../ui/format.js';
import { button, el, icon, mount } from '../ui/dom.js';
import * as Speech from '../audio/speech.js';
import * as Sound from '../audio/sound.js';

const SECONDS_PER_REP = 3;

const session = {
  day: null,
  blockIdx: 0,
  setIdx: 0,
  /** @type {'intro'|'active'|'rest'|'done'} */
  phase: 'intro',
  remainingMs: 0,
  reps: 0,
  startedAt: 0,
  paused: false,
  blocksCompleted: 0,
};

let tickHandle = null;
let appRoot = null;

export function render(root) {
  appRoot = root;
  if (!session.day) bootSession();
  draw();
}

function bootSession() {
  const day = getTodayDay(state.plan);
  session.day = day;
  session.blockIdx = 0;
  session.setIdx = 0;
  session.phase = 'intro';
  session.remainingMs = 0;
  session.reps = 0;
  session.startedAt = Date.now();
  session.paused = false;
  session.blocksCompleted = 0;
}

function currentBlock() { return session.day.blocks[session.blockIdx]; }
function currentExercise() { return getExercise(currentBlock().exerciseId); }

function draw() {
  if (!appRoot) return;
  const block = currentBlock();
  if (!block) return finish();
  const ex = currentExercise();
  mount(appRoot, el('main.session', {}, [
    sessionHeader(),
    sessionBody(block, ex),
    sessionControls(),
  ]));
}

function sessionHeader() {
  const total = session.day.blocks.length;
  const idx = session.blockIdx + 1;
  const pct = (session.blockIdx / total) * 100;
  return el('header.session-header', {}, [
    el('button.icon-btn', { onClick: confirmExit, title: 'Thoát' }, [icon('x', 24)]),
    el('div.session-progress', {}, [
      el('div.session-progress-bar', {}, [
        el('div.session-progress-fill', { style: { width: `${pct}%` } }),
      ]),
      el('div.session-progress-label', {}, [`Bài ${idx}/${total}`]),
    ]),
    el('button.icon-btn', { onClick: skipBlock, title: 'Bỏ qua' }, [icon('skip', 22)]),
  ]);
}

function sessionBody(block, ex) {
  if (session.phase === 'rest') return restView(block, ex);
  return activeView(block, ex);
}

function activeView(block, ex) {
  const setCount = block.sets;
  const setLabel = `Set ${session.setIdx + 1}/${setCount}`;
  return el('div.session-main', {}, [
    el('div.exercise-icon', {}, [exerciseEmoji(ex)]),
    el('h1.exercise-title', {}, [ex.name]),
    el('div.exercise-meta', {}, [setLabel]),
    bigDisplay(block, ex),
    el('p.exercise-instructions', {}, [ex.instructions]),
    el('div.cue-row', {}, ex.cues.map((c) => el('span.cue-pill', {}, [c]))),
  ]);
}

function bigDisplay(block, ex) {
  if (session.phase === 'intro') {
    return el('div.big-display', {}, [
      el('div.big-num', {}, [
        ex.mode === 'time' ? fmtTime((block.duration ?? 0)) : String(block.reps ?? 0),
      ]),
      el('div.big-sub', {}, [ex.mode === 'time' ? 'thời gian' : repLabel(ex)]),
    ]);
  }
  if (ex.mode === 'time') {
    return el('div.big-display', {}, [
      el('div.big-num.timer', {}, [fmtTime(session.remainingMs / 1000)]),
      el('div.big-sub', {}, ['còn lại']),
    ]);
  }
  // rep mode: show count up to target
  return el('div.big-display', {}, [
    el('div.big-num.timer', {}, [`${session.reps}/${block.reps}`]),
    el('div.big-sub', {}, [repLabel(ex)]),
  ]);
}

function restView(block, ex) {
  const next = session.day.blocks[session.blockIdx + 1];
  const isLastSet = session.setIdx + 1 >= block.sets;
  const upcoming = isLastSet
    ? next ? `Tiếp: ${getExercise(next.exerciseId).name}` : 'Sắp hết!'
    : `Set tiếp theo: ${session.setIdx + 2}/${block.sets}`;
  return el('div.session-main.is-rest', {}, [
    el('div.exercise-icon', {}, ['⏸']),
    el('h1.exercise-title', {}, ['Nghỉ']),
    el('div.big-display', {}, [
      el('div.big-num.timer', {}, [fmtTime(session.remainingMs / 1000)]),
      el('div.big-sub', {}, [upcoming]),
    ]),
    el('p.exercise-instructions', {}, ['Hít thở sâu, uống ngụm nước, lắc tay thả lỏng.']),
  ]);
}

function sessionControls() {
  if (session.phase === 'intro') {
    return el('footer.session-footer', {}, [
      button('Bắt đầu set 🔥', startSet, { variant: 'primary', large: true, full: true }),
    ]);
  }
  return el('footer.session-footer', {}, [
    button(session.paused ? 'Tiếp tục' : 'Tạm dừng', togglePause, { variant: 'secondary' }),
    button(session.phase === 'rest' ? 'Bỏ qua nghỉ' : 'Hoàn thành set', completeOrSkip, { variant: 'primary', large: true }),
  ]);
}

// ---------- transitions ----------

function startSet() {
  Sound.unlock();
  Speech.init();
  const block = currentBlock();
  const ex = currentExercise();
  Speech.speak(`${ex.name}. Bắt đầu.`, { urgent: true });
  Sound.beep({ freq: 1100, duration: 0.15 });
  session.phase = 'active';
  if (ex.mode === 'time') {
    session.remainingMs = block.duration * 1000;
  } else {
    session.reps = 0;
    session.remainingMs = block.reps * SECONDS_PER_REP * 1000;
  }
  session.paused = false;
  startTicker();
  draw();
}

function startRest() {
  const block = currentBlock();
  const restSec = block.restSeconds ?? DEFAULT_REST_SECONDS;
  if (restSec <= 0) return advanceSet();
  session.phase = 'rest';
  session.remainingMs = restSec * 1000;
  Speech.speak('Nghỉ. Hít thở sâu.', { urgent: true });
  Sound.beep({ freq: 660, duration: 0.15 });
  startTicker();
  draw();
}

function advanceSet() {
  const block = currentBlock();
  const isLastSet = session.setIdx + 1 >= block.sets;
  if (!isLastSet) {
    session.setIdx++;
    startSet();
    return;
  }
  // block done
  session.blocksCompleted++;
  session.blockIdx++;
  session.setIdx = 0;
  session.phase = 'intro';
  if (session.blockIdx >= session.day.blocks.length) return finish();
  Speech.speak(`Tốt. Tiếp theo: ${currentExercise().name}`, { urgent: true });
  draw();
}

function completeOrSkip() {
  stopTicker();
  if (session.phase === 'rest') return advanceSet();
  // user pressed "Hoàn thành set" early → go to rest
  startRest();
}

function skipBlock() {
  if (!confirm('Bỏ qua bài này?')) return;
  stopTicker();
  session.blockIdx++;
  session.setIdx = 0;
  session.phase = 'intro';
  if (session.blockIdx >= session.day.blocks.length) return finish();
  draw();
}

function togglePause() {
  session.paused = !session.paused;
  if (session.paused) { stopTicker(); Speech.cancel(); }
  else startTicker();
  draw();
}

function confirmExit() {
  if (!confirm('Thoát buổi tập? Tiến độ sẽ không lưu.')) return;
  stopTicker();
  Speech.cancel();
  session.day = null;
  navigate(ROUTES.DASHBOARD);
}

function finish() {
  stopTicker();
  Sound.chime();
  Speech.speak('Hoàn thành buổi tập. Tốt lắm!', { urgent: true });
  recordSession({
    date: new Date().toISOString().slice(0, 10),
    dayType: session.day.dayType,
    durationSec: Math.round((Date.now() - session.startedAt) / 1000),
    blocksDone: session.blocksCompleted,
    totalBlocks: session.day.blocks.length,
  });
  showFinishCard();
}

function showFinishCard() {
  const blocks = session.blocksCompleted;
  const total = session.day.blocks.length;
  const minutes = Math.round((Date.now() - session.startedAt) / 60000);
  session.day = null;
  mount(appRoot, el('main.screen', {}, [
    el('div.finish-hero', {}, [
      el('div.finish-emoji', {}, ['🎉']),
      el('h1', {}, ['Xong rồi!']),
      el('p.muted', {}, [`Hoàn thành ${blocks}/${total} bài trong ${minutes} phút.`]),
      button('Về Trang chính', () => navigate(ROUTES.DASHBOARD), { variant: 'primary', large: true, full: true }),
    ]),
  ]));
}

// ---------- ticker ----------

function startTicker() {
  stopTicker();
  let last = Date.now();
  tickHandle = setInterval(() => {
    const now = Date.now();
    const delta = now - last;
    last = now;
    session.remainingMs -= delta;
    onTick();
    if (session.remainingMs <= 0) onTimeUp();
    draw();
  }, TICK_MS);
}

function stopTicker() {
  if (tickHandle) { clearInterval(tickHandle); tickHandle = null; }
}

function onTick() {
  const sec = Math.ceil(session.remainingMs / 1000);
  // rep-mode: speak count when rep boundary crossed
  if (session.phase === 'active' && currentExercise().mode !== 'time') {
    const block = currentBlock();
    const elapsed = block.reps - sec / SECONDS_PER_REP;
    const newReps = Math.min(block.reps, Math.floor(elapsed));
    if (newReps > session.reps) {
      session.reps = newReps;
      Speech.speakCount(session.reps);
    }
  }
  // countdown ticks for last 3 seconds
  if ((session.phase === 'active' || session.phase === 'rest') && sec <= 3 && sec > 0) {
    if (!session._lastTickSec || session._lastTickSec !== sec) {
      Sound.tick();
      session._lastTickSec = sec;
    }
  } else session._lastTickSec = null;
}

function onTimeUp() {
  if (session.phase === 'active') {
    Sound.bell();
    Speech.speak('Hết set!', { urgent: true });
    startRest();
  } else if (session.phase === 'rest') {
    Sound.bell();
    advanceSet();
  }
}

// ---------- helpers ----------

function repLabel(ex) {
  return ex.mode === 'reps-per-side' ? 'rep mỗi bên' : 'rep';
}

function exerciseEmoji(ex) {
  const map = {
    cardio: '🏃', warmup: '🚶', cooldown: '🚶', core: '🔥', lower: '🦵',
    upper: '💪', flexibility: '🧘', 'full-body': '⚡',
  };
  return map[ex.type] ?? '💪';
}
