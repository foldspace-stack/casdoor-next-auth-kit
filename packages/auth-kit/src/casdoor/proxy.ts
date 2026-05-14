import { NextResponse, type NextRequest } from 'next/server';
import type { AuthKitConfig } from '../types';

function buildUpstreamUrl(request: NextRequest, baseUrl: string, prefix: string): string {
  const url = new URL(request.url);
  const rewritten = new URL(url.pathname.replace(prefix, ''), baseUrl);
  rewritten.search = url.search;
  return rewritten.toString();
}

async function proxyRequest(request: NextRequest, baseUrl: string, prefix: string): Promise<NextResponse> {
  const upstreamUrl = buildUpstreamUrl(request, baseUrl, prefix);
  const headers = new Headers(request.headers);
  headers.delete('host');
  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer();
  const upstream = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body
  });
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: upstream.headers
  });
}

export function createCasdoorApiProxyHandler(config: AuthKitConfig, prefix = '/auth/api'): (request: NextRequest) => Promise<NextResponse> {
  return async (request) => proxyRequest(request, config.casdoor.serverUrl, prefix);
}

export function createCasdoorPageProxyHandler(config: AuthKitConfig, prefix = '/auth'): (request: NextRequest) => Promise<NextResponse> {
  return async (request) => proxyRequest(request, config.casdoor.serverUrl, prefix);
}

export function createCasdoorCommerceProxyHandler(config: AuthKitConfig, prefix = '/api/casdoor/commerce'): (request: NextRequest) => Promise<NextResponse> {
  return async (request) => proxyRequest(request, config.casdoor.serverUrl, prefix);
}
