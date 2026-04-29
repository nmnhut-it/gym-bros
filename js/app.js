/**
 * Bootstrap. Loads state, registers routes, kicks off the router.
 */

import { ROUTES } from './constants.js';
import { state, load as loadState, onChange } from './state.js';
import * as Router from './router.js';
import * as Speech from './audio/speech.js';
import * as Onboarding from './views/onboarding.js';
import * as Dashboard from './views/dashboard.js';
import * as Plan from './views/plan.js';
import * as Session from './views/session.js';
import * as Progress from './views/progress.js';
import * as Settings from './views/settings.js';

function applyTheme() {
  document.body.classList.toggle('tv-mode', !!state.settings.tvMode);
}

function registerRoutes() {
  Router.register(ROUTES.ONBOARDING, Onboarding.render);
  Router.register(ROUTES.DASHBOARD,  Dashboard.render);
  Router.register(ROUTES.PLAN,       Plan.render);
  Router.register(ROUTES.SESSION,    Session.render);
  Router.register(ROUTES.PROGRESS,   Progress.render);
  Router.register(ROUTES.SETTINGS,   Settings.render);
}

function main() {
  loadState();
  applyTheme();
  Speech.init();
  registerRoutes();
  const root = document.getElementById('app');
  Router.init(root);
  // Re-apply theme whenever settings change.
  onChange((e) => { if (e.detail.reason === 'settings') applyTheme(); });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
