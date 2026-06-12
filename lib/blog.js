import { oldestTimestamp } from './paginate.js';
import { list, single, splitOptions } from './resource.js';

const POST_TYPES = [
  'text',
  'quote',
  'link',
  'answer',
  'video',
  'audio',
  'photo'
];

const AVATAR_SIZES = new Set([16, 24, 30, 40, 48, 64, 96, 128, 512]);
const DEFAULT_AVATAR_SIZE = 64;

const POST_ID = /^\d+$/;

function notesCursor(notes) {
  const oldest = oldestTimestamp(notes);

  return oldest === undefined ? undefined : { before_timestamp: oldest };
}

function createAvatar(ctx, base) {
  return async (size = DEFAULT_AVATAR_SIZE, options) => {
    if (!AVATAR_SIZES.has(size)) {
      throw new TypeError(
        `avatar size must be one of ${[...AVATAR_SIZES].join(', ')}`
      );
    }

    const { params, call } = splitOptions(options);
    const result = await ctx.request(`${base}/avatar/${size}`, params, {
      ...call,
      followRedirect: false
    });

    return result?.location;
  };
}

function createPost(ctx, base) {
  return async (id, options) => {
    if (!POST_ID.test(String(id))) {
      throw new TypeError('post(id) requires a numeric post id');
    }

    const { params, call } = splitOptions(options);
    const response = await ctx.request(
      `${base}/posts`,
      { ...params, id },
      call
    );

    return response?.posts?.[0] ?? null;
  };
}

export function createBlog(ctx, host) {
  if (!host) {
    throw new TypeError('blog(host) requires a blog identifier');
  }

  const base = `blog/${host}`;

  const posts = list(ctx, (options) => {
    const { params, call } = splitOptions(options);
    const { type, ...rest } = params;
    const path = type ? `${base}/posts/${type}` : `${base}/posts`;

    return { path, params: rest, call };
  });

  const notes = list(
    ctx,
    (id, options) => {
      if (!POST_ID.test(String(id))) {
        throw new TypeError('notes(id) requires a numeric post id');
      }
      const { params, call } = splitOptions(options);

      return { path: `${base}/notes`, params: { ...params, id }, call };
    },
    notesCursor
  );

  const blog = {
    info: single(ctx, `${base}/info`),
    avatar: createAvatar(ctx, base),
    post: createPost(ctx, base),
    posts,
    notes,
    likes: list(ctx, `${base}/likes`),
    followers: list(ctx, `${base}/followers`),
    following: list(ctx, `${base}/following`)
  };

  for (const type of POST_TYPES) {
    blog[type] = list(ctx, `${base}/posts/${type}`);
  }

  return blog;
}
