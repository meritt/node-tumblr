import assert from 'node:assert/strict';
import { test } from 'node:test';

import { applyAuth, resolveAuth } from '../lib/auth.js';

const OAUTH1 = {
  consumer_key: 'ck',
  consumer_secret: 'cs',
  token: 'tk',
  token_secret: 'ts'
};

test('selects oauth1 when all four fields are present', () => {
  const strategy = resolveAuth(OAUTH1, {});
  assert.equal(strategy.type, 'oauth1');
  assert.deepEqual(strategy.credentials, OAUTH1);
});

test('selects bearer for an access_token', () => {
  const strategy = resolveAuth({ access_token: 'AT' }, {});
  assert.equal(strategy.type, 'bearer');
  assert.equal(strategy.accessToken, 'AT');
});

test('selects apikey for a lone consumer_key', () => {
  const strategy = resolveAuth({ consumer_key: 'ck' }, {});
  assert.equal(strategy.type, 'apikey');
  assert.equal(strategy.apiKey, 'ck');
});

test('throws on partial OAuth 1.0a credentials', () => {
  assert.throws(
    () =>
      resolveAuth(
        { consumer_key: 'ck', consumer_secret: 'cs', token: 'tk' },
        {}
      ),
    TypeError
  );
});

test('throws when no credentials are present', () => {
  assert.throws(() => resolveAuth({}, {}), TypeError);
});

test('reads credentials from env', () => {
  const strategy = resolveAuth({}, { TUMBLR_CONSUMER_KEY: 'envck' });
  assert.equal(strategy.type, 'apikey');
  assert.equal(strategy.apiKey, 'envck');
});

test('an explicit empty consumer_key does not fall back to env', () => {
  assert.throws(
    () => resolveAuth({ consumer_key: '' }, { TUMBLR_CONSUMER_KEY: 'envck' }),
    TypeError
  );
});

test('applyAuth(apikey) adds api_key to the query, no auth header', async () => {
  const url = new URL('https://api.tumblr.com/v2/blog/x/info');
  const { headers } = await applyAuth(
    { type: 'apikey', apiKey: 'KEY' },
    'GET',
    url
  );
  assert.equal(url.searchParams.get('api_key'), 'KEY');
  assert.deepEqual(headers, {});
});

test('applyAuth(bearer) sets Authorization: Bearer, no api_key', async () => {
  const url = new URL('https://api.tumblr.com/v2/user/info');
  const { headers } = await applyAuth(
    { type: 'bearer', accessToken: 'AT' },
    'GET',
    url
  );
  assert.equal(headers.Authorization, 'Bearer AT');
  assert.equal(url.searchParams.has('api_key'), false);
});

test('applyAuth(oauth1) signs and sets Authorization: OAuth, no api_key', async () => {
  const url = new URL('https://api.tumblr.com/v2/user/info');
  const { headers } = await applyAuth(
    { type: 'oauth1', credentials: OAUTH1 },
    'GET',
    url
  );
  assert.match(headers.Authorization, /^OAuth /);
  assert.match(headers.Authorization, /oauth_signature="/);
  assert.equal(url.searchParams.has('api_key'), false);
});
