/**
 * PWA install + service-worker registration.
 *
 * Captures the browser's `beforeinstallprompt` event (Chrome/Edge/Android) so
 * the Settings view can later show a "Cài về máy" button and trigger the
 * native install flow. Safe-noop on Safari and other browsers without the API.
 *
 * Usage:
 *   PwaInstall.init()                  // call once at app boot
 *   PwaInstall.canInstall()            // any prompt available?
 *   PwaInstall.promptInstall()         // show the prompt; resolves outcome
 *   PwaInstall.isStandalone()          // running as installed PWA?
 *   PwaInstall.onChange(fn)            // notify when prompt/install state flips
 */

import { PWA } from '../constants.js';

let deferredPrompt = null;
const listeners = new Set();

export function init() {
  registerServiceWorker();
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

/** True when running inside an installed PWA (not the browser tab). */
export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)')?.matches === true
      || window.navigator?.standalone === true;
}

/** True when the browser has offered an install prompt we can show. */
export function canInstall() { return deferredPrompt !== null; }

/**
 * Show the browser install prompt. Resolves with 'accepted', 'dismissed',
 * or 'unavailable' (no prompt was queued).
 */
export async function promptInstall() {
  if (!deferredPrompt) return 'unavailable';
  const e = deferredPrompt;
  deferredPrompt = null;
  notify();
  e.prompt();
  const choice = await e.userChoice;
  return choice?.outcome ?? 'dismissed';
}

/** Subscribe to install-state changes. Returns an unsubscribe fn. */
export function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() { listeners.forEach((fn) => { try { fn(); } catch { /* swallow */ } }); }

function registerServiceWorker() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  // file:// and other non-HTTP origins reject SW registration. Skip silently.
  if (!/^https?:/.test(location.protocol)) return;
  navigator.serviceWorker.register(PWA.SW_PATH).catch((err) => {
    console.warn('[pwa] service worker registration failed', err);
  });
}
