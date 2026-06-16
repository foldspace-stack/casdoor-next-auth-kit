import { NextResponse, type NextRequest } from 'next/server.js';
import type { AuthKitConfig } from '../types';
import { buildCasdoorProxyRequestHeaders } from './proxy-headers.ts';
import { decodeSessionToken } from '../core/session-token.ts';

const FOLLOW_REDIRECT_PATHS = new Map<string, Set<string>>([
  // 登录态初始化类接口需要跟随 Casdoor 内部跳转并把 Set-Cookie 带回宿主域。
  // 其它接口，尤其 buy-product，不能暴露外部 login/oauth 地址给前端，否则会破坏同域登录/支付链路。
  ['/login', new Set(['POST'])],
  ['/signup', new Set(['POST'])],
  ['/get-app-login', new Set(['GET'])],
  ['/get-account', new Set(['GET'])],
  ['/get-session', new Set(['GET'])],
]);

function buildUpstreamUrl(request: NextRequest, baseUrl: string, localPrefix: string, upstreamPrefix: string): string {
  const url = new URL(request.url);
  // `/auth/api/*` 是宿主同域入口；真正请求 Casdoor 时只替换 prefix，不允许前端直接拼外域地址。
  const upstreamPath = url.pathname.startsWith(localPrefix)
    ? upstreamPrefix + url.pathname.slice(localPrefix.length)
    : url.pathname;
  const rewritten = new URL(upstreamPath, baseUrl);
  rewritten.search = url.search;
  return rewritten.toString();
}

function shouldFollowUpstreamRedirect(request: NextRequest, localPrefix: string): boolean {
  const pathname = new URL(request.url).pathname;
  if (!pathname.startsWith(localPrefix)) {
    return false;
  }

  const upstreamPath = pathname.slice(localPrefix.length) || '/';
  const methods = FOLLOW_REDIRECT_PATHS.get(upstreamPath);
  if (!methods) {
    return false;
  }

  return methods.has(request.method.toUpperCase());
}

function buildUpstreamPath(request: NextRequest, localPrefix: string): string {
  const pathname = new URL(request.url).pathname;
  return pathname.startsWith(localPrefix) ? pathname.slice(localPrefix.length) || '/' : pathname;
}

function encodePathId(id: string): string {
  // Casdoor 商品和支付 ID 使用 owner/name 结构，必须逐段编码，不能把 `/` 编成 `%2F`。
  return id.split('/').map((part) => encodeURIComponent(part)).join('/');
}

function buildCasdoorReferer(request: NextRequest, localPrefix: string, casdoorOrigin: string): string {
  const url = new URL(request.url);
  const upstreamPath = buildUpstreamPath(request, localPrefix);

  // 支付相关接口对 referer 有实际依赖：成功购买链路来自
  // `https://auth.xxx/products/{owner}/{product}/buy`，不要改回根路径或宿主页面 referer。
  if ((upstreamPath === '/get-product' || upstreamPath === '/buy-product') && url.searchParams.get('id')) {
    return `${casdoorOrigin}/products/${encodePathId(url.searchParams.get('id') || '')}/buy`;
  }

  // 支付状态查询同样模拟 Casdoor 原站结果页来源，避免后续轮询被上游当作跨页面异常请求处理。
  if (upstreamPath === '/get-payment' && url.searchParams.get('id')) {
    return `${casdoorOrigin}/payments/${encodePathId(url.searchParams.get('id') || '')}/result`;
  }

  const notifyPaymentPrefix = '/notify-payment/';
  if (upstreamPath.startsWith(notifyPaymentPrefix)) {
    // notify-payment 在原站由二维码页触发；这里保留 qrcode 来源语义。
    return `${casdoorOrigin}/qrcode/${encodePathId(upstreamPath.slice(notifyPaymentPrefix.length))}`;
  }

  return `${casdoorOrigin}/`;
}

function isRedirectStatus(status: number): boolean {
  return status >= 300 && status < 400;
}

