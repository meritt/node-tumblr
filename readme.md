# tumblr

[![NPM version][npm-image]][npm-url]
[![Build status][github-actions-image]][github-actions-url]
[![Coverage status][coveralls-image]][coveralls-url]
[![Dependency status][libraries-image]][libraries-url]

A small, zero-dependency, read-only client for the [Tumblr API v2](https://www.tumblr.com/docs/en/api/v2). Methods return Tumblr's unwrapped `response`; failures throw `TumblrError`.

## Requirements

- Node.js ≥ 26.3
- A Tumblr API key for public reads, or OAuth credentials for user-scoped endpoints

## Installation

```bash
pnpm add tumblr
# or: npm install tumblr
```

## Usage

```js
import { Tumblr } from 'tumblr';

const tumblr = new Tumblr({ consumer_key: process.env.TUMBLR_CONSUMER_KEY });
const blog = tumblr.blog('staff.tumblr.com');

const profile = await blog.info();
// { blog: { name, title, posts, updated, description, ... } }

const { posts } = await blog.posts({ limit: 5 });
const photos = await blog.photo({ limit: 5 });
const url = await blog.avatar(128);
const tagged = await tumblr.tagged('art', { limit: 5 });

for await (const post of blog.posts.each()) {
  console.log(post.id_string, post.timestamp);
}
```

User-scoped endpoints require OAuth:

```js
const tumblr = new Tumblr({
  consumer_key,
  consumer_secret,
  token,
  token_secret
});

const { user } = await tumblr.user().info();

for await (const post of tumblr.user().dashboard.each()) {
  console.log(post.blog_name, post.id_string);
}
```

## Authentication

The strategy is selected from the credentials passed to the constructor:

| Credentials                                                   | Strategy   | Transport                          |
| ------------------------------------------------------------- | ---------- | ---------------------------------- |
| `consumer_key`                                                | API key    | `api_key` query parameter          |
| `access_token`                                                | OAuth 2.0  | `Authorization: Bearer`            |
| `consumer_key` + `consumer_secret` + `token` + `token_secret` | OAuth 1.0a | `Authorization: OAuth` (HMAC-SHA1) |

Incomplete OAuth 1.0a credentials throw `TypeError`. Each field falls back to an environment variable — `TUMBLR_CONSUMER_KEY`, `TUMBLR_CONSUMER_SECRET`, `TUMBLR_TOKEN`, `TUMBLR_TOKEN_SECRET`, `TUMBLR_ACCESS_TOKEN` — read from `process.env` or a custom `env` object.

```js
new Tumblr({ consumer_key }); // explicit
new Tumblr(); // from process.env.TUMBLR_*
new Tumblr({ env: secrets }); // from a custom source
```

## Client

```js
new Tumblr(options);
```

| Option        | Default                      | Meaning                                                                        |
| ------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| _credentials_ | `env.TUMBLR_*`               | `consumer_key` / `consumer_secret` / `token` / `token_secret` / `access_token` |
| `env`         | `process.env`                | Source for the `TUMBLR_*` fallbacks                                            |
| `baseUrl`     | `https://api.tumblr.com/v2/` | API host                                                                       |
| `timeout`     | `30000`                      | Per-request timeout in ms; `0` disables                                        |

`tumblr.rateLimit` returns the rate limit of the most recent request as `{ limit, remaining, reset }`, where `reset` is a `Temporal.Instant`, or `undefined` before the first request.

`Tumblr` implements `Symbol.asyncDispose` for use with `await using`.

## blog(host)

| Method                                                             | Returns                          |
| ------------------------------------------------------------------ | -------------------------------- |
| `info()`                                                           | `{ blog }`                       |
| `avatar(size = 64)`                                                | avatar image URL                 |
| `post(id)`                                                         | a single post, or `null`         |
| `posts(options)`                                                   | `{ blog, posts, total_posts }`   |
| `text` / `quote` / `link` / `answer` / `video` / `audio` / `photo` | posts of that type               |
| `notes(id, options)`                                               | `{ notes, total_notes, ... }`    |
| `likes(options)`                                                   | `{ liked_posts, liked_count }`   |
| `followers(options)`                                               | `{ users, total_users }` — OAuth |
| `following(options)`                                               | `{ blogs, total_blogs }` — OAuth |

`avatar` resolves to the image URL for `size` {16, 24, 30, 40, 48, 64, 96, 128, 512}.
`notes(id, { mode })` accepts a `mode` of `all`, `likes`, `conversation`, `rollup`, or `reblogs_with_tags`.

## user()

| Method               | Returns           |
| -------------------- | ----------------- |
| `info()`             | `{ user }`        |
| `limits()`           | API usage limits  |
| `dashboard(options)` | `{ posts }`       |
| `likes(options)`     | `{ liked_posts }` |
| `following(options)` | `{ blogs }`       |

All `user()` methods require OAuth.

## tagged(tag, options)

Returns an array of posts tagged with `tag`.

## Pagination

Each list method — `posts`, `notes`, `likes`, `followers`, `following`, `dashboard`, `tagged`, and the type shortcuts — exposes an `.each` companion returning an `AsyncIterable` that follows Tumblr's cursors to the last page:

```js
for await (const post of tumblr.tagged.each('art')) {
  // ...
}
```

## Options

Method `options` carry through to the request as query parameters (`limit`, `offset`, `before`, `after`, `tag`, `npf`, `filter`, `reblog_info`, `notes_info`, …), plus two wrapper keys:

| Key       | Meaning                                                    |
| --------- | ---------------------------------------------------------- |
| `signal`  | `AbortSignal` for cancellation                             |
| `timeout` | Per-call timeout in ms, overriding the constructor default |

## Errors

A failed request — an HTTP or envelope error, a network failure, a timeout, or invalid JSON — throws `TumblrError` with `message`, `status`, `code`, `meta`, `errors`, and `rateLimit`.

Invalid arguments — missing or incomplete credentials, an out-of-range `timeout`, an unsupported avatar size, a non-numeric post id, a missing tag, a missing host — throw `TypeError` or `RangeError`.

## Rate limits

HTTP 429 surfaces as `TumblrError`; no retry or back-off is performed. `tumblr.rateLimit` holds the latest limit, remaining count, and reset instant.

## Author

- [Alexey Simonenko](https://github.com/meritt)

## License

MIT. See `LICENSE`.

[npm-image]: https://img.shields.io/npm/v/tumblr.svg?style=flat
[npm-url]: https://www.npmjs.com/package/tumblr
[github-actions-image]: https://github.com/meritt/node-tumblr/actions/workflows/ci.yml/badge.svg
[github-actions-url]: https://github.com/meritt/node-tumblr/actions/workflows/ci.yml
[coveralls-image]: https://coveralls.io/repos/github/meritt/node-tumblr/badge.svg?branch=main
[coveralls-url]: https://coveralls.io/github/meritt/node-tumblr?branch=main
[libraries-image]: https://img.shields.io/librariesio/release/npm/tumblr.svg?style=flat
[libraries-url]: https://libraries.io/npm/tumblr
