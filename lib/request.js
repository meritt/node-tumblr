import { applyAuth } from './auth.js';
import { TumblrError } from './errors.js';

export const DEFAULT_BASE_URL = 'https://api.tumblr.com/v2/';

function removeSecrets(text) {
  return text.replace(/(api_key=)[^&\s]+/gi, '$1REDACTED');
}

function sanitizeCause(cause) {
  if (!(cause instanceof Error)) {
    return undefined;
  }

  const safe = new Error(removeSecrets(String(cause.message ?? '')));
  safe.name = cause.name;

  const code = cause.code ?? cause.cause?.code;
  if (code !== undefined) {
    safe.code = code;
  }

  return safe;
}

function signalOf(timeout, signal) {
  if (Number.isFinite(timeout) && timeout > 0) {
    const deadline = AbortSignal.timeout(timeout);

    return signal ? AbortSignal.any([signal, deadline]) : deadline;
  }

  return signal;
}

function parseRateLimit(headers) {
  if (!headers) {
    return undefined;
  }

  const limit = headers.get('x-ratelimit-perhour-limit');
  const remaining = headers.get('x-ratelimit-perhour-remaining');
  const reset = headers.get('x-ratelimit-perhour-reset');

  if (limit == null && remaining == null && reset == null) {
    return undefined;
  }

  const rateLimit = {};
  if (limit != null) {
    rateLimit.limit = Number(limit);
  }
  if (remaining != null) {
    rateLimit.remaining = Number(remaining);
  }
  if (reset != null) {
    rateLimit.reset = Temporal.Now.instant().add({ seconds: Number(reset) });
  }

  return rateLimit;
}

export function buildUrl(baseUrl, path, params = {}) {
  const base = baseUrl.replace(/\/+$/, '');
  const cleanPath = String(path).replace(/^\/+/, '');
  const url = new URL(`${base}/${cleanPath}`);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url;
}

export async function request(baseUrl, path, params = {}, options = {}) {
  const {
    strategy,
    timeout,
    signal,
    followRedirect = true,
    onRateLimit
  } = options;

  const url = buildUrl(baseUrl, path, params);
  const { url: finalUrl, headers: authHeaders } = await applyAuth(
    strategy,
    'GET',
    url
  );

  const init = {
    method: 'GET',
    redirect: followRedirect ? 'follow' : 'manual',
    headers: { Accept: 'application/json', ...authHeaders }
  };

  const composed = signalOf(timeout, signal);
  if (composed) {
    init.signal = composed;
  }

  let response;
  try {
    response = await fetch(finalUrl, init);
  } catch (cause) {
    const message =
      cause?.name === 'TimeoutError'
        ? `Request timed out after ${timeout}ms`
        : `Network request failed: ${removeSecrets(String(cause?.message ?? cause))}`;
    throw new TumblrError(message, { cause: sanitizeCause(cause) });
  }

  const rateLimit = parseRateLimit(response.headers);
  if (onRateLimit && rateLimit) {
    onRateLimit(rateLimit);
  }

  if (!followRedirect && response.status >= 300 && response.status < 400) {
    return {
      status: response.status,
      location: response.headers.get('location')
    };
  }

  let body;
  let parseFailed = false;
  try {
    body = await response.json();
  } catch {
    body = {};
    parseFailed = true;
  }

  const meta = body?.meta;

  if (!response.ok || meta?.status >= 400) {
    throw new TumblrError(meta?.msg ?? `HTTP ${response.status}`, {
      status: meta?.status ?? response.status,
      meta,
      errors: body?.errors ?? body?.response?.errors,
      rateLimit
    });
  }

  if (parseFailed) {
    throw new TumblrError('Invalid JSON in response', {
      status: response.status,
      rateLimit
    });
  }

  return body?.response;
}
