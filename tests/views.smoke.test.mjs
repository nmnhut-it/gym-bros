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
  state.favorites = [];
}

function appRoot() { return document.getElementById('app'); }

beforeEach(seedFullState);

describe('view smoke: each render() produces output without throwing', () => {
  it('dashboard renders with seeded profile + plan', async () => {
    const { render } = await import('../js/views/dashboard.js');
    render(appRoot());
    assert.ok(appRoot().children.length > 0, 'dashboard should mount children');
  });

  it('dashboard renders favorites tile row when favorites are pinned', async () => {
    state.favorites = ['dead-bug', 'glute-bridge'];
    const { render } = await import('../js/views/dashboard.js');
    render(appRoot());
    const text = appRoot().textContent;
    assert.ok(text.includes('Yêu thích'), 'favorites section should render');
    assert.ok(text.includes('Dead Bug'), 'pinned exercise name should appear');
  });

  it('dashboard surfaces last-run exercise as Tập tiếp hero', async () => {
    state.sessions = [
      { date: '2026-04-29', dayType: 'cardio-core', durationSec: 600,
        blocksDone: 1, totalBlocks: 1, exerciseIds: ['dead-bug'] },
    ];
    const { render } = await import('../js/views/dashboard.js');
    render(appRoot());
    const text = appRoot().textContent;
    assert.ok(text.includes('Tập tiếp'),
      'continue eyebrow should appear when recent sessions exist');
    assert.ok(text.includes('Dead Bug'),
      'last-run exercise name should surface');
  });

  it('dashboard shows empty hint when no recent sessions and no favorites', async () => {
    state.sessions = [];
    state.favorites = [];
    const { render } = await import('../js/views/dashboard.js');
    render(appRoot());
    const text = appRoot().textContent;
    assert.ok(text.includes('Sẵn sàng tập?'),
      'empty continue card should prompt user to start');
    assert.ok(text.includes('Mở thư viện'),
      'CTA should point at the library');
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

  it('session: star button pins the current exercise', async () => {
    state.favorites = [];
    // Force a known exercise as the active block — the seeded weekly plan
    // may land on a rest day depending on `new Date().getDay()`, in which
    // case the session view jumps straight to the finish card and the star
    // never renders. An ad-hoc day with one real exercise sidesteps that.
    state.adHocDay = {
      weekday: 0, dayType: 'cardio-core', name: 'Test', icon: '🎯',
      summary: 'test', estimatedMinutes: 5,
      blocks: [{ exerciseId: 'dead-bug', sets: 1, reps: 10, restSeconds: 30 }],
    };
    const { render } = await import('../js/views/session.js');
    render(appRoot());
    const star = appRoot().querySelector('.star-btn');
    assert.ok(star, 'session intro should render a star button next to the title');
    assert.equal(state.favorites.length, 0);
    star.click();
    assert.equal(state.favorites.length, 1,
      'clicking the session star should pin the current exercise');
    assert.equal(state.favorites[0], 'dead-bug',
      'pinned id should match the active exercise');
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

  it('settings view renders profile + plan + audio + install cards', async () => {
    const { render } = await import('../js/views/settings.js');
    render(appRoot());
    assert.ok(appRoot().textContent.includes('Cài đặt'));
    assert.ok(appRoot().textContent.includes('Cài về máy'),
      'install card should render even when prompt unavailable');
  });

  it('browse view renders exercise library', async () => {
    const { render } = await import('../js/views/browse.js');
    render(appRoot());
    assert.ok(appRoot().textContent.includes('Thư viện bài tập'));
  });

  it('browse: tap star button toggles favorite without adding to cart', async () => {
    state.favorites = [];
    const { render } = await import('../js/views/browse.js');
    render(appRoot());
    const star = appRoot().querySelector('.star-btn');
    assert.ok(star, 'browse should render at least one star button');
    assert.equal(star.classList.contains('is-on'), false, 'star should start off');

    star.click();
    // After click, favorites should contain at least one id and the row
    // should NOT have flipped into the cart.
    assert.equal(state.favorites.length, 1, 'click should add one favorite');
    const row = star.closest('.browse-item');
    assert.equal(row.classList.contains('in-cart'), false,
      'star click must not propagate into cart toggle');

    // Click again on the freshly rendered star to remove.
    const star2 = appRoot().querySelector('.star-btn.is-on');
    assert.ok(star2, 'after add, the row should now show a filled star');
    star2.click();
    assert.equal(state.favorites.length, 0, 'second click should remove favorite');
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
