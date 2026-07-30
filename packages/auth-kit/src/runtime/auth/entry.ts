import { NextResponse, type NextRequest } from 'next/server.js';
import { createElement } from 'react';
import type { AuthKitConfig } from '../shared/types.ts';
import { normalizeAuthKitConfig } from '../shared/config.ts';
import {
  buildAuthUserSummary,
  clearAuthEntryCookies,
  getAuthRedirectTarget,
  getRequestOrigin,
  isSecureRequest,
  normalizeOrigin,
  setAuthRedirectCookie,
  setPublicOriginCookie,
} from '../shared/core.ts';
import { generateStateToken } from '../shared/oauth-state.ts';
import { decodeSessionToken } from '../shared/session-token.ts';
import { LoginView, SignupView } from './views.tsx';
import { loadAuthPortalContext } from './api.ts';
import { buildPkceAuthorizeBootstrapScript } from './pkce-storage.ts';
import { getCasdoorAuthorizeUrl } from '../shared/config.ts';

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

function getEntryOrigin(request: NextRequest, appUrl?: string): string {
  const configuredOrigin = normalizeOrigin(appUrl);
  const refererOrigin = normalizeOrigin(request.headers.get('referer'));
  const headers = new Headers(request.headers);

  if (refererOrigin && configuredOrigin && refererOrigin !== configuredOrigin) {
    headers.delete('referer');
  }

  return getRequestOrigin(new Request(request.url, { headers }), appUrl);
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
  const origin = getEntryOrigin(request, normalized.appUrl);
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

  const { application, account } = await loadAuthPortalContext(request, normalized);
  const accountSummary = account
    ? buildAuthUserSummary({
        id: account.id || account.name || account.email || 'casdoor-user',
        name: account.displayName || account.name || account.email || normalized.casdoor.appName,
        email: account.email ?? null,
        image: account.avatar || account.permanentAvatar || null,
        isAdmin: Boolean(account.isAdmin),
        tokenBalance: Number(account.balanceCredit ?? account.balance ?? 0),
        isVip: false,
        role: account.isAdmin ? 'admin' : 'user',
      })
    : undefined;
  const authorizeHref = buildLocalAuthorizeUrl(origin, normalized, { state, kind });
  const { renderToStaticMarkup } = await import('react-dom/server');
  const pageHtml =
    kind === 'signup'
      ? renderToStaticMarkup(
          createElement(SignupView, {
            appName: normalized.casdoor.appName,
            organizationName: normalized.casdoor.organizationName,
            description: '注册后即可继续使用宿主站点里的订阅和积分购买能力。',
            authorizeHref,
            loginHref: '/auth/login',
            application,
            session: accountSummary,
            theme: {
              primary: '#111827',
              accent: 'rgba(99, 102, 241, 0.14)',
              pageBackdrop:
                'radial-gradient(circle at top, rgba(99, 102, 241, 0.12) 0, rgba(99, 102, 241, 0) 36%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
            },
          }),
        )
      : renderToStaticMarkup(
          createElement(LoginView, {
            appName: normalized.casdoor.appName,
            organizationName: normalized.casdoor.organizationName,
            description: '登录后继续完成订阅、积分购买和个人中心查看。',
            authorizeHref,
            signupHref: '/auth/signup',
            redirect: redirectTarget,
            application,
            account: account ?? undefined,
            session: accountSummary,
            theme: {
              primary: '#111827',
              accent: 'rgba(14, 165, 233, 0.14)',
              pageBackdrop:
                'radial-gradient(circle at top, rgba(14, 165, 233, 0.12) 0, rgba(14, 165, 233, 0) 36%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
            },
          }),
        );

  const response = new NextResponse(`<!doctype html>${pageHtml}`, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
    },
  });
  clearAuthEntryCookies(request, response, normalized.appUrl);
  if (redirectTarget) {
    setAuthRedirectCookie(response, redirectTarget, secure);
  }
  setPublicOriginCookie(response, origin, secure);
  response.cookies.set('oauth_state', state, { httpOnly: true, sameSite: 'lax', secure, path: '/' });
  return response;
}

function buildAuthorizeBootstrapHtml(options: {
  appName: string;
  organizationName: string;
  script: string;
}): string {
  const title = `${options.appName} - ${options.organizationName}`;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><meta name="robots" content="noindex,nofollow" /><title>${title}</title></head><body style="margin:0;background:#f8fafc;color:#0f172a;font-family:Inter,ui-sans-serif,system-ui,sans-serif;"><noscript>JavaScript is required to continue sign in.</noscript><script>${options.script}</script></body></html>`;
}

async function createAuthorizePageResponse(request: NextRequest, config: AuthKitConfig): Promise<NextResponse> {
  const normalized = normalizeAuthKitConfig(config);
  const requestUrl = new URL(request.url);
  const origin = getRequestOrigin(request, normalized.appUrl);
  const secure =
    normalized.cookie?.secure === 'auto' ? isSecureRequest(request, normalized.appUrl) : Boolean(normalized.cookie?.secure);
  const kind = requestUrl.searchParams.get('kind') === 'signup' ? 'signup' : 'login';
  const state = requestUrl.searchParams.get('state');
  const codeChallenge = requestUrl.searchParams.get('code_challenge');
  const redirectUri = `${origin}${normalized.casdoor.redirectPath || '/callback'}`;

  if (!state) {
    const nextUrl = new URL(request.url);
    nextUrl.searchParams.set('state', generateStateToken());
    nextUrl.searchParams.set('kind', kind);
    const response = NextResponse.redirect(nextUrl, 307);
    clearAuthEntryCookies(request, response, normalized.appUrl);
    setPublicOriginCookie(response, origin, secure);
    return response;
  }

  if (codeChallenge) {
    const response = NextResponse.redirect(
      getCasdoorAuthorizeUrl(normalized, {
        state,
        codeChallenge,
        redirectUri,
        kind,
      }),
      307,
    );
    clearAuthEntryCookies(request, response, normalized.appUrl);
    setPublicOriginCookie(response, origin, secure);
    response.cookies.set('oauth_state', state, { httpOnly: true, sameSite: 'lax', secure, path: '/' });
    return response;
  }

  const response = new NextResponse(
    buildAuthorizeBootstrapHtml({
      appName: normalized.casdoor.appName,
      organizationName: normalized.casdoor.organizationName,
      script: buildPkceAuthorizeBootstrapScript(normalized.casdoor.serverUrl),
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
  response.cookies.set('oauth_state', state, { httpOnly: true, sameSite: 'lax', secure, path: '/' });
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