function appendCookieValue(headers: Headers, name: string, value: string) {
  const existing = headers.get('cookie');
  // 追加派生出的 Casdoor access token 时先去重，避免同名 cookie 重复导致上游取错值。
  const parts = existing
    ? existing
        .split(';')
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => !item.startsWith(`${name}=`))
    : [];
  parts.push(`${name}=${value}`);
  headers.set('cookie', parts.join('; '));
}

function readSetCookieHeaders(headers: Headers): string[] {
  const typedHeaders = headers as Headers & { getSetCookie?: () => string[] };
  if (typeof typedHeaders.getSetCookie === 'function') {
    return typedHeaders.getSetCookie();
  }

  const singleHeader = headers.get('set-cookie');
  return singleHeader ? [singleHeader] : [];
}

function copySetCookieHeaders(response: NextResponse, headers: Headers) {
  // Casdoor 的登录态会落在 `casdoor_session_id` 里，后续的 `/api/get-session`、`/api/buy-product`
  // 都依赖它；这里必须把上游 `Set-Cookie` 原样透回宿主同域，否则只剩 Bearer token 仍然会被判定为未登录。
  for (const cookie of readSetCookieHeaders(headers)) {
    response.headers.append('set-cookie', cookie);
  }
}

async function followUpstreamRedirect(
  initialResponse: Response,
  initialRequest: NextRequest,
  initialHeaders: Headers,
  initialBody: ArrayBuffer | undefined,
  initialUrl: string,
): Promise<{ response: Response; setCookieHeaders: string[] }> {
  let response: Response = initialResponse;
  let currentUrl = initialUrl;
  let currentMethod = initialRequest.method.toUpperCase();
  let currentBody = initialBody;
  const maxRedirects = 5;
  const setCookieHeaders: string[] = [];

  for (let redirectCount = 0; redirectCount < maxRedirects && isRedirectStatus(response.status); redirectCount += 1) {
    setCookieHeaders.push(...readSetCookieHeaders(response.headers));
    const location = response.headers.get('location');
    if (!location) {
      return { response, setCookieHeaders };
    }

    const nextUrl = new URL(location, currentUrl).toString();
    const nextStatus = response.status;
    const canKeepBody = nextStatus === 307 || nextStatus === 308;
    // Casdoor 登录类接口可能 301/302 到实际 API；非 307/308 按浏览器语义改成 GET，避免错误重放 POST body。
    const nextMethod =
      currentMethod === 'GET' || currentMethod === 'HEAD' || canKeepBody ? currentMethod : 'GET';
    const nextBody = nextMethod === 'GET' || nextMethod === 'HEAD' ? undefined : currentBody;

    response = await fetch(nextUrl, {
      method: nextMethod,
      headers: initialHeaders,
      body: nextBody,
      redirect: 'manual',
    });
    currentUrl = nextUrl;
    currentMethod = nextMethod;
    currentBody = nextBody;
  }

  setCookieHeaders.push(...readSetCookieHeaders(response.headers));
  return { response, setCookieHeaders };
}

function cloneUpstreamResponse(upstream: Response, setCookieHeaders: string[] = []): NextResponse {
  const responseHeaders = new Headers();

  upstream.headers.forEach((value, key) => {
    // 这些 hop-by-hop / body 相关头由 Next.js 重新计算；原样复制会导致压缩或长度不匹配。
    if (key === 'content-encoding' || key === 'content-length' || key === 'transfer-encoding' || key === 'connection' || key === 'set-cookie') {
      return;
    }
    responseHeaders.set(key, value);
  });

  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
  for (const cookie of setCookieHeaders) {
    response.headers.append('set-cookie', cookie);
  }
  return response;
}

