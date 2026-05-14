import { NextResponse, type NextRequest } from 'next/server';
import type { AuthKitConfig } from '../types';
import { isSecureRequest } from '../core/request-security';
import { clearAuthRedirectCookie } from '../core/auth-redirect';
import { clearPublicOriginCookie } from '../core/public-origin';
import { pkceCookiePrefix } from '../core/oauth-state';

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

export function createLogoutHandler(config: AuthKitConfig) {
  return async function GET(request: NextRequest) {
    const origin = request.cookies.get('auth_origin')?.value ?? config.appUrl ?? new URL(request.url).origin;
    const secure = config.cookie?.secure === 'auto' ? isSecureRequest(request, config.appUrl) : Boolean(config.cookie?.secure);
    const response = NextResponse.redirect(new URL('/', origin));
    const cookieNames = getCookieNamesFromHeader(request.headers.get('cookie'));
    const sessionCookiePrefixes = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'authjs.session-token',
      '__Secure-authjs.session-token',
    ];
    for (const cookieName of cookieNames) {
      if (sessionCookiePrefixes.some((prefix) => cookieName === prefix || cookieName.startsWith(`${prefix}.`))) {
        response.cookies.set(cookieName, '', {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure,
          maxAge: 0,
        });
      }
    }
    response.cookies.delete('oauth_state');
    response.cookies.delete('auth_origin');
    clearAuthRedirectCookie(response, secure);
    clearPublicOriginCookie(response, secure);
    for (const cookieName of cookieNames) {
      if (cookieName.startsWith(`${pkceCookiePrefix}.`)) {
        response.cookies.set(cookieName, '', {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure,
          maxAge: 0,
        });
      }
    }
    return response;
  };
}
