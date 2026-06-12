import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { inspect } from 'node:util';

import { TumblrError } from '../lib/errors.js';
import { buildUrl, request, DEFAULT_BASE_URL } from '../lib/request.js';
import { stubFetch } from './helpers.js';

const APIKEY = { type: 'apikey', apiKey: 'KEY' };

afterEach(() => mock.restoreAll());

function envelope(response, meta = { status: 200, msg: 'OK' }) {
  return { meta, response };
}

test('buildUrl joins base + path and appends params, skipping nullish', () => {
  const url = buildUrl(
    'https://api.tumblr.com/v2/',
    '/blog/x.tumblr.com/posts',
    {
      limit: 5,
      offset: undefined,
      type: null
    }
  );
  assert.equal(
    url.origin + url.pathname,
    'https://api.tumblr.com/v2/blog/x.tumblr.com/posts'
  );
  assert.equal(url.searchParams.get('limit'), '5');
  assert.equal(url.searchParams.has('offset'), false);
  assert.equal(url.searchParams.has('type'), false);
});

test('request unwraps body.response and sends api_key, no User-Agent', async () => {
  const fetch = stubFetch({
    status: 200,
    body: envelope({ blog: { name: 'x' } })
  });
  const data = await request(
    DEFAULT_BASE_URL,
    'blog/x.tumblr.com/info',
    {},
    { strategy: APIKEY }
  );
  assert.deepEqual(data, { blog: { name: 'x' } });
  assert.equal(fetch.calls[0].url.searchParams.get('api_key'), 'KEY');
  assert.equal(fetch.calls[0].init.headers['User-Agent'], undefined);
});

test('request throws TumblrError on meta.status >= 400', async () => {
  stubFetch({
    status: 404,
    body: { meta: { status: 404, msg: 'Not Found' }, response: {} }
  });
  await assert.rejects(
    () => request(DEFAULT_BASE_URL, 'blog/nope/info', {}, { strategy: APIKEY }),
    (err) => {
      assert.ok(err instanceof TumblrError);
      assert.equal(err.message, 'Not Found');
      assert.equal(err.status, 404);
      assert.deepEqual(err.meta, { status: 404, msg: 'Not Found' });
      return true;
    }
  );
});

test('request falls back to HTTP status when the body has no meta', async () => {
  stubFetch({ status: 500, body: {} });
  await assert.rejects(
    () => request(DEFAULT_BASE_URL, 'blog/x/info', {}, { strategy: APIKEY }),
    (err) => {
      assert.ok(err instanceof TumblrError);
      assert.equal(err.message, 'HTTP 500');
      assert.equal(err.status, 500);
      return true;
    }
  );
});

test('request wraps network failures in TumblrError', async () => {
  mock.method(globalThis, 'fetch', async () => {
    throw new Error('ECONNREFUSED');
  });
  await assert.rejects(
    () => request(DEFAULT_BASE_URL, 'blog/x/info', {}, { strategy: APIKEY }),
    (err) => err instanceof TumblrError
  );
});

test('request maps a TimeoutError to a clear message', async () => {
  mock.method(globalThis, 'fetch', async () => {
    const error = new Error('timed out');
    error.name = 'TimeoutError';
    throw error;
  });
  await assert.rejects(
    () =>
      request(
        DEFAULT_BASE_URL,
        'blog/x/info',
        {},
        {
          strategy: APIKEY,
          timeout: 50
        }
      ),
    (err) => {
      assert.ok(err instanceof TumblrError);
      assert.match(err.message, /timed out after 50ms/);
      return true;
    }
  );
});

test('request rejects a 2xx response with a non-JSON body', async () => {
  mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    headers: new Headers(),
    async json() {
      throw new SyntaxError('Unexpected token <');
    }
  }));
  await assert.rejects(
    () => request(DEFAULT_BASE_URL, 'blog/x/info', {}, { strategy: APIKEY }),
    (err) => {
      assert.ok(err instanceof TumblrError);
      assert.match(err.message, /Invalid JSON/);
      assert.equal(err.status, 200);
      return true;
    }
  );
});

test('request redacts api_key and never leaks it via cause or inspect', async () => {
  mock.method(globalThis, 'fetch', async (input) => {
    throw new Error(`connect to ${input} failed`);
  });
  await assert.rejects(
    () => request(DEFAULT_BASE_URL, 'blog/x/info', {}, { strategy: APIKEY }),
    (err) => {
      assert.doesNotMatch(err.message, /KEY/);
      assert.match(err.message, /api_key=REDACTED/);
      assert.doesNotMatch(inspect(err, { depth: null }), /=KEY/);
      return true;
    }
  );
});

test('request surfaces rate-limit headers and attaches them to errors', async () => {
  let seen;
  stubFetch({
    status: 429,
    body: { meta: { status: 429, msg: 'Limit Exceeded' }, response: {} },
    headers: {
      'x-ratelimit-perhour-limit': '1000',
      'x-ratelimit-perhour-remaining': '0',
      'x-ratelimit-perhour-reset': '3600'
    }
  });
  await assert.rejects(
    () =>
      request(
        DEFAULT_BASE_URL,
        'blog/x/info',
        {},
        {
          strategy: APIKEY,
          onRateLimit: (rl) => (seen = rl)
        }
      ),
    (err) => {
      assert.equal(err.status, 429);
      assert.equal(err.rateLimit.limit, 1000);
      assert.equal(err.rateLimit.remaining, 0);
      assert.ok(err.rateLimit.reset instanceof Temporal.Instant);
      return true;
    }
  );
  assert.equal(seen.remaining, 0);
});

test('request returns the redirect location when followRedirect is false', async () => {
  stubFetch({
    status: 302,
    headers: { location: 'https://64.media.tumblr.com/avatar_128.png' }
  });
  const result = await request(
    DEFAULT_BASE_URL,
    'blog/x.tumblr.com/avatar/128',
    {},
    { strategy: APIKEY, followRedirect: false }
  );
  assert.deepEqual(result, {
    status: 302,
    location: 'https://64.media.tumblr.com/avatar_128.png'
  });
});

test('request composes a timeout with an external abort signal', async () => {
  const fetch = stubFetch({
    status: 200,
    body: { meta: { status: 200, msg: 'OK' }, response: {} }
  });
  const controller = new AbortController();
  await request(
    DEFAULT_BASE_URL,
    'blog/x/info',
    {},
    {
      strategy: APIKEY,
      timeout: 1000,
      signal: controller.signal
    }
  );
  assert.ok(fetch.calls[0].init.signal instanceof AbortSignal);
});
