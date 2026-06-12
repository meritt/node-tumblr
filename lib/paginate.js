const MAX_PAGES = 100;

function pickList(body) {
  if (Array.isArray(body)) {
    return body;
  }

  return (
    body?.posts ??
    body?.liked_posts ??
    body?.notes ??
    body?.users ??
    body?.blogs ??
    body?.tagged ??
    []
  );
}

export function oldestTimestamp(items) {
  let oldest;
  for (const item of items) {
    const ts = item?.timestamp;
    if (typeof ts === 'number' && (oldest === undefined || ts < oldest)) {
      oldest = ts;
    }
  }

  return oldest;
}

function nextCursor(body, list, offset, cursor) {
  if (body?._links) {
    return body._links.next?.query_params;
  }

  if (cursor) {
    return cursor(list);
  }

  if (Array.isArray(body)) {
    const oldest = oldestTimestamp(list);

    return oldest === undefined ? undefined : { before: oldest };
  }

  return { offset };
}

export function firstPage(ctx, path, params = {}, call = {}) {
  return ctx.request(path, params, call);
}

export async function* paginate(ctx, path, params = {}, call = {}, cursor) {
  const seenCursors = new Set();
  const seenIds = new Set();

  let position = {};
  let offset = Number(params.offset ?? 0);
  let pages = 0;

  for (;;) {
    const body = await ctx.request(path, { ...params, ...position }, call);
    const list = pickList(body);

    let fresh = 0;
    for (const item of list) {
      const id = item?.id;

      if (id != null) {
        if (seenIds.has(id)) {
          continue;
        }
        seenIds.add(id);
      }

      fresh += 1;
      yield item;
    }

    pages += 1;
    offset += list.length;

    const next = nextCursor(body, list, offset, cursor);
    const key = next && JSON.stringify(next);

    if (
      pages >= MAX_PAGES ||
      list.length === 0 ||
      fresh === 0 ||
      !next ||
      seenCursors.has(key)
    ) {
      return;
    }

    seenCursors.add(key);
    position = next;
  }
}
