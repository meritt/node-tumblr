import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';

import { Tumblr } from '../lib/client.js';
import { stubFetch } from './helpers.js';

afterEach(() => mock.restoreAll());

const API_KEY = { consumer_key: 'CK' };
const OAUTH1 = {
  consumer_key: 'CK',
  consumer_secret: 'CS',
  token: 'TK',
  token_secret: 'TS'
};
const BEARER = { access_token: 'AT' };

function ok(response, headers = {}) {
  return {
    status: 200,
    body: { meta: { status: 200, msg: 'OK' }, response },
    headers
  };
}

test('constructor requires credentials', () => {
  assert.throws(() => new Tumblr({ env: {} }), TypeError);
});

test('constructor validates timeout', () => {
  assert.throws(() => new Tumblr({ ...API_KEY, timeout: 1.5 }), TypeError);
  assert.throws(
    () => new Tumblr({ ...API_KEY, timeout: Number.POSITIVE_INFINITY }),
    TypeError
  );
  assert.throws(() => new Tumblr({ ...API_KEY, timeout: -1 }), RangeError);
  assert.ok(new Tumblr({ ...API_KEY, timeout: 0 }));
});

test('reads credentials from env', async () => {
  const fetch = stubFetch(ok({ blog: { name: 'x' } }));
  const tumblr = new Tumblr({ env: { TUMBLR_CONSUMER_KEY: 'ENVCK' } });
  await tumblr.blog('x.tumblr.com').info();
  assert.equal(fetch.calls[0].url.searchParams.get('api_key'), 'ENVCK');
});

test('api-key auth puts api_key in the query, no Authorization', async () => {
  const fetch = stubFetch(ok({ blog: {} }));
  const tumblr = new Tumblr(API_KEY);
  await tumblr.blog('x.tumblr.com').info();
  assert.equal(fetch.calls[0].url.searchParams.get('api_key'), 'CK');
  assert.equal(fetch.calls[0].init.headers.Authorization, undefined);
});

test('bearer auth sets Authorization: Bearer, no api_key', async () => {
  const fetch = stubFetch(ok({ user: {} }));
  const tumblr = new Tumblr(BEARER);
  await tumblr.user().info();
  assert.equal(fetch.calls[0].init.headers.Authorization, 'Bearer AT');
  assert.equal(fetch.calls[0].url.searchParams.has('api_key'), false);
});

test('oauth1 auth signs the request, no api_key', async () => {
  const fetch = stubFetch(ok({ user: {} }));
  const tumblr = new Tumblr(OAUTH1);
  await tumblr.user().info();
  assert.match(fetch.calls[0].init.headers.Authorization, /^OAuth /);
  assert.match(fetch.calls[0].init.headers.Authorization, /oauth_signature="/);
  assert.equal(fetch.calls[0].url.searchParams.has('api_key'), false);
});

test('rateLimit getter reflects the last response headers', async () => {
  stubFetch(
    ok(
      { blog: {} },
      {
        'x-ratelimit-perhour-limit': '1000',
        'x-ratelimit-perhour-remaining': '42'
      }
    )
  );
  const tumblr = new Tumblr(API_KEY);
  assert.equal(tumblr.rateLimit, undefined);
  await tumblr.blog('x.tumblr.com').info();
  assert.equal(tumblr.rateLimit.remaining, 42);
  assert.equal(tumblr.rateLimit.limit, 1000);
});

test('asyncDispose clears cached state', async () => {
  stubFetch(ok({ blog: {} }, { 'x-ratelimit-perhour-remaining': '42' }));
  const tumblr = new Tumblr(API_KEY);
  await tumblr.blog('x').info();
  assert.equal(tumblr.rateLimit.remaining, 42);
  await tumblr[Symbol.asyncDispose]();
  assert.equal(tumblr.rateLimit, undefined);
});
