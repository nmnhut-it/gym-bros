/**
 * Session player integration tests — full state machine + golden path.
 *
 * Renders the actual session view into a jsdom #app root and drives it with
 * Node's built-in mock timers. Speech + Sound modules are stubbed in _setup.mjs.
 *
 * Coverage:
 *   - golden path: intro → active → time-up → finish + session record persisted
 *   - rep-mode counter advances per SECONDS_PER_REP and is announced via TTS
 *   - pause halts the ticker, resume restarts it
 *   - skipBlock + finish branch
 *   - swap exercise mid-intro replaces block in place
 *   - multiple sets: rest between sets, advance to next set on rest end
 *   - last set on last block falls through to finish
 *
 * Each test re-seeds state and adHocDay so the session module re-boots cleanly.
 */

import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';

import { resetMocks, speechCalls } from './_setup.mjs';
import { state, setAdHocDay } from '../js/state.js';
import { render as renderSession } from '../js/views/session.js';
import { CONDITION, DEFAULT_SETTINGS } from '../js/constants.js';

const PROFILE = Object.freeze({
  name: 'Tester', gender: 'male', age: 30, heightCm: 170, weightKg: 70,
  level: 'beginner', goals: ['fat-loss'], conditions: [CONDITION.CORE_EASY],
  equipment: ['treadmill', 'yoga-mat'], daysPerWeek: 3, sessionMinutes: 30,
});

/** Build a minimal one-block ad-hoc day. */
function timeBlockDay({ exerciseId = 'plank-knee', sets = 1, duration = 4, restSeconds = 0 } = {}) {
  return {
    weekday: 0, dayType: 'cardio-core', name: 'Test', icon: '🧪', summary: '',
    blocks: [{ exerciseId, sets, duration, restSeconds }],
    estimatedMinutes: 1,
  };
}
function repBlockDay({ exerciseId = 'pelvic-tilt', sets = 1, reps = 4, restSeconds = 0 } = {}) {
  return {
    weekday: 0, dayType: 'cardio-core', name: 'Test', icon: '🧪', summary: '',
    blocks: [{ exerciseId, sets, reps, restSeconds }],
    estimatedMinutes: 1,
  };
}

function freshState() {
  resetMocks();
  state.profile = { ...PROFILE };
  state.plan = null;
  state.sessions = [];
  state.weights = [];
  state.settings = { ...DEFAULT_SETTINGS };
  state.adHocDay = null;
}

function appRoot() { return document.getElementById('app'); }
function $(sel) { return appRoot().querySelector(sel); }
function $$(sel) { return [...appRoot().querySelectorAll(sel)]; }
function findButton(textFragment) {
  return $$('button').find((b) => b.textContent.includes(textFragment));
}

/**
 * mock.timers.tick(N) with N > ~3000ms occasionally drops setInterval fires
 * mid-callback under Node's experimental mock-timers. Ticking in 100ms slices
 * matches the app's TICK_MS exactly and is reliable. Use this everywhere.
 */
function advance(totalMs) {
  for (let elapsed = 0; elapsed < totalMs; elapsed += 100) mock.timers.tick(100);
}

beforeEach(() => {
  freshState();
  mock.timers.enable({ apis: ['setInterval', 'setTimeout', 'Date'] });
});
afterEach(() => {
  mock.timers.reset();
});

describe('session golden path (time-mode, single block, single set)', () => {
  it('renders intro phase first with the start button', () => {
    setAdHocDay(timeBlockDay({ duration: 4, sets: 1 }));
    renderSession(appRoot());
    assert.ok(findButton('Bắt đầu set'), 'expected Bắt đầu set button on intro');
    assert.ok(appRoot().querySelector('.exercise-title'), 'expected exercise title');
  });

  it('starts the timer on click and persists a session record at finish', () => {
    setAdHocDay(timeBlockDay({ duration: 4, sets: 1, restSeconds: 0 }));
    renderSession(appRoot());

    findButton('Bắt đầu set').click();
    assert.ok($('.big-num.timer'), 'expected ticking timer after start');

    // Drain the 4-second active phase. With restSeconds=0 advanceSet → finish.
    advance(4500);

    assert.equal(state.sessions.length, 1, 'recordSession should fire on finish');
    assert.equal(state.sessions[0].totalBlocks, 1);
    assert.ok(appRoot().textContent.includes('Xong rồi'), 'finish card should render');
  });
});

