/**
 * Storage layer tests — round-trip + isolation under prefix.
 *
 * Storage is a thin localStorage wrapper but it's the boundary the rest of the
 * app trusts, so any regression here cascades. These cover the contract the
 * other layers depend on.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { resetMocks } from './_setup.mjs';
import * as Storage from '../js/storage.js';

const PREFIX = 'gymbros';

beforeEach(() => resetMocks());

describe('Storage.save + load', () => {
  it('round-trips a plain object', () => {
    Storage.save('gymbros:profile', { name: 'A', age: 30 });
    assert.deepEqual(Storage.load('gymbros:profile', null), { name: 'A', age: 30 });
  });

  it('round-trips an array', () => {
    Storage.save('gymbros:sessions', [{ d: '2026-04-30' }]);
    assert.deepEqual(Storage.load('gymbros:sessions', []), [{ d: '2026-04-30' }]);
  });

  it('returns fallback when key absent', () => {
    assert.deepEqual(Storage.load('gymbros:missing', { def: 1 }), { def: 1 });
    assert.equal(Storage.load('gymbros:missing', null), null);
  });

  it('returns fallback when stored value is malformed JSON', () => {
    localStorage.setItem('gymbros:bad', '{not json');
    assert.deepEqual(Storage.load('gymbros:bad', { ok: true }), { ok: true });
  });

  it('overwrites prior value on repeated save', () => {
    Storage.save('gymbros:k', 1);
    Storage.save('gymbros:k', 2);
    assert.equal(Storage.load('gymbros:k', null), 2);
  });
});

describe('Storage.remove', () => {
  it('deletes a single key', () => {
    Storage.save('gymbros:k', 'v');
    Storage.remove('gymbros:k');
    assert.equal(Storage.load('gymbros:k', null), null);
  });

  it('is a no-op on a missing key', () => {
    Storage.remove('gymbros:never-existed');
    // Reaching this assertion is the test — no throw.
    assert.ok(true);
  });
});

describe('Storage.clearAll', () => {
  it('removes only keys under the given prefix', () => {
    Storage.save('gymbros:a', 1);
    Storage.save('gymbros:b', 2);
    localStorage.setItem('other:x', 'keep');

    Storage.clearAll(PREFIX);

    assert.equal(Storage.load('gymbros:a', null), null);
    assert.equal(Storage.load('gymbros:b', null), null);
    assert.equal(localStorage.getItem('other:x'), 'keep');
  });

  it('handles empty storage gracefully', () => {
    Storage.clearAll(PREFIX);
    assert.equal(localStorage.length, 0);
  });
});
