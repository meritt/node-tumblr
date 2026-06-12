import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';

import { Tumblr } from '../lib/client.js';
import { stubFetch } from './helpers.js';

afterEach(() => mock.restoreAll());

const client = () => new Tumblr({ consumer_key: 'CK' });

function ok(response) {
  return { status: 200, body: { meta: { status: 200, msg: 'OK' }, response } };
}

test('info() requests /blog/{host}/info and unwraps the response', async () => {
  const fetch = stubFetch(ok({ blog: { name: 'staff' } }));
  const data = await client().blog('staff.tumblr.com').info();
  assert.deepEqual(data, { blog: { name: 'staff' } });
  assert.match(
    fetch.calls[0].url.pathname,
    /\/v2\/blog\/staff\.tumblr\.com\/info$/
  );
});

test('posts() returns the full response and forwards limit', async () => {
  const fetch = stubFetch(ok({ blog: {}, posts: [{ id: 1 }], total_posts: 1 }));
  const data = await client().blog('x').posts({ limit: 5 });
  assert.deepEqual(data.posts, [{ id: 1 }]);
  assert.equal(fetch.calls[0].url.searchParams.get('limit'), '5');
  assert.match(fetch.calls[0].url.pathname, /\/posts$/);
});

test('posts({ type }) uses the legacy /posts/{type} path segment', async () => {
  const fetch = stubFetch(ok({ posts: [] }));
  await client().blog('x').posts({ type: 'photo', limit: 2 });
  assert.match(fetch.calls[0].url.pathname, /\/posts\/photo$/);
  assert.equal(fetch.calls[0].url.searchParams.has('type'), false);
  assert.equal(fetch.calls[0].url.searchParams.get('limit'), '2');
});

test('type shortcuts hit /posts/{type}', async () => {
  const fetch = stubFetch(ok({ posts: [] }));
  await client().blog('x').video({ limit: 1 });
  assert.match(fetch.calls[0].url.pathname, /\/posts\/video$/);
});

test('avatar() returns the redirect location, defaulting to size 64', async () => {
  const fetch = stubFetch({
    status: 302,
    headers: { location: 'https://cdn/av64.png' }
  });
  const url = await client().blog('x').avatar();
  assert.equal(url, 'https://cdn/av64.png');
  assert.match(fetch.calls[0].url.pathname, /\/avatar\/64$/);
});

test('avatar(size) uses the requested size', async () => {
  const fetch = stubFetch({
    status: 302,
    headers: { location: 'https://cdn/av512.png' }
  });
  const url = await client().blog('x').avatar(512);
  assert.equal(url, 'https://cdn/av512.png');
  assert.match(fetch.calls[0].url.pathname, /\/avatar\/512$/);
});

test('avatar() rejects an unsupported size', async () => {
  stubFetch({ status: 302, headers: { location: 'x' } });
  await assert.rejects(() => client().blog('x').avatar(13), TypeError);
});

test('posts.each() auto-paginates across pages', async () => {
  const pages = [
    ok({
      posts: [{ id: 1 }, { id: 2 }],
      _links: { next: { query_params: { offset: 2 } } }
    }),
    ok({ posts: [{ id: 3 }], _links: {} })
  ];
  let i = 0;
  const fetch = stubFetch(() => pages[i++]);
  const ids = [];
  for await (const post of client().blog('x').posts.each({ limit: 2 })) {
    ids.push(post.id);
  }
  assert.deepEqual(ids, [1, 2, 3]);
  assert.equal(fetch.calls[1].url.searchParams.get('offset'), '2');
});

test('avatar(undefined, options) keeps the default size and forwards options', async () => {
  const fetch = stubFetch({
    status: 302,
    headers: { location: 'https://cdn/av64.png' }
  });
  const url = await client().blog('x').avatar(undefined, { timeout: 5000 });
  assert.equal(url, 'https://cdn/av64.png');
  assert.match(fetch.calls[0].url.pathname, /\/avatar\/64$/);
});

test('post(id) returns the single post object', async () => {
  const fetch = stubFetch(
    ok({ blog: {}, posts: [{ id: 42, id_string: '42' }], total_posts: 1 })
  );
  const post = await client().blog('x').post(42);
  assert.deepEqual(post, { id: 42, id_string: '42' });
  assert.equal(fetch.calls[0].url.searchParams.get('id'), '42');
  assert.match(fetch.calls[0].url.pathname, /\/posts$/);
});

test('post() rejects a non-numeric id', async () => {
  stubFetch(ok({ posts: [] }));
  await assert.rejects(() => client().blog('x').post('abc'), TypeError);
});

test('notes(id) requests /notes with the post id and forwards mode', async () => {
  const fetch = stubFetch(
    ok({ notes: [{ type: 'like', timestamp: 5 }], total_notes: 1 })
  );
  const r = await client().blog('x').notes(42, { mode: 'likes' });
  assert.equal(r.total_notes, 1);
  assert.match(fetch.calls[0].url.pathname, /\/notes$/);
  assert.equal(fetch.calls[0].url.searchParams.get('id'), '42');
  assert.equal(fetch.calls[0].url.searchParams.get('mode'), 'likes');
});

test('notes.each() paginates by before_timestamp', async () => {
  const pages = [
    ok({
      notes: [
        { type: 'like', timestamp: 100 },
        { type: 'like', timestamp: 90 }
      ]
    }),
    ok({ notes: [{ type: 'like', timestamp: 80 }] }),
    ok({ notes: [] })
  ];
  let i = 0;
  const fetch = stubFetch(() => pages[i++]);
  const collected = [];
  for await (const note of client().blog('x').notes.each(42)) {
    collected.push(note);
  }
  assert.equal(collected.length, 3);
  assert.equal(fetch.calls[1].url.searchParams.get('before_timestamp'), '90');
});

test('following() requests /blog/{host}/following', async () => {
  const fetch = stubFetch(ok({ blogs: [{ name: 'a' }], total_blogs: 1 }));
  const r = await client().blog('x').following();
  assert.equal(r.total_blogs, 1);
  assert.match(fetch.calls[0].url.pathname, /\/blog\/x\/following$/);
});

test('blog() requires a host', () => {
  assert.throws(() => client().blog(), TypeError);
});