describe('session: pause / resume', () => {
  it('pause stops the timer; resume continues from where it stopped', () => {
    setAdHocDay(timeBlockDay({ duration: 10, sets: 1, restSeconds: 0 }));
    renderSession(appRoot());
    findButton('Bắt đầu set').click();

    advance(2000);
    findButton('Tạm dừng').click();
    const pausedText = $('.big-num.timer').textContent;

    // Advance real time — paused, nothing should change because tickHandle was cleared.
    advance(3000);
    assert.equal($('.big-num.timer').textContent, pausedText, 'timer must not move while paused');

    findButton('Tiếp tục').click();
    advance(10000);
    assert.equal(state.sessions.length, 1, 'session should still finish after resume');
  });
});

describe('session: rep-mode counter', () => {
  it('increments reps every SECONDS_PER_REP (=3s) and announces via TTS', () => {
    setAdHocDay(repBlockDay({ reps: 4, sets: 1, restSeconds: 0 }));
    renderSession(appRoot());
    findButton('Bắt đầu set').click();

    // After 3s → 1 rep counted, after 6s → 2 reps, etc.
    advance(3100);
    assert.match($('.big-num.timer').textContent, /^1\/4$/, 'counter should show 1/4 after 3s');

    advance(3000);
    assert.match($('.big-num.timer').textContent, /^2\/4$/, 'counter should show 2/4 after 6s');

    // TTS announced at least the first count word ('một').
    const counts = speechCalls.filter((c) => c.type === 'speak' && /^một|^hai|^ba/.test(c.text));
    assert.ok(counts.length > 0, 'TTS should speak rep counts');

    // Cleanup: pause to release the ticker so the next test starts cleanly.
    findButton('Tạm dừng')?.click();
  });
});

describe('session: skip block', () => {
  it('advances past the current block when user skips', () => {
    const day = {
      ...timeBlockDay({ duration: 30, sets: 1 }),
      blocks: [
        { exerciseId: 'plank-knee', sets: 1, duration: 30, restSeconds: 0 },
        { exerciseId: 'pelvic-tilt', sets: 1, reps: 4, restSeconds: 0 },
      ],
    };
    setAdHocDay(day);
    renderSession(appRoot());

    // Header has a skip icon-button (title="Bỏ qua"). Click it.
    const skipBtn = $$('button.icon-btn').find((b) => b.title === 'Bỏ qua');
    assert.ok(skipBtn, 'expected a skip button in header');
    skipBtn.click();

    assert.ok(appRoot().textContent.includes('Nghiêng xương chậu'),
      'should show next block (pelvic-tilt) after skip');
  });
});

describe('session: swap exercise mid-intro', () => {
  it('replaces the current block exercise without leaving intro', () => {
    setAdHocDay(timeBlockDay({ exerciseId: 'plank-knee', duration: 30, sets: 1 }));
    renderSession(appRoot());
    assert.ok(appRoot().textContent.includes('Plank đầu gối'));

    findButton('Đổi bài').click();
    // Sheet opens with same-type alternates; pick first .swap-item.
    const first = document.querySelector('.swap-item');
    assert.ok(first, 'expected at least one swap candidate');
    const altName = first.querySelector('.swap-name')?.textContent;
    first.click();

    assert.ok(altName, 'alt name should exist');
    assert.ok(appRoot().textContent.includes(altName),
      `expected swapped exercise (${altName}) to show after swap`);
  });
});

describe('session: multi-set block with rest', () => {
  it('runs set 1 → rest → set 2 → finish', () => {
    setAdHocDay(timeBlockDay({ duration: 3, sets: 2, restSeconds: 2 }));
    renderSession(appRoot());

    findButton('Bắt đầu set').click();
    advance(3500);   // set 1 active 3s done → rest
    assert.ok(appRoot().textContent.includes('Nghỉ'), 'should be in rest phase after set 1');

    advance(2500);   // rest 2s done → set 2 starts
    assert.ok($('.big-num.timer'), 'set 2 timer should appear');

    advance(5500);   // set 2 active 3s + rest 2s + buffer → finish
    assert.equal(state.sessions.length, 1);
  });
});

describe('session: bootSession resets between ad-hoc days', () => {
  it('starting a new adHocDay re-renders from intro of the new first block', () => {
    setAdHocDay(timeBlockDay({ exerciseId: 'plank-knee', duration: 30 }));
    renderSession(appRoot());
    findButton('Bắt đầu set').click();
    advance(1000);

    // Now switch to a different day — should re-boot to intro.
    setAdHocDay(timeBlockDay({ exerciseId: 'pelvic-tilt', sets: 1, reps: 4, restSeconds: 0 }));
    renderSession(appRoot());

    assert.ok(findButton('Bắt đầu set'), 'should be back at intro after day switch');
    assert.ok(appRoot().textContent.includes('Nghiêng xương chậu'),
      'new exercise should be the one rendered');
  });
});
