import type { AuthUser, AuthUserRole } from '../types';

export type AuthSummaryRole = 'guest' | AuthUserRole;

export interface AuthUserLike {
  id?: string | null;
  sub?: string | null;
  name?: string | null;
  displayName?: string | null;
  email?: string | null;
  image?: string | null;
  picture?: string | null;
  avatarUrl?: string | null;
  isAdmin?: boolean;
  role?: string | null;
  tokenBalance?: number;
  isVip?: boolean;
}

export interface AuthUserSummaryShape {
  id: string | null;
  name: string;
  email: string | null;
  image: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  tokenBalance: number;
  isVip: boolean;
  role: AuthSummaryRole;
}

export function resolveAuthUserRole(role: string | null | undefined, isAdmin: boolean): AuthUserRole {
  if (role === 'admin' || role === 'user') {
    return role;
  }

  return isAdmin ? 'admin' : 'user';
}

export function buildAuthUserFromProfile(profile: AuthUserLike, isAdmin: boolean): AuthUser {
  const role = resolveAuthUserRole(profile.role, isAdmin);
  return {
    id: profile.sub || profile.id || profile.email || 'casdoor-user',
    name: profile.name || profile.displayName || null,
    email: profile.email || null,
    image: profile.picture || profile.avatarUrl || null,
    isAdmin: isAdmin || role === 'admin',
    role,
    tokenBalance: Number(profile.tokenBalance ?? 2580),
    isVip: Boolean(profile.isVip ?? true),
  };
}

export function buildAuthUserFromToken(
  token: AuthUserLike & {
    userId?: string;
    sub?: string;
    id?: string;
    accessToken?: string;
    expiresAt?: number;
  },
  isAdmin: boolean,
): AuthUser {
  const role = resolveAuthUserRole(token.role, isAdmin);
  return {
    id: token.userId || token.sub || token.id || token.email || 'casdoor-user',
    name: token.name ?? null,
    email: token.email ?? null,
    image: token.picture ?? null,
    isAdmin: isAdmin || role === 'admin',
    role,
    tokenBalance: Number(token.tokenBalance ?? 2580),
    isVip: Boolean(token.isVip ?? true),
  };
}

export function buildAuthUserSummary(user: AuthUserLike | null | undefined): AuthUserSummaryShape {
  const isAuthenticated = Boolean(user);
  const isAdmin = Boolean(user?.isAdmin) || user?.role === 'admin';
  const role: AuthSummaryRole = !isAuthenticated ? 'guest' : resolveAuthUserRole(user?.role, isAdmin);

  return {
    id: user?.id ?? null,
    name: user?.name || '登录',
    email: user?.email ?? null,
    image: user?.image ?? user?.picture ?? null,
    isAuthenticated,
    isAdmin,
    tokenBalance: Number(user?.tokenBalance ?? 2580),
    isVip: Boolean(user?.isVip ?? true),
    role,
  };
}
