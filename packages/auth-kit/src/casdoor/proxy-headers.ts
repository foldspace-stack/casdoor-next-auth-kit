const CASDOOR_COOKIE_NAME_PATTERNS = [
  // Casdoor 原站支付和账号接口真正需要的是这两个会话值。
  // 不要把 next-auth.session-token 或其分片加入这里；大 JWT 会让每个 /auth/api 请求都携带超大 cookie。
  /^casdoor_session_id$/,
  /^casdoor_access_token$/,
];

function isAllowedCasdoorCookieName(name: string): boolean {
  return CASDOOR_COOKIE_NAME_PATTERNS.some((pattern) => pattern.test(name));
}

function filterCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  // 这里是同域代理的核心边界：浏览器可以带很多宿主 cookie，但转给 Casdoor 的只保留白名单。
  // 支付问题曾经由“整段 cookie 透传 + HTTP Casdoor origin”触发 Please login first，后续不要回退。
  const cookies = cookieHeader
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const separatorIndex = item.indexOf('=');
      if (separatorIndex < 1) {
        return null;
      }

      return {
        name: item.slice(0, separatorIndex).trim(),
        value: item.slice(separatorIndex + 1).trim(),
      };
    })
    .filter((item): item is { name: string; value: string } => item !== null && item.name.length > 0 && item.value.length > 0)
    .filter((item) => isAllowedCasdoorCookieName(item.name))
    .map((item) => `${item.name}=${item.value}`);

  return cookies.length ? cookies.join('; ') : null;
}

interface BuildCasdoorProxyRequestHeadersOptions {
  // 某些 Casdoor 兼容接口仍依赖完整的浏览器 cookie 参与会话判断。
  // 默认只转最小会话集，必要时再显式回退到原始 cookie，避免把 NextAuth 分片常态化透传。
  // 注意：支付接口不要使用 includeAllCookies。支付只需要 casdoor_session_id / casdoor_access_token。
  includeAllCookies?: boolean;
}

export function buildCasdoorProxyRequestHeaders(
  request: Pick<Request, 'headers'>,
  options: BuildCasdoorProxyRequestHeadersOptions = {},
): Headers {
  const headers = new Headers();
  const allowedHeaderNames = [
    'accept',
    'accept-language',
    'authorization',
    'content-type',
    'origin',
    'referer',
    'x-requested-with',
  ];

  for (const headerName of allowedHeaderNames) {
    const value = request.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  }

  const cookieHeader = request.headers.get('cookie');
  const forwardedCookieHeader = options.includeAllCookies ? cookieHeader : filterCookieHeader(cookieHeader);
  if (forwardedCookieHeader) {
    // 默认只把 Casdoor 真正需要的会话 cookie 透给上游，避免把 NextAuth 的大分片 cookie 一起带过去。
    // 但如果某个 Casdoor 兼容接口本身依赖完整浏览器 cookie，就由调用方显式切到 includeAllCookies。
    // 当前 createCasdoorApiProxyHandler 不应为支付路径打开 includeAllCookies。
    headers.set('cookie', forwardedCookieHeader);
  }

  return headers;
}
