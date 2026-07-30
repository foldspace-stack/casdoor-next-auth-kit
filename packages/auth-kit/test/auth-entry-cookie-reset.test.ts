import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server.js';

import {
  createAuthorizeEntryResponse,
  createLoginEntryResponse,
  createSignupEntryResponse,
} from '../dist/casdoor/index.js';
import { encodeSessionToken } from '../src/core/session-token.ts';

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
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /text\/html/);
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
  assert.equal(hasCookieSet(cookies, 'pkce_code_verifier.'), false);
  assert.match(html, /继续登录/);
  assert.match(html, /去注册/);
  assert.match(html, /\/login\/oauth\/authorize/);
});

test('login entry persists redirect query into auth_redirect cookie', async () => {
  const request = new NextRequest('http://localhost:5177/auth/login?redirect=%2Fuser%2Faccount', {
    headers: { cookie: staleCookieHeader },
  });

  const response = await createLoginEntryResponse(request, authConfig as any);
  const cookies = getResponseCookies(response);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.equal(hasCookieSet(cookies, 'auth_redirect'), true);
  assert.ok(cookies.some((cookie) => cookie.name === 'auth_redirect' && cookie.value === '/user/account'));
  assert.match(html, /登录后会回到 \/user\/account/);
});

test('login entry returns directly to redirect target when session cookie already exists', async () => {
  const sessionToken = await encodeSessionToken({
    token: {
      id: 'user-1',
      userId: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    },
    secret: authConfig.nextauthSecret,
  });

  const request = new NextRequest('http://localhost:5177/auth/login?redirect=%2F', {
    headers: {
      cookie: [
        `next-auth.session-token=${sessionToken}`,
        'auth_redirect=%2F',
      ].join('; '),
    },
  });

  const response = await createLoginEntryResponse(request, authConfig as any);
  const cookies = getResponseCookies(response);

  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), 'http://localhost:5177/');
  assert.equal(cookies.some((cookie) => cookie.name === 'oauth_state'), false);
  assert.equal(cookies.some((cookie) => cookie.name === 'auth_redirect'), false);
});

test('login entry keeps redirects on the current request origin even with an external referer', async () => {
  const casdoorOrigin = new URL(authConfig.casdoor.serverUrl).origin;
  const request = new NextRequest('http://localhost:5177/auth/login', {
    headers: {
      cookie: staleCookieHeader,
      referer: `${casdoorOrigin}/login/oauth/authorize`,
    },
  });

  const response = await createLoginEntryResponse(request, authConfig as any);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, new RegExp(`http://localhost:5177/login/oauth/authorize`));
  assert.match(html, /继续登录/);
  assert.equal(casdoorOrigin, 'http://casdoor.local');
});

test('signup entry clears stale auth cookies before redirecting', async () => {
  const request = new NextRequest('http://localhost:5177/auth/signup', {
    headers: { cookie: staleCookieHeader },
  });

  const response = await createSignupEntryResponse(request, authConfig as any);
  const cookies = getResponseCookies(response);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /text\/html/);
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
  assert.equal(hasCookieSet(cookies, 'pkce_code_verifier.'), false);
  assert.match(html, /继续注册/);
  assert.match(html, /返回登录/);
  assert.match(html, /\/signup\/oauth\/authorize/);
});

test('authorize entry clears stale auth cookies before returning the local bootstrap page', async () => {
  const request = new NextRequest('http://localhost:5177/login/oauth/authorize?state=test-state&kind=login', {
    headers: { cookie: staleCookieHeader },
  });

  const response = await createAuthorizeEntryResponse(request, authConfig as any);
  const cookies = getResponseCookies(response);
  const html = await response.text();

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
  assert.equal(hasCookieSet(cookies, 'oauth_state'), true);
  assert.match(html, /JavaScript is required to continue sign in/);
  assert.match(html, /code_challenge_method/);
});

test('authorize entry redirects to Casdoor when the code challenge is already present', async () => {
  const request = new NextRequest(
    'http://localhost:5177/signup/oauth/authorize?state=test-state&kind=signup&code_challenge=test-challenge',
    {
      headers: { cookie: staleCookieHeader },
    },
  );

  const response = await createAuthorizeEntryResponse(request, authConfig as any);
  const cookies = getResponseCookies(response);
  const location = response.headers.get('location') ?? '';

  assert.equal(response.status, 307);
  assert.match(location, /^http:\/\/casdoor\.local\/login\/oauth\/authorize/);
  assert.match(location, /code_challenge=test-challenge/);
  assert.match(location, /state=test-state/);
  assert.match(location, /action=signup/);
  assert.equal(hasCookieDelete(cookies, 'next-auth.session-token'), true);
  assert.equal(hasCookieSet(cookies, 'oauth_state'), true);
});
