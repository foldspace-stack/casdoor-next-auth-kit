import { NextResponse, type NextRequest } from 'next/server';
import type { AuthBusinessAdapter, AuthKitConfig, AuthPersistenceAdapter, AuthUser } from '../types';
import { normalizeAuthKitConfig } from '../core/config';
import { getRequestOrigin, getStoredPublicOrigin, clearPublicOriginCookie } from '../core/public-origin';
import { isSecureRequest } from '../core/request-security';
import { getAuthRedirectTarget, clearAuthRedirectCookie } from '../core/auth-redirect';
import {
  decodeCasdoorAccessToken,
  exchangeCasdoorOAuthToken,
  fetchCasdoorUserInfo,
} from './oauth';
import { getCasdoorConfig } from './config';
import { getPkceCookieName, verifyState } from '../core/oauth-state';
import { encodeSessionToken } from '../core/session-token';
import { isGlobalAdminEmail } from '../core/admin';
import { resolvePostLoginRedirect } from '../core/redirect';
import { buildAuthUserFromProfile } from '../core/auth-role';

export interface CallbackHandlerOptions {
  config: AuthKitConfig;
  adapter?: AuthBusinessAdapter;
  persistence?: AuthPersistenceAdapter;
}

function readCookieHeaderValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const entry of cookieHeader.split(';')) {
    const [rawName, ...valueParts] = entry.trim().split('=');
    if (rawName === name) {
      const value = valueParts.join('=').trim();
      return value || null;
    }
  }

  return null;
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

function getPkceCodeVerifier(request: NextRequest, state: string): string | null {
  return readCookieHeaderValue(request.headers.get('cookie'), getPkceCookieName(state));
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

function sanitizeRedirectPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/user/account';
  }

  return value;
}

function summarizeCookieHeader(cookieHeader: string | null): Record<string, unknown> {
  if (!cookieHeader) {
    return { present: false };
  }

  const cookieNames = cookieHeader
    .split(';')
    .map((entry) => entry.trim().split('=')[0])
    .filter(Boolean);

  return {
    present: true,
    count: cookieNames.length,
    names: cookieNames,
  };
}

export function mapProfileToAuthUser(profile: Awaited<ReturnType<typeof fetchCasdoorUserInfo>>, adapter?: AuthBusinessAdapter): AuthUser {
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

export async function createCallbackResponse(
  request: NextRequest,
  options: CallbackHandlerOptions,
): Promise<NextResponse> {
  const normalized = normalizeAuthKitConfig(options.config);
  const publicOrigin = getPublicOrigin(request, normalized);
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const secure = normalized.cookie?.secure === 'auto'
    ? isSecureRequest(request, normalized.appUrl)
    : Boolean(normalized.cookie?.secure);

  if (error) {
    return rewriteToCallbackErrorPage(
      request,
      normalized,
      'Casdoor 返回了授权错误',
      '授权服务器在回调阶段返回了错误信息。请返回首页或重新登录后再试。',
      error,
    );
  }

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

  const codeVerifier = getPkceCodeVerifier(request, state);
  if (!codeVerifier) {
    return rewriteToCallbackErrorPage(
      request,
      normalized,
      '缺少 PKCE 校验值',
      '回调请求里没有找到 pkce_code_verifier cookie。请重新从登录入口发起流程。',
      'missing_pkce_code_verifier',
    );
  }

  const casdoorConfig = getCasdoorConfig(normalized);
  const redirectUri = `${publicOrigin}${casdoorConfig.casdoor.redirectPath}`;
  const tokens = await exchangeCasdoorOAuthToken(casdoorConfig, code, redirectUri, codeVerifier);
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

  const response = NextResponse.redirect(new URL(getRedirectTarget(request, mappedUser, options.adapter), publicOrigin));
  setNextAuthSessionCookies(response, sessionToken, secure);
  response.cookies.set(getPkceCookieName(state), '', {
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

export function createCallbackHandler(options: CallbackHandlerOptions) {
  return async function GET(request: NextRequest) {
    return createCallbackResponse(request, options);
  };
}
