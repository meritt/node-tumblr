import assert from 'node:assert/strict';
import { test } from 'node:test';

import * as api from '../lib/index.js';

test('public surface is exported', () => {
  assert.equal(typeof api.Tumblr, 'function');
  assert.equal(typeof api.TumblrError, 'function');
});

test('legacy class names are no longer exported', () => {
  assert.equal(api.Blog, undefined);
  assert.equal(api.User, undefined);
  assert.equal(api.Tagged, undefined);
});
