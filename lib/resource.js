import { firstPage, paginate } from './paginate.js';

export function splitOptions(options = {}) {
  const { signal, timeout, ...params } = options;

  return { params, call: { signal, timeout } };
}

function resolver(route) {
  if (typeof route === 'function') {
    return route;
  }

  return (options) => {
    const { params, call } = splitOptions(options);
    return { path: route, params, call };
  };
}

export function single(ctx, route) {
  const resolve = resolver(route);

  return async (...args) => {
    const { path, params, call } = resolve(...args);
    return firstPage(ctx, path, params, call);
  };
}

export function list(ctx, route, cursor) {
  const resolve = resolver(route);

  const method = async (...args) => {
    const { path, params, call } = resolve(...args);

    return firstPage(ctx, path, params, call);
  };

  method.each = (...args) => {
    const { path, params, call } = resolve(...args);

    return paginate(ctx, path, params, call, cursor);
  };

  return method;
}
