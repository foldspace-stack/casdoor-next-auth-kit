import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server.js';

import { createCasdoorApiProxyHandler } from '../src/casdoor/proxy.ts';
import { encodeSessionToken } from '../src/core/session-token.ts';

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
