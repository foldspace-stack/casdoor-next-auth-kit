import type { NextRequest, NextResponse } from 'next/server.js';
import { isSecureRequest } from './request-security.ts';

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
