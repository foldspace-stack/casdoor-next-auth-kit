import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server.js';

import { createCasdoorApiProxyHandler } from '../src/casdoor/proxy.ts';
import { encodeSessionToken } from '../src/core/session-token.ts';

function createAuthKitConfig() {
  return {
    appUrl: 'http://localhost:3000',
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
}

test('casdoor api proxy derives authorization from nextauth session token', async () => {
  const sessionToken = await encodeSessionToken({
    token: {
      accessToken: 'casdoor-access-token',
      userId: 'user-1',
      id: 'user-1',
      email: 'admin@example.com',
    },
    secret: 'test-secret',
  });

  const fetchMock = async (_url: RequestInfo | URL, init?: RequestInit) => {
    assert.equal((init?.headers as Headers | undefined)?.get('authorization'), 'Bearer casdoor-access-token');
    assert.equal((init?.headers as Headers | undefined)?.get('cookie')?.includes('next-auth.session-token'), true);
    return new Response(JSON.stringify({ status: 'ok', msg: 'success', data: null, data2: null, data3: null }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  global.fetch = fetchMock as never;

  const handler = createCasdoorApiProxyHandler(
    {
      appUrl: 'http://localhost:3000',
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
    },
    '/auth/api',
    '/api',
  );

  const request = new NextRequest('http://localhost:3000/auth/api/buy-product?id=qixiaoju%2Fpoints-500&providerName=wechat', {
    headers: {
      cookie: `next-auth.session-token=${sessionToken}`,
      accept: 'application/json',
      'accept-language': 'zh-CN',
      'x-requested-with': 'XMLHttpRequest',
    },
  });

  const response = await handler(request);
  assert.equal(response.status, 200);
});

test('casdoor api proxy preserves upstream redirect for login entry', async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () =>
    new Response(null, {
      status: 302,
      headers: {
        location: 'http://casdoor.local/login/oauth/authorize?response_type=code',
      },
    })) as never;

  try {
    const handler = createCasdoorApiProxyHandler(createAuthKitConfig(), '/auth/api', '/api');

    const request = new NextRequest('http://localhost:3000/auth/api/login', {
      method: 'POST',
      headers: {
        cookie: 'next-auth.session-token=test-session',
        'content-type': 'application/json',
      },
    });

    const response = await handler(request);
    assert.equal(response.status, 302);
    assert.equal(
      response.headers.get('location'),
      'http://casdoor.local/login/oauth/authorize?response_type=code',
    );
  } finally {
    global.fetch = originalFetch;
  }
});

test('casdoor api proxy still normalizes upstream redirects for buy-product', async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () =>
    new Response(null, {
      status: 302,
      headers: {
        location: 'http://casdoor.local/login/oauth/authorize',
      },
    })) as never;

  try {
    const handler = createCasdoorApiProxyHandler(createAuthKitConfig(), '/auth/api', '/api');

    const request = new NextRequest('http://localhost:3000/auth/api/buy-product?id=qixiaoju%2Fpoints-500', {
      method: 'POST',
      headers: {
        cookie: 'next-auth.session-token=test-session',
        'content-type': 'application/json',
      },
    });

    const response = await handler(request);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      status: 'error',
      msg: 'Please login first',
      redirect: 'http://casdoor.local/login/oauth/authorize',
    });
  } finally {
    global.fetch = originalFetch;
  }
});
