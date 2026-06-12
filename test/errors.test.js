import assert from 'node:assert/strict';
import { test } from 'node:test';

import { TumblrError } from '../lib/errors.js';

test('TumblrError carries Tumblr error fields', () => {
  const err = new TumblrError('Not Found', {
    status: 404,
    code: 1,
    meta: { status: 404, msg: 'Not Found' },
    errors: [{ title: 'Not Found' }],
    rateLimit: { remaining: 0 }
  });
  assert.ok(err instanceof Error);
  assert.equal(err.name, 'TumblrError');
  assert.equal(err.message, 'Not Found');
  assert.equal(err.status, 404);
  assert.equal(err.code, 1);
  assert.deepEqual(err.meta, { status: 404, msg: 'Not Found' });
  assert.deepEqual(err.errors, [{ title: 'Not Found' }]);
  assert.deepEqual(err.rateLimit, { remaining: 0 });
});

test('TumblrError preserves cause', () => {
  const cause = new Error('socket reset');
  const err = new TumblrError('network failure', { cause });
  assert.equal(err.cause, cause);
});