async function proxyRequest(
  config: AuthKitConfig,
  request: NextRequest,
  localPrefix: string,
  upstreamPrefix: string,
  options: { suppressRedirects?: boolean } = {},
): Promise<NextResponse> {
  const upstreamUrl = buildUpstreamUrl(request, config.casdoor.serverUrl, localPrefix, upstreamPrefix);
  // 这里必须使用配置里的真实 Casdoor origin。生产环境若 Casdoor 是 HTTPS，配置成 HTTP 会导致
  // casdoor_session_id 虽然被转发但上游仍判定 Please login first。
  const casdoorOrigin = new URL(config.casdoor.serverUrl).origin;
  const headers = buildCasdoorProxyRequestHeaders(request);
  // 浏览器始终只访问同源 `/auth/*`，这里把上游请求头改成 Casdoor 原点，避免把站内 origin 直接透传过去。
  // 支付相关 API 也只允许带白名单 Casdoor cookie，不能再回退成整段浏览器 cookie，否则 NextAuth 分片会持续膨胀请求头。
  headers.set('origin', casdoorOrigin);
  headers.set('referer', buildCasdoorReferer(request, localPrefix, casdoorOrigin));
  let accessToken = headers
    .get('authorization')
    ?.replace(/^Bearer\s+/i, '')
    .trim();

  if (!accessToken) {
    // 浏览器侧可能已经有 Casdoor access token cookie，优先复用，减少对 NextAuth 大 JWT 的依赖。
    const accessTokenCookie = request.cookies.get('casdoor_access_token')?.value;
    if (accessTokenCookie) {
      accessToken = accessTokenCookie;
    }
  }

  if (!accessToken) {
    // 只在需要补 Authorization 时读取 NextAuth token；读取后只提取 accessToken，不把 NextAuth cookie 透给 Casdoor。
    const sessionToken =
      request.cookies.get('__Secure-next-auth.session-token')?.value ||
      request.cookies.get('next-auth.session-token')?.value ||
      request.cookies
        .getAll()
        .filter((cookie) =>
          cookie.name.startsWith('__Secure-next-auth.session-token.') ||
          cookie.name.startsWith('next-auth.session-token.')
        )
        .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }))
        .map((cookie) => cookie.value)
        .join('');

    if (sessionToken) {
      const decoded = await decodeSessionToken({
        token: sessionToken,
        secret: config.nextauthSecret,
      });
      const decodedAccessToken = typeof decoded?.accessToken === 'string' ? decoded.accessToken : undefined;
      if (decodedAccessToken) {
        accessToken = decodedAccessToken;
      }
    }
  }

  if (accessToken) {
    if (!headers.has('authorization')) {
      headers.set('authorization', `Bearer ${accessToken}`);
    }
    // 一些 Casdoor API 不只看 Authorization，也会从 cookie 读 casdoor_access_token；这里补齐但仍保持 cookie 白名单。
    appendCookieValue(headers, 'casdoor_access_token', accessToken);
  }

  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer();
  const upstream = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body,
    redirect: options.suppressRedirects ? 'manual' : 'follow',
  });
  const upstreamSetCookieHeaders = readSetCookieHeaders(upstream.headers);

  if (options.suppressRedirects && isRedirectStatus(upstream.status)) {
    if (shouldFollowUpstreamRedirect(request, localPrefix)) {
      const followed = await followUpstreamRedirect(upstream, request, headers, body, upstreamUrl);
      return cloneUpstreamResponse(followed.response, followed.setCookieHeaders);
    }

    const response = NextResponse.json(
      {
        status: 'error',
        msg: 'Please login first',
        redirect: upstream.headers.get('location') || null,
      },
      { status: 200 },
    );
    copySetCookieHeaders(response, upstream.headers);
    return response;
  }

  return cloneUpstreamResponse(upstream, upstreamSetCookieHeaders);
}

export function createCasdoorApiProxyHandler(
  config: AuthKitConfig,
  prefix = '/auth/api',
  upstreamPrefix = '/api',
): (request: NextRequest) => Promise<NextResponse> {
  return async (request) => proxyRequest(config, request, prefix, upstreamPrefix, { suppressRedirects: true });
}

export function createCasdoorPageProxyHandler(
  config: AuthKitConfig,
  prefix = '/auth',
  upstreamPrefix = '',
): (request: NextRequest) => Promise<NextResponse> {
  return async (request) => proxyRequest(config, request, prefix, upstreamPrefix);
}

export function createCasdoorCommerceProxyHandler(
  config: AuthKitConfig,
  prefix = '/auth/api/commerce',
  upstreamPrefix = '/api/commerce',
): (request: NextRequest) => Promise<NextResponse> {
  return async (request) => proxyRequest(config, request, prefix, upstreamPrefix, { suppressRedirects: true });
}
