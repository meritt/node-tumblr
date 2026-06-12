import { list, single } from './resource.js';

export function createUser(ctx) {
  return {
    info: single(ctx, 'user/info'),
    limits: single(ctx, 'user/limits'),
    dashboard: list(ctx, 'user/dashboard'),
    likes: list(ctx, 'user/likes'),
    following: list(ctx, 'user/following')
  };
}
