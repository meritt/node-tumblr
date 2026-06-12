import assert from 'node:assert/strict';
import { test } from 'node:test';

import { firstPage, paginate } from '../lib/paginate.js';

function fakeCtx(handler) {
  const calls = [];
  let i = 0;
  const request = async (path, params) => {
    calls.push({ path, params });
    const body =
      typeof handler === 'function' ? handler(params, i) : handler[i];
    i += 1;
    return body;
  };
  return { calls, request };
}

function collect(iterable) {
  return Array.fromAsync(iterable);
}

const idsOf = (items) => items.map((item) => item.id);

function minTimestampCursor(list) {
  let min;
  for (const item of list) {
    if (min === undefined || item.timestamp < min) {
      min = item.timestamp;
    }
  }
  return min === undefined ? undefined : { before_timestamp: min };
}

test('follows _links.next.query_params and preserves base params', async () => {
  const ctx = fakeCtx([
    {
      posts: [{ id: 1 }, { id: 2 }],
      _links: { next: { query_params: { offset: 2 } } }
    },
    { posts: [{ id: 3 }], _links: {} }
  ]);
  const posts = await collect(paginate(ctx, 'blog/x/posts', { limit: 2 }));
  assert.deepEqual(idsOf(posts), [1, 2, 3]);
  assert.equal(ctx.calls[1].params.offset, 2);
  assert.equal(ctx.calls[1].params.limit, 2);
});

test('stops at the MAX_PAGES cap on an endless feed', async () => {
  const ctx = fakeCtx((params) => {
    const offset = Number(params.offset ?? 0);
    return {
      posts: [{ id: offset }],
      _links: { next: { query_params: { offset: offset + 1 } } }
    };
  });
  const items = await collect(paginate(ctx, 'p', {}));
  assert.equal(items.length, 100);
  assert.equal(ctx.calls.length, 100);
});

test('stops on an empty page', async () => {
  const ctx = fakeCtx([
    { posts: [], _links: { next: { query_params: { offset: 2 } } } }
  ]);
  const items = await collect(paginate(ctx, 'p', {}));
  assert.equal(items.length, 0);
  assert.equal(ctx.calls.length, 1);
});

test('de-duplicates ids and stops when a page adds nothing new', async () => {
  // server ignores the cursor and returns the same posts every page
  const ctx = fakeCtx(() => ({
    posts: [{ id: 1 }],
    _links: { next: { query_params: { offset: 5 } } }
  }));
  const items = await collect(paginate(ctx, 'p', {}));
  assert.deepEqual(idsOf(items), [1]);
  assert.equal(ctx.calls.length, 2);
});

test('de-dupes a non-advancing enveloped feed (dashboard-style)', async () => {
  // no _links, server ignores offset -> same posts; must not yield duplicates
  const ctx = fakeCtx(() => ({ posts: [{ id: 1 }, { id: 2 }] }));
  const items = await collect(paginate(ctx, 'user/dashboard', {}));
  assert.deepEqual(idsOf(items), [1, 2]);
  assert.equal(ctx.calls.length, 2);
});

test('falls back to offset paging when there is no _links', async () => {
  const ctx = fakeCtx((params) => {
    const offset = Number(params.offset ?? 0);
    if (offset >= 4) {
      return { posts: [] };
    }
    return { posts: [{ id: offset }, { id: offset + 1 }] };
  });
  const items = await collect(paginate(ctx, 'blog/x/posts', {}));
  assert.deepEqual(idsOf(items), [0, 1, 2, 3]);
});

test('paginates array responses (tagged) by the oldest timestamp', async () => {
  const ctx = fakeCtx([
    [
      { id: 1, timestamp: 100 },
      { id: 2, timestamp: 90 }
    ],
    [{ id: 3, timestamp: 80 }],
    []
  ]);
  const posts = await collect(paginate(ctx, 'tagged', { tag: 'art' }));
  assert.deepEqual(idsOf(posts), [1, 2, 3]);
  assert.equal(ctx.calls[1].params.before, 90);
  assert.equal(ctx.calls[1].params.tag, 'art');
});

test('array cursor uses the page minimum timestamp, not the last item', async () => {
  const ctx = fakeCtx([
    [
      { id: 1, timestamp: 90 },
      { id: 2, timestamp: 80 },
      { id: 3, timestamp: 100 }
    ],
    []
  ]);
  await collect(paginate(ctx, 'tagged', {}));
  assert.equal(ctx.calls[1].params.before, 80);
});

test('pickList reads liked_posts for likes endpoints', async () => {
  const ctx = fakeCtx([{ liked_posts: [{ id: 1 }], _links: {} }]);
  const posts = await collect(paginate(ctx, 'blog/x/likes', {}));
  assert.deepEqual(idsOf(posts), [1]);
});

test('pickList reads notes and a custom cursor drives before_timestamp', async () => {
  const ctx = fakeCtx([
    { notes: [{ timestamp: 100 }, { timestamp: 90 }] },
    { notes: [{ timestamp: 80 }] },
    { notes: [] }
  ]);
  const all = await collect(
    paginate(ctx, 'blog/x/notes', {}, {}, minTimestampCursor)
  );
  assert.equal(all.length, 3);
  assert.equal(ctx.calls[1].params.before_timestamp, 90);
  assert.equal(ctx.calls[2].params.before_timestamp, 80);
});

test('firstPage returns the raw unwrapped response', async () => {
  const ctx = fakeCtx([
    { blog: { name: 'x' }, posts: [{ id: 1 }], total_posts: 1 }
  ]);
  const page = await firstPage(ctx, 'blog/x/posts', { limit: 1 });
  assert.deepEqual(page, {
    blog: { name: 'x' },
    posts: [{ id: 1 }],
    total_posts: 1
  });
});
