import { mock } from 'node:test';

export function makeResponse(status, body, headers = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    async json() {
      return body;
    }
  };
}

export function stubFetch(handler) {
  const calls = [];
  const m = mock.method(globalThis, 'fetch', async (input, init) => {
    const url = new URL(input);
    calls.push({ url, init });

    const result =
      typeof handler === 'function' ? handler(url, calls.length - 1) : handler;
    const { status = 200, body = {}, headers = {} } = result;

    return makeResponse(status, body, headers);
  });

  m.calls = calls;
  return m;
}
