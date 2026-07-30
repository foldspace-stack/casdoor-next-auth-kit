import type { NextRequest, NextResponse } from 'next/server.js';
import type { AuthUser, AuthUserRole } from './types.ts';

const DEFAULT_ADMIN_EMAILS = ['admin@example.com'];

export const AUTH_ENTRY_COOKIE_NAMES = [
  'auth_origin',
  'auth_redirect',
  'oauth_state',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  '__Host-next-auth.session-token',
  'next-auth.csrf-token',
  '__Secure-next-auth.csrf-token',
  '__Host-next-auth.csrf-token',
  'next-auth.callback-url',
  '__Secure-next-auth.callback-url',
  '__Host-next-auth.callback-url',
  'next-auth.state',
  '__Secure-next-auth.state',
  '__Host-next-auth.state',
] as const;

export const AUTH_ENTRY_COOKIE_PREFIXES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  '__Host-next-auth.session-token',
  'next-auth.csrf-token',
  '__Secure-next-auth.csrf-token',
  '__Host-next-auth.csrf-token',
  'next-auth.callback-url',
  '__Secure-next-auth.callback-url',
  '__Host-next-auth.callback-url',
  'next-auth.state',
  '__Secure-next-auth.state',
  '__Host-next-auth.state',
  'pkce_code_verifier',
] as const;

export const AUTH_REDIRECT_COOKIE_NAME = 'auth_redirect';
export const PUBLIC_ORIGIN_COOKIE_NAME = 'auth_origin';

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

function isLikelyEmail(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.includes('@');
}

function pickPreferredName(...values: Array<string | null | undefined>): string | null {
  const candidates = values
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean);

  if (candidates.length === 0) {
    return null;
  }

  const preferred = candidates.find((value) => !isLikelyEmail(value));
  return preferred ?? candidates[0] ?? null;
}

export function getGlobalAdminEmails(): string[] {
  const source = process.env.GLOBAL_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '';
  if (!source) {
    return DEFAULT_ADMIN_EMAILS;
  }

  return source
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isGlobalAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  return getGlobalAdminEmails().includes(email.toLowerCase());
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
    name: pickPreferredName(profile.name, profile.displayName, profile.email),
    email: profile.email || null,
    image: profile.picture || profile.avatarUrl || null,
    isAdmin: isAdmin || role === 'admin',
    role,
    tokenBalance: Number(profile.tokenBalance ?? 0),
    isVip: Boolean(profile.isVip ?? false),
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
    name: pickPreferredName(token.name, token.displayName, token.email),
    email: token.email ?? null,
    image: token.picture ?? null,
    isAdmin: isAdmin || role === 'admin',
    role,
    tokenBalance: Number(token.tokenBalance ?? 0),
    isVip: Boolean(token.isVip ?? false),
  };
}

export function buildAuthUserSummary(user: AuthUserLike | null | undefined): AuthUserSummaryShape {
  const isAuthenticated = Boolean(user);
  const isAdmin = Boolean(user?.isAdmin) || user?.role === 'admin';
  const role: AuthSummaryRole = !isAuthenticated ? 'guest' : resolveAuthUserRole(user?.role, isAdmin);

  return {
    id: user?.id ?? null,
    name: pickPreferredName(user?.name, user?.displayName, user?.email) || '登录',
    email: user?.email ?? null,
    image: user?.image ?? user?.picture ?? null,
    isAuthenticated,
    isAdmin,
    tokenBalance: Number(user?.tokenBalance ?? 0),
    isVip: Boolean(user?.isVip ?? false),
    role,
  };
}

export function buildAuthJumpHref(kind: 'login' | 'signup', redirect?: string, basePath = '/auth'): string {
  const normalizedBasePath = basePath ? (basePath.startsWith('/') ? basePath : '/' + basePath) : '';
  const targetPath = (normalizedBasePath + '/' + kind).replace(/\/+/g, '/');
  const url = new URL(targetPath, 'http://localhost');

  if (redirect) {
    url.searchParams.set('redirect', redirect);
  }

  return url.pathname + url.search;
}

