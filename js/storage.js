/**
 * localStorage wrapper. Swap this file later to migrate to IndexedDB or a server API
 * without touching the rest of the app.
 */

/**
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[storage] load failed for ${key}`, err);
    return fallback;
  }
}

/**
 * @param {string} key
 * @param {unknown} value
 */
export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[storage] save failed for ${key}`, err);
  }
}

/** @param {string} key */
export function remove(key) {
  localStorage.removeItem(key);
}

/** Wipe everything under the app prefix. Used by Settings → Reset. */
export function clearAll(prefix) {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}
