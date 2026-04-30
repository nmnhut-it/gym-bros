/**
 * View smoke tests — every route renders without throwing.
 *
 * Each view exports `render(root)`. We seed a realistic state, mount, and
 * assert: no exception, root is non-empty, and the heading the view declares
 * exists in the DOM. This is cheap insurance against regressions like missing
 * imports, renamed enums, or broken DOM construction.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { resetMocks, resetAppRoot } from './_setup.mjs';
import { state, setProfile } from '../js/state.js';
import { generatePlan } from '../js/plan/generator.js';
import { CONDITION, DEFAULT_SETTINGS } from '../js/constants.js';

const PROFILE = Object.freeze({
  name: 'Tester', gender: 'male', age: 32, heightCm: 168, weightKg: 75,
  level: 'beginner', goals: ['fat-loss', 'general-fitness'],
  conditions: [CONDITION.CORE_EASY],
  equipment: ['treadmill', 'treadmill-incline', 'yoga-mat'],
  daysPerWeek: 3, sessionMinutes: 45,
});

function seedFullState() {
  resetMocks();
  resetAppRoot();
  state.profile = { ...PROFILE };
  state.plan = generatePlan(PROFILE);
  state.sessions = [
    { date: '2026-04-29', dayType: 'cardio-core', durationSec: 1800, blocksDone: 5, totalBlocks: 6 },
  ];
  state.weights = [{ date: '2026-04-29', kg: 75 }, { date: '2026-04-28', kg: 75.4 }];
  state.settings = { ...DEFAULT_SETTINGS };
  state.adHocDay = null;
}

function appRoot() { return document.getElementById('app'); }

beforeEach(seedFullState);

describe('view smoke: each render() produces output without throwing', () => {
  it('dashboard renders with seeded profile + plan', async () => {
    const { render } = await import('../js/views/dashboard.js');
    render(appRoot());
    assert.ok(appRoot().children.length > 0, 'dashboard should mount children');
  });

  it('plan view renders the weekly schedule', async () => {
    const { render } = await import('../js/views/plan.js');
    render(appRoot());
    assert.ok(appRoot().textContent.length > 0, 'plan should render text');
  });

  it('session view renders intro for the scheduled day', async () => {
    const { render } = await import('../js/views/session.js');
    render(appRoot());
    assert.ok(appRoot().textContent.length > 0, 'session should render text');
  });

  it('progress view renders chart + history with seeded data', async () => {
    const { render } = await import('../js/views/progress.js');
    render(appRoot());
    assert.ok(appRoot().textContent.length > 0);
  });

  it('progress view also renders cleanly with empty history', async () => {
    state.sessions = [];
    state.weights = [];
    const { render } = await import('../js/views/progress.js');
    render(appRoot());
    assert.ok(appRoot().children.length > 0);
  });

  it('settings view renders profile + plan + audio cards', async () => {
    const { render } = await import('../js/views/settings.js');
    render(appRoot());
    assert.ok(appRoot().textContent.includes('Cài đặt'));
  });

  it('browse view renders exercise library', async () => {
    const { render } = await import('../js/views/browse.js');
    render(appRoot());
    assert.ok(appRoot().textContent.includes('Thư viện bài tập'));
  });

  it('onboarding view renders the welcome step (no profile required)', async () => {
    state.profile = null;
    state.plan = null;
    const { render } = await import('../js/views/onboarding.js');
    render(appRoot());
    assert.ok(appRoot().textContent.includes('Chào mừng'));
  });
});

describe('view smoke: low-impact-core flags drive UI label rendering', () => {
  it('onboarding step "conditions" lists the renamed flags by neutral label', async () => {
    state.profile = null;
    const { render } = await import('../js/views/onboarding.js');
    render(appRoot());

    // Click forward through Welcome → Body → Goals → Conditions (4 "Tiếp tục" steps).
    function clickContinue() {
      const btn = [...appRoot().querySelectorAll('button')].find((b) =>
        b.textContent.includes('Tiếp tục'));
      assert.ok(btn, 'expected Tiếp tục button');
      btn.click();
    }
    clickContinue(); clickContinue(); clickContinue();

    const text = appRoot().textContent;
    assert.ok(text.includes('Tập nhẹ vùng bụng'),    'CORE_EASY label should appear');
    assert.ok(text.includes('Tập rất nhẹ vùng bụng'), 'CORE_MIN label should appear');
    assert.ok(text.includes('Lưng nhạy cảm'),         'BACK_EASY label should appear');
    assert.ok(text.includes('Gối nhạy cảm'),          'KNEE_EASY label should appear');
    assert.ok(!/thoát vị|hernia/i.test(text),         'no disease names in onboarding copy');
  });
});
