import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';

import { Tumblr } from '../lib/client.js';
import { stubFetch } from './helpers.js';

afterEach(() => mock.restoreAll());

function ok(response) {
  return { status: 200, body: { meta: { status: 200, msg: 'OK' }, response } };
}

test('info() requests /user/info', async () => {
  const fetch = stubFetch(ok({ user: { name: 'me' } }));
  const data = await new Tumblr({ access_token: 'AT' }).user().info();
  assert.deepEqual(data, { user: { name: 'me' } });
  assert.match(fetch.calls[0].url.pathname, /\/v2\/user\/info$/);
});

test('limits() requests /user/limits', async () => {
  const fetch = stubFetch(ok({ user: { name: 'me' } }));
  await new Tumblr({ access_token: 'AT' }).user().limits();
  assert.match(fetch.calls[0].url.pathname, /\/v2\/user\/limits$/);
});

test('dashboard() requests /user/dashboard and forwards options', async () => {
  const fetch = stubFetch(ok({ posts: [] }));
  await new Tumblr({ access_token: 'AT' }).user().dashboard({ limit: 10 });
  assert.match(fetch.calls[0].url.pathname, /\/v2\/user\/dashboard$/);
  assert.equal(fetch.calls[0].url.searchParams.get('limit'), '10');
});

test('following() requests /user/following', async () => {
  const fetch = stubFetch(ok({ blogs: [] }));
  await new Tumblr({ access_token: 'AT' }).user().following();
  assert.match(fetch.calls[0].url.pathname, /\/v2\/user\/following$/);
});

test('user requests carry the bearer token', async () => {
  const fetch = stubFetch(ok({ user: {} }));
  await new Tumblr({ access_token: 'AT' }).user().info();
  assert.equal(fetch.calls[0].init.headers.Authorization, 'Bearer AT');
});

test('dashboard.each() auto-paginates the feed', async () => {
  const pages = [
    ok({
      posts: [{ id: 1 }],
      _links: { next: { query_params: { offset: 1 } } }
    }),
    ok({ posts: [{ id: 2 }], _links: {} })
  ];
  let i = 0;
  stubFetch(() => pages[i++]);
  const ids = [];
  for await (const post of new Tumblr({ access_token: 'AT' })
    .user()
    .dashboard.each()) {
    ids.push(post.id);
  }
  assert.deepEqual(ids, [1, 2]);
});
