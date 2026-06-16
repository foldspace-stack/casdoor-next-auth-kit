import { NextResponse, type NextRequest } from 'next/server.js';
import type { AuthBusinessAdapter, AuthKitConfig, AuthPersistenceAdapter, AuthUser } from '../types';
import { normalizeAuthKitConfig } from '../core/config.ts';
import { getRequestOrigin, getStoredPublicOrigin, clearPublicOriginCookie } from '../core/public-origin.ts';
import { isSecureRequest } from '../core/request-security.ts';
import { getAuthRedirectTarget, clearAuthRedirectCookie } from '../core/auth-redirect.ts';
import {
  decodeCasdoorAccessToken,
  exchangeCasdoorOAuthToken,
  fetchCasdoorUserInfo,
} from './oauth.ts';
import { getCasdoorConfig } from './config.ts';
import { buildCallbackBridgeScript } from '../core/pkce-storage.ts';
import { getPkceCookieName, verifyState } from '../core/oauth-state.ts';
import { encodeSessionToken } from '../core/session-token.ts';
import { isGlobalAdminEmail } from '../core/admin.ts';
import { resolvePostLoginRedirect } from '../core/redirect.ts';
import { buildAuthUserFromProfile } from '../core/auth-role.ts';

export interface CallbackHandlerOptions {
  config: AuthKitConfig;
  adapter?: AuthBusinessAdapter;
  persistence?: AuthPersistenceAdapter;
}

interface CallbackExchangeBody {
  code: string;
  state: string;
  verifier: string;
}

function getPublicOrigin(request: NextRequest, config: AuthKitConfig): string {
  return getStoredPublicOrigin(request) || getRequestOrigin(request, config.appUrl);
}

function rewriteToCallbackErrorPage(
  request: NextRequest,
  config: AuthKitConfig,
  title: string,
  message: string,
  details?: string,
): NextResponse {
  const origin = getPublicOrigin(request, config);
  const targetUrl = new URL('/callback/error', origin);
  targetUrl.searchParams.set('title', title);
  targetUrl.searchParams.set('message', message);

  if (details) {
    targetUrl.searchParams.set('details', details);
  }

  return NextResponse.redirect(targetUrl, 307);
}

function sanitizeRedirectPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/user/account';
  }

  return value;
}

function buildCallbackBridgeHtml(): string {
  const script = buildCallbackBridgeScript();

  return String.raw`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="正在完成登录回调" />
    <title>正在完成登录</title>
    <style>
      html,
      body {
        margin: 0;
        min-height: 100%;
        background: #f8fafc;
        color: #0f172a;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      body {
        min-height: 100dvh;
        display: grid;
        place-items: center;
        padding: 24px;
        box-sizing: border-box;
      }

      main {
        width: min(100%, 420px);
        border-radius: 28px;
        padding: 28px 24px;
        background: rgba(255, 255, 255, 0.96);
        border: 1px solid rgba(148, 163, 184, 0.2);
        box-shadow: 0 20px 48px rgba(15, 23, 42, 0.12);
        text-align: center;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        padding: 6px 12px;
        border-radius: 9999px;
        background: rgba(59, 130, 246, 0.12);
        color: #1d4ed8;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.04em;
      }
    </style>
  </head>
  <body>
    <main>
      <div class="badge">回调处理中</div>
      <h1 style="margin: 0; font-size: 24px; line-height: 1.2;">正在完成登录</h1>
      <p style="margin: 12px 0 0; line-height: 1.6; color: #334155;">浏览器正在把授权码和本地 verifier 发送给服务端，请稍候。</p>
    </main>
    <script>
${script}
    </script>
  </body>
</html>`;
}

function readCallbackExchangeBody(request: NextRequest): Promise<CallbackExchangeBody | null> {
  return request
    .json()
    .then((value) => {
      if (!value || typeof value !== 'object') {
        return null;
      }

      const record = value as Record<string, unknown>;
      const code = typeof record.code === 'string' ? record.code : '';
      const state = typeof record.state === 'string' ? record.state : '';
      const verifier = typeof record.verifier === 'string' ? record.verifier : '';

      if (!code || !state || !verifier) {
        return null;
      }

      return { code, state, verifier };
    })
    .catch(() => null);
}

