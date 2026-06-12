import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';

import { Tumblr } from '../lib/client.js';
import { stubFetch } from './helpers.js';

afterEach(() => mock.restoreAll());

const client = () => new Tumblr({ consumer_key: 'CK' });

test('tagged(tag) requests /tagged with the tag and api_key', async () => {
  const fetch = stubFetch({
    status: 200,
    body: { meta: { status: 200 }, response: [{ id: 1 }] }
  });
  const data = await client().tagged('art', { limit: 5 });
  assert.deepEqual(data, [{ id: 1 }]);
  assert.match(fetch.calls[0].url.pathname, /\/v2\/tagged$/);
  assert.equal(fetch.calls[0].url.searchParams.get('tag'), 'art');
  assert.equal(fetch.calls[0].url.searchParams.get('limit'), '5');
  assert.equal(fetch.calls[0].url.searchParams.get('api_key'), 'CK');
});

test('tagged() rejects a missing tag', async () => {
  stubFetch({ status: 200, body: { meta: { status: 200 }, response: [] } });
  await assert.rejects(() => client().tagged(), TypeError);
});

test('tagged.each() auto-paginates by the last post timestamp', async () => {
  const pages = [
    {
      status: 200,
      body: {
        meta: { status: 200 },
        response: [
          { id: 1, timestamp: 100 },
          { id: 2, timestamp: 90 }
        ]
      }
    },
    {
      status: 200,
      body: { meta: { status: 200 }, response: [{ id: 3, timestamp: 80 }] }
    },
    { status: 200, body: { meta: { status: 200 }, response: [] } }
  ];
  let i = 0;
  const fetch = stubFetch(() => pages[i++]);
  const ids = [];
  for await (const post of client().tagged.each('art')) {
    ids.push(post.id);
  }
  assert.deepEqual(ids, [1, 2, 3]);
  assert.equal(fetch.calls[1].url.searchParams.get('before'), '90');
});

test('tagged.each() throws synchronously on a missing tag', () => {
  assert.throws(() => client().tagged.each(), TypeError);
});