export function resolvePostLoginRedirect(user: AuthUser, fallback = '/'): string {
  if (user.role === 'admin' || user.isAdmin) return '/admin';
  return fallback;
}

function isContainerOrigin(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname;
    return hostname === '0.0.0.0' || hostname === '::' || hostname === '[::]';
  } catch {
    return true;
  }
}

export function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const origin = new URL(value).origin;
    return isContainerOrigin(origin) ? null : origin;
  } catch {
    return null;
  }
}

function firstForwardedValue(value: string | null): string | null {
  return value?.split(',')[0]?.trim() || null;
}

function normalizeHostOrigin(host: string | null, proto: string | null, appUrl?: string): string | null {
  if (!host || host === '0.0.0.0' || host.startsWith('0.0.0.0:')) {
    return null;
  }

  const configured = normalizeOrigin(appUrl);
  const configuredProtocol = configured ? new URL(configured).protocol.replace(':', '') : null;
  const protocol = proto || configuredProtocol || 'https';
  return normalizeOrigin(protocol + '://' + host);
}

function normalizeFirstEnvOrigin(value: string | null | undefined): string | null {
  const candidate = value?.split(',')[0]?.trim();
  if (!candidate) {
    return null;
  }
  return normalizeOrigin(candidate.includes('://') ? candidate : `https://${candidate}`);
}

export function getRequestOrigin(request: Request, appUrl?: string): string {
  const referer = normalizeOrigin(request.headers.get('referer'));
  if (referer) return referer;

  const origin = normalizeOrigin(request.headers.get('origin'));
  if (origin) return origin;

  const forwardedProto = firstForwardedValue(request.headers.get('x-forwarded-proto'));
  const forwardedHost = firstForwardedValue(request.headers.get('x-forwarded-host'));
  const forwardedOrigin = normalizeHostOrigin(forwardedHost, forwardedProto, appUrl);
  if (forwardedOrigin) return forwardedOrigin;

  const hostOrigin = normalizeHostOrigin(request.headers.get('host'), forwardedProto, appUrl);
  if (hostOrigin) return hostOrigin;

  const configured = normalizeOrigin(appUrl);
  if (configured) return configured;

  const envConfigured =
    normalizeFirstEnvOrigin(process.env.APP_URL) ||
    normalizeFirstEnvOrigin(process.env.NEXTAUTH_URL) ||
    normalizeFirstEnvOrigin(process.env.SERVICE_URL_WEB) ||
    normalizeFirstEnvOrigin(process.env.COOLIFY_URL) ||
    normalizeFirstEnvOrigin(process.env.SERVICE_FQDN_WEB) ||
    normalizeFirstEnvOrigin(process.env.COOLIFY_FQDN);
  if (envConfigured) return envConfigured;

  return normalizeOrigin(request.url) || 'http://localhost';
}

export function resolvePublicOrigin(request: Request, appUrl?: string): string {
  return getRequestOrigin(request, appUrl);
}

export function isSecureRequest(request: Request, appUrl?: string): boolean {
  const url = new URL(request.url);
  if (url.protocol === 'https:') return true;

  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase();
  if (forwardedProto === 'https') return true;

  if (appUrl) {
    try {
      return new URL(appUrl).protocol === 'https:';
    } catch {
      return false;
    }
  }

  return false;
}

function getCookieNamesFromHeader(
  cookieHeader: string | null,
  options: { includeAll?: boolean; exactNames?: readonly string[]; prefixes?: readonly string[] } = {},
): string[] {
  if (!cookieHeader) {
    return [];
  }

  const { includeAll = false, exactNames = AUTH_ENTRY_COOKIE_NAMES, prefixes = AUTH_ENTRY_COOKIE_PREFIXES } = options;

  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split('=')[0]?.trim())
    .filter((name): name is string => {
      if (!name) {
        return false;
      }

      if (includeAll) {
        return true;
      }

      return exactNames.some((exactName) => name === exactName) || prefixes.some((prefix) => name.startsWith(prefix));
    });
}

