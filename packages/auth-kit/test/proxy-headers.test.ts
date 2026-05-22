import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCasdoorProxyRequestHeaders } from '../src/casdoor/proxy-headers.ts';

test('casdoor proxy headers forward cookie and auth context', () => {
  const request = new Request('https://example.com/auth/api/buy-product', {
    headers: {
      accept: 'application/json',
      'accept-language': 'zh-CN',
      authorization: 'Bearer session-token',
      cookie: 'next-auth.session-token=abc; casdoor_session=def',
      'content-type': 'application/json',
      'x-requested-with': 'XMLHttpRequest',
      origin: 'https://example.com',
    },
  });

  const headers = buildCasdoorProxyRequestHeaders(request);

  assert.equal(headers.get('accept'), 'application/json');
  assert.equal(headers.get('accept-language'), 'zh-CN');
  assert.equal(headers.get('authorization'), 'Bearer session-token');
  assert.equal(headers.get('cookie'), 'next-auth.session-token=abc; casdoor_session=def');
  assert.equal(headers.get('content-type'), 'application/json');
  assert.equal(headers.get('x-requested-with'), 'XMLHttpRequest');
  assert.equal(headers.get('origin'), null);
});
