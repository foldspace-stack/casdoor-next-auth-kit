import { NextResponse, type NextRequest } from 'next/server';
import type { AuthKitConfig } from '../types';
import { normalizeAuthKitConfig } from '../core/config';
import { getRequestOrigin, setPublicOriginCookie } from '../core/public-origin';
import { isSecureRequest } from '../core/request-security';
import { createPkcePair } from '../core/pkce';
import { generateStateToken, getPkceCookieName } from '../core/oauth-state';
import { getAuthRedirectTarget, setAuthRedirectCookie } from '../core/auth-redirect';
import { createAuthIndexHtml } from '../core/index-html';

async function createEntryResponse(request: NextRequest, config: AuthKitConfig): Promise<NextResponse> {
  const normalized = normalizeAuthKitConfig(config);
  const origin = getRequestOrigin(request, normalized.appUrl);
  const secure = normalized.cookie?.secure === 'auto' ? isSecureRequest(request, normalized.appUrl) : Boolean(normalized.cookie?.secure);
  const { verifier } = await createPkcePair();
  const state = generateStateToken();
  const response = new NextResponse(
    createAuthIndexHtml({
      appName: normalized.casdoor.appName,
      organizationName: normalized.casdoor.organizationName,
      staticOrigin: process.env.NEXT_PUBLIC_CASDOOR_STATIC_ORIGIN,
      casdoorOrigin: normalized.casdoor.serverUrl,
      apiProxyPrefix: '/auth/',
    }),
    {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
    },
  });
  const redirectTarget = getAuthRedirectTarget(request);
  if (redirectTarget) {
    setAuthRedirectCookie(response, redirectTarget, secure);
  }
  setPublicOriginCookie(response, origin, secure);
  response.cookies.set('oauth_state', state, { httpOnly: true, sameSite: 'lax', secure, path: '/' });
  response.cookies.set(getPkceCookieName(state), verifier, { httpOnly: true, sameSite: 'lax', secure, path: '/' });
  return response;
}

export async function createLoginEntryResponse(request: NextRequest, config: AuthKitConfig): Promise<NextResponse> {
  return createEntryResponse(request, config);
}

export async function createSignupEntryResponse(request: NextRequest, config: AuthKitConfig): Promise<NextResponse> {
  return createEntryResponse(request, config);
}
