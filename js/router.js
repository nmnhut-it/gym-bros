/**
 * Hash-based router. Maps `location.hash` → view render function.
 * Hash routing chosen over History API so the app can run from any path
 * (file://, GitHub Pages subfolder, Cloudflare Pages root) without server config.
 */

import { ROUTES } from './constants.js';
import { isOnboarded } from './state.js';

/** @type {Map<string, (root: HTMLElement) => void>} */
const routes = new Map();
let rootEl = null;

/** Register a route handler. */
export function register(path, render) {
  routes.set(path, render);
}

/** Programmatic navigation. */
export function navigate(path) {
  if (location.hash !== path) location.hash = path;
  else handle();  // re-render same route
}

/** Current hash, with fallback to dashboard. */
export function current() {
  return location.hash || ROUTES.DASHBOARD;
}

/** Initialize the router. Call once after DOM + state are ready. */
export function init(root) {
  rootEl = root;
  window.addEventListener('hashchange', handle);
  if (!location.hash) location.hash = isOnboarded() ? ROUTES.DASHBOARD : ROUTES.ONBOARDING;
  handle();
}

function handle() {
  const path = current();
  if (!isOnboarded() && path !== ROUTES.ONBOARDING) {
    navigate(ROUTES.ONBOARDING);
    return;
  }
  const handler = routes.get(path) ?? routes.get(ROUTES.DASHBOARD);
  if (!handler) {
    rootEl.replaceChildren(document.createTextNode(`Không tìm thấy route: ${path}`));
    return;
  }
  rootEl.scrollTo?.(0, 0);
  handler(rootEl);
}