function getRedirectTarget(request: NextRequest, user: AuthUser, adapter?: AuthBusinessAdapter): string {
  const adapterRedirect = adapter?.resolvePostLoginRedirect?.(user);
  if (adapterRedirect) {
    return sanitizeRedirectPath(adapterRedirect);
  }

  const storedRedirect = getAuthRedirectTarget(request);
  if (storedRedirect) {
    return sanitizeRedirectPath(storedRedirect);
  }

  return sanitizeRedirectPath(resolvePostLoginRedirect(user, '/user/account'));
}

function mapProfileToAuthUser(profile: Awaited<ReturnType<typeof fetchCasdoorUserInfo>>, adapter?: AuthBusinessAdapter): AuthUser {
  const typedProfile = profile as Awaited<ReturnType<typeof fetchCasdoorUserInfo>> & {
    sub?: string;
    picture?: string;
    avatarUrl?: string;
    role?: string;
  };
  const email = typedProfile.email || null;
  const isAdmin =
    Boolean(typedProfile.isAdmin) ||
    Boolean(adapter?.isAdminEmail?.(email)) ||
    isGlobalAdminEmail(email);

  return buildAuthUserFromProfile(
    {
      id: typedProfile.id,
      sub: typedProfile.sub,
      name: typedProfile.name,
      displayName: typedProfile.displayName,
      email,
      picture: typedProfile.picture,
      avatarUrl: typedProfile.avatarUrl,
      isAdmin: typedProfile.isAdmin,
      role: typedProfile.role,
    },
    isAdmin,
  );
}

function setNextAuthSessionCookies(response: NextResponse, sessionToken: string, isSecure: boolean): void {
  const cookieName = isSecure ? '__Secure-next-auth.session-token' : 'next-auth.session-token';
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const baseOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isSecure,
    expires,
  };
  const maxCookieSize = 3933;

  if (sessionToken.length <= maxCookieSize) {
    response.cookies.set(cookieName, sessionToken, baseOptions);
    return;
  }

  const chunkCount = Math.ceil(sessionToken.length / maxCookieSize);
  for (let index = 0; index < chunkCount; index++) {
    response.cookies.set(
      `${cookieName}.${index}`,
      sessionToken.slice(index * maxCookieSize, (index + 1) * maxCookieSize),
      baseOptions,
    );
  }
}

async function exchangeCallbackCode(
  request: NextRequest,
  options: CallbackHandlerOptions,
  body: CallbackExchangeBody,
): Promise<NextResponse> {
  const normalized = normalizeAuthKitConfig(options.config);
  const publicOrigin = getPublicOrigin(request, normalized);
  const secure =
    normalized.cookie?.secure === 'auto'
      ? isSecureRequest(request, normalized.appUrl)
      : Boolean(normalized.cookie?.secure);
  const stateIsValid = await verifyState(body.state);

  if (!stateIsValid) {
    return rewriteToCallbackErrorPage(
      request,
      normalized,
      '登录状态校验失败',
      '回调中的 state 与本次登录流程不匹配，请重新发起登录。',
      'invalid_state',
    );
  }

  const casdoorConfig = getCasdoorConfig(normalized);
  const redirectUri = `${publicOrigin}${casdoorConfig.casdoor.redirectPath}`;
  const tokens = await exchangeCasdoorOAuthToken(casdoorConfig, body.code, redirectUri, body.verifier);
  const accessToken = tokens.access_token ?? tokens.accessToken ?? '';

  if (!accessToken) {
    return rewriteToCallbackErrorPage(
      request,
      normalized,
      '缺少访问令牌',
      'Casdoor 回调没有返回 access token。',
      'missing_access_token',
    );
  }

  const profile = await fetchCasdoorUserInfo(casdoorConfig, accessToken);
  const decodedAccessToken = decodeCasdoorAccessToken(accessToken) as { exp?: number } | null;
  const mappedUser = options.adapter?.onUserSync
    ? await options.adapter.onUserSync(profile, {
        accessToken,
        refreshToken: tokens.refresh_token || tokens.refreshToken,
        idToken: tokens.id_token || tokens.idToken,
        expiresAt: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : tokens.expiresAt,
      })
    : mapProfileToAuthUser(profile, options.adapter);

  if (options.persistence?.syncAuthUser) {
    await options.persistence.syncAuthUser(mappedUser);
  }

  const sessionToken = await encodeSessionToken({
    token: {
      id: mappedUser.id,
      sub: mappedUser.id,
      userId: mappedUser.id,
      name: mappedUser.name,
      email: mappedUser.email,
      picture: mappedUser.image,
      accessToken,
      expiresAt: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : decodedAccessToken?.exp,
      isAdmin: mappedUser.isAdmin,
      role: mappedUser.role,
      tokenBalance: mappedUser.tokenBalance,
      isVip: mappedUser.isVip,
    },
    secret: normalized.nextauthSecret,
    maxAge: normalized.session?.maxAgeSeconds,
  });

  const redirectUrl = new URL(getRedirectTarget(request, mappedUser, options.adapter), publicOrigin).toString();
  const response = NextResponse.json(
    {
      redirectUrl,
    },
    {
      status: 200,
      headers: {
        'cache-control': 'no-store, max-age=0',
      },
    },
  );

  setNextAuthSessionCookies(response, sessionToken, secure);
  response.cookies.set(getPkceCookieName(body.state), '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 0,
  });
  response.cookies.set('oauth_state', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 0,
  });
  clearAuthRedirectCookie(response, secure);
  clearPublicOriginCookie(response, secure);
  return response;
}

