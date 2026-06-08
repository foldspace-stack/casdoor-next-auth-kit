import { NextResponse, type NextRequest } from 'next/server.js';
import type { AuthKitConfig } from '../types';
import { normalizeAuthKitConfig } from '../core/config.ts';
import { getRequestOrigin, setPublicOriginCookie } from '../core/public-origin.ts';
import { isSecureRequest } from '../core/request-security.ts';
import { createPkcePair } from '../core/pkce.ts';
import { generateStateToken, getPkceCookieName } from '../core/oauth-state.ts';
import { getAuthRedirectTarget, setAuthRedirectCookie } from '../core/auth-redirect.ts';
import { createAuthIndexHtml } from '../core/index-html.ts';
import { clearAuthEntryCookies } from '../core/auth-entry-cookies.ts';

function buildLocalAuthorizeUrl(
  origin: string,
  config: AuthKitConfig,
  params: { state: string; codeChallenge: string; kind: 'login' | 'signup' },
): string {
  const normalized = normalizeAuthKitConfig(config);
  const authorizePath =
    params.kind === 'signup'
      ? '/signup/oauth/authorize'
      : normalized.casdoor.signinPath || '/login/oauth/authorize';
  const authorizeUrl = new URL(authorizePath, origin);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', normalized.casdoor.clientId);
  authorizeUrl.searchParams.set('redirect_uri', `${origin}${normalized.casdoor.redirectPath || '/callback'}`);
  authorizeUrl.searchParams.set('scope', 'profile');
  authorizeUrl.searchParams.set('state', params.state);
  authorizeUrl.searchParams.set('code_challenge', params.codeChallenge);
  authorizeUrl.searchParams.set('code_challenge_method', 'S256');
  return authorizeUrl.toString();
}

async function createRedirectEntryResponse(
  request: NextRequest,
  config: AuthKitConfig,
  kind: 'login' | 'signup',
): Promise<NextResponse> {
  const normalized = normalizeAuthKitConfig(config);
  const origin = getRequestOrigin(request, normalized.appUrl);
  const secure =
    normalized.cookie?.secure === 'auto' ? isSecureRequest(request, normalized.appUrl) : Boolean(normalized.cookie?.secure);
  const { verifier, challenge } = await createPkcePair();
  const state = generateStateToken();
  const response = NextResponse.redirect(
    buildLocalAuthorizeUrl(origin, normalized, { state, codeChallenge: challenge, kind }),
    307,
  );
  clearAuthEntryCookies(request, response, normalized.appUrl);
  const redirectTarget = getAuthRedirectTarget(request);
  if (redirectTarget) {
    setAuthRedirectCookie(response, redirectTarget, secure);
  }
  setPublicOriginCookie(response, origin, secure);
  response.cookies.set('oauth_state', state, { httpOnly: true, sameSite: 'lax', secure, path: '/' });
  response.cookies.set(getPkceCookieName(state), verifier, { httpOnly: true, sameSite: 'lax', secure, path: '/' });
  return response;
}

async function createAuthorizePageResponse(request: NextRequest, config: AuthKitConfig): Promise<NextResponse> {
  const normalized = normalizeAuthKitConfig(config);
  const origin = getRequestOrigin(request, normalized.appUrl);
  const secure =
    normalized.cookie?.secure === 'auto' ? isSecureRequest(request, normalized.appUrl) : Boolean(normalized.cookie?.secure);
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
    },
  );
  clearAuthEntryCookies(request, response, normalized.appUrl);
  setPublicOriginCookie(response, origin, secure);
  return response;
}

export async function createLoginEntryResponse(request: NextRequest, config: AuthKitConfig): Promise<NextResponse> {
  return createRedirectEntryResponse(request, config, 'login');
}

export async function createSignupEntryResponse(request: NextRequest, config: AuthKitConfig): Promise<NextResponse> {
  return createRedirectEntryResponse(request, config, 'signup');
}

export async function createAuthorizeEntryResponse(request: NextRequest, config: AuthKitConfig): Promise<NextResponse> {
  return createAuthorizePageResponse(request, config);
}
