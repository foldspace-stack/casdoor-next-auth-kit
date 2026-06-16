import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCasdoorProxyRequestHeaders } from '../src/casdoor/proxy-headers.ts';

test('casdoor proxy headers forward cookie and auth context', () => {
  const request = new Request('https://example.com/auth/api/buy-product', {
    headers: {
      accept: 'application/json',
      'accept-language': 'zh-CN',
      authorization: 'Bearer session-token',
      cookie: 'next-auth.session-token=abc; casdoor_session_id=def; casdoor_access_token=ghi',
      'content-type': 'application/json',
      referer: 'https://example.com/user/points',
      'x-requested-with': 'XMLHttpRequest',
      origin: 'https://example.com',
    },
  });

  const headers = buildCasdoorProxyRequestHeaders(request);

  assert.equal(headers.get('accept'), 'application/json');
  assert.equal(headers.get('accept-language'), 'zh-CN');
  assert.equal(headers.get('authorization'), 'Bearer session-token');
  // 防回归：默认模式必须过滤掉 next-auth.session-token，只留下 Casdoor 会话 cookie。
  assert.equal(headers.get('cookie'), 'casdoor_session_id=def; casdoor_access_token=ghi');
  assert.equal(headers.get('content-type'), 'application/json');
  assert.equal(headers.get('referer'), 'https://example.com/user/points');
  assert.equal(headers.get('x-requested-with'), 'XMLHttpRequest');
  assert.equal(headers.get('origin'), 'https://example.com');
});

test('casdoor proxy headers can forward the raw cookie header when required', () => {
  const request = new Request('https://example.com/auth/api/buy-product', {
    headers: {
      cookie: 'next-auth.session-token=abc; casdoor_session_id=def; casdoor_access_token=ghi',
    },
  });

  const headers = buildCasdoorProxyRequestHeaders(request, {
    // 只有确认某个兼容接口确实需要完整浏览器 cookie 时才允许打开；
    // 支付 / buy-product 路径不要使用这个选项。
    includeAllCookies: true,
  });

  assert.equal(headers.get('cookie'), 'next-auth.session-token=abc; casdoor_session_id=def; casdoor_access_token=ghi');
});