function getPathCandidates(pathname: string): string[] {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const segments = normalized.split('/').filter(Boolean);
  const paths = new Set<string>(['/']);

  let current = '';
  for (const segment of segments) {
    current += `/${segment}`;
    paths.add(current);
  }

  return [...paths];
}

function clearCookieEverywhere(
  response: NextResponse,
  cookieName: string,
  secure: boolean,
  pathCandidates: string[],
) {
  for (const path of pathCandidates) {
    response.cookies.set(cookieName, '', {
      path,
      httpOnly: true,
      sameSite: 'lax',
      secure,
      maxAge: 0,
    });
  }
}

export function clearAuthEntryCookies(
  request: NextRequest,
  response: NextResponse,
  appUrl?: string,
  options: { includeAllRequestCookies?: boolean; setClearSiteData?: boolean } = {},
) {
  const secure = isSecureRequest(request, appUrl);
  const pathCandidates = getPathCandidates(request.nextUrl.pathname);
  const cookieNames = new Set<string>([
    ...getCookieNamesFromHeader(request.headers.get('cookie'), {
      includeAll: options.includeAllRequestCookies,
    }),
    ...(options.includeAllRequestCookies ? [] : AUTH_ENTRY_COOKIE_NAMES),
  ]);

  if (options.setClearSiteData) {
    response.headers.set('Clear-Site-Data', '"cookies"');
  }

  for (const cookieName of cookieNames) {
    clearCookieEverywhere(response, cookieName, secure, pathCandidates);
  }
}

export function getAuthRedirectTarget(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  for (const entry of cookieHeader.split(';')) {
    const [rawName, ...valueParts] = entry.trim().split('=');
    if (rawName === AUTH_REDIRECT_COOKIE_NAME) {
      const value = valueParts.join('=').trim();
      if (!value) {
        return null;
      }
      let decoded = value;
      try {
        decoded = decodeURIComponent(value);
      } catch {
        // ignore
      }
      if (decoded.startsWith('/') && !decoded.startsWith('//')) {
        return decoded;
      }
      return null;
    }
  }

  return null;
}

export function setAuthRedirectCookie(
  response: { cookies: { set: (...args: any[]) => void } },
  target: string,
  secure: boolean,
) {
  response.cookies.set(AUTH_REDIRECT_COOKIE_NAME, target, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
  });
}

export function clearAuthRedirectCookie(
  response: { cookies: { set: (...args: any[]) => void } },
  secure: boolean,
) {
  response.cookies.set(AUTH_REDIRECT_COOKIE_NAME, '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 0,
  });
}

export function setPublicOriginCookie(response: { cookies: { set: (...args: any[]) => void } }, origin: string, secure: boolean) {
  response.cookies.set(PUBLIC_ORIGIN_COOKIE_NAME, origin, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
  });
}

export function clearPublicOriginCookie(response: { cookies: { set: (...args: any[]) => void } }, secure: boolean) {
  response.cookies.set(PUBLIC_ORIGIN_COOKIE_NAME, '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 0,
  });
}

function isContainerPublicOrigin(origin: string): boolean {
  try {
    return new URL(origin).hostname === '0.0.0.0';
  } catch {
    return true;
  }
}

export function getStoredPublicOrigin(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  for (const entry of cookieHeader.split(';')) {
    const [rawName, ...valueParts] = entry.trim().split('=');
    if (rawName === PUBLIC_ORIGIN_COOKIE_NAME) {
      const value = valueParts.join('=').trim();
      if (!value) {
        return null;
      }
      try {
        const decoded = decodeURIComponent(value);
        return isContainerPublicOrigin(decoded) ? null : decoded;
      } catch {
        return isContainerPublicOrigin(value) ? null : value;
      }
    }
  }

  return null;
}
