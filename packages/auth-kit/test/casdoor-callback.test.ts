import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { NextRequest } from 'next/server.js';

import { createCallbackResponse } from '../src/casdoor/callback.ts';
import { generateStateToken } from '../src/core/oauth-state.ts';

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

function getResponseCookies(response: Response): Array<{ name: string; value: string; maxAge?: number }> {
  return (response as Response & { cookies?: { getAll: () => Array<{ name: string; value: string; maxAge?: number }> } }).cookies?.getAll() ?? [];
}

function createAccessToken(): string {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 3600,
      sub: 'user-1',
    }),
  ).toString('base64url');

  return `header.${payload}.signature`;
}

test('callback GET returns a browser bridge page that posts verifier from storage', async () => {
  const state = generateStateToken();
  const request = new NextRequest(`http://localhost:5177/callback?code=test-code&state=${encodeURIComponent(state)}`);

  const response = await createCallbackResponse(request, { config: authConfig as any });
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /text\/html/);
  assert.match(html, /回调处理中/);
  assert.match(html, /fetch\(window\.location\.pathname/);
  assert.match(html, /method: 'POST'/);
  assert.match(html, /sessionStorage\.getItem/);
  assert.match(html, /localStorage\.getItem/);
  assert.match(html, /redirectUrl/);
});

test('callback POST exchanges code with verifier and returns redirect url json', async () => {
  const state = generateStateToken();
  const request = new NextRequest(`http://localhost:5177/callback?code=test-code&state=${encodeURIComponent(state)}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      code: 'test-code',
      state,
      verifier: 'test-verifier',
    }),
  });

  const originalFetch = global.fetch;
  const tokenResponse = {
    access_token: createAccessToken(),
    refresh_token: 'refresh-token',
    id_token: 'id-token',
    expires_in: 3600,
  };
  const userInfoResponse = {
    id: 'user-1',
    name: 'Test User',
    displayName: 'Test User',
    email: 'test@example.com',
    avatarUrl: 'https://example.com/avatar.png',
    isAdmin: false,
  };

  global.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/api/login/oauth/access_token')) {
      return new Response(JSON.stringify(tokenResponse), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    }

    if (url.includes('/api/userinfo')) {
      return new Response(JSON.stringify(userInfoResponse), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    }

    throw new Error(`unexpected fetch url: ${url}`);
  }) as typeof fetch;

  try {
    const response = await createCallbackResponse(request, { config: authConfig as any });
    const payload = (await response.json()) as { redirectUrl: string };
    const cookies = getResponseCookies(response);

    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') ?? '', /application\/json/);
    assert.equal(payload.redirectUrl, 'http://localhost:5177/user/account');
    assert.ok(cookies.some((cookie) => cookie.name.includes('next-auth.session-token')));
    assert.ok(cookies.some((cookie) => cookie.name === 'oauth_state' && cookie.maxAge === 0));
  } finally {
    global.fetch = originalFetch;
  }
});

test('callback POST without verifier redirects to an error page', async () => {
  const state = generateStateToken();
  const request = new NextRequest(`http://localhost:5177/callback?code=test-code&state=${encodeURIComponent(state)}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      code: 'test-code',
      state,
      verifier: '',
    }),
  });

  const response = await createCallbackResponse(request, { config: authConfig as any });

  assert.equal(response.status, 307);
  assert.match(response.headers.get('location') ?? '', /\/callback\/error/);
  assert.match(response.headers.get('location') ?? '', /missing_pkce_code_verifier/);
});
