import { NextResponse, type NextRequest } from 'next/server.js';
import type { AuthKitConfig } from '../shared/types';
import { clearAuthEntryCookies, clearAuthRedirectCookie, clearPublicOriginCookie, getRequestOrigin, isSecureRequest } from '../shared/core';

function resolveLogoutTargetUrl(request: NextRequest, config: AuthKitConfig): URL {
  // 退出跳转同样不能依赖 request.url；优先复用登录阶段写入的 auth_origin，
  // 其次再按请求头动态推导，避免多域名或代理环境跳回 0.0.0.0 之类的容器地址。
  const origin = request.cookies.get('auth_origin')?.value ?? getRequestOrigin(request, config.appUrl);
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
