import type { AuthUser } from '../types';

export function buildAuthJumpHref(kind: 'login' | 'signup', redirect?: string, basePath = '/auth'): string {
  const url = new URL(basePath + '/' + kind, 'http://localhost');
  if (redirect) url.searchParams.set('redirect', redirect);
  return url.pathname + url.search;
}

export function resolvePostLoginRedirect(user: AuthUser, fallback = '/'): string {
  if (user.isAdmin) return '/admin';
  return fallback;
}
