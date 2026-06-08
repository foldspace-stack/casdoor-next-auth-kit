import { NextResponse, type NextRequest } from 'next/server.js';
import type { AuthKitConfig } from '../types';
import { isSecureRequest } from '../core/request-security.ts';
import { clearAuthRedirectCookie } from '../core/auth-redirect.ts';
import { clearPublicOriginCookie } from '../core/public-origin.ts';
import { clearAuthEntryCookies } from '../core/auth-entry-cookies.ts';

function resolveLogoutTargetUrl(request: NextRequest, config: AuthKitConfig): URL {
  const origin = request.cookies.get('auth_origin')?.value ?? config.appUrl ?? new URL(request.url).origin;
  const logoutRedirectPath = config.logoutRedirectPath ?? '/';
  return new URL(logoutRedirectPath, origin);
}

export function createLogoutHandler(config: AuthKitConfig) {
  return async function GET(request: NextRequest) {
    const secure = config.cookie?.secure === 'auto' ? isSecureRequest(request, config.appUrl) : Boolean(config.cookie?.secure);
    // 307 keeps same-path targets behaving like a reload instead of a cache-friendly rewrite.
    const targetUrl = resolveLogoutTargetUrl(request, config);
    const response = NextResponse.redirect(targetUrl, 307);
    clearAuthEntryCookies(request, response, config.appUrl, {
      includeAllRequestCookies: true,
      setClearSiteData: true,
    });
    clearAuthRedirectCookie(response, secure);
    clearPublicOriginCookie(response, secure);

    return response;
  };
}
