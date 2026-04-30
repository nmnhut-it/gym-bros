/**
 * PWA layer tests — manifest contract, service-worker shape, install module.
 *
 * The browser is the ultimate judge of a PWA, but these guard the static parts
 * that we control: the manifest doesn't drift out of spec, the SW file is
 * present and wires the right lifecycle listeners, and our install/wake-lock
 * wrappers behave safely on browsers that lack the underlying APIs.
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import './_setup.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
function repoFile(rel) { return readFileSync(join(ROOT, rel), 'utf8'); }

describe('manifest.json', () => {
  let manifest;
  before(() => { manifest = JSON.parse(repoFile('manifest.json')); });

  it('parses as JSON', () => assert.ok(manifest));

  it('declares all installability fields', () => {
    for (const field of ['name', 'short_name', 'start_url', 'display', 'icons', 'theme_color', 'background_color']) {
      assert.ok(manifest[field], `missing field: ${field}`);
    }
  });

  it('uses standalone display mode (no browser chrome when launched)', () => {
    assert.equal(manifest.display, 'standalone');
  });

  it('declares Vietnamese as the primary language', () => {
    assert.match(manifest.lang ?? '', /^vi/);
  });

  it('provides both "any" and "maskable" icon purposes', () => {
    const purposes = new Set(manifest.icons.map((i) => i.purpose));
    assert.ok(purposes.has('any'),      'missing purpose=any icon');
    assert.ok(purposes.has('maskable'), 'missing purpose=maskable icon');
  });

  it('icon files referenced in manifest actually exist', () => {
    for (const icon of manifest.icons) {
      const rel = icon.src.replace(/^\//, '');
      assert.doesNotThrow(() => repoFile(rel), `${icon.src} not found`);
    }
  });
});

describe('service worker (sw.js)', () => {
  let src;
  before(() => { src = repoFile('sw.js'); });

  it('exists at site root so its scope claims everything', () => assert.ok(src.length > 0));
  it('declares a versioned cache name (so updates can invalidate old caches)', () => {
    assert.match(src, /CACHE_VERSION\s*=\s*['"][^'"]+['"]/);
  });
  it('registers an install listener', () => assert.match(src, /addEventListener\(['"]install['"]/));
  it('registers an activate listener', () => assert.match(src, /addEventListener\(['"]activate['"]/));
  it('registers a fetch listener', () => assert.match(src, /addEventListener\(['"]fetch['"]/));
  it('precaches at least the index + stylesheet', () => {
    assert.match(src, /\/index\.html/);
    assert.match(src, /\/styles\/main\.css/);
  });
});

describe('PwaInstall', () => {
  let mod;
  before(async () => { mod = await import('../js/pwa/install.js'); });

  it('canInstall is false until beforeinstallprompt fires', () => {
    assert.equal(mod.canInstall(), false);
  });

  it('isStandalone is false in a normal tab / jsdom env', () => {
    assert.equal(mod.isStandalone(), false);
  });

  it('promptInstall returns "unavailable" when no prompt is queued', async () => {
    assert.equal(await mod.promptInstall(), 'unavailable');
  });

  it('init() does not throw on browsers without serviceWorker', () => {
    assert.doesNotThrow(() => mod.init());
  });

  it('onChange registers + returns an unsubscribe fn', () => {
    let count = 0;
    const off = mod.onChange(() => { count++; });
    assert.equal(typeof off, 'function');
    off();
  });
});

describe('WakeLock', () => {
  let mod;
  before(async () => { mod = await import('../js/wake-lock.js'); });

  it('isSupported is false in jsdom (no navigator.wakeLock)', () => {
    assert.equal(mod.isSupported(), false);
  });

  it('acquire is a safe no-op when unsupported', async () => {
    await assert.doesNotReject(() => mod.acquire());
    assert.equal(mod.isHeld(), false);
  });

  it('release is a safe no-op when no lock is held', () => {
    assert.doesNotThrow(() => mod.release());
  });
});
