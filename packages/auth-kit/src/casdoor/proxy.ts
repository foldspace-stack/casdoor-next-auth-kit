import { NextResponse, type NextRequest } from 'next/server';
import type { AuthKitConfig } from '../types';

function buildUpstreamUrl(request: NextRequest, baseUrl: string, localPrefix: string, upstreamPrefix: string): string {
  const url = new URL(request.url);
  const upstreamPath = url.pathname.startsWith(localPrefix)
    ? upstreamPrefix + url.pathname.slice(localPrefix.length)
    : url.pathname;
  const rewritten = new URL(upstreamPath, baseUrl);
  rewritten.search = url.search;
  return rewritten.toString();
}

function cleanProxyRequestHeaders(request: NextRequest, baseUrl: string): Headers {
  const headers = new Headers(request.headers);
  // 让 fetch 自动设为上游 host
  headers.delete('host');
  // 删掉浏览器侧 origin/referer，避免把宿主的 http origin 暴露给 Casdoor
  headers.delete('origin');
  headers.delete('referer');
  // 删掉反向代理注入的 forwarded 系列头，避免 Casdoor 看到 http 内网地址
  headers.delete('x-forwarded-host');
  headers.delete('x-forwarded-port');
  headers.delete('x-forwarded-proto');
  headers.delete('forwarded');
  return headers;
}

async function proxyRequest(
  request: NextRequest,
  baseUrl: string,
  localPrefix: string,
  upstreamPrefix: string,
  options: { suppressRedirects?: boolean } = {},
): Promise<NextResponse> {
  const upstreamUrl = buildUpstreamUrl(request, baseUrl, localPrefix, upstreamPrefix);
  const headers = cleanProxyRequestHeaders(request, baseUrl);
  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer();
  const upstream = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body,
    redirect: options.suppressRedirects ? 'manual' : 'follow',
  });

  if (options.suppressRedirects && upstream.status >= 300 && upstream.status < 400) {
    return NextResponse.json(
      {
        status: 'error',
        msg: 'Please login first',
        redirect: upstream.headers.get('location') || null,
      },
      { status: 200 },
    );
  }

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

export function createCasdoorApiProxyHandler(
  config: AuthKitConfig,
  prefix = '/auth/api',
  upstreamPrefix = '/api',
): (request: NextRequest) => Promise<NextResponse> {
  return async (request) => proxyRequest(request, config.casdoor.serverUrl, prefix, upstreamPrefix, { suppressRedirects: true });
}

export function createCasdoorPageProxyHandler(
  config: AuthKitConfig,
  prefix = '/auth',
  upstreamPrefix = '',
): (request: NextRequest) => Promise<NextResponse> {
  return async (request) => proxyRequest(request, config.casdoor.serverUrl, prefix, upstreamPrefix);
}

export function createCasdoorCommerceProxyHandler(
  config: AuthKitConfig,
  prefix = '/auth/api/commerce',
  upstreamPrefix = '/api/commerce',
): (request: NextRequest) => Promise<NextResponse> {
  return async (request) => proxyRequest(request, config.casdoor.serverUrl, prefix, upstreamPrefix, { suppressRedirects: true });
}
