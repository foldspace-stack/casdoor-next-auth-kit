import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCasdoorProxyRequestHeaders } from '../src/casdoor/proxy-headers.ts';
import { getRequestOrigin } from '../src/core/origin.ts';

test('APP_URL takes precedence over browser origin headers', () => {
  const request = new Request('http://dev-chuangxiaoju.agent-lattice.cn/auth/login', {
    headers: {
      origin: 'http://dev-chuangxiaoju.agent-lattice.cn',
      referer: 'http://dev-chuangxiaoju.agent-lattice.cn/login/oauth/authorize?foo=bar',
    },
  });

  assert.equal(getRequestOrigin(request, 'https://dev-chuangxiaoju.agent-lattice.cn'), 'https://dev-chuangxiaoju.agent-lattice.cn');
});

test('Casdoor proxy headers are whitelisted', () => {
  const request = new Request('http://dev-chuangxiaoju.agent-lattice.cn/auth/api/login', {
    headers: {
      accept: 'text/html',
      'accept-language': 'zh-CN',
      authorization: 'Bearer token',
      'content-type': 'application/json',
      'x-requested-with': 'fetch',
      cookie: 'auth_origin=http://dev-chuangxiaoju.agent-lattice.cn; next-auth.session-token=test',
      origin: 'http://dev-chuangxiaoju.agent-lattice.cn',
      referer: 'http://dev-chuangxiaoju.agent-lattice.cn/login/oauth/authorize?foo=bar',
      'x-forwarded-host': 'dev-chuangxiaoju.agent-lattice.cn',
      'x-forwarded-port': '80',
      'x-forwarded-proto': 'http',
      forwarded: 'for=127.0.0.1;proto=http;host=dev-chuangxiaoju.agent-lattice.cn',
    },
  });

  const headers = buildCasdoorProxyRequestHeaders(request);
  assert.deepEqual([...headers.keys()].sort(), [
    'accept',
    'accept-language',
    'authorization',
    'content-type',
    'x-requested-with',
  ]);
  assert.equal(headers.get('accept'), 'text/html');
  assert.equal(headers.get('accept-language'), 'zh-CN');
  assert.equal(headers.get('authorization'), 'Bearer token');
  assert.equal(headers.get('content-type'), 'application/json');
  assert.equal(headers.get('x-requested-with'), 'fetch');
  assert.equal(headers.has('cookie'), false);
  assert.equal(headers.has('origin'), false);
  assert.equal(headers.has('referer'), false);
  assert.equal(headers.has('x-forwarded-host'), false);
  assert.equal(headers.has('x-forwarded-port'), false);
  assert.equal(headers.has('x-forwarded-proto'), false);
  assert.equal(headers.has('forwarded'), false);
});
