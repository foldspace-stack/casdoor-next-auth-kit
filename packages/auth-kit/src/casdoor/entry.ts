import { NextResponse, type NextRequest } from 'next/server';
import type { AuthKitConfig } from '../types';
import { normalizeAuthKitConfig } from '../core/config';
import { getRequestOrigin, setPublicOriginCookie } from '../core/public-origin';
import { isSecureRequest } from '../core/request-security';
import { createPkcePair } from '../core/pkce';
import { generateStateToken, getPkceCookieName } from '../core/oauth-state';
import { getAuthRedirectTarget, setAuthRedirectCookie } from '../core/auth-redirect';
import { getCasdoorAuthorizeUrl } from './config';

async function createEntryResponse(request: NextRequest, config: AuthKitConfig, kind: 'login' | 'signup'): Promise<NextResponse> {
  const normalized = normalizeAuthKitConfig(config);
  const origin = getRequestOrigin(request, normalized.appUrl);
  const secure = normalized.cookie?.secure === 'auto' ? isSecureRequest(request, normalized.appUrl) : Boolean(normalized.cookie?.secure);
  const redirectUri = new URL(normalized.casdoor.redirectPath ?? '/callback', origin).toString();
  const { verifier, challenge } = await createPkcePair();
  const state = generateStateToken();
  const url = getCasdoorAuthorizeUrl(normalized, { state, codeChallenge: challenge, redirectUri, kind });
  const response = NextResponse.redirect(url);
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
  return createEntryResponse(request, config, 'login');
}

export async function createSignupEntryResponse(request: NextRequest, config: AuthKitConfig): Promise<NextResponse> {
  return createEntryResponse(request, config, 'signup');
}
