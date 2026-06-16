import { NextResponse, type NextRequest } from 'next/server.js';
import type { AuthKitConfig } from '../types';
import { buildCasdoorProxyRequestHeaders } from './proxy-headers.ts';
import { decodeSessionToken } from '../core/session-token.ts';

const PRESERVE_REDIRECT_PATHS = new Map<string, Set<string>>([
  ['/login', new Set(['POST'])],
  ['/signup', new Set(['POST'])],
  ['/get-app-login', new Set(['GET'])],
  ['/get-account', new Set(['GET'])],
  ['/get-session', new Set(['GET'])],
]);

function buildUpstreamUrl(request: NextRequest, baseUrl: string, localPrefix: string, upstreamPrefix: string): string {
  const url = new URL(request.url);
  const upstreamPath = url.pathname.startsWith(localPrefix)
    ? upstreamPrefix + url.pathname.slice(localPrefix.length)
    : url.pathname;
  const rewritten = new URL(upstreamPath, baseUrl);
  rewritten.search = url.search;
  return rewritten.toString();
}

function shouldPreserveUpstreamRedirect(request: NextRequest, localPrefix: string): boolean {
  const pathname = new URL(request.url).pathname;
  if (!pathname.startsWith(localPrefix)) {
    return false;
  }

  const upstreamPath = pathname.slice(localPrefix.length) || '/';
  const methods = PRESERVE_REDIRECT_PATHS.get(upstreamPath);
  if (!methods) {
    return false;
  }

  return methods.has(request.method.toUpperCase());
}

function cloneUpstreamResponse(upstream: Response): NextResponse {
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');
  responseHeaders.delete('transfer-encoding');
  responseHeaders.delete('connection');
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

async function proxyRequest(
  config: AuthKitConfig,
  request: NextRequest,
  localPrefix: string,
  upstreamPrefix: string,
  options: { suppressRedirects?: boolean } = {},
): Promise<NextResponse> {
  const upstreamUrl = buildUpstreamUrl(request, config.casdoor.serverUrl, localPrefix, upstreamPrefix);
  const headers = buildCasdoorProxyRequestHeaders(request);
  if (!headers.has('authorization')) {
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
      const accessToken = typeof decoded?.accessToken === 'string' ? decoded.accessToken : undefined;
      if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`);
      }
    }
  }
  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer();
  const upstream = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body,
    redirect: options.suppressRedirects ? 'manual' : 'follow',
  });

  if (options.suppressRedirects && upstream.status >= 300 && upstream.status < 400) {
    if (shouldPreserveUpstreamRedirect(request, localPrefix)) {
      return cloneUpstreamResponse(upstream);
    }

    return NextResponse.json(
      {
        status: 'error',
        msg: 'Please login first',
        redirect: upstream.headers.get('location') || null,
      },
      { status: 200 },
    );
  }

  return cloneUpstreamResponse(upstream);
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
