import { NextResponse, type NextRequest } from 'next/server.js';
import type { AuthKitConfig } from '../types';
import { normalizeAuthKitConfig } from '../core/config.ts';
import { getRequestOrigin } from '../core/origin.ts';
import { setPublicOriginCookie } from '../core/public-origin.ts';
import { isSecureRequest } from '../core/request-security.ts';
import { generateStateToken } from '../core/oauth-state.ts';
import { getAuthRedirectTarget, setAuthRedirectCookie } from '../core/auth-redirect.ts';
import { createAuthIndexHtml } from '../core/index-html.ts';
import { clearAuthEntryCookies } from '../core/auth-entry-cookies.ts';
import { decodeSessionToken } from '../core/session-token.ts';

function buildLocalAuthorizeUrl(
  origin: string,
  config: AuthKitConfig,
  params: { state: string; kind: 'login' | 'signup' },
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
  authorizeUrl.searchParams.set('kind', params.kind);
  return authorizeUrl.toString();
}

async function hasValidSessionToken(request: NextRequest, secret: string): Promise<boolean> {
  const directSessionCookieNames = [
    '__Secure-next-auth.session-token',
    'next-auth.session-token',
    '__Host-next-auth.session-token',
  ] as const;

  const directToken = directSessionCookieNames
    .map((name) => request.cookies.get(name)?.value)
    .find((value): value is string => Boolean(value));

  if (directToken && (await decodeSessionToken({ token: directToken, secret }))) {
    return true;
  }

  const chunkedToken = request
    .cookies
    .getAll()
    .filter((cookie) =>
      cookie.name.startsWith('__Secure-next-auth.session-token.') ||
      cookie.name.startsWith('next-auth.session-token.') ||
      cookie.name.startsWith('__Host-next-auth.session-token.')
    )
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }))
    .map((cookie) => cookie.value)
    .join('');

  return Boolean(chunkedToken && (await decodeSessionToken({ token: chunkedToken, secret })));
}

async function createRedirectEntryResponse(
  request: NextRequest,
  config: AuthKitConfig,
  kind: 'login' | 'signup',
): Promise<NextResponse> {
  const normalized = normalizeAuthKitConfig(config);
  // 这里必须按请求头动态推导 origin，不能再用 request.url 的 origin。
  // Coolify / Traefik 场景下 request.url 可能落到容器内网主机名（例如 0.0.0.0:7273），
  // 一旦把这个值写进 authorize / redirect_uri，登录就会跳到错误域名。
  const origin = getRequestOrigin(request, normalized.appUrl);
  const secure =
    normalized.cookie?.secure === 'auto' ? isSecureRequest(request, normalized.appUrl) : Boolean(normalized.cookie?.secure);
  const state = generateStateToken();
  const redirectTarget = (() => {
    const requestUrl = new URL(request.url);
    const redirect = requestUrl.searchParams.get('redirect') || requestUrl.searchParams.get('returnTo');
    if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
      return redirect;
    }
    return getAuthRedirectTarget(request);
  })();

  if (await hasValidSessionToken(request, normalized.nextauthSecret)) {
    return NextResponse.redirect(new URL(redirectTarget || '/', origin), 307);
  }

  const response = NextResponse.redirect(
    buildLocalAuthorizeUrl(origin, normalized, { state, kind }),
    307,
  );
  clearAuthEntryCookies(request, response, normalized.appUrl);
  if (redirectTarget) {
    setAuthRedirectCookie(response, redirectTarget, secure);
  }
  setPublicOriginCookie(response, origin, secure);
  response.cookies.set('oauth_state', state, { httpOnly: true, sameSite: 'lax', secure, path: '/' });
  return response;
}

async function createAuthorizePageResponse(request: NextRequest, config: AuthKitConfig): Promise<NextResponse> {
  const normalized = normalizeAuthKitConfig(config);
  // 授权壳页也要沿用同一个动态 origin，保证后续回跳和公共 origin cookie 一致。
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
        'content-security-policy': "sandbox allow-forms allow-scripts allow-same-origin",
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
