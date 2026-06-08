import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server.js';

import {
  createAuthorizeEntryResponse,
  createLoginEntryResponse,
  createSignupEntryResponse,
} from '../src/casdoor/entry.ts';

const authConfig = {
  appUrl: 'http://localhost:5177',
  nextauthSecret: 'test-secret',
  casdoor: {
    serverUrl: 'http://casdoor.local',
    clientId: 'client-id',
    clientSecret: 'client-secret',
    appName: 'app',
    organizationName: 'org',
    redirectPath: '/callback',
    signinPath: '/login/oauth/authorize',
  },
};

const staleCookieHeader = [
  'next-auth.session-token=old-session',
  '__Secure-next-auth.session-token=old-secure-session',
  '__Host-next-auth.session-token=old-host-session',
  'next-auth.csrf-token=old-csrf',
  '__Secure-next-auth.csrf-token=old-secure-csrf',
  '__Host-next-auth.csrf-token=old-host-csrf',
  'next-auth.callback-url=%2Fdashboard',
  '__Secure-next-auth.callback-url=%2Fdashboard',
  '__Host-next-auth.callback-url=%2Fdashboard',
  'next-auth.state=old-state-token',
  '__Secure-next-auth.state=old-secure-state-token',
  '__Host-next-auth.state=old-host-state-token',
  'oauth_state=old-state',
  'auth_origin=http%3A%2F%2Flocalhost%3A5177',
  'auth_redirect=%2Forders',
  'pkce_code_verifier.old-digest=old-verifier',
].join('; ');

function getResponseCookies(response: Response): Array<{ name: string; value: string; maxAge?: number }> {
  return (response as Response & { cookies?: { getAll: () => Array<{ name: string; value: string; maxAge?: number }> } }).cookies?.getAll() ?? [];
}

function hasCookieDelete(cookies: Array<{ name: string; value: string; maxAge?: number }>, name: string): boolean {
  return cookies.some((cookie) => cookie.name === name && cookie.maxAge === 0);
}

function hasCookieSet(
  cookies: Array<{ name: string; value: string; maxAge?: number }>,
  nameOrPrefix: string,
): boolean {
  return cookies.some((cookie) => cookie.name.startsWith(nameOrPrefix) && cookie.maxAge !== 0);
}

test('login entry clears stale auth cookies before redirecting', async () => {
  const request = new NextRequest('http://localhost:5177/auth/login', {
    headers: { cookie: staleCookieHeader },
  });

  const response = await createLoginEntryResponse(request, authConfig as any);
  const cookies = getResponseCookies(response);

  assert.equal(response.status, 307);
  assert.match(response.headers.get('location') ?? '', /\/login\/oauth\/authorize/);
  assert.equal(hasCookieDelete(cookies, 'next-auth.session-token'), true);
  assert.equal(hasCookieDelete(cookies, '__Secure-next-auth.session-token'), true);
  assert.equal(hasCookieDelete(cookies, '__Host-next-auth.session-token'), true);
  assert.equal(hasCookieDelete(cookies, 'next-auth.csrf-token'), true);
  assert.equal(hasCookieDelete(cookies, 'next-auth.callback-url'), true);
  assert.equal(hasCookieDelete(cookies, 'next-auth.state'), true);
  assert.equal(hasCookieDelete(cookies, 'pkce_code_verifier.old-digest'), true);
  assert.equal(hasCookieSet(cookies, 'oauth_state'), true);
  assert.equal(hasCookieSet(cookies, 'auth_origin'), true);
  assert.equal(hasCookieSet(cookies, 'auth_redirect'), true);
  assert.equal(hasCookieSet(cookies, 'pkce_code_verifier.'), true);
});

test('signup entry clears stale auth cookies before redirecting', async () => {
  const request = new NextRequest('http://localhost:5177/auth/signup', {
    headers: { cookie: staleCookieHeader },
  });

  const response = await createSignupEntryResponse(request, authConfig as any);
  const cookies = getResponseCookies(response);

  assert.equal(response.status, 307);
  assert.match(response.headers.get('location') ?? '', /\/signup\/oauth\/authorize/);
  assert.equal(hasCookieDelete(cookies, 'next-auth.session-token'), true);
  assert.equal(hasCookieDelete(cookies, '__Secure-next-auth.session-token'), true);
  assert.equal(hasCookieDelete(cookies, '__Host-next-auth.session-token'), true);
  assert.equal(hasCookieDelete(cookies, 'next-auth.csrf-token'), true);
  assert.equal(hasCookieDelete(cookies, 'next-auth.callback-url'), true);
  assert.equal(hasCookieDelete(cookies, 'next-auth.state'), true);
  assert.equal(hasCookieDelete(cookies, 'pkce_code_verifier.old-digest'), true);
  assert.equal(hasCookieSet(cookies, 'oauth_state'), true);
  assert.equal(hasCookieSet(cookies, 'auth_origin'), true);
  assert.equal(hasCookieSet(cookies, 'auth_redirect'), true);
  assert.equal(hasCookieSet(cookies, 'pkce_code_verifier.'), true);
});

test('authorize entry clears stale auth cookies before returning html', async () => {
  const request = new NextRequest('http://localhost:5177/login/oauth/authorize', {
    headers: { cookie: staleCookieHeader },
  });

  const response = await createAuthorizeEntryResponse(request, authConfig as any);
  const cookies = getResponseCookies(response);

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /text\/html/);
  assert.equal(hasCookieDelete(cookies, 'next-auth.session-token'), true);
  assert.equal(hasCookieDelete(cookies, '__Secure-next-auth.session-token'), true);
  assert.equal(hasCookieDelete(cookies, '__Host-next-auth.session-token'), true);
  assert.equal(hasCookieDelete(cookies, 'next-auth.csrf-token'), true);
  assert.equal(hasCookieDelete(cookies, 'next-auth.callback-url'), true);
  assert.equal(hasCookieDelete(cookies, 'next-auth.state'), true);
  assert.equal(hasCookieDelete(cookies, 'pkce_code_verifier.old-digest'), true);
  assert.equal(hasCookieSet(cookies, 'auth_origin'), true);
});
