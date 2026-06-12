import { list, splitOptions } from './resource.js';

export function createTagged(ctx) {
  return list(ctx, (tag, options) => {
    if (!tag) {
      throw new TypeError('tagged(tag) requires a tag');
    }

    const { params, call } = splitOptions(options);

    return { path: 'tagged', params: { ...params, tag }, call };
  });
}
