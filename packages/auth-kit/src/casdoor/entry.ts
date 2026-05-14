import { NextResponse, type NextRequest } from 'next/server';
import type { AuthKitConfig } from '../types';
import { normalizeAuthKitConfig } from '../core/config';
import { getRequestOrigin, setPublicOriginCookie } from '../core/public-origin';
import { isSecureRequest } from '../core/request-security';
import { createPkcePair } from '../core/pkce';
import { generateStateToken, getPkceCookieName } from '../core/oauth-state';
import { getAuthRedirectTarget, setAuthRedirectCookie } from '../core/auth-redirect';
import { createAuthIndexHtml } from '../core/index-html';

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