export async function createCallbackResponse(
  request: NextRequest,
  options: CallbackHandlerOptions,
): Promise<NextResponse> {
  const normalized = normalizeAuthKitConfig(options.config);
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return rewriteToCallbackErrorPage(
      request,
      normalized,
      'Casdoor 返回了授权错误',
      '授权服务器在回调阶段返回了错误信息。请返回首页或重新登录后再试。',
      error,
    );
  }

  if (request.method === 'GET') {
    if (!code) {
      return rewriteToCallbackErrorPage(
        request,
        normalized,
        '缺少授权码',
        'Casdoor 回调没有带回 code，这通常意味着授权流程未完成。',
        'no_code',
      );
    }

    if (!state || !(await verifyState(state))) {
      return rewriteToCallbackErrorPage(
        request,
        normalized,
        '登录状态校验失败',
        '回调中的 state 与本次登录流程不匹配，请重新发起登录。',
        'invalid_state',
      );
    }

    return new NextResponse(buildCallbackBridgeHtml(), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store, max-age=0',
      },
    });
  }

  if (request.method === 'POST') {
    const body = await readCallbackExchangeBody(request);
    const callbackBody = body ?? {
      code: code ?? '',
      state: state ?? '',
      verifier: '',
    };

    if (!callbackBody.code) {
      return rewriteToCallbackErrorPage(
        request,
        normalized,
        '缺少授权码',
        'Casdoor 回调没有带回 code，这通常意味着授权流程未完成。',
        'no_code',
      );
    }

    if (!callbackBody.state || !(await verifyState(callbackBody.state))) {
      return rewriteToCallbackErrorPage(
        request,
        normalized,
        '登录状态校验失败',
        '回调中的 state 与本次登录流程不匹配，请重新发起登录。',
        'invalid_state',
      );
    }

    if (!callbackBody.verifier) {
      return rewriteToCallbackErrorPage(
        request,
        normalized,
        '缺少 PKCE 校验值',
        '回调桥接页没有找到浏览器里保存的 verifier，请重新从登录入口开始。',
        'missing_pkce_code_verifier',
      );
    }

    return exchangeCallbackCode(request, options, callbackBody);
  }

  return rewriteToCallbackErrorPage(
    request,
    normalized,
    '不支持的回调方法',
    `当前回调只接受 GET 和 POST 请求，但收到的是 ${request.method || 'UNKNOWN'}。`,
    'unsupported_method',
  );
}

export function createCallbackHandler(options: CallbackHandlerOptions) {
  return async function callbackHandler(request: NextRequest) {
    return createCallbackResponse(request, options);
  };
}
