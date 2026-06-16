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
    // 防回归：buy-product 只能带 Casdoor 会话 cookie。
    // 如果这里重新出现 next-auth.session-token，支付请求会携带巨大分片 cookie，并可能再次触发 Please login first。
    assert.equal(
      (init?.headers as Headers | undefined)?.get('cookie'),
      'casdoor_session_id=session-id; casdoor_access_token=casdoor-access-token',
    );
    // 防回归：Casdoor 商品购买接口需要商品页来源，不要改回宿主页面或 Casdoor 根路径。
    assert.equal((init?.headers as Headers | undefined)?.get('referer'), 'http://casdoor.local/products/qixiaoju/points-500/buy');
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
      cookie: `next-auth.session-token=${sessionToken}; casdoor_session_id=session-id`,
      accept: 'application/json',
      'accept-language': 'zh-CN',
      'x-requested-with': 'XMLHttpRequest',
    },
  });

  const response = await handler(request);
  assert.equal(response.status, 200);
});

test('casdoor api proxy follows upstream redirect for login entry without exposing external location', async () => {
  const originalFetch = global.fetch;
  let callCount = 0;
  global.fetch = (async (_url: RequestInfo | URL) => {
    callCount += 1;
    if (callCount === 1) {
      return new Response(null, {
        status: 301,
        headers: {
          location: 'http://casdoor.local/api/get-app-login?clientId=client-id',
        },
      });
    }

    assert.equal(String(_url), 'http://casdoor.local/api/get-app-login?clientId=client-id');
    return new Response(JSON.stringify({ status: 'ok', msg: '', data: { redirected: true }, data2: null, data3: null }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as never;

  try {
    const handler = createCasdoorApiProxyHandler(createAuthKitConfig(), '/auth/api', '/api');

    const request = new NextRequest('http://localhost:3000/auth/api/get-app-login?clientId=client-id', {
      headers: {
        cookie: 'next-auth.session-token=test-session',
        accept: 'application/json',
      },
    });

    const response = await handler(request);
    // 登录入口可以跟随 Casdoor 内部 API redirect，但不能把外域 location 暴露给宿主前端。
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('location'), null);
    assert.deepEqual(await response.json(), {
      status: 'ok',
      msg: '',
      data: { redirected: true },
      data2: null,
      data3: null,
    });
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
        'set-cookie': 'casdoor_session_id=session-id; Path=/; HttpOnly; SameSite=Lax',
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
    // buy-product 未登录时返回 JSON 错误给宿主弹窗处理，不能 302 到外域登录页。
    assert.equal(response.status, 200);
    // 即使 buy-product 被上游判定未登录，也要把 Casdoor 新发的 session cookie 带回宿主同域。
    assert.deepEqual(response.headers.getSetCookie(), [
      'casdoor_session_id=session-id; Path=/; HttpOnly; SameSite=Lax',
    ]);
    assert.deepEqual(await response.json(), {
      status: 'error',
      msg: 'Please login first',
      redirect: 'http://casdoor.local/login/oauth/authorize',
    });
  } finally {
    global.fetch = originalFetch;
  }
});
