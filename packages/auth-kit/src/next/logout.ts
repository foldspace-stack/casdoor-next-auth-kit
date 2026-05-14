import { NextResponse, type NextRequest } from 'next/server';
import type { AuthKitConfig } from '../types';
import { isSecureRequest } from '../core/request-security';
import { clearAuthRedirectCookie } from '../core/auth-redirect';
import { clearPublicOriginCookie } from '../core/public-origin';
import { pkceCookiePrefix } from '../core/oauth-state';

export function createLogoutHandler(config: AuthKitConfig) {
  return async function GET(request: NextRequest) {
    const origin = request.cookies.get('auth_origin')?.value ?? config.appUrl ?? new URL(request.url).origin;
    const secure = config.cookie?.secure === 'auto' ? isSecureRequest(request, config.appUrl) : Boolean(config.cookie?.secure);
    const response = NextResponse.redirect(new URL('/', origin));
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.session-token');
    response.cookies.delete('oauth_state');
    response.cookies.delete('auth_origin');
    clearAuthRedirectCookie(response, secure);
    clearPublicOriginCookie(response, secure);
    request.cookies.getAll().forEach((cookie) => {
      if (cookie.name.startsWith(`${pkceCookiePrefix}.`)) {
        response.cookies.set(cookie.name, '', {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure,
          maxAge: 0,
        });
      }
    });
    return response;
  };
}
