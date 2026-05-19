import { NextResponse, type NextRequest } from 'next/server';
import type { AuthKitConfig } from '../types';
import { isSecureRequest } from '../core/request-security';
import { clearAuthRedirectCookie } from '../core/auth-redirect';
import { clearPublicOriginCookie } from '../core/public-origin';

function getCookieNamesFromHeader(cookieHeader: string | null): string[] {
  if (!cookieHeader) {
    return [];
  }

  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split('=')[0]?.trim())
    .filter((name): name is string => Boolean(name));
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

function resolveLogoutTargetUrl(request: NextRequest, config: AuthKitConfig): URL {
  const origin = request.cookies.get('auth_origin')?.value ?? config.appUrl ?? new URL(request.url).origin;
  const logoutRedirectPath = config.logoutRedirectPath ?? '/';
  return new URL(logoutRedirectPath, origin);
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

export function createLogoutHandler(config: AuthKitConfig) {
  return async function GET(request: NextRequest) {
    const secure = config.cookie?.secure === 'auto' ? isSecureRequest(request, config.appUrl) : Boolean(config.cookie?.secure);
    // 307 keeps same-path targets behaving like a reload instead of a cache-friendly rewrite.
    const targetUrl = resolveLogoutTargetUrl(request, config);
    const response = NextResponse.redirect(targetUrl, 307);
    response.headers.set('Clear-Site-Data', '"cookies"');
    const cookieNames = getCookieNamesFromHeader(request.headers.get('cookie'));
    const pathCandidates = getPathCandidates(request.nextUrl.pathname);

    for (const cookieName of cookieNames) {
      clearCookieEverywhere(response, cookieName, secure, pathCandidates);
    }
    clearCookieEverywhere(response, 'oauth_state', secure, pathCandidates);
    clearCookieEverywhere(response, 'auth_origin', secure, pathCandidates);
    clearCookieEverywhere(response, 'auth_redirect', secure, pathCandidates);
    clearAuthRedirectCookie(response, secure);
    clearPublicOriginCookie(response, secure);

    return response;
  };
}
