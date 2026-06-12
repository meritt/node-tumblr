import { resolveAuth } from './auth.js';
import { createBlog } from './blog.js';
import { request, DEFAULT_BASE_URL } from './request.js';
import { createTagged } from './tagged.js';
import { createUser } from './user.js';

const DEFAULT_TIMEOUT = 30000;
const MAX_TIMEOUT = 2147483647;

export class Tumblr {
  #strategy;
  #baseUrl;
  #timeout;
  #ctx;
  #rateLimit;

  constructor({
    env,
    baseUrl = DEFAULT_BASE_URL,
    timeout = DEFAULT_TIMEOUT,
    ...credentials
  } = {}) {
    if (!Number.isSafeInteger(timeout)) {
      throw new TypeError('timeout must be an integer number of milliseconds');
    }

    if (timeout < 0 || timeout > MAX_TIMEOUT) {
      throw new RangeError(`timeout must be between 0 and ${MAX_TIMEOUT} ms`);
    }

    this.#strategy = resolveAuth(credentials, env);
    this.#baseUrl = baseUrl;
    this.#timeout = timeout;
    this.#rateLimit = undefined;

    this.#ctx = {
      request: (path, params, call = {}) =>
        request(this.#baseUrl, path, params, {
          strategy: this.#strategy,
          timeout: call.timeout ?? this.#timeout,
          signal: call.signal,
          followRedirect: call.followRedirect,
          onRateLimit: (rateLimit) => {
            this.#rateLimit = rateLimit;
          }
        })
    };

    this.tagged = createTagged(this.#ctx);
  }

  blog(host) {
    return createBlog(this.#ctx, host);
  }

  user() {
    return createUser(this.#ctx);
  }

  get rateLimit() {
    return this.#rateLimit;
  }

  async [Symbol.asyncDispose]() {
    this.#rateLimit = undefined;
  }
}
