/**
 * Screen Wake Lock wrapper.
 *
 * Keeps the phone screen on during a workout session. Browser auto-releases
 * the lock when the page is hidden (tab switch, screen-off button), so we
 * re-acquire on `visibilitychange` while a session still wants the lock.
 *
 * Safe-noop on browsers without `navigator.wakeLock` (older Safari, TV
 * browsers, Node test env).
 */

let lock = null;
let wanted = false;

export function isSupported() {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
}

/** True if a wake lock is currently held. */
export function isHeld() { return lock !== null; }

/** Acquire the lock. Idempotent; subsequent calls are no-ops while held. */
export async function acquire() {
  wanted = true;
  await tryAcquire();
}

/** Release any held lock and stop auto-reacquiring on visibility change. */
export function release() {
  wanted = false;
  if (lock) {
    lock.release().catch(() => {});
    lock = null;
  }
}

async function tryAcquire() {
  if (!isSupported() || !wanted || lock) return;
  try {
    lock = await navigator.wakeLock.request('screen');
    lock.addEventListener?.('release', () => { lock = null; });
  } catch (err) {
    // Some browsers throw if not in a user gesture; not fatal.
    console.warn('[wake-lock] request failed', err);
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') tryAcquire();
  });
}
